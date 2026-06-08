# 设计师妈妈的服装实验室 · HTML PM 应用

> **项目**：小红书创业项目管理
> **部署位置**：`projects/manman/html-app/`
> **编制日期**：2026-06-08
> **编制人**：Javis
> **使用对象**：杨珂 + 李曼曼

---

## 🚀 30 秒上线（推荐 Netlify Drop）

**最快路径**：
1. 打开 https://app.netlify.com/drop
2. 把 **`html-app/` 整个目录** 拖进去
3. 30 秒后拿到 URL（`https://xxx.netlify.app`）
4. **把这个 URL 发给曼曼 + 自己**——完事

> 不用注册、不用 token、不用 GitHub。
> **国内打开速度比 GitHub Pages 还快**（曼曼手机丝滑）。

---

## 📦 目录结构

```
html-app/
├── index.html               # 入口
├── css/
│   └── style.css            # 全部样式（15.7KB）
├── js/
│   ├── app.js               # 主逻辑（36.6KB · 9 屏 + 路由 + 角色）
│   └── markdown.js          # 简易 Markdown 解析器
├── data/                    # 15 份 Markdown 数据源
│   ├── README.md            # 总览
│   ├── plan-v2.0.md         # 项目计划书
│   ├── phase1-account.md
│   ├── phase2-script-voice-v2.md
│   ├── ... (10 份 Phase)
│   ├── matrix-2026-06-06.md # 06-06 矩阵
│   └── audio-mode-changes.md # 声音档调整记录
└── README.md                # 本文件
```

---

## 🖥️ 本地预览

```bash
cd projects/manman/html-app
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

---

## 📱 9 屏速览

| 屏 | 干啥 | 谁主用 |
|---|---|---|
| 🏠 主页 | 倒计时 + 今日 3 件事 + Phase 0 进度 | 共同 |
| 📅 M1 日历 | 4 周 17 条排期（周切换）| 曼曼 |
| 🔬 选题库 | 反种草 5 + 焦虑 3 = TOP 8 + 筛选器 | 曼曼 |
| 📊 周复盘 | 数据录入 + 自动算比率 + 健康线 | 共同 |
| 🛒 设备采购 | 7 件设备 + 勾选进度 | 杨珂 |
| 💰 财务沙盘 | 12 月三档 + 决策建议 | 杨珂 |
| 🛡️ 护城河 | 9 条进度 + 时间轴 | 共同 |
| 💬 声音档 | 5 条脚本预览 | 共同 |
| 📚 资料库 | 10 份 Phase 完整版（弹窗）| 共同 |

---

## 🎛️ 三个全局开关

### 1. 角色切换（右上 🔧）
- 🔧 **杨珂**：技术细节全开
- 📸 **曼曼**：只显示拍摄/剪辑相关
- 👫 **共同**：双方通用视图

切换状态自动存到 localStorage，**下次打开还是这个角色**。

### 2. 声音档 toggle（右上 🎙️）
- 开启后所有"老公"自动加紫色标识
- 拍摄时一眼看出哪些地方是**杨珂出声音**

### 3. Phase 0 进度（主页）
- 5 项 Phase 0 完成标志，可勾选
- 进度条自动算百分比
- 数据存 localStorage

---

## 💾 数据持久化（localStorage）

应用用了 3 个 localStorage key：

| Key | 存什么 |
|---|---|
| `manman-pm.role` | 当前角色（yangke/manman/both）|
| `manman-pm.audio` | 声音档模式（1/0）|
| `manman-pm.checklist` | 设备勾选 + Phase 0 进度 |
| `manman-pm.reviews` | 周复盘历史 |

**清空方法**：浏览器控制台跑 `localStorage.clear()`。

---

## 🚢 部署选项

### A. Netlify Drop（30 秒，最快）⭐⭐⭐⭐⭐
1. https://app.netlify.com/drop
2. 拖 `html-app/` 进去
3. 拿到 URL

### B. Vercel（30 秒）⭐⭐⭐⭐
1. https://vercel.com/new
2. 拖 `html-app/` 进去
3. 拿到 URL

### C. GitHub Pages（5-10 分钟）⭐⭐⭐
1. GitHub 创建 `Maxwell888/manman-pm` 仓库
2. 本地或 OpenClaw 推代码
3. Settings → Pages → 选 `main` 分支
4. 拿到 `https://Maxwell888.github.io/manman-pm/`

### D. 本地服务（局域网）⭐⭐
```bash
cd projects/manman/html-app
python3 -m http.server 8080
# 同局域网设备访问 http://<Mac-IP>:8080
```

---

## 🐛 常见问题

### Q: 资料库点击文档没反应？
A: 文档弹窗需要从 `data/` fetch Markdown。第一次打开会慢一点（2-3 秒），之后浏览器会缓存。

### Q: 部署后样式乱了？
A: 检查 `data/` 目录的 15 个 .md 文件是否完整上传。CSS/JS 引用的是相对路径，必须在同一域下。

### Q: 中文文件名在某些环境出错？
A: 已经全部重命名为 ASCII（`phase1-account.md` 等），**不会再有编码问题**。

### Q: 怎么更新数据？
A: 修改 `data/*.md` 文件，**重新部署**即可（Netlify 拖一次新的 zip 就行）。

---

## 📞 联系 / 反馈

- 编制：Javis
- 主人：杨珂（iMessage +8618516357114）
- 上线时间：2026-06-08

---

> **最后更新**：2026-06-08 18:00
> **应用大小**：~420KB（含数据）
> **依赖**：零（纯静态 HTML/CSS/JS）
> **手机优化**：✅ iPhone Safari / Android Chrome
