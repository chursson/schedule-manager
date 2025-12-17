import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { showToast } from 'vant';

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    console.error('响应错误:', error);

    let message = '请求失败';

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          message = data.message || '请求参数错误';
          break;
        case 401:
          message = '未登录或登录已过期';
          // 清除token并跳转到登录页
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          message = data.message || '没有权限访问';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 409:
          message = data.message || '数据冲突';
          break;
        case 500:
          message = '服务器错误';
          break;
        default:
          message = data.message || '请求失败';
      }
    } else if (error.request) {
      message = '网络连接失败，请检查网络';
    }

    // 显示错误提示（移动端使用Vant的Toast）
    showToast({
      message,
      position: 'top',
    });

    return Promise.reject(error);
  }
);

export default request;
