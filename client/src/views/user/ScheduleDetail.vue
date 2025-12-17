<template>
  <div class="schedule-detail-page">
    <van-nav-bar title="日程详情" left-arrow @click-left="router.back()">
      <template #right>
        <van-icon name="share-o" @click="handleShare" />
      </template>
    </van-nav-bar>

    <div v-if="loading" class="loading-container">
      <van-loading type="spinner" size="24px">加载中...</van-loading>
    </div>

    <div v-else-if="schedule" class="schedule-content">
      <!-- 在线用户提示 -->
      <van-notice-bar
        v-if="onlineUsers.length > 1"
        left-icon="friends-o"
        :text="`${onlineUsers.length} 人正在查看此日程`"
        color="#1989fa"
        background="#ecf9ff"
      />

      <!-- 正在编辑提示 -->
      <van-notice-bar
        v-if="typingUser"
        left-icon="edit"
        :text="`${typingUser} 正在编辑...`"
        color="#ff976a"
        background="#fff7cc"
      />

      <!-- 日程信息 -->
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

      <!-- 参与者 -->
      <van-cell-group inset class="detail-group">
        <van-cell title="参与者" />
        <van-cell
          v-for="participant in schedule.participants"
          :key="getUserId(participant.userId)"
          :title="getUserName(participant.userId)"
        >
          <template #value>
            <van-tag v-if="participant.permission === 'owner'" type="danger">
              创建者
            </van-tag>
            <van-tag v-else-if="participant.permission === 'editor'" type="primary">
              编辑者
            </van-tag>
            <van-tag v-else type="default">查看者</van-tag>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button
          v-if="canEdit"
          block
          type="primary"
          @click="handleEdit"
          icon="edit"
        >
          编辑日程
        </van-button>
        <van-button
          v-if="isOwner"
          block
          type="danger"
          @click="handleDelete"
          icon="delete-o"
        >
          删除日程
        </van-button>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <schedule-edit-dialog
      v-if="schedule"
      v-model:show="showEditDialog"
      :schedule="schedule"
      @updated="handleScheduleUpdated"
    />

    <!-- 分享对话框 -->
    <share-dialog
      v-if="schedule"
      v-model:show="showShareDialog"
      :schedule-id="schedule._id"
      :schedule-title="schedule.title"
      :schedule-desc="schedule.description"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import { useScheduleStore } from '../../stores/schedule';
import { useAuthStore } from '../../stores/auth';
import { socketClient } from '../../utils/socket';
import type { Schedule, User } from '../../types';
import ScheduleEditDialog from '../../components/ScheduleEditDialog.vue';
import ShareDialog from '../../components/ShareDialog.vue';

const router = useRouter();
const route = useRoute();
const scheduleStore = useScheduleStore();
const authStore = useAuthStore();

const scheduleId = route.params.id as string;
const schedule = ref<Schedule | null>(null);
const loading = ref(true);
const showEditDialog = ref(false);
const showShareDialog = ref(false);
const onlineUsers = ref<string[]>([]);
const typingUser = ref('');
let typingTimeout: any = null;

// 加载日程详情
const loadSchedule = async () => {
  loading.value = true;
  try {
    schedule.value = await scheduleStore.fetchScheduleById(scheduleId);

    // 加入Socket房间
    if (socketClient.isConnected()) {
      socketClient.joinSchedule(scheduleId);
    }
  } catch (error) {
    console.error('加载日程失败:', error);
    showToast('加载失败');
    router.back();
  } finally {
    loading.value = false;
  }
};

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

// 权限检查
const isOwner = computed(() => {
  if (!schedule.value || !authStore.user) return false;
  return schedule.value.createdBy === authStore.user.id ||
         (typeof schedule.value.createdBy === 'object' &&
          (schedule.value.createdBy as User)?.id === authStore.user.id);
});

const canEdit = computed(() => {
  if (!schedule.value || !authStore.user) return false;
  const participant = schedule.value.participants.find(
    (p) => {
      const userId = typeof p.userId === 'string' ? p.userId : (p.userId as User)?.id;
      return userId === authStore.user!.id;
    }
  );
  return participant && ['owner', 'editor'].includes(participant.permission);
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

// 获取用户ID
const getUserId = (userId: string | User): string => {
  if (typeof userId === 'string') return userId;
  return userId.id;
};

// 获取用户名
const getUserName = (userId: string | User): string => {
  if (typeof userId === 'string') return '用户';
  return userId.username || userId.email || '未知用户';
};

// 编辑日程
const handleEdit = () => {
  showEditDialog.value = true;
};

// 日程更新成功
const handleScheduleUpdated = () => {
  loadSchedule();
};

// 删除日程
const handleDelete = async () => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个日程吗？此操作不可恢复。',
    });

    await scheduleStore.deleteSchedule(scheduleId);
    showToast('删除成功');
    router.push('/user/dashboard');
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
    }
  }
};

// 分享日程
const handleShare = async () => {
  try {
    // 生成分享token
    await scheduleStore.generateShareToken(scheduleId);

    // 显示分享对话框
    showShareDialog.value = true;
  } catch (error) {
    console.error('生成分享链接失败:', error);
    showToast('生成分享链接失败');
  }
};

// Socket事件处理
const setupSocketListeners = () => {
  // 用户加入
  socketClient.onUserJoined((data) => {
    if (!onlineUsers.value.includes(data.username)) {
      onlineUsers.value.push(data.username);
    }
  });

  // 用户离开
  socketClient.onUserLeft((data) => {
    onlineUsers.value = onlineUsers.value.filter((u) => u !== data.username);
  });

  // 日程更新
  socketClient.onScheduleUpdated((data) => {
    if (data.scheduleId === scheduleId) {
      // 更新本地数据
      scheduleStore.updateScheduleLocally(scheduleId, data.updates);
      loadSchedule();

      showToast({
        message: `${data.updatedBy.username} 更新了日程`,
        duration: 1500,
      });
    }
  });

  // 用户正在输入
  socketClient.onUserTyping((data) => {
    typingUser.value = data.username;

    // 3秒后清除提示
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      typingUser.value = '';
    }, 3000);
  });

  // 用户停止输入
  socketClient.onUserStopTyping(() => {
    typingUser.value = '';
    if (typingTimeout) clearTimeout(typingTimeout);
  });

  // 房间成员列表
  socketClient.onRoomMembers((members) => {
    onlineUsers.value = members;
  });
};

// 清理Socket监听
const cleanupSocketListeners = () => {
  socketClient.off('user-joined');
  socketClient.off('user-left');
  socketClient.off('schedule-updated');
  socketClient.off('user-typing');
  socketClient.off('user-stop-typing');
  socketClient.off('room-members');
};

// 生命周期
onMounted(() => {
  loadSchedule();
  setupSocketListeners();
});

onUnmounted(() => {
  // 离开Socket房间
  if (socketClient.isConnected()) {
    socketClient.leaveSchedule(scheduleId);
  }
  cleanupSocketListeners();

  if (typingTimeout) clearTimeout(typingTimeout);
});
</script>

<style scoped>
.schedule-detail-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.loading-container {
  padding: 100px 20px;
  text-align: center;
}

.schedule-content {
  padding-bottom: 80px;
}

.detail-group {
  margin: 12px 0;
}

:deep(.van-cell__title) {
  font-weight: 500;
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
  display: flex;
  gap: 12px;
}

.action-buttons .van-button {
  flex: 1;
}

:deep(.van-button--primary) {
  background: #2c5aa0;
  border-color: #2c5aa0;
}
</style>
