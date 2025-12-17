# 家庭日程应用 - 部署指南

## 📱 方案一：局域网部署（推荐）

**适用场景**：家里的手机、平板、电脑都能访问

### 配置已完成 ✅
- 后端已配置监听所有网络接口
- 前端已配置允许局域网访问
- CORS已配置允许局域网跨域请求

### 启动步骤

#### 1. 启动后端服务
```bash
cd server
npm run dev
```

#### 2. 启动前端服务
```bash
cd client
npm run dev
```

### 访问方式

**本机访问（电脑）**:
- 前端: http://localhost:5173
- 后端API: http://localhost:3000/api

**局域网访问（手机、平板等）**:
- 前端: http://30.138.104.69:5173
- 后端API: http://30.138.104.69:3000/api

### 📲 手机访问步骤

1. 确保手机和电脑连接同一个WiFi
2. 在手机浏览器中打开: `http://30.138.104.69:5173`
3. 注册账号或登录现有账号
4. 开始使用！

### 🔒 防火墙设置

如果其他设备无法访问，可能需要开放端口：

**macOS**:
```bash
# 查看防火墙状态
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# 如果防火墙开启，允许Node访问
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
```

---

## 🌐 方案二：生产环境部署（互联网访问）

**适用场景**：需要在外面也能访问，不在家里也能用

### 推荐部署平台

#### 前端部署（免费）
- **Vercel** (推荐): https://vercel.com
- **Netlify**: https://netlify.com
- **GitHub Pages**: https://pages.github.com

#### 后端部署（免费/低成本）
- **Railway** (推荐): https://railway.app (每月$5免费额度)
- **Render**: https://render.com (免费层)
- **Fly.io**: https://fly.io (免费层)

### 生产环境构建步骤

#### 1. 构建前端
```bash
cd client
npm run build
# 生成 dist/ 目录
```

#### 2. 构建后端
```bash
cd server
npm run build
# 生成 dist/ 目录
```

#### 3. 部署到Railway示例

**后端部署**:
1. 注册Railway账号
2. 创建新项目 > Deploy from GitHub
3. 选择你的仓库 > server目录
4. 添加环境变量:
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=your-secret-key
   ```
5. 部署完成后会得到URL: `https://your-app.railway.app`

**前端部署**:
1. 注册Vercel账号
2. Import Git Repository
3. 选择client目录
4. 添加环境变量:
   ```
   VITE_API_URL=https://your-app.railway.app
   ```
5. 部署完成！

---

## 📝 注意事项

### 局域网部署
- ✅ 完全免费
- ✅ 速度快，无延迟
- ✅ 数据存在本地，更安全
- ❌ 只能在家里WiFi环境下使用
- ❌ 电脑需要保持开机

### 云端部署
- ✅ 随时随地访问
- ✅ 不需要电脑开机
- ✅ 自动备份
- ❌ 可能需要付费（低成本）
- ❌ 需要学习部署流程

---

## 🆘 常见问题

### Q: 手机访问显示"无法连接"
A: 检查以下几点：
1. 手机和电脑是否在同一WiFi网络
2. 电脑防火墙是否开放了3000和5173端口
3. 确认后端和前端服务都在运行中

### Q: 局域网IP会变吗？
A: 可能会变。可以在路由器中设置静态IP，或者：
```bash
# 每次启动前检查当前IP
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Q: 如何让应用一直运行？
A: 使用进程管理器：
```bash
# 安装PM2
npm install -g pm2

# 启动后端（持久运行）
cd server
pm2 start npm --name "schedule-backend" -- run dev

# 启动前端（持久运行）
cd client
pm2 start npm --name "schedule-frontend" -- run dev

# 查看状态
pm2 list

# 停止服务
pm2 stop all
```

---

## 🎯 快速开始命令

```bash
# 一键启动（需要两个终端窗口）

# 终端1 - 启动后端
cd server && npm run dev

# 终端2 - 启动前端
cd client && npm run dev

# 然后用手机访问: http://30.138.104.69:5173
```

---

**技术支持**: 如有问题，请参考项目README或提交Issue
