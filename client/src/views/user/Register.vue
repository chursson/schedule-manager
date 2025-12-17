<template>
  <div class="register-page">
    <van-nav-bar title="注册" left-arrow @click-left="router.back()" />

    <div class="register-content">
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
          />
          <van-field
            v-model="form.email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱"
            :rules="[
              { required: true, message: '请输入邮箱' },
              { pattern: /^\S+@\S+\.\S+$/, message: '请输入有效的邮箱地址' },
            ]"
            type="email"
          />
          <van-field
            v-model="form.password"
            name="password"
            type="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]"
          />
          <van-field
            v-model="form.confirmPassword"
            name="confirmPassword"
            type="password"
            label="确认密码"
            placeholder="请再次输入密码"
            :rules="[
              { required: true, message: '请再次输入密码' },
              { validator: validatePassword, message: '两次密码不一致' },
            ]"
          />
        </van-cell-group>

        <div class="register-actions">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            注册
          </van-button>
          <div class="login-link">
            已有账号？
            <router-link to="/login">立即登录</router-link>
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
  background-color: #f7f8fa;
}

.register-content {
  padding: 20px;
}

.register-actions {
  margin-top: 30px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #646566;
  font-size: 14px;
}

.login-link a {
  color: #2c5aa0;
  font-weight: bold;
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
