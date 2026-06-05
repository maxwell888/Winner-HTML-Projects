# Winner HTML Projects

公开预览仓库，只放 Max 的两个 HTML/Web 项目的静态展示内容和可公开部署的后端服务代码。

## 在线项目

- `math-adventure`：儿童数学冒险学习游戏，纯前端项目。
- `xiaohongshu-tools`：小红书内容生产工作台静态预览版。
- `xiaohongshu-tools-backend`：小红书工具 Node/Express 后端，可部署到 Render/Railway/VPS。

## 在线访问

GitHub Pages 总入口：

```text
https://maxwell888.github.io/Winner-HTML-Projects/
```

数学冒险：

```text
https://maxwell888.github.io/Winner-HTML-Projects/math-adventure/index.html
```

小红书工具静态预览：

```text
https://maxwell888.github.io/Winner-HTML-Projects/xiaohongshu-tools/index.html
```

## 后端部署：Render

本仓库根目录已经提供 `render.yaml`，可通过 Render Blueprint 部署。

Render 部署入口：

```text
https://dashboard.render.com/blueprint/new?repo=https://github.com/maxwell888/Winner-HTML-Projects
```

默认部署设置：

- Service name: `xiaohongshu-tools`
- Root directory: `xiaohongshu-tools-backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check: `/health`
- `MOCK_MODE=true`

首次部署建议保持 `MOCK_MODE=true`，这样无需 API Key 也能验证服务健康。部署成功后访问：

```text
https://<render-service-name>.onrender.com/health
```

然后在 GitHub Pages 小红书工具页面的 Settings 里填写后端地址：

```text
https://<render-service-name>.onrender.com
```

## 安全原则

本仓库不包含：

- Winner 长期记忆
- 家庭/健康/个人隐私
- `.env`
- API Key / Token / Cookie
- `node_modules/`

真实 API Key 应放在 Render 环境变量里，不要放入 GitHub 仓库或前端页面。

## 2026-06-05 更新

- 小红书工具静态预览版增加本地工作台模式：发布管理使用浏览器 localStorage 保存草稿/日历。
- 文案工作台在没有后端 API 时提供离线模板生成。
- 前端 Settings 支持填写后端服务地址。
- 后端增加 `/health`、`MOCK_MODE`、Render Blueprint 配置。
