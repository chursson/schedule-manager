# 日程管理与分享系统

一个支持多人实时协作的日程管理与分享平台，包含移动端C端用户界面和桌面端B端管理后台。

## 项目特点

- **C端移动端优先**: 专为微信浏览器优化，支持移动端手势操作
- **实时协作**: 基于WebSocket的实时同步编辑
- **微信分享**: 深度集成微信JS-SDK，支持分享到好友和朋友圈
- **专业UI**: Vant移动端组件库 + Element Plus桌面端组件库
- **线条小狗元素**: 友好的设计素材点缀

## 技术栈

### 前端
- Vue 3 + TypeScript + Vite
- Vant 4 (移动端) / Element Plus (桌面端)
- Pinia (状态管理)
- Vue Router (路由)
- Socket.IO Client (实时通信)
- Axios (HTTP客户端)
- ECharts (数据可视化)

### 后端
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Socket.IO (WebSocket)
- JWT (认证)
- bcrypt (密码加密)

## 项目结构

```
schedule-manager/
├── client/          # 前端项目
│   ├── src/
│   │   ├── assets/      # 静态资源
│   │   ├── components/  # 公共组件
│   │   ├── views/       # 页面
│   │   │   ├── user/    # C端页面
│   │   │   └── admin/   # B端页面
│   │   ├── stores/      # 状态管理
│   │   ├── api/         # API封装
│   │   ├── utils/       # 工具函数
│   │   └── router/      # 路由配置
│   └── ...
│
└── server/          # 后端项目
    ├── src/
    │   ├── models/       # 数据模型
    │   ├── routes/       # 路由
    │   ├── controllers/  # 控制器
    │   ├── middleware/   # 中间件
    │   ├── services/     # 业务逻辑
    │   ├── config/       # 配置
    │   └── utils/        # 工具函数
    └── ...
```

## 快速开始

### 环境要求
- Node.js 18+
- MongoDB 5.0+
- npm/yarn/pnpm

### 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 配置环境变量

```bash
# 后端环境变量
cp server/.env.example server/.env
# 编辑 server/.env 配置数据库和微信公众号信息

# 前端环境变量已在 client/.env 中配置
```

### 运行项目

```bash
# 启动后端开发服务器
cd server
npm run dev

# 启动前端开发服务器（新终端）
cd client
npm run dev
```

前端地址: http://localhost:5173
后端地址: http://localhost:3000

## 核心功能

### C端功能（移动端）
- 用户登录/注册
- 日程列表（支持下拉刷新、上拉加载）
- 日程创建/编辑/删除
- 日历视图
- 实时协作编辑
- 微信分享
- 离线支持

### B端功能（桌面端）
- 用户账号管理
- 权限管理
- 数据统计
- 系统配置

## 开发计划

- [x] 阶段1: 项目初始化
- [ ] 阶段2: 后端核心功能开发
- [ ] 阶段3: 前端基础框架搭建
- [ ] 阶段4: C端移动端功能开发
- [ ] 阶段5: 微信分享功能集成
- [ ] 阶段6: B端管理后台开发
- [ ] 阶段7: UI优化与素材集成
- [ ] 阶段8: 测试与部署

## 微信浏览器适配

项目针对微信浏览器做了以下优化：
- 禁用字体放大
- 处理键盘遮挡问题
- 微信JS-SDK签名（iOS/Android差异处理）
- 移动端性能优化

## 许可证

MIT
