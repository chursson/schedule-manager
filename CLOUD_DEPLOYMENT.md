# 🌐 云端部署指南 - 免费方案

## 总览

**后端**: Railway (免费 $5/月额度)  
**前端**: Vercel (完全免费)  
**预计时间**: 30分钟

部署完成后，任何人在任何地方都可以访问您的应用！

---

## 📋 准备工作

### 1. 注册账号

#### Railway账号
1. 访问 https://railway.app
2. 点击 "Start a New Project"
3. 使用GitHub账号登录（推荐）
4. 免费获得 $5/月 额度

#### Vercel账号
1. 访问 https://vercel.com
2. 点击 "Sign Up"
3. 使用GitHub账号登录（推荐）
4. 完全免费，无限制

### 2. 推送代码到GitHub

```bash
cd /Users/qiupeng/schedule-manager

# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "准备云端部署"

# 创建GitHub仓库并推送
# 访问 https://github.com/new 创建新仓库
# 然后执行：
git remote add origin https://github.com/你的用户名/schedule-manager.git
git branch -M main
git push -u origin main
```

---

## 🚀 第一步：部署后端到Railway

### 1. 创建新项目

1. 登录 Railway: https://railway.app
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的 `schedule-manager` 仓库
5. Railway 会自动检测到项目

### 2. 配置后端服务

1. Railway会自动检测到 `server` 目录
2. 如果没有，点击 "Add Service" > "GitHub Repo" > 选择 server 目录

### 3. 设置环境变量

在Railway项目中，点击你的服务 > Variables 标签，添加以下变量：

```
NODE_ENV=production
PORT=3000
JWT_SECRET=请生成一个随机字符串（至少32位）
CLIENT_URL=暂时填写 *（稍后更新为Vercel域名）
```

**生成JWT_SECRET的方法**:
```bash
# 在本地终端运行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. 配置构建命令

Railway通常会自动检测，但如果需要手动配置：

- Build Command: `npm install && npm run build`
- Start Command: `npm start`

### 5. 部署

1. 点击 "Deploy"
2. 等待3-5分钟完成部署
3. 部署成功后，点击 "Settings" > "Domains"
4. 点击 "Generate Domain" 生成公开域名
5. **记录下这个域名**，例如：`your-app-production.up.railway.app`

### 6. 测试后端

访问：`https://your-app-production.up.railway.app/api/health`

应该看到：
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...
}
```

---

## 🎨 第二步：部署前端到Vercel

### 1. 导入项目

1. 登录 Vercel: https://vercel.com
2. 点击 "Add New Project"
3. 选择 "Import Git Repository"
4. 选择你的 `schedule-manager` 仓库
5. 点击 "Import"

### 2. 配置项目

**重要**: 配置 Root Directory

1. 在 "Configure Project" 页面
2. 找到 "Root Directory"
3. 点击 "Edit"
4. 选择 `client` 目录
5. 点击 "Continue"

### 3. 设置环境变量

在 "Environment Variables" 部分，添加：

```
VITE_API_URL=https://your-app-production.up.railway.app
```

**⚠️ 重要**: 将 `your-app-production.up.railway.app` 替换为你在Railway获得的域名！

### 4. 部署

1. 点击 "Deploy"
2. 等待2-3分钟完成构建和部署
3. 部署成功后会显示你的应用URL
4. 例如：`https://your-app.vercel.app`

### 5. 更新Railway的CLIENT_URL

1. 回到 Railway 项目
2. 点击你的后端服务
3. 进入 "Variables"
4. 更新 `CLIENT_URL` 为你的Vercel域名：`https://your-app.vercel.app`
5. 点击 "Save"
6. Railway会自动重新部署

---

## ✅ 第三步：测试线上应用

### 1. 访问你的应用

打开浏览器，访问：`https://your-app.vercel.app`

### 2. 注册测试账号

1. 点击"立即注册"
2. 填写用户名、邮箱、密码
3. 注册成功后会自动登录

### 3. 创建测试日程

1. 点击"添加安排"按钮
2. 填写日程信息
3. 保存

### 4. 手机测试

1. 在手机浏览器打开同样的URL
2. 登录同一个账号
3. 应该能看到刚才创建的日程

---

## 📱 分享给家人

部署完成后，告诉家人：

**应用地址**: `https://your-app.vercel.app`

他们可以：
1. 用手机浏览器打开
2. 注册自己的账号
3. 开始使用！

**添加到手机主屏幕**（iOS）:
1. 在Safari打开应用
2. 点击分享按钮
3. 选择"添加到主屏幕"
4. 就像原生APP一样使用！

**添加到手机主屏幕**（Android）:
1. 在Chrome打开应用
2. 点击菜单
3. 选择"添加到主屏幕"

---

## 💰 费用说明

### Railway
- **免费额度**: $5/月
- **重置**: 每月1号重置
- **监控**: 在Railway Dashboard查看用量
- **超出**: 应用会暂停，下月自动恢复

### Vercel
- **完全免费**: 个人项目无限制
- **流量**: 100GB/月（足够使用）
- **构建**: 无限次

**总费用**: ¥0/月（正常使用不会超出免费额度）

---

## 🔧 常见问题

### Q1: 部署后无法访问？
**A**: 检查以下几点：
1. Railway服务是否正常运行（绿色状态）
2. Vercel部署是否成功（Production状态）
3. 环境变量是否正确配置
4. CORS配置是否包含Vercel域名

### Q2: 如何更新应用？
**A**: 
```bash
# 修改代码后
git add .
git commit -m "更新描述"
git push

# Railway和Vercel会自动检测并重新部署
```

### Q3: 数据会丢失吗？
**A**: 
- Railway使用Volume持久化数据
- SQLite数据库文件会保存
- 建议定期备份（下载database.sqlite文件）

### Q4: 忘记Railway域名了？
**A**: 
1. 登录Railway
2. 进入项目
3. Settings > Domains 可以看到

### Q5: 应用运行缓慢？
**A**: 
- Railway免费版可能有冷启动（首次访问慢）
- 等待10-30秒后会恢复正常
- 升级到付费版可以避免冷启动

---

## 📊 监控和维护

### Railway监控
1. 登录Railway Dashboard
2. 查看CPU、内存、流量使用情况
3. 查看日志排查问题

### Vercel监控
1. 登录Vercel Dashboard
2. 查看访问量、构建次数
3. 查看错误日志

### 备份数据
定期从Railway下载数据库：
1. 进入Railway项目
2. 点击服务
3. Connect > 连接到服务器
4. 下载 `database.sqlite` 文件

---

## 🎉 完成！

恭喜！您的应用已经成功部署到云端，现在：

✅ 随时随地访问  
✅ 多人协作使用  
✅ 数据云端保存  
✅ 完全免费  

**应用地址**: `https://your-app.vercel.app`  
**分享给家人朋友，开始使用吧！** 🚀

---

## 🆘 需要帮助？

如果遇到问题：
1. 检查Railway和Vercel的部署日志
2. 查看浏览器控制台错误
3. 参考Railway和Vercel官方文档
