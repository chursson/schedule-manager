# 快速开始指南

## 环境要求

- Node.js 18+
- MongoDB 5.0+
- npm 或 yarn

## 第一步：启动 MongoDB

### 方式1：本地MongoDB（推荐用于测试）
```bash
# macOS（使用Homebrew）
brew services start mongodb-community

# 或者直接运行
mongod --dbpath=/path/to/data/db
```

### 方式2：使用Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:5
```

### 方式3：MongoDB Atlas（云数据库）
1. 访问 https://www.mongodb.com/cloud/atlas
2. 创建免费集群
3. 获取连接字符串
4. 更新 `server/.env` 中的 `MONGODB_URI`

## 第二步：启动后端服务

```bash
# 进入后端目录
cd server

# 确认已安装依赖（如果还没安装）
npm install

# 启动开发服务器
npm run dev
```

**预期输出：**
```
✅ MongoDB连接成功
🚀 服务器运行在端口 3000
📝 API地址: http://localhost:3000/api
🔌 WebSocket地址: http://localhost:3000
🌍 环境: development
```

## 第三步：启动前端服务

**打开新的终端窗口**

```bash
# 进入前端目录
cd client

# 确认已安装依赖（如果还没安装）
npm install

# 启动开发服务器
npm run dev
```

**预期输出：**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## 第四步：访问应用

在浏览器中打开：**http://localhost:5173**

### 推荐使用移动端模拟器测试

**Chrome DevTools：**
1. 按 F12 打开开发者工具
2. 点击设备工具栏图标（或按 Ctrl+Shift+M / Cmd+Shift+M）
3. 选择移动设备（推荐：iPhone 12 Pro 或 Pixel 5）

## 测试流程

### 1. 注册新用户
- 访问注册页面
- 填写用户名、邮箱、密码
- 注册成功后自动登录

### 2. 创建日程
- 点击首页右上角的 "+" 图标
- 填写日程信息
- 保存

### 3. 查看日程列表
- 下拉刷新列表
- 滚动到底部加载更多
- 左滑日程卡片可删除

### 4. 编辑日程
- 点击日程卡片进入详情页
- 点击"编辑日程"按钮
- 修改信息并保存

### 5. 测试实时协作
- **打开两个浏览器窗口**
- 两个窗口都登录（可以用同一账号）
- 在一个窗口中编辑日程
- 观察另一个窗口是否显示"正在编辑"提示

### 6. 日历视图
- 切换到"日历"标签
- 选择不同日期查看日程

### 7. 个人中心
- 切换到"我的"标签
- 查看统计数据
- 测试退出登录

### 8. 分享功能
- 进入日程详情页
- 点击右上角分享图标
- 分享链接会被复制到剪贴板
- 在新标签页中打开分享链接测试

## 常见问题

### MongoDB 连接失败
```
❌ MongoDB初始化连接失败
```
**解决方案：**
- 确认MongoDB已启动
- 检查 `server/.env` 中的 `MONGODB_URI` 配置
- 默认连接：`mongodb://localhost:27017/schedule-manager`

### 端口占用
```
Error: listen EADDRINUSE: address already in use :::3000
```
**解决方案：**
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或者修改端口
# 编辑 server/.env，修改 PORT=3001
```

### 前端无法连接后端
**解决方案：**
- 确认后端服务已启动（http://localhost:3000/api/health）
- 检查 `client/.env` 中的 `VITE_API_URL` 配置
- 检查浏览器控制台是否有CORS错误

### 登录后立即退出
**解决方案：**
- 打开浏览器控制台查看错误
- 可能是JWT配置问题
- 检查 `server/.env` 中的 `JWT_SECRET` 是否设置

## API 测试

### 健康检查
```bash
curl http://localhost:3000/api/health
```

### 注册用户
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "123456"
  }'
```

### 登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

## 停止服务

### 停止后端
在后端终端按 `Ctrl+C`

### 停止前端
在前端终端按 `Ctrl+C`

### 停止MongoDB
```bash
# macOS Homebrew
brew services stop mongodb-community

# Docker
docker stop mongodb
```

## 下一步

测试完成后，您可以：
1. 继续开发微信分享功能
2. 开发B端管理后台
3. 进行UI优化和素材集成
4. 准备生产环境部署

---

**提示**：建议在移动端设备模拟器中测试，体验最佳！
