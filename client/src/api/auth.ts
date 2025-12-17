import request from '../utils/request';
import type { LoginForm, RegisterForm, AuthResponse, User } from '../types';

/**
 * 用户注册
 */
export const register = (data: RegisterForm) => {
  return request.post<any, AuthResponse>('/api/auth/register', data);
};

/**
 * 用户登录
 */
export const login = (data: LoginForm) => {
  return request.post<any, AuthResponse>('/api/auth/login', data);
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
  return request.get<any, { user: User }>('/api/auth/me');
};

/**
 * 刷新token
 */
export const refreshToken = () => {
  return request.post<any, { message: string; token: string }>('/api/auth/refresh');
};
