<template>
  <div class="login-page">
    <!-- 背景装饰圆圈 -->
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>
    <div class="bg-circle bg-circle-3"></div>

    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="dog-container">
        <img src="../../assets/images/dog-happy.svg" alt="Welcome" class="welcome-dog" />
      </div>
      <h1 class="app-title">日程管理小助手</h1>
      <p class="welcome-text">欢迎回来！让我们一起高效安排每一天 ✨</p>
    </div>

    <!-- 登录表单卡片 -->
    <div class="login-card">
      <van-form @submit="handleLogin">
        <van-cell-group inset>
          <van-field
            v-model="form.email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱地址"
            :rules="[{ required: true, message: '请输入邮箱' }]"
            type="email"
            autocomplete="email"
            left-icon="envelop-o"
          />
          <van-field
            v-model="form.password"
            name="password"
            type="password"
            label="密码"
            placeholder="请输入登录密码"
            :rules="[{ required: true, message: '请输入密码' }]"
            autocomplete="current-password"
            left-icon="lock"
          />
        </van-cell-group>

        <div class="login-actions">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            class="login-btn"
          >
            <span v-if="!loading">立即登录</span>
          </van-button>

          <div class="register-link">
            还没有账号？
            <router-link to="/register" class="link-text">立即注册</router-link>
          </div>
        </div>
      </van-form>
    </div>

    <!-- 底部装饰 -->
    <div class="footer-tips">
      <p>💡 温馨提示：首次使用建议先注册账号</p>
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
  background: var(--gradient-primary);
  padding: 40px 20px 30px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 背景装饰圆圈 */
.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  pointer-events: none;
}

.bg-circle-1 {
  width: 200px;
  height: 200px;
  top: -50px;
  right: -50px;
  animation: float 6s ease-in-out infinite;
}

.bg-circle-2 {
  width: 150px;
  height: 150px;
  bottom: 100px;
  left: -30px;
  animation: float 8s ease-in-out infinite reverse;
}

.bg-circle-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  right: 20px;
  animation: float 7s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

/* 欢迎区域 */
.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.dog-container {
  margin-bottom: 20px;
  animation: bounce 2s ease-in-out infinite;
}

.welcome-dog {
  width: 100px;
  height: 100px;
  filter: drop-shadow(0 4px 12px rgba(255, 107, 157, 0.2));
}

.app-title {
  font-size: 28px;
  font-weight: bold;
  color: white;
  margin-bottom: 12px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.welcome-text {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.6;
}

/* 登录卡片 */
.login-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 32px 20px;
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 1;
  animation: slide-up 0.5s ease-out;
}

/* 登录操作区 */
.login-actions {
  margin-top: 24px;
}

.login-btn {
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
  transition: all var(--transition-normal);
}

.login-btn:active {
  transform: scale(0.98);
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

.link-text {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
  transition: color var(--transition-fast);
}

.link-text:hover {
  color: var(--primary-dark);
}

/* 底部提示 */
.footer-tips {
  text-align: center;
  margin-top: 30px;
  position: relative;
  z-index: 1;
}

.footer-tips p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 10px 20px;
  border-radius: var(--radius-full);
  display: inline-block;
}

/* Vant组件样式覆盖 */
:deep(.van-cell-group) {
  background: transparent;
  margin: 0;
}

:deep(.van-cell) {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: 16px;
  padding: 16px;
  border: 2px solid transparent;
  transition: all var(--transition-fast);
}

:deep(.van-cell:focus-within) {
  border-color: var(--primary-light);
  background: white;
  box-shadow: 0 0 0 4px rgba(255, 107, 157, 0.1);
}

:deep(.van-field__label) {
  color: var(--text-primary);
  font-weight: 500;
  width: 60px;
}

:deep(.van-field__control) {
  color: var(--text-primary);
}

:deep(.van-field__left-icon) {
  color: var(--primary-color);
  margin-right: 8px;
}

:deep(.van-button--primary) {
  background: var(--gradient-primary);
  border: none;
}

:deep(.van-button--primary:hover) {
  opacity: 0.9;
}

/* 响应式调整 */
@media (max-width: 375px) {
  .app-title {
    font-size: 24px;
  }

  .welcome-text {
    font-size: 14px;
  }

  .login-card {
    padding: 24px 16px;
  }
}

/* 大屏幕居中限制宽度 */
@media (min-width: 768px) {
  .login-page {
    align-items: center;
  }

  .welcome-section,
  .login-card {
    max-width: 400px;
    width: 100%;
  }
}
</style>
