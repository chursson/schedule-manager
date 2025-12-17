<template>
  <div class="dashboard-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="我的日程" :border="false">
      <template #right>
        <van-icon name="plus" size="20" @click="handleCreate" />
      </template>
    </van-nav-bar>

    <!-- 筛选标签 -->
    <van-tabs v-model:active="activeStatus" @change="handleStatusChange" sticky>
      <van-tab title="全部" name="all" />
      <van-tab title="待办" name="pending" />
      <van-tab title="进行中" name="in-progress" />
      <van-tab title="已完成" name="completed" />
    </van-tabs>

    <!-- 日程列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div v-if="scheduleStore.schedules.length === 0 && !loading" class="empty-state">
          <van-empty description="暂无日程" />
          <van-button type="primary" round @click="handleCreate">
            创建第一个日程
          </van-button>
        </div>

        <div v-else class="schedule-list">
          <schedule-card
            v-for="schedule in scheduleStore.schedules"
            :key="schedule._id"
            :schedule="schedule"
            @click="handleView(schedule._id)"
            @delete="handleDelete"
          />
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import { useScheduleStore } from '../../stores/schedule';
import ScheduleCard from '../../components/ScheduleCard.vue';
import ScheduleCreateDialog from '../../components/ScheduleCreateDialog.vue';

const router = useRouter();
const scheduleStore = useScheduleStore();

const activeStatus = ref('all');
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);
const showCreateDialog = ref(false);

let currentPage = 1;

// 加载日程列表
const loadSchedules = async (page: number = 1, refresh: boolean = false) => {
  try {
    const params: any = {
      page,
      limit: 20,
    };

    if (activeStatus.value !== 'all') {
      params.status = activeStatus.value;
    }

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

// 状态筛选变化
const handleStatusChange = () => {
  currentPage = 1;
  finished.value = false;
  scheduleStore.clearSchedules();
  loadSchedules(1, true);
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

// 删除日程
const handleDelete = async (id: string) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个日程吗？',
    });

    await scheduleStore.deleteSchedule(id);
    showToast('删除成功');
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
    }
  }
};

// 初始化
onMounted(() => {
  scheduleStore.clearSchedules();
  loadSchedules(1, true);
});
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

:deep(.van-nav-bar) {
  background-color: #2c5aa0;
}

:deep(.van-nav-bar__title) {
  color: white;
  font-weight: bold;
}

:deep(.van-nav-bar__text),
:deep(.van-icon) {
  color: white;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-state .van-button {
  margin-top: 20px;
  background: #2c5aa0;
  border-color: #2c5aa0;
}

.schedule-list {
  padding: 12px;
}
</style>
