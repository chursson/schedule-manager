<template>
  <div class="shared-view-page">
    <van-nav-bar title="分享的日程" left-arrow @click-left="handleBack" />

    <div v-if="loading" class="loading-container">
      <van-loading type="spinner" size="24px">加载中...</van-loading>
    </div>

    <div v-else-if="schedule" class="schedule-content">
      <!-- 分享提示 -->
      <van-notice-bar
        left-icon="info-o"
        text="这是其他人分享给您的日程"
        color="#1989fa"
        background="#ecf9ff"
      />

      <!-- 日程详情 -->
      <van-cell-group inset class="detail-group">
        <van-cell title="标题" :value="schedule.title" />
        <van-cell title="描述" :label="schedule.description || '暂无描述'" />
        <van-cell title="开始时间" :value="formatDateTime(schedule.startTime)" />
        <van-cell title="结束时间" :value="formatDateTime(schedule.endTime)" />
        <van-cell title="状态">
          <template #value>
            <van-tag :type="statusTagType">{{ statusText }}</van-tag>
          </template>
        </van-cell>
        <van-cell v-if="schedule.tags && schedule.tags.length > 0" title="标签">
          <template #value>
            <div class="tags-container">
              <van-tag
                v-for="tag in schedule.tags"
                :key="tag"
                type="primary"
                plain
                size="medium"
              >
                {{ tag }}
              </van-tag>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button
          v-if="!isLoggedIn"
          block
          type="primary"
          @click="router.push('/login')"
        >
          登录查看更多
        </van-button>
        <van-button
          v-else
          block
          type="primary"
          @click="router.push('/user/dashboard')"
        >
          查看我的日程
        </van-button>
      </div>
    </div>

    <div v-else class="error-state">
      <van-empty description="分享链接无效或已过期">
        <van-button
          round
          type="primary"
          @click="isLoggedIn ? router.push('/user/dashboard') : router.push('/login')"
        >
          {{ isLoggedIn ? '返回首页' : '前往登录' }}
        </van-button>
      </van-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { useScheduleStore } from '../../stores/schedule';
import { useAuthStore } from '../../stores/auth';
import type { Schedule } from '../../types';

const router = useRouter();
const route = useRoute();
const scheduleStore = useScheduleStore();
const authStore = useAuthStore();

const scheduleId = route.params.id as string;
const token = route.query.token as string;

const schedule = ref<Schedule | null>(null);
const loading = ref(true);

const isLoggedIn = computed(() => authStore.isAuthenticated);

// 状态相关
const statusTagType = computed(() => {
  if (!schedule.value) return 'default';
  const statusMap: Record<string, any> = {
    pending: 'default',
    'in-progress': 'primary',
    completed: 'success',
  };
  return statusMap[schedule.value.status] || 'default';
});

const statusText = computed(() => {
  if (!schedule.value) return '';
  const statusMap: Record<string, string> = {
    pending: '待办',
    'in-progress': '进行中',
    completed: '已完成',
  };
  return statusMap[schedule.value.status] || '未知';
});

// 格式化时间
const formatDateTime = (time: string | Date) => {
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 加载分享的日程
const loadSchedule = async () => {
  loading.value = true;
  try {
    if (!token) {
      throw new Error('缺少分享token');
    }

    schedule.value = await scheduleStore.fetchScheduleByShareToken(scheduleId, token);
  } catch (error: any) {
    console.error('加载分享日程失败:', error);
    showToast('加载失败');
    schedule.value = null;
  } finally {
    loading.value = false;
  }
};

// 返回处理
const handleBack = () => {
  if (isLoggedIn.value) {
    router.push('/user/dashboard');
  } else {
    router.push('/login');
  }
};

onMounted(() => {
  loadSchedule();
});
</script>

<style scoped>
.shared-view-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.loading-container,
.error-state {
  padding: 100px 20px;
  text-align: center;
}

.schedule-content {
  padding-bottom: 80px;
}

.detail-group {
  margin: 12px 0;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.van-button--primary) {
  background: #2c5aa0;
  border-color: #2c5aa0;
}

:deep(.van-empty .van-button) {
  margin-top: 20px;
}
</style>
