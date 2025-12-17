// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'super-admin' | 'admin' | 'editor' | 'viewer';
  status?: 'active' | 'disabled';
  avatar?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// 日程相关类型
export interface Participant {
  userId: string | User;
  permission: 'owner' | 'editor' | 'viewer';
}

export interface Schedule {
  _id: string;
  title: string;
  description?: string;
  startTime: string | Date;
  endTime: string | Date;
  participants: Participant[];
  tags: string[];
  status: 'pending' | 'in-progress' | 'completed';
  version: number;
  shareToken?: string;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleForm {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  tags?: string[];
  status?: 'pending' | 'in-progress' | 'completed';
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ScheduleListResponse {
  schedules: Schedule[];
  pagination: PaginationData;
}

// Socket事件类型
export interface SocketUserJoined {
  userId: string;
  username: string;
  timestamp: Date;
}

export interface SocketUserLeft {
  userId: string;
  username: string;
  timestamp: Date;
}

export interface SocketScheduleUpdated {
  scheduleId: string;
  updates: Partial<Schedule>;
  version: number;
  updatedBy: {
    userId: string;
    username: string;
  };
  timestamp: Date;
}

export interface SocketUserTyping {
  userId: string;
  username: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  [key: string]: any;
}

export interface ApiError {
  message: string;
  status?: number;
}
