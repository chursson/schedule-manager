import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Schedule, ScheduleForm, PaginationData } from '../types';
import * as scheduleApi from '../api/schedule';

export const useScheduleStore = defineStore('schedule', () => {
  // State
  const schedules = ref<Schedule[]>([]);
  const currentSchedule = ref<Schedule | null>(null);
  const pagination = ref<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const loading = ref(false);

  /**
   * 获取日程列表
   */
  async function fetchSchedules(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    loading.value = true;
    try {
      const response = await scheduleApi.getSchedules(params);
      schedules.value = response.schedules;
      pagination.value = response.pagination;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取单个日程详情
   */
  async function fetchScheduleById(id: string) {
    loading.value = true;
    try {
      const response = await scheduleApi.getScheduleById(id);
      currentSchedule.value = response.schedule;
      return response.schedule;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 创建日程
   */
  async function createSchedule(data: ScheduleForm) {
    const response = await scheduleApi.createSchedule(data);
    // 添加到列表开头
    schedules.value.unshift(response.schedule);
    return response.schedule;
  }

  /**
   * 更新日程
   */
  async function updateSchedule(id: string, data: Partial<ScheduleForm>, version?: number) {
    const response = await scheduleApi.updateSchedule(id, { ...data, version });

    // 更新列表中的日程
    const index = schedules.value.findIndex((s) => s._id === id);
    if (index !== -1) {
      schedules.value[index] = response.schedule;
    }

    // 更新当前日程
    if (currentSchedule.value?._id === id) {
      currentSchedule.value = response.schedule;
    }

    return response.schedule;
  }

  /**
   * 删除日程
   */
  async function deleteSchedule(id: string) {
    await scheduleApi.deleteSchedule(id);

    // 从列表中移除
    schedules.value = schedules.value.filter((s) => s._id !== id);

    // 清除当前日程
    if (currentSchedule.value?._id === id) {
      currentSchedule.value = null;
    }
  }

  /**
   * 生成分享链接
   */
  async function generateShareToken(id: string) {
    return await scheduleApi.generateShareToken(id);
  }

  /**
   * 通过分享token获取日程
   */
  async function fetchScheduleByShareToken(id: string, token: string) {
    loading.value = true;
    try {
      const response = await scheduleApi.getScheduleByShareToken(id, token);
      currentSchedule.value = response.schedule;
      return response.schedule;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 本地更新日程（用于实时协作）
   */
  function updateScheduleLocally(id: string, updates: Partial<Schedule>) {
    const index = schedules.value.findIndex((s) => s._id === id);
    if (index !== -1) {
      schedules.value[index] = { ...schedules.value[index], ...updates } as Schedule;
    }

    if (currentSchedule.value?._id === id) {
      currentSchedule.value = { ...currentSchedule.value, ...updates } as Schedule;
    }
  }

  /**
   * 清空列表
   */
  function clearSchedules() {
    schedules.value = [];
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    };
  }

  /**
   * 清空当前日程
   */
  function clearCurrentSchedule() {
    currentSchedule.value = null;
  }

  return {
    // State
    schedules,
    currentSchedule,
    pagination,
    loading,
    // Actions
    fetchSchedules,
    fetchScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    generateShareToken,
    fetchScheduleByShareToken,
    updateScheduleLocally,
    clearSchedules,
    clearCurrentSchedule,
  };
});
