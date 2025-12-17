import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, LoginForm, RegisterForm } from '../types';
import * as authApi from '../api/auth';
import { socketClient } from '../utils/socket';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => {
    return user.value?.role === 'admin' || user.value?.role === 'super-admin';
  });

  /**
   * 初始化 - 从localStorage恢复状态
   */
  function init() {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      token.value = savedToken;
      try {
        user.value = JSON.parse(savedUser);
        // TODO: 初始化Socket连接 - 暂时禁用
        // socketClient.connect(savedToken);
      } catch (error) {
        console.error('解析用户信息失败:', error);
        logout();
      }
    }
  }

  /**
   * 登录
   */
  async function login(form: LoginForm) {
    loading.value = true;
    try {
      const response = await authApi.login(form);

      token.value = response.token;
      user.value = response.user;

      // 保存到localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // TODO: 连接Socket - 暂时禁用
      // socketClient.connect(response.token);

      return response;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 注册
   */
  async function register(form: RegisterForm) {
    loading.value = true;
    try {
      const response = await authApi.register(form);

      token.value = response.token;
      user.value = response.user;

      // 保存到localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // TODO: 连接Socket - 暂时禁用
      // socketClient.connect(response.token);

      return response;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 登出
   */
  function logout() {
    // TODO: 断开Socket连接 - 暂时禁用
    // socketClient.disconnect();

    // 清除状态
    user.value = null;
    token.value = null;

    // 清除localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * 获取当前用户信息
   */
  async function fetchCurrentUser() {
    try {
      const response = await authApi.getCurrentUser();
      user.value = response.user;
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      console.error('获取用户信息失败:', error);
      logout();
      throw error;
    }
  }

  /**
   * 更新用户信息
   */
  function updateUser(newUser: User) {
    user.value = newUser;
    localStorage.setItem('user', JSON.stringify(newUser));
  }

  return {
    // State
    user,
    token,
    loading,
    // Getters
    isAuthenticated,
    isAdmin,
    // Actions
    init,
    login,
    register,
    logout,
    fetchCurrentUser,
    updateUser,
  };
});
