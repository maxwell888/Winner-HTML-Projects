# Xiaohongshu Tools

小红书「设计师妈妈的服装实验室」AI 内容生产集成工作台。项目来自 Max 的 MacBook Pro，目前在 Winner 工作区维护一个开发副本。

## 项目类型

- 本地/云端 Web 工具
- 技术栈：Node.js + Express + 静态 HTML 前端
- 用于小红书内容生产、素材/文案处理、发布草稿管理、封面模板、视频/TTS 工作流

## 主要文件

- `server.js`：Express 后端服务入口
- `package.json`：项目依赖和启动脚本
- `package-lock.json`：依赖锁定文件
- `public/index.html`：当前主界面
- `public/index-v3.1-backup.html`：v3.1 备份界面
- `data/posts.json`：本地内容数据文件
- `.env.example`：环境变量示例
- `render.yaml`：Render 部署配置示例
- `Procfile`：通用 PaaS 启动配置
- `start.sh`：Mac/Linux 启动脚本

## 启动方式

安装依赖：

```bash
npm install
```

启动服务：

```bash
npm start
```

开发模式：

```bash
npm run dev
```

默认访问：

```text
http://localhost:3456
```

健康检查：

```text
http://localhost:3456/health
```

## Mock 模式

没有真实 AI/TTS/火山引擎 Key 时，可以开启 mock 模式验证完整服务链路：

```bash
MOCK_MODE=true npm start
```

Windows PowerShell：

```powershell
$env:MOCK_MODE="true"; npm start
```

Mock 模式下：

- 文案生成返回 mock 文案
- 图片生成返回占位图 URL
- 视频生成返回示例视频 URL
- 智能处理返回 mock jobId
- TTS 返回 mock 响应，不生成真实音频

## 当前能力状态

已完成：

- 静态前端预览：GitHub Pages 可访问
- 发布管理：后端 JSON 存储；静态版使用浏览器 `localStorage`
- 文案工作台：支持 Agent Plan；静态版支持离线模板生成
- 封面模板：纯前端 canvas，可下载 PNG
- `/api/status`：能力状态接口
- `/health`：部署健康检查接口
- `MOCK_MODE`：无密钥演示/部署验证模式
- `render.yaml`：Render 部署配置示例

需要真实服务/密钥：

- Agent Plan：AI 文案、图片、视频生成
- TTS：语音合成
- 火山智能处理：ASR、背景移除、画质增强
- FFmpeg：本地视频合成

## 环境变量

真实 `.env` 不进入 Git。请基于 `.env.example` 创建本地 `.env`：

```bash
cp .env.example .env
```

关键变量：

```text
PORT=3456
MOCK_MODE=false
AGENT_PLAN_KEY=
AGENT_PLAN_BASE=https://ark.cn-beijing.volces.com/api/plan
TTS_API_KEY=
VOLCANO_TTS_APP_ID=
VOLCANO_TTS_CLUSTER=volcano_tts
VOLC_ACCESS_KEY=
VOLC_SECRET_KEY=
FFMPEG_FONT_FILE=
```

## Render 部署建议

1. 新建 Render Web Service。
2. 绑定本项目仓库。
3. Build Command：

```bash
npm install
```

4. Start Command：

```bash
npm start
```

5. Health Check Path：

```text
/health
```

6. 先设置：

```text
MOCK_MODE=true
```

验证服务跑通后，再逐步加入真实 API Key。

## GitHub Pages 与完整后端的区别

GitHub Pages 只能运行静态前端：

- 可以：封面模板、离线文案模板、本地草稿管理
- 不可以：真实 AI/TTS/FFmpeg/云端 JSON 数据写入

完整功能需要 Node 后端：

- 本地运行：`npm start`
- 云端运行：Render/Railway/Fly.io/VPS 等

## 安全注意事项

- 不提交 `.env`。
- 不提交密钥、token、cookie。
- 不提交 `node_modules/`。
- API Key 应放在服务端环境变量里，不要放进前端页面。
- 公开 GitHub Pages 只放静态预览，不放私人数据。

## 提交前检查

```bash
git status --short
npm run check
```
