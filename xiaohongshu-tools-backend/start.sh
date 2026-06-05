#!/bin/bash
cd "$(dirname "$0")"

# Copy .env.example to .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📝 已创建 .env 文件，请编辑填入你的 API Key 后再启动"
  echo "   vim .env"
  exit 0
fi

# Install dependencies if needed
if [ ! -d node_modules ]; then
  echo "📦 首次运行，正在安装依赖..."
  npm install
fi

echo "🧪 启动小红书内容生产工作台..."
node server.js
