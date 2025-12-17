<template>
  <div class="register-page">
    <!-- 背景装饰 -->
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <!-- 顶部导航 -->
    <div class="top-nav">
      <div class="back-btn" @click="router.back()">
        <van-icon name="arrow-left" size="20" />
      </div>
      <h2 class="nav-title">创建账号</h2>
    </div>

    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="dog-container">
        <img src="../../assets/images/dog-happy.svg" alt="Welcome" class="welcome-dog" />
      </div>
      <h1 class="app-title">加入我们</h1>
      <p class="welcome-text">开启高效日程管理之旅 🚀</p>
    </div>

    <!-- 注册表单卡片 -->
    <div class="register-card">
      <van-form @submit="handleRegister">
        <van-cell-group inset>
          <van-field
            v-model="form.username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
            ]"
            left-icon="user-o"
          />
          <van-field
            v-model="form.email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱地址"
            :rules="[
              { required: true, message: '请输入邮箱' },
              { pattern: /^\S+@\S+\.\S+$/, message: '请输入有效的邮箱地址' },
            ]"
            type="email"
            left-icon="envelop-o"
          />
          <van-field
            v-model="form.password"
            name="password"
            type="password"
            label="密码"
            placeholder="至少6位密码"
            :rules="[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]"
            left-icon="lock"
          />
          <van-field
            v-model="form.confirmPassword"
            name="confirmPassword"
            type="password"
            label="确认密码"
            placeholder="再次输入密码"
            :rules="[
              { required: true, message: '请再次输入密码' },
              { validator: validatePassword, message: '两次密码不一致' },
            ]"
            left-icon="lock"
          />
        </van-cell-group>

        <div class="register-actions">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            class="register-btn"
          >
            <span v-if="!loading">立即注册</span>
          </van-button>

          <div class="login-link">
            已有账号？
            <router-link to="/login" class="link-text">立即登录</router-link>
          </div>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useAuthStore } from '../../stores/auth';
import type { RegisterForm } from '../../types';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive<RegisterForm>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const loading = ref(false);

// 验证密码一致性
const validatePassword = (val: string) => {
  return val === form.password;
};

const handleRegister = async () => {
  loading.value = true;
  try {
    await authStore.register(form);

    showToast({
      message: '注册成功',
      type: 'success',
    });

    // 跳转到首页
    router.push('/user/dashboard');
  } catch (error: any) {
    console.error('注册失败:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: var(--gradient-primary);
  padding: 0 20px 30px;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  pointer-events: none;
}

.bg-circle-1 {
  width: 180px;
  height: 180px;
  top: -40px;
  right: -40px;
  animation: float 7s ease-in-out infinite;
}

.bg-circle-2 {
  width: 120px;
  height: 120px;
  bottom: 150px;
  left: -20px;
  animation: float 9s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.03);
  }
}

/* 顶部导航 */
.top-nav {
  display: flex;
  align-items: center;
  padding: 16px 0;
  position: relative;
  z-index: 10;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.back-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

.nav-title {
  flex: 1;
  text-align: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin-right: 40px;
}

/* 欢迎区域 */
.welcome-section {
  text-align: center;
  margin: 30px 0 40px;
  position: relative;
  z-index: 1;
}

.dog-container {
  margin-bottom: 16px;
  animation: bounce 2s ease-in-out infinite;
}

.welcome-dog {
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 4px 12px rgba(255, 107, 157, 0.2));
}

.app-title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.welcome-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.6;
}

/* 注册卡片 */
.register-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 28px 20px;
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 1;
  animation: slide-up 0.5s ease-out;
}

/* 注册操作区 */
.register-actions {
  margin-top: 20px;
}

.register-btn {
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
  transition: all var(--transition-normal);
}

.register-btn:active {
  transform: scale(0.98);
}

.login-link {
  text-align: center;
  margin-top: 16px;
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

/* Vant组件样式覆盖 */
:deep(.van-cell-group) {
  background: transparent;
  margin: 0;
}

:deep(.van-cell) {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: 14px;
  padding: 14px;
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
  width: 70px;
  font-size: 14px;
}

:deep(.van-field__control) {
  color: var(--text-primary);
  font-size: 14px;
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
    font-size: 22px;
  }

  .welcome-text {
    font-size: 13px;
  }

  .register-card {
    padding: 24px 16px;
  }

  :deep(.van-cell) {
    padding: 12px;
  }
}

/* 大屏幕居中 */
@media (min-width: 768px) {
  .register-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .top-nav,
  .welcome-section,
  .register-card {
    max-width: 400px;
    width: 100%;
  }

  .top-nav {
    margin-bottom: 0;
  }
}
</style>
