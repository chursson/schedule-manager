import axios from 'axios';

// 用户接口
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'super-admin' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'disabled';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 角色接口
export interface Role {
  value: string;
  label: string;
  description: string;
}

// 统计数据接口
export interface Statistics {
  users: {
    total: number;
    active: number;
    recent: number;
  };
  schedules: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    recent: number;
  };
}

/**
 * 获取用户列表
 */
export const getUserList = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) => {
  const response = await axios.get('/api/admin/users', { params });
  return response.data;
};

/**
 * 更新用户
 */
export const updateUser = async (
  userId: number,
  data: Partial<User>
) => {
  const response = await axios.put(`/api/admin/users/${userId}`, data);
  return response.data;
};

/**
 * 重置用户密码
 */
export const resetUserPassword = async (
  userId: number,
  newPassword: string
) => {
  const response = await axios.post(`/api/admin/users/${userId}/reset-password`, {
    newPassword,
  });
  return response.data;
};

/**
 * 删除用户
 */
export const deleteUser = async (userId: number) => {
  const response = await axios.delete(`/api/admin/users/${userId}`);
  return response.data;
};

/**
 * 获取角色列表
 */
export const getRoles = async () => {
  const response = await axios.get('/api/admin/roles');
  return response.data;
};

/**
 * 获取统计数据
 */
export const getStatistics = async () => {
  const response = await axios.get<Statistics>('/api/admin/statistics');
  return response.data;
};
