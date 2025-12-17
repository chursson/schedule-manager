<template>
  <van-swipe-cell>
    <van-card
      :title="schedule.title"
      :desc="schedule.description"
      class="schedule-card"
      @click="$emit('click')"
    >
      <template #tags>
        <div class="schedule-meta">
          <van-tag :type="statusTagType" size="medium">
            {{ statusText }}
          </van-tag>
          <span class="schedule-time">
            {{ formatTime(schedule.startTime) }}
          </span>
        </div>
        <div v-if="schedule.tags && schedule.tags.length > 0" class="schedule-tags">
          <van-tag
            v-for="tag in schedule.tags"
            :key="tag"
            plain
            type="primary"
            size="small"
          >
            {{ tag }}
          </van-tag>
        </div>
      </template>
    </van-card>

    <template #right>
      <van-button square type="danger" text="删除" @click="handleDelete" class="delete-btn" />
    </template>
  </van-swipe-cell>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Schedule } from '../types';

interface Props {
  schedule: Schedule;
}

const props = defineProps<Props>();
const emit = defineEmits(['click', 'delete']);

// 状态标签类型
const statusTagType = computed(() => {
  const statusMap: Record<string, any> = {
    pending: 'default',
    'in-progress': 'primary',
    completed: 'success',
  };
  return statusMap[props.schedule.status] || 'default';
});

// 状态文本
const statusText = computed(() => {
  const statusMap: Record<string, string> = {
    pending: '待办',
    'in-progress': '进行中',
    completed: '已完成',
  };
  return statusMap[props.schedule.status] || '未知';
});

// 格式化时间
const formatTime = (time: string | Date) => {
  const date = new Date(time);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < -1) {
    return `${Math.abs(days)} 天前`;
  } else if (days === -1) {
    return '昨天';
  } else if (days === 0) {
    return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return '明天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' +
           date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
};

// 删除日程
const handleDelete = () => {
  emit('delete', props.schedule._id);
};
</script>

<style scoped>
.schedule-card {
  margin-bottom: 12px;
  border-radius: 12px;
  overflow: hidden;
}

:deep(.van-card__content) {
  min-height: 80px;
}

:deep(.van-card__title) {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 8px;
}

:deep(.van-card__desc) {
  color: #969799;
  font-size: 14px;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.schedule-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.schedule-time {
  font-size: 12px;
  color: #969799;
}

.schedule-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.delete-btn {
  height: 100%;
}
</style>
