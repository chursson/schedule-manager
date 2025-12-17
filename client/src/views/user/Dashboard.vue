<template>
  <div class="dashboard-page">
    <!-- 顶部标题栏 -->
    <div class="app-header">
      <div class="header-left">
        <div class="app-icon">
          <van-icon name="home-o" />
        </div>
        <h1 class="app-title">家庭行程</h1>
      </div>
      <van-icon name="info-o" class="info-icon" />
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-info">
        <div class="user-avatar">
          {{ getUserInitials(authStore.user?.username) }}
        </div>
        <div class="user-details">
          <h3 class="user-name">{{ authStore.user?.username || '用户' }}</h3>
          <p class="user-email">{{ authStore.user?.email || '' }}</p>
        </div>
        <van-icon name="arrow" class="arrow-icon" />
      </div>
      <div class="view-toggles">
        <div class="toggle-btn" :class="{ active: viewMode === 'year' }" @click="viewMode = 'year'">
          年维度
        </div>
        <div class="toggle-btn" :class="{ active: viewMode === 'day' }" @click="viewMode = 'day'">
          天维度
        </div>
      </div>
    </div>

    <!-- 日程规划区域 -->
    <div class="planning-section">
      <div class="section-header">
        <div class="section-title">
          <h2>年度规划 🦌</h2>
          <p class="section-subtitle">本年规划总数 · {{ scheduleStore.schedules.length }} 项</p>
        </div>
        <div class="section-actions">
          <div class="view-options">
            <div class="option-btn" :class="{ active: listView === 'timeline' }" @click="listView = 'timeline'">
              时间线
            </div>
            <div class="option-btn" :class="{ active: listView === 'calendar' }" @click="listView = 'calendar'">
              日历
            </div>
          </div>
        </div>
      </div>

      <!-- 添加按钮 -->
      <button class="add-schedule-btn" @click="handleCreate">
        <van-icon name="plus" />
        <span>添加安排</span>
      </button>
    </div>

    <!-- 日程列表 - 时间轴视图 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="content-wrapper">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="✨ 已经到底啦"
        @load="onLoad"
      >
        <div v-if="scheduleStore.schedules.length === 0 && !loading" class="empty-state">
          <div class="empty-dog">
            <img src="../../assets/images/dog-empty.svg" alt="Empty" />
          </div>
          <h3 class="empty-title">还没有日程呢</h3>
          <p class="empty-desc">创建第一个日程，开始规划美好生活吧！</p>
        </div>

        <div v-else class="timeline-container">
          <div
            v-for="(group, month) in groupedSchedules"
            :key="month"
            class="timeline-group"
          >
            <div class="month-header">
              <div class="month-icon">
                <van-icon name="calendar-o" />
              </div>
              <h3 class="month-title">{{ month }}</h3>
            </div>

            <div class="timeline-items">
              <div
                v-for="schedule in group"
                :key="schedule.id"
                class="timeline-item"
                @click="handleView(schedule.id)"
              >
                <div class="item-icon">
                  <van-icon name="notes-o" />
                </div>
                <div class="item-content">
                  <div class="item-header">
                    <h4 class="item-title">{{ schedule.title }}</h4>
                    <span class="item-tag">{{ getStatusText(schedule.status) }}</span>
                  </div>
                  <p class="item-desc">{{ schedule.description }}</p>
                  <div class="item-meta">
                    <span class="meta-item">
                      <van-icon name="clock-o" />
                      {{ formatDateTime(schedule.startTime) }}
                    </span>
                    <span v-if="schedule.tags && schedule.tags.length > 0" class="meta-item">
                      <van-icon name="location-o" />
                      {{ schedule.tags[0] }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 创建日程弹窗 -->
    <schedule-create-dialog
      v-model:show="showCreateDialog"
      @created="handleScheduleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import { useAuthStore } from '../../stores/auth';
import { useScheduleStore } from '../../stores/schedule';
import ScheduleCreateDialog from '../../components/ScheduleCreateDialog.vue';

const router = useRouter();
const authStore = useAuthStore();
const scheduleStore = useScheduleStore();

const viewMode = ref('year'); // 'year' | 'day'
const listView = ref('timeline'); // 'timeline' | 'calendar'
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);
const showCreateDialog = ref(false);

let currentPage = 1;

// 获取用户名首字母
const getUserInitials = (name: string | undefined) => {
  if (!name) return '用';
  return name.substring(0, 2);
};

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '其他规划',
    'in-progress': '进行中',
    completed: '已完成',
  };
  return statusMap[status] || '其他规划';
};

// 格式化日期时间
const formatDateTime = (time: string | Date) => {
  const date = new Date(time);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hour}:${minute}`;
};

// 按月份分组日程
const groupedSchedules = computed(() => {
  const groups: Record<string, any[]> = {};

  scheduleStore.schedules.forEach(schedule => {
    const date = new Date(schedule.startTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const key = `${year}年${month}月`;

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(schedule);
  });

  return groups;
});

// 加载日程列表
const loadSchedules = async (page: number = 1, _refresh: boolean = false) => {
  try {
    const params: any = {
      page,
      limit: 20,
    };

    await scheduleStore.fetchSchedules(params);

    // 检查是否还有更多数据
    if (
      scheduleStore.pagination.page >= scheduleStore.pagination.totalPages ||
      scheduleStore.schedules.length >= scheduleStore.pagination.total
    ) {
      finished.value = true;
    }
  } catch (error) {
    console.error('加载日程失败:', error);
    showToast('加载失败');
  }
};

// 下拉刷新
const onRefresh = async () => {
  currentPage = 1;
  finished.value = false;
  scheduleStore.clearSchedules();
  await loadSchedules(1, true);
  refreshing.value = false;
  showToast('刷新成功');
};

// 上拉加载
const onLoad = async () => {
  if (refreshing.value) return;

  loading.value = true;
  await loadSchedules(currentPage);
  currentPage++;
  loading.value = false;
};

// 查看日程详情
const handleView = (id: string) => {
  router.push(`/schedule/${id}`);
};

// 创建日程
const handleCreate = () => {
  showCreateDialog.value = true;
};

// 日程创建成功
const handleScheduleCreated = () => {
  onRefresh();
};

// 删除日程（暂未使用）
// const handleDelete = async (id: string) => {
//   try {
//     await showConfirmDialog({
//       title: '确认删除',
//       message: '确定要删除这个日程吗？',
//     });

//     await scheduleStore.deleteSchedule(id);
//     showToast('删除成功');
//   } catch (error: any) {
//     if (error !== 'cancel') {
//       console.error('删除失败:', error);
//     }
//   }
// };

// 初始化
onMounted(() => {
  scheduleStore.clearSchedules();
  loadSchedules(1, true);
});
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: #F5F7FA;
  padding-bottom: 20px;
}

/* 顶部标题栏 */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4A7FFF 0%, #6B9EFF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: #4A7FFF;
  margin: 0;
}

.info-icon {
  font-size: 24px;
  color: #4A7FFF;
}

/* 用户信息卡片 */
.user-card {
  background: white;
  margin: 12px 16px;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4A7FFF 0%, #6B9EFF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 4px 0;
}

.user-email {
  font-size: 13px;
  color: #9CA3AF;
  margin: 0;
}

.arrow-icon {
  font-size: 16px;
  color: #D1D5DB;
}

.view-toggles {
  display: flex;
  gap: 8px;
  background: #F3F4F6;
  padding: 4px;
  border-radius: 10px;
}

.toggle-btn {
  flex: 1;
  padding: 8px 16px;
  text-align: center;
  font-size: 14px;
  color: #6B7280;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: white;
  color: #4A7FFF;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 日程规划区域 */
.planning-section {
  padding: 0 16px 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.section-title h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 6px 0;
}

.section-subtitle {
  font-size: 13px;
  color: #9CA3AF;
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 8px;
}

.view-options {
  display: flex;
  gap: 8px;
  background: #F3F4F6;
  padding: 4px;
  border-radius: 8px;
}

.option-btn {
  padding: 6px 12px;
  font-size: 13px;
  color: #6B7280;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-btn.active {
  background: white;
  color: #4A7FFF;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 添加按钮 */
.add-schedule-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4A7FFF 0%, #6B9EFF 100%);
  color: white;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(74, 127, 255, 0.3);
  transition: all 0.2s;
}

.add-schedule-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(74, 127, 255, 0.3);
}

/* 内容区域 */
.content-wrapper {
  padding: 0 16px;
}

/* 空状态 */
.empty-state {
  padding: 60px 30px;
  text-align: center;
  animation: fade-in 0.5s ease-out;
}

.empty-dog {
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

.empty-dog img {
  width: 140px;
  height: 140px;
  filter: drop-shadow(0 4px 16px rgba(74, 127, 255, 0.15));
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 12px 0;
}

.empty-desc {
  font-size: 14px;
  color: #9CA3AF;
  line-height: 1.6;
  margin: 0;
}

/* 时间轴容器 */
.timeline-container {
  padding: 16px 0;
}

.timeline-group {
  position: relative;
  margin-bottom: 24px;
}

.month-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-left: 4px;
}

.month-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4A7FFF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 2px 8px rgba(74, 127, 255, 0.3);
}

.month-title {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

/* 时间轴项目 */
.timeline-items {
  position: relative;
  padding-left: 32px;
  border-left: 3px solid #E5E7EB;
  margin-left: 20px;
}

.timeline-item {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  gap: 12px;
}

.timeline-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateX(2px);
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -35px;
  top: 24px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4A7FFF;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #4A7FFF;
}

.item-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  font-size: 20px;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-tag {
  padding: 4px 12px;
  background: #EFF6FF;
  color: #4A7FFF;
  font-size: 12px;
  border-radius: 6px;
  flex-shrink: 0;
}

.item-desc {
  font-size: 14px;
  color: #6B7280;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #9CA3AF;
}

.meta-item .van-icon {
  font-size: 14px;
}

/* 加载完成提示 */
:deep(.van-list__finished-text) {
  color: #9CA3AF;
  font-size: 13px;
  padding: 20px 0;
}

/* 下拉刷新 */
:deep(.van-pull-refresh__head) {
  color: #4A7FFF;
}

:deep(.van-loading__spinner) {
  color: #4A7FFF;
}

/* 动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 375px) {
  .app-icon {
    width: 44px;
    height: 44px;
    font-size: 22px;
  }

  .app-title {
    font-size: 18px;
  }

  .user-card {
    margin: 10px 12px;
    padding: 14px;
  }

  .planning-section {
    padding: 0 12px 12px;
  }

  .content-wrapper {
    padding: 0 12px;
  }
}
</style>
