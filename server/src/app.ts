import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './config/database';
import { SocketService } from './services/socketService';

// 导入路由
import authRoutes from './routes/auth';
import scheduleRoutes from './routes/schedule';
import wechatRoutes from './routes/wechat';
import adminRoutes from './routes/admin';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const httpServer = createServer(app);

// 连接数据库
connectDB();

// 初始化Socket.IO
const socketService = new SocketService(httpServer);

// 中间件
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? [process.env.CLIENT_URL || '*']
      : [
          'http://localhost:5173',
          'http://30.138.104.69:5173',
          process.env.CLIENT_URL || 'http://localhost:5173'
        ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/wechat', wechatRoutes);
app.use('/api/admin', adminRoutes);

// 健康检查
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404处理
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: '接口不存在' });
});

// 错误处理
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('错误:', err);
  res.status(err.status || 500).json({
    message: err.message || '服务器内部错误',
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // 监听所有网络接口

httpServer.listen(PORT, HOST, () => {
  console.log('='.repeat(50));
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📝 本地访问: http://localhost:${PORT}/api`);
  console.log(`📱 局域网访问: http://30.138.104.69:${PORT}/api`);
  console.log(`🔌 WebSocket地址: http://30.138.104.69:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
});

// 优雅退出
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  httpServer.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

export { socketService };
