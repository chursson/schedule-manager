import request from '../utils/request';
import type { Schedule, ScheduleForm, ScheduleListResponse } from '../types';

/**
 * 创建日程
 */
export const createSchedule = (data: ScheduleForm) => {
  return request.post<any, { message: string; schedule: Schedule }>(
    '/api/schedules',
    data
  );
};

/**
 * 获取日程列表
 */
export const getSchedules = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return request.get<any, ScheduleListResponse>('/api/schedules', { params });
};

/**
 * 获取单个日程详情
 */
export const getScheduleById = (id: string) => {
  return request.get<any, { schedule: Schedule }>(`/api/schedules/${id}`);
};

/**
 * 更新日程
 */
export const updateSchedule = (id: string, data: Partial<ScheduleForm> & { version?: number }) => {
  return request.put<any, { message: string; schedule: Schedule }>(
    `/api/schedules/${id}`,
    data
  );
};

/**
 * 删除日程
 */
export const deleteSchedule = (id: string) => {
  return request.delete<any, { message: string }>(`/api/schedules/${id}`);
};

/**
 * 生成分享链接
 */
export const generateShareToken = (id: string) => {
  return request.post<any, { message: string; shareToken: string; shareUrl: string }>(
    `/api/schedules/${id}/share`
  );
};

/**
 * 通过分享token获取日程
 */
export const getScheduleByShareToken = (id: string, token: string) => {
  return request.get<any, { schedule: Schedule }>(`/api/schedules/shared/${id}`, {
    params: { token },
  });
};
