/**
 * 小红书内容生产集成工作台 v3.1
 * ── Agent Plan 统一 API (替代 Claude + 方舟)
 * ── TTS 语音合成 (独立 Key)
 * ── 智能处理 (独立 AK/SK)
 * ── FFmpeg 本地合成 (备选)
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { execSync } = require("child_process");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3456;
const MOCK_MODE = String(process.env.MOCK_MODE || "").toLowerCase() === "true";
const TMP = process.env.TMP_DIR || path.join(require("os").tmpdir(), "xhs-volc");
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

const upload = multer({ dest: path.join(require("os").tmpdir(), "xhs-uploads") });
const uploadMulti = multer({ dest: TMP });

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

function hasFFmpeg() { try { execSync("ffmpeg -version", { stdio: "ignore" }); return true; } catch { return false; } }
function nowIso() { return new Date().toISOString(); }
function mockDelay(ms = 250) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getFontFile() {
  const candidates = [
    process.env.FFMPEG_FONT_FILE,
    "/System/Library/Fonts/PingFang.ttc",
    "C:/Windows/Fonts/msyh.ttc",
    "C:/Windows/Fonts/simhei.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
  ].filter(Boolean);
  return candidates.find(f => fs.existsSync(f)) || "";
}

// ── Auth Helpers ─────────────────────────────────────────
function getHeader(req, name) { return req.headers[name?.toLowerCase()] || ""; }

// Agent Plan Key
function getPlanKey(req) { return process.env.AGENT_PLAN_KEY || getHeader(req, "x-plan-key"); }

// TTS
function getTtsKey(req) { return process.env.TTS_API_KEY || getHeader(req, "x-tts-api-key"); }

// 智能处理 AK/SK
function getAkSk(req) { return { ak: process.env.VOLC_ACCESS_KEY || getHeader(req, "x-volc-access-key"), sk: process.env.VOLC_SECRET_KEY || getHeader(req, "x-volc-secret-key") }; }

// ── HMAC-SHA256 签名 (智能处理) ──────────────────────────
function signRequest(ak, sk, region, service, method, uri, query, body, timestamp) {
  const date = timestamp.substring(0, 8);
  const hashedPayload = crypto.createHash("sha256").update(body || "").digest("hex");
  const canonicalHeaders = `content-type:application/json\nhost:open.volcengineapi.com\nx-date:${timestamp}\n`;
  const signedHeaders = "content-type;host;x-date";
  const canonicalRequest = [method, uri, query || "", canonicalHeaders, signedHeaders, hashedPayload].join("\n");
  const credentialScope = `${date}/${region}/${service}/request`;
  const stringToSign = ["HMAC-SHA256", timestamp, credentialScope, crypto.createHash("sha256").update(canonicalRequest).digest("hex")].join("\n");
  const kDate = crypto.createHmac("sha256", sk).update(date).digest();
  const kRegion = crypto.createHmac("sha256", kDate).update(region).digest();
  const kService = crypto.createHmac("sha256", kRegion).update(service).digest();
  const kSigning = crypto.createHmac("sha256", kService).update("request").digest();
  const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");
  return `HMAC-SHA256 Credential=${ak}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

async function callVolcAPI(ak, sk, service, region, method, uri, query, body) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const host = "open.volcengineapi.com";
  const bodyStr = body ? JSON.stringify(body) : "";
  const auth = signRequest(ak, sk, region, service, method, uri, query, bodyStr, timestamp);
  const r = await fetch(`https://${host}${uri}${query ? "?" + query : ""}`, {
    method, headers: { "Content-Type": "application/json", "X-Date": timestamp, "Authorization": auth, "Host": host }, body: bodyStr || undefined,
  });
  return r.json();
}

// ═══════════════════════════════════════════════════════════
// 1. Agent Plan API (统一 Chat + 图片 + 视频)
// ═══════════════════════════════════════════════════════════
const PLAN_BASE = process.env.AGENT_PLAN_BASE || "https://ark.cn-beijing.volces.com/api/plan";

async function callPlanAPI(req, endpoint, body) {
  if (MOCK_MODE) {
    await mockDelay();
    if (endpoint.includes("chat")) {
      const prompt = body?.messages?.map(m => m.content).join("\n") || "内容主题";
      return { model: "mock-plan", usage: { total_tokens: 0 }, choices: [{ message: { content: `【Mock 文案】\n标题：${prompt.slice(0, 28) || "今日穿搭测评"}\n\n1. 先说结论：这条内容适合做成真实测评风格。\n2. 中间结构：背景 → 检测/观察 → 通俗解释 → 选购建议。\n3. 结尾互动：你们还想看我测哪一类衣服？\n\n#服装测评 #设计师妈妈 #面料科普 #真实分享` } }] };
    }
    if (endpoint.includes("images")) return { data: [{ url: "https://dummyimage.com/1024x1024/f6e7d8/2d2a26&text=XHS+Mock+Image" }], usage: { total_tokens: 0 } };
    if (endpoint.includes("videos")) return { data: [{ url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" }], usage: { total_tokens: 0 } };
  }
  const apiKey = getPlanKey(req);
  if (!apiKey) throw new Error("请先设置 Agent Plan API Key");
  const r = await fetch(`${PLAN_BASE}${endpoint}`, {
    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` }, body: JSON.stringify(body),
  });
  const data = await r.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data;
}

// Agent Plan Chat (替代 Claude + 方舟 Chat)
app.post("/api/plan/chat", async (req, res) => {
  try {
    const { system, messages, model = "auto", max_tokens = 2048 } = req.body;
    const data = await callPlanAPI(req, "/chat/completions", {
      model: model === "auto" ? "ark-code-latest" : model,
      max_tokens,
      messages: [...(system ? [{ role: "system", content: system }] : []), ...(messages || [{ role: "user", content: "你好" }])],
    });
    res.json({ text: data.choices?.[0]?.message?.content || "", usage: data.usage, model: data.model });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Agent Plan 图片生成 (Seedream)
app.post("/api/plan/txt2img", async (req, res) => {
  try {
    const { prompt, negative_prompt, width = 1024, height = 1024 } = req.body;
    const data = await callPlanAPI(req, "/images/generations", {
      model: "doubao-seedream-4-0-250828", prompt, negative_prompt, size: `${width}x${height}`, response_format: "url",
    });
    res.json({ images: data.data || [], usage: data.usage });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Agent Plan 视频生成 (Seedance)
app.post("/api/plan/img2video", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = req.body.image_url;
    if (req.file) { imageUrl = `data:${req.file.mimetype};base64,${fs.readFileSync(req.file.path).toString("base64")}`; fs.unlinkSync(req.file.path); }
    if (!imageUrl) return res.status(400).json({ error: "请提供图片" });
    const { prompt, duration = 5 } = req.body;
    const data = await callPlanAPI(req, "/videos/generations", {
      model: "doubao-seedance-1-0-i2v-250415", prompt: prompt || "服装动态展示，自然走动，展示细节和质感", image_url: imageUrl, duration, response_format: "url",
    });
    res.json({ video_url: data.data?.[0]?.url || data.video_url, usage: data.usage });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════
// 2. TTS (独立 Key)
// ═══════════════════════════════════════════════════════════
app.post("/api/tts/generate", async (req, res) => {
  try {
    if (MOCK_MODE) return res.json({ audio_base64: "", format: "mp3", mock: true, message: "MOCK_MODE 下不生成真实音频" });
    const apiKey = getTtsKey(req);
    if (!apiKey) return res.status(400).json({ error: "请先设置 TTS API Key" });
    const { text, voice, speed = 1.0 } = req.body;
    const appId = process.env.VOLCANO_TTS_APP_ID || "";
    const r = await fetch("https://openspeech.bytedance.com/api/v1/tts", {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer;${appId};${apiKey}` },
      body: JSON.stringify({ app: { appid: appId, token: apiKey, cluster: process.env.VOLCANO_TTS_CLUSTER || "volcano_tts" }, user: { uid: "xhs-tools" }, audio: { voice_type: voice || "zh_female_shuangkuaisisi_moon_bigtts", encoding: "mp3", speed_ratio: speed }, request: { reqid: Date.now().toString(), text, text_type: "plain" } }),
    });
    const data = await r.json();
    if (data.code !== 3000) return res.status(400).json({ error: data.message || "TTS 失败" });
    res.json({ audio_base64: data.audio, format: "mp3" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════
// 3. 智能处理 (独立 AK/SK)
// ═══════════════════════════════════════════════════════════
async function submitImpJob(req, templateId, inputParams) {
  if (MOCK_MODE) {
    await mockDelay();
    return { JobId: `mock_${templateId}_${Date.now()}` };
  }
  const { ak, sk } = getAkSk(req);
  if (!ak || !sk) throw new Error("请设置火山引擎 AK/SK");
  const data = await callVolcAPI(ak, sk, "imp", "cn-beijing", "POST", "/", "", { Action: "SubmitJob", Version: "2023-08-01", TemplateId: templateId, Input: inputParams });
  if (data.ResponseMetadata?.Error) throw new Error(data.ResponseMetadata.Error.Message);
  return data;
}

app.post("/api/volc/asr", upload.single("audio"), async (req, res) => {
  try {
    let audioUrl = req.body.audio_url;
    if (req.file) { audioUrl = `data:${req.file.mimetype};base64,${fs.readFileSync(req.file.path).toString("base64")}`; fs.unlinkSync(req.file.path); }
    if (!audioUrl) return res.status(400).json({ error: "请提供音频" });
    const result = await submitImpJob(req, "SpeechToText", { AudioUrl: audioUrl, Language: "zh-CN", EnablePunctuation: true });
    res.json({ jobId: result.JobId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/volc/remove-bg", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = req.body.image_url;
    if (req.file) { imageUrl = `data:${req.file.mimetype};base64,${fs.readFileSync(req.file.path).toString("base64")}`; fs.unlinkSync(req.file.path); }
    if (!imageUrl) return res.status(400).json({ error: "请提供图片" });
    const result = await submitImpJob(req, "RemoveImageBackground", { ImageUrl: imageUrl });
    res.json({ jobId: result.JobId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/volc/enhance-image", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = req.body.image_url;
    if (req.file) { imageUrl = `data:${req.file.mimetype};base64,${fs.readFileSync(req.file.path).toString("base64")}`; fs.unlinkSync(req.file.path); }
    if (!imageUrl) return res.status(400).json({ error: "请提供图片" });
    const result = await submitImpJob(req, "EnhanceImage", { ImageUrl: imageUrl });
    res.json({ jobId: result.JobId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/volc/job/:jobId", async (req, res) => {
  try {
    if (MOCK_MODE || req.params.jobId.startsWith("mock_")) return res.json({ jobId: req.params.jobId, status: "Succeeded", mock: true, output: {} });
    const { ak, sk } = getAkSk(req);
    const data = await callVolcAPI(ak, sk, "imp", "cn-beijing", "POST", "/", "", { Action: "GetJobInfo", Version: "2023-08-01", JobId: req.params.jobId });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════
// 4. 发布管理 (本地 JSON 存储)
// ═══════════════════════════════════════════════════════════
const DATA_DIR = path.join(__dirname, "data");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(POSTS_FILE)) fs.writeFileSync(POSTS_FILE, "[]", "utf-8");

function readPosts() { try { return JSON.parse(fs.readFileSync(POSTS_FILE, "utf-8")); } catch { return []; } }
function writePosts(posts) { fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), "utf-8"); }

// 列表 (支持日期筛选和分页)
app.get("/api/posts", (req, res) => {
  try {
    let posts = readPosts();
    const { date, status, q, limit = 50 } = req.query;
    if (date) posts = posts.filter(p => p.publishDate === date);
    if (status) posts = posts.filter(p => p.status === status);
    if (q) posts = posts.filter(p => p.title.includes(q) || p.copy.includes(q) || (p.hashtags || []).some(h => h.includes(q)));
    posts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json(posts.slice(0, parseInt(limit)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 日历标记 (哪天有发布)
app.get("/api/posts/calendar", (req, res) => {
  try {
    const { month } = req.query;
    const posts = readPosts().filter(p => p.status === "published" && p.publishDate && p.publishDate.startsWith(month));
    const dates = [...new Set(posts.map(p => p.publishDate))];
    res.json(dates);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 单个帖子
app.get("/api/posts/:id", (req, res) => {
  try {
    const posts = readPosts();
    const post = posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: "帖子不存在" });
    res.json(post);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 创建/更新
app.post("/api/posts", (req, res) => {
  try {
    const posts = readPosts();
    const { id, title, copy, images, video, cover, hashtags, status, publishDate, platform, notes } = req.body;
    const now = new Date().toISOString();
    if (id) {
      const idx = posts.findIndex(p => p.id === id);
      if (idx === -1) return res.status(404).json({ error: "帖子不存在" });
      posts[idx] = { ...posts[idx], title, copy, images, video, cover, hashtags, status, publishDate, platform, notes, updatedAt: now };
      writePosts(posts);
      res.json(posts[idx]);
    } else {
      const post = { id: "p" + Date.now(), title: title || "", copy: copy || "", images: images || [], video: video || "", cover: cover || "", hashtags: hashtags || [], status: status || "draft", publishDate: publishDate || new Date().toISOString().split("T")[0], platform: platform || "小红书", notes: notes || "", createdAt: now, updatedAt: now };
      posts.unshift(post);
      writePosts(posts);
      res.json(post);
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 删除
app.delete("/api/posts/:id", (req, res) => {
  try {
    let posts = readPosts();
    const idx = posts.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "帖子不存在" });
    posts.splice(idx, 1);
    writePosts(posts);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 批量获取某天的发布内容（组装发布包）
app.get("/api/publish/daily", (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const posts = readPosts().filter(p => p.publishDate === date);
    const drafts = posts.filter(p => p.status === "draft");
    const published = posts.filter(p => p.status === "published");
    res.json({ date, total: posts.length, drafts, published });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════
// 4. FFmpeg 本地合成 (备选)
// ═══════════════════════════════════════════════════════════
app.post("/api/video/compose", uploadMulti.fields([{ name: "images", maxCount: 20 }, { name: "audio", maxCount: 1 }, { name: "bgm", maxCount: 1 }]), async (req, res) => {
  try {
    if (!hasFFmpeg()) return res.status(500).json({ error: "FFmpeg 未安装" });
    const imageFiles = req.files?.images || [], audioFile = req.files?.audio?.[0], bgmFile = req.files?.bgm?.[0];
    if (!imageFiles.length || !audioFile) return res.status(400).json({ error: "请上传图片和配音" });
    const { title = "", subtitleText = "", durationPerImage = 4 } = req.body;
    const ts = Date.now(), outDir = `${TMP}compose-${ts}/`;
    fs.mkdirSync(outDir, { recursive: true });
    try {
      const segments = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const seg = `${outDir}seg_${i}.mp4`;
        const dur = parseFloat(durationPerImage);
        execSync(`ffmpeg -y -loop 1 -i "${imageFiles[i].path}" -vf "zoompan=z='min(zoom+0.0008,1.15)':d=${Math.round(dur * 25)}:s=1080x1080:fps=25" -t ${dur} -c:v libx264 -preset fast -pix_fmt yuv420p "${seg}"`, { stdio: "ignore", timeout: 60000 });
        segments.push(seg);
      }
      const concatList = `${outDir}concat.txt`; fs.writeFileSync(concatList, segments.map(s => `file '${s}'`).join("\n"));
      const concatVid = `${outDir}concat.mp4`;
      execSync(`ffmpeg -y -f concat -safe 0 -i "${concatList}" -c copy "${concatVid}"`, { stdio: "ignore", timeout: 30000 });
      let audioDur = 30;
      try { audioDur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${audioFile.path}"`, { stdio: "pipe", timeout: 10000 }).toString().trim()); } catch {}
      const fontFile = getFontFile();
      let vfParts = [];
      if (fontFile && title) vfParts.push(`drawtext=fontfile='${fontFile}':text='${title.replace(/'/g, "\\'")}':fontsize=42:fontcolor=white:x=(w-text_w)/2:y=h-th-60:box=1:boxcolor=black@0.35:boxborderw=12`);
      if (fontFile && subtitleText) vfParts.push(`drawtext=fontfile='${fontFile}':text='${subtitleText.replace(/'/g, "\\'")}':fontsize=28:fontcolor=white:x=(w-text_w)/2:y=h-100:box=1:boxcolor=black@0.3:boxborderw=8`);
      const vf = vfParts.length ? `-vf "${vfParts.join(",")}"` : "";
      const bgmInput = bgmFile ? `-i "${bgmFile.path}"` : "";
      const af = bgmFile ? `-filter_complex "[1:a]volume=1.0[v];[2:a]volume=0.12[bgm];[v][bgm]amix=inputs=2:duration=first:normalize=0[a]" -map "[a]"` : "";
      const mapA = bgmFile ? "" : "-map 1:a";
      const output = `${outDir}output.mp4`;
      execSync(`ffmpeg -y -i "${concatVid}" -i "${audioFile.path}" ${bgmInput} -t ${audioDur} ${vf} ${af} ${mapA} -c:v libx264 -preset fast -c:a aac -b:a 128k -pix_fmt yuv420p "${output}"`, { stdio: "ignore", timeout: 120000 });
      const buffer = fs.readFileSync(output);
      res.set({ "Content-Type": "video/mp4", "Content-Disposition": `attachment; filename="composed-${ts}.mp4"` });
      res.send(buffer);
    } finally {
      setTimeout(() => { try { fs.rmSync(outDir, { recursive: true, force: true }); } catch {} }, 60000);
      imageFiles.forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
    }
  } catch (e) { res.status(500).json({ error: `视频合成失败: ${e.message}` }); }
});

// ═══════════════════════════════════════════════════════════
// 5. 健康检查
// ═══════════════════════════════════════════════════════════
app.get("/api/status", (req, res) => {
  const { ak, sk } = getAkSk(req);
  res.json({
    plan: !!getPlanKey(req),
    tts: !!getTtsKey(req),
    volc_smart: !!(ak && sk),
    ffmpeg: hasFFmpeg(),
    mock: MOCK_MODE,
  });
});

app.get("/health", (req, res) => {
  const { ak, sk } = getAkSk(req);
  res.json({
    ok: true,
    service: "xiaohongshu-tools",
    version: require("./package.json").version || "1.0.0",
    time: nowIso(),
    mock: MOCK_MODE,
    capabilities: {
      plan: MOCK_MODE || !!getPlanKey(req),
      tts: MOCK_MODE || !!getTtsKey(req),
      volc_smart: MOCK_MODE || !!(ak && sk),
      ffmpeg: hasFFmpeg(),
    },
  });
});

app.listen(PORT, () => {
  console.log(`\n  🧪 小红书内容生产工作台 v3.1`);
  console.log(`     http://localhost:${PORT}\n`);
  console.log(`  Agent Plan: ${process.env.AGENT_PLAN_KEY ? "✅" : "❌"}`);
  console.log(`  TTS:        ${process.env.TTS_API_KEY ? "✅" : "❌"}`);
  console.log(`  智能处理:    ${process.env.VOLC_ACCESS_KEY ? "✅" : "❌"}`);
  console.log(`  FFmpeg:     ${hasFFmpeg() ? "✅" : "❌"}`);
  console.log(`  Mock Mode:  ${MOCK_MODE ? "✅" : "❌"}\n`);
});
