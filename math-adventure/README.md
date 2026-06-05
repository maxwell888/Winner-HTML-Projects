# Math Adventure

儿童数学冒险学习游戏，面向小学阶段数学启蒙/练习场景。项目来自 Max 的 MacBook Pro，目前在 Winner 工作区维护一个开发副本。

## 项目类型

- 纯前端 Web 项目
- 技术栈：HTML + CSS + JavaScript
- 不依赖 Node 后端

## 主要文件

- `index.html`：主入口页面
- `standalone.html`：单文件/整合版页面，适合直接打开或分享
- `debug.html`：调试入口
- `app.js`：应用交互逻辑
- `engine.js`：游戏/课程运行引擎
- `data.js`：年级、单元、课程、题目数据
- `style.css`：样式

## 当前开发状态

已完成：

- 从 MacBook Pro 拉取项目源码
- 修复 `data.js` 中导致 JavaScript 解析失败的结构错误
- 验证以下命令通过：

```bash
node --check data.js
node --check app.js
node --check engine.js
```

- 使用本地静态 HTTP 服务访问 `index.html`，返回 `HTTP 200 OK`

## 本地预览方式

在项目目录下启动任意静态服务器即可，例如：

```bash
node -e "const http=require('http'),fs=require('fs'),path=require('path');const root=process.cwd();http.createServer((req,res)=>{let u=req.url.split('?')[0];let p=path.join(root,u==='/'?'index.html':u);fs.readFile(p,(e,d)=>{if(e){res.writeHead(404);res.end('Not found')}else{res.writeHead(200);res.end(d)}})}).listen(8765,()=>console.log('http://localhost:8765'))"
```

然后打开：

```text
http://localhost:8765/index.html
```

## 后续开发建议

1. 做一次浏览器级功能测试：年级/单元/课程切换、题目提交、反馈动画。
2. 检查 `data.js` 中各年级题库内容是否完整、是否存在重复/错误选项。
3. 给川韬设计更清晰的学习路径：二年级巩固、三年级预习、错题复习。
4. 增加学习进度保存：可先用 `localStorage`。
5. 增加家长视图：查看完成课程、正确率、薄弱知识点。

## 注意事项

- `data.js` 是核心内容文件，修改前建议先跑 `node --check data.js`。
- 如后续引入构建工具，再补充 `package.json` 和标准启动脚本。
