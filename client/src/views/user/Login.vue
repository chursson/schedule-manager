<template>
  <div class="login-page">
    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- App图标和标题 -->
      <div class="app-header">
        <div class="app-icon">
          <img src="../../assets/images/app-logo.svg" alt="DP59 家庭行程" class="icon-img" />
        </div>
        <h1 class="app-title">家庭行程</h1>
        <p class="app-subtitle">🐾 请登录以继续使用 🐾</p>
      </div>

      <!-- 登录表单 -->
      <van-form @submit="handleLogin">
        <div class="form-group">
          <label class="form-label">手机号</label>
          <van-field
            v-model="form.email"
            name="email"
            placeholder="请输入手机号"
            type="tel"
            autocomplete="tel"
            :border="false"
            class="custom-field"
          >
            <template #left-icon>
              <van-icon name="phone" class="field-icon" />
            </template>
          </van-field>
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <van-field
            v-model="form.password"
            name="password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
            :border="false"
            class="custom-field"
          >
            <template #left-icon>
              <van-icon name="lock" class="field-icon" />
            </template>
          </van-field>
        </div>

        <div class="login-actions">
          <van-button
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            class="login-btn"
          >
            <span v-if="!loading">登录</span>
          </van-button>
        </div>
      </van-form>
    </div>
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
  // 验证表单
  if (!form.email || !form.email.trim()) {
    showToast({
      message: '请输入手机号',
      type: 'fail',
    });
    return;
  }

  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(form.email.trim())) {
    showToast({
      message: '请输入正确的手机号',
      type: 'fail',
    });
    return;
  }

  if (!form.password || !form.password.trim()) {
    showToast({
      message: '请输入密码',
      type: 'fail',
    });
    return;
  }

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
  background: linear-gradient(180deg, #E8EEF2 0%, #F5F7FA 100%);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 登录卡片 */
.login-card {
  background: white;
  border-radius: 20px;
  padding: 60px 40px 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 480px;
}

/* App头部 */
.app-header {
  text-align: center;
  margin-bottom: 50px;
}

.app-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(78, 124, 255, 0.25);
  overflow: hidden;
}

.icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-title {
  font-size: 32px;
  font-weight: 600;
  color: #4E7CFF;
  margin-bottom: 12px;
  letter-spacing: 2px;
}

.app-subtitle {
  font-size: 15px;
  color: #8B95A5;
  font-weight: 400;
}

/* 表单组 */
.form-group {
  margin-bottom: 24px;
  text-align: left;
}

.form-label {
  display: block;
  font-size: 15px;
  color: #2C3E50;
  margin-bottom: 8px;
  font-weight: 500;
  text-align: left;
  padding-left: 2px;
}

/* 自定义输入框 */
.custom-field {
  background: #F5F7FA;
  border-radius: 12px;
  padding: 0 16px;
  height: 52px;
}

.field-icon {
  color: #B0B8C1;
  font-size: 18px;
  margin-right: 12px;
}

:deep(.van-cell) {
  background: #F5F7FA;
  border-radius: 12px;
  padding: 14px 16px;
  line-height: 24px;
}

:deep(.van-field__control) {
  color: #2C3E50;
  font-size: 15px;
}

:deep(.van-field__control::placeholder) {
  color: #C5CDD6;
}

/* 登录按钮 */
.login-actions {
  margin-top: 32px;
}

.login-btn {
  height: 52px;
  font-size: 17px;
  font-weight: 600;
  background: linear-gradient(90deg, #4E7CFF 0%, #38C7E8 100%);
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(78, 124, 255, 0.3);
  transition: all 0.3s ease;
}

.login-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(78, 124, 255, 0.3);
}

:deep(.van-button--primary) {
  background: linear-gradient(90deg, #4E7CFF 0%, #38C7E8 100%);
  border: none;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .login-card {
    padding: 50px 28px 32px;
  }

  .app-icon {
    width: 88px;
    height: 88px;
  }

  .icon-img {
    width: 52px;
    height: 52px;
  }

  .app-title {
    font-size: 28px;
  }

  .app-subtitle {
    font-size: 14px;
  }
}
</style>
