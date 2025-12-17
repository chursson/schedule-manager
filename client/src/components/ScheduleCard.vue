<template>
  <van-swipe-cell class="schedule-swipe">
    <div class="schedule-card" @click="$emit('click')">
      <!-- 状态指示条 -->
      <div class="status-bar" :class="`status-${schedule.status}`"></div>

      <div class="card-content">
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="status-badge" :class="`status-${schedule.status}`">
            <van-icon :name="statusIcon" />
            <span>{{ statusText }}</span>
          </div>
          <span class="time-badge">
            <van-icon name="clock-o" />
            {{ formatTime(schedule.startTime) }}
          </span>
        </div>

        <!-- 标题和描述 -->
        <h3 class="card-title">{{ schedule.title }}</h3>
        <p v-if="schedule.description" class="card-desc">{{ schedule.description }}</p>

        <!-- 标签 -->
        <div v-if="schedule.tags && schedule.tags.length > 0" class="card-tags">
          <span
            v-for="tag in schedule.tags"
            :key="tag"
            class="tag-item"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>

    <template #right>
      <div class="delete-action" @click="handleDelete">
        <van-icon name="delete-o" size="20" />
        <span>删除</span>
      </div>
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

// 状态图标
const statusIcon = computed(() => {
  const iconMap: Record<string, string> = {
    pending: 'clock-o',
    'in-progress': 'play-circle-o',
    completed: 'checked',
  };
  return iconMap[props.schedule.status] || 'question-o';
});

// 状态文本
const statusText = computed(() => {
  const statusMap: Record<string, string> = {
    pending: '待开始',
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
  emit('delete', props.schedule.id);
};
</script>

<style scoped>
.schedule-swipe {
  margin-bottom: 12px;
}

.schedule-card {
  position: relative;
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.schedule-card:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-md);
}

/* 状态指示条 */
.status-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.status-bar.status-pending {
  background: var(--accent-color);
}

.status-bar.status-in-progress {
  background: var(--secondary-color);
}

.status-bar.status-completed {
  background: linear-gradient(to bottom, #67C23A, #85CE61);
}

/* 卡片内容 */
.card-content {
  padding: 16px 16px 16px 20px;
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
}

.status-badge.status-pending {
  background: rgba(255, 217, 61, 0.15);
  color: #E6A23C;
}

.status-badge.status-in-progress {
  background: rgba(78, 205, 196, 0.15);
  color: var(--secondary-color);
}

.status-badge.status-completed {
  background: rgba(103, 194, 58, 0.15);
  color: #67C23A;
}

.time-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.time-badge .van-icon {
  font-size: 13px;
}

/* 标题和描述 */
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 标签 */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  display: inline-block;
  padding: 3px 10px;
  background: var(--primary-lighter);
  color: var(--primary-color);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
}

/* 删除操作 */
.delete-action {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 20px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.delete-action:active {
  opacity: 0.8;
}

/* 响应式 */
@media (max-width: 375px) {
  .card-content {
    padding: 14px 14px 14px 18px;
  }

  .card-title {
    font-size: 15px;
  }

  .card-desc {
    font-size: 13px;
  }
}
</style>
