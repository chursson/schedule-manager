#!/bin/bash

# 家庭日程应用 - 一键启动脚本

echo "🚀 正在启动家庭日程应用..."
echo ""

# 获取本机IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "=================================="
echo "📱 家庭日程管理系统"
echo "=================================="
echo ""
echo "✅ 本机访问: http://localhost:5173"
echo "📱 手机访问: http://$LOCAL_IP:5173"
echo ""
echo "提示: 确保手机和电脑连接同一WiFi"
echo "=================================="
echo ""

# 检查是否在项目根目录
if [ ! -d "server" ] || [ ! -d "client" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 启动后端
echo "🔧 启动后端服务..."
cd server
npm run dev &
SERVER_PID=$!
cd ..

# 等待后端启动
sleep 3

# 启动前端
echo "🎨 启动前端服务..."
cd client
npm run dev &
CLIENT_PID=$!
cd ..

echo ""
echo "✨ 应用启动成功！"
echo ""
echo "按 Ctrl+C 停止服务"

# 等待用户中断
wait

# 清理进程
kill $SERVER_PID $CLIENT_PID 2>/dev/null
echo ""
echo "👋 服务已停止"
