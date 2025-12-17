import { io, Socket } from 'socket.io-client';
import type {
  SocketUserJoined,
  SocketUserLeft,
  SocketScheduleUpdated,
  SocketUserTyping,
} from '../types';

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 初始重连延迟（毫秒）

  /**
   * 连接Socket.IO服务器
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket已连接');
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

    this.socket = io(socketUrl, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.setupEventHandlers();
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // 连接成功
    this.socket.on('connect', () => {
      console.log('✅ Socket连接成功');
      this.reconnectAttempts = 0;
    });

    // 连接错误
    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket连接错误:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('达到最大重连次数，停止重连');
      }
    });

    // 断开连接
    this.socket.on('disconnect', (reason) => {
      console.log('⚠️  Socket断开连接:', reason);

      if (reason === 'io server disconnect') {
        // 服务器主动断开，手动重连
        this.socket?.connect();
      }
    });

    // 重连尝试
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 尝试重连 (${attemptNumber}/${this.maxReconnectAttempts})...`);
    });

    // 重连成功
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ 重连成功 (尝试次数: ${attemptNumber})`);
    });
  }

  /**
   * 加入日程房间
   */
  joinSchedule(scheduleId: string): void {
    this.socket?.emit('join-schedule', { scheduleId });
  }

  /**
   * 离开日程房间
   */
  leaveSchedule(scheduleId: string): void {
    this.socket?.emit('leave-schedule', { scheduleId });
  }

  /**
   * 发送日程更新
   */
  sendScheduleUpdate(scheduleId: string, updates: any, version: number): void {
    this.socket?.emit('schedule-update', { scheduleId, updates, version });
  }

  /**
   * 发送用户正在输入
   */
  sendUserTyping(scheduleId: string): void {
    this.socket?.emit('user-typing', { scheduleId });
  }

  /**
   * 发送用户停止输入
   */
  sendUserStopTyping(scheduleId: string): void {
    this.socket?.emit('user-stop-typing', { scheduleId });
  }

  /**
   * 监听用户加入
   */
  onUserJoined(callback: (data: SocketUserJoined) => void): void {
    this.socket?.on('user-joined', callback);
  }

  /**
   * 监听用户离开
   */
  onUserLeft(callback: (data: SocketUserLeft) => void): void {
    this.socket?.on('user-left', callback);
  }

  /**
   * 监听日程更新
   */
  onScheduleUpdated(callback: (data: SocketScheduleUpdated) => void): void {
    this.socket?.on('schedule-updated', callback);
  }

  /**
   * 监听用户输入状态
   */
  onUserTyping(callback: (data: SocketUserTyping) => void): void {
    this.socket?.on('user-typing', callback);
  }

  /**
   * 监听用户停止输入
   */
  onUserStopTyping(callback: (data: { userId: string }) => void): void {
    this.socket?.on('user-stop-typing', callback);
  }

  /**
   * 监听房间成员列表
   */
  onRoomMembers(callback: (members: string[]) => void): void {
    this.socket?.on('room-members', callback);
  }

  /**
   * 移除事件监听器
   */
  off(event: string): void {
    this.socket?.off(event);
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * 获取连接状态
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// 导出单例
export const socketClient = new SocketClient();
export default socketClient;
