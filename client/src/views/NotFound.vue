<template>
  <div class="not-found-page">
    <van-empty
      image="error"
      description="页面不存在"
    >
      <van-button
        round
        type="primary"
        @click="handleGoHome"
      >
        返回首页
      </van-button>
    </van-empty>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleGoHome = () => {
  if (authStore.isAuthenticated) {
    router.push('/user/dashboard');
  } else {
    router.push('/login');
  }
};
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7f8fa;
  padding: 20px;
}

:deep(.van-empty) {
  padding: 60px 20px;
}

:deep(.van-button--primary) {
  background: #2c5aa0;
  border-color: #2c5aa0;
  margin-top: 20px;
}
</style>
