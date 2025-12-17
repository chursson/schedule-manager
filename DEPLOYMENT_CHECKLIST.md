# ☑️ 云端部署清单

按照这个清单一步步操作，30分钟完成部署！

---

## 📝 准备阶段

- [ ] 注册Railway账号 (https://railway.app)
- [ ] 注册Vercel账号 (https://vercel.com)
- [ ] 注册GitHub账号 (https://github.com)
- [ ] 在GitHub创建新仓库 (名称：schedule-manager)

---

## 🔧 推送代码到GitHub

在项目根目录执行：

```bash
cd /Users/qiupeng/schedule-manager

# 初始化Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "准备云端部署"

# 连接到GitHub仓库
git remote add origin https://github.com/你的用户名/schedule-manager.git

# 推送
git branch -M main
git push -u origin main
```

- [ ] 代码已推送到GitHub

---

## 🚂 部署后端到Railway

### 1. 创建项目
- [ ] 访问 Railway Dashboard
- [ ] 点击 "New Project"
- [ ] 选择 "Deploy from GitHub repo"
- [ ] 选择 schedule-manager 仓库

### 2. 配置环境变量
点击服务 > Variables，添加：

```
NODE_ENV=production
PORT=3000
JWT_SECRET=（运行下面命令生成）
CLIENT_URL=*
```

生成JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- [ ] 环境变量已配置

### 3. 获取域名
- [ ] 点击 Settings > Domains
- [ ] 点击 "Generate Domain"
- [ ] **记录域名**: _________________________

### 4. 测试后端
访问：`https://你的域名/api/health`

- [ ] 后端部署成功

---

## ⚡ 部署前端到Vercel

### 1. 导入项目
- [ ] 访问 Vercel Dashboard
- [ ] 点击 "Add New Project"
- [ ] 选择 schedule-manager 仓库
- [ ] **重要**: Root Directory 选择 `client`

### 2. 配置环境变量
添加：
```
VITE_API_URL=https://你在Railway获得的域名
```

- [ ] 环境变量已配置

### 3. 部署
- [ ] 点击 "Deploy"
- [ ] 等待部署完成
- [ ] **记录域名**: _________________________

---

## 🔄 更新Railway配置

- [ ] 回到Railway项目
- [ ] 更新 `CLIENT_URL` 为 Vercel域名
- [ ] 保存并等待重新部署

---

## ✅ 测试应用

- [ ] 访问 Vercel 域名
- [ ] 注册新账号
- [ ] 创建测试日程
- [ ] 手机端访问测试
- [ ] 分享给家人测试

---

## 🎉 完成！

✅ 后端部署在: _________________________ (Railway)
✅ 前端部署在: _________________________ (Vercel)

**分享链接给家人**: https://_________________________

---

## 📱 告诉家人

把这个链接发给家人：

```
🏠 家庭日程管理应用上线啦！

访问地址：https://你的域名.vercel.app

1. 用手机浏览器打开链接
2. 注册你的账号
3. 开始创建和管理日程
4. 可以添加到手机主屏幕，像APP一样使用！

随时随地，轻松管理家庭日程 ✨
```

---

## 🆘 遇到问题？

参考详细指南：`CLOUD_DEPLOYMENT.md`

常见问题：
- 访问不了 → 检查域名是否正确
- 无法登录 → 检查后端是否正常运行
- 页面空白 → 查看浏览器控制台错误
