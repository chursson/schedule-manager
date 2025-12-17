import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import User from '../models/User';

// 用户Socket映射
const userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>
const scheduleRooms = new Map<string, Set<string>>(); // scheduleId -> Set<userId>

export class SocketService {
  private io: SocketIOServer;

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * 设置中间件 - JWT认证
   */
  private setupMiddleware() {
    this.io.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('未提供认证token'));
        }

        // 验证token
        const decoded = jwt.verify(token, jwtConfig.secret) as { userId: string };

        // 查找用户
        const user = await User.findById(decoded.userId);

        if (!user || user.status !== 'active') {
          return next(new Error('用户不存在或已被禁用'));
        }

        // 将用户信息附加到socket
        socket.data.user = {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
        };

        next();
      } catch (error) {
        next(new Error('认证失败'));
      }
    });
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.user.id;
      console.log(`✅ 用户连接: ${socket.data.user.username} (${socket.id})`);

      // 记录用户socket
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)!.add(socket.id);

      // 加入日程房间
      socket.on('join-schedule', ({ scheduleId }: { scheduleId: string }) => {
        socket.join(`schedule:${scheduleId}`);

        // 记录房间成员
        if (!scheduleRooms.has(scheduleId)) {
          scheduleRooms.set(scheduleId, new Set());
        }
        scheduleRooms.get(scheduleId)!.add(userId);

        // 通知房间内其他人
        socket.to(`schedule:${scheduleId}`).emit('user-joined', {
          userId,
          username: socket.data.user.username,
          timestamp: new Date(),
        });

        // 发送当前房间成员列表
        const roomMembers = Array.from(scheduleRooms.get(scheduleId) || []);
        socket.emit('room-members', roomMembers);

        console.log(
          `📅 ${socket.data.user.username} 加入日程: ${scheduleId}`
        );
      });

      // 离开日程房间
      socket.on('leave-schedule', ({ scheduleId }: { scheduleId: string }) => {
        socket.leave(`schedule:${scheduleId}`);

        // 从房间成员中移除
        const room = scheduleRooms.get(scheduleId);
        if (room) {
          room.delete(userId);
          if (room.size === 0) {
            scheduleRooms.delete(scheduleId);
          }
        }

        // 通知房间内其他人
        socket.to(`schedule:${scheduleId}`).emit('user-left', {
          userId,
          username: socket.data.user.username,
          timestamp: new Date(),
        });

        console.log(
          `📤 ${socket.data.user.username} 离开日程: ${scheduleId}`
        );
      });

      // 日程更新事件
      socket.on(
        'schedule-update',
        ({
          scheduleId,
          updates,
          version,
        }: {
          scheduleId: string;
          updates: any;
          version: number;
        }) => {
          // 广播给房间内其他用户
          socket.to(`schedule:${scheduleId}`).emit('schedule-updated', {
            scheduleId,
            updates,
            version,
            updatedBy: {
              userId,
              username: socket.data.user.username,
            },
            timestamp: new Date(),
          });

          console.log(
            `✏️  ${socket.data.user.username} 更新日程: ${scheduleId}`
          );
        }
      );

      // 用户正在输入
      socket.on('user-typing', ({ scheduleId }: { scheduleId: string }) => {
        socket.to(`schedule:${scheduleId}`).emit('user-typing', {
          userId,
          username: socket.data.user.username,
        });
      });

      // 用户停止输入
      socket.on('user-stop-typing', ({ scheduleId }: { scheduleId: string }) => {
        socket.to(`schedule:${scheduleId}`).emit('user-stop-typing', {
          userId,
        });
      });

      // 断开连接
      socket.on('disconnect', () => {
        console.log(`❌ 用户断开: ${socket.data.user.username} (${socket.id})`);

        // 清理用户socket映射
        const sockets = userSockets.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(userId);

            // 从所有房间中移除用户
            scheduleRooms.forEach((members, scheduleId) => {
              if (members.has(userId)) {
                members.delete(userId);
                // 通知房间内其他人
                this.io.to(`schedule:${scheduleId}`).emit('user-left', {
                  userId,
                  username: socket.data.user.username,
                  timestamp: new Date(),
                });
              }
            });
          }
        }
      });
    });
  }

  /**
   * 向指定用户发送消息
   */
  public emitToUser(userId: string, event: string, data: any) {
    const sockets = userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  /**
   * 向指定日程房间发送消息
   */
  public emitToSchedule(scheduleId: string, event: string, data: any) {
    this.io.to(`schedule:${scheduleId}`).emit(event, data);
  }

  /**
   * 获取Socket.IO实例
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
}
