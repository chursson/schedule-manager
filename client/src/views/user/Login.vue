<template>
  <div class="login-page">
    <div class="login-header">
      <h1>日程管理</h1>
      <p>欢迎回来</p>
    </div>

    <van-form @submit="handleLogin">
      <van-cell-group inset>
        <van-field
          v-model="form.email"
          name="email"
          label="邮箱"
          placeholder="请输入邮箱"
          :rules="[{ required: true, message: '请输入邮箱' }]"
          type="email"
          autocomplete="email"
        />
        <van-field
          v-model="form.password"
          name="password"
          type="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
          autocomplete="current-password"
        />
      </van-cell-group>

      <div class="login-actions">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登录
        </van-button>
        <div class="register-link">
          还没有账号？
          <router-link to="/register">立即注册</router-link>
        </div>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { useAuthStore } from '../../stores/auth';
import type { LoginForm } from '../../types';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = reactive<LoginForm>({
  email: '',
  password: '',
});

const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  try {
    await authStore.login(form);

    showToast({
      message: '登录成功',
      type: 'success',
    });

    // 跳转到重定向页面或首页
    const redirect = (route.query.redirect as string) || '/user/dashboard';
    router.push(redirect);
  } catch (error: any) {
    console.error('登录失败:', error);
    // 错误提示已在axios拦截器中处理
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 20px 20px;
}

.login-header {
  text-align: center;
  color: white;
  margin-bottom: 60px;
}

.login-header h1 {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
}

.login-header p {
  font-size: 16px;
  opacity: 0.9;
}

.login-actions {
  margin-top: 30px;
  padding: 0 16px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: white;
  font-size: 14px;
}

.register-link a {
  color: white;
  font-weight: bold;
  text-decoration: underline;
}

:deep(.van-cell-group) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.van-button--primary) {
  background: #2c5aa0;
  border-color: #2c5aa0;
  height: 48px;
  font-size: 16px;
}
</style>
