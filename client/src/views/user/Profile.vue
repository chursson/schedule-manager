<template>
  <div class="profile-page">
    <van-nav-bar title="个人中心" :border="false" />

    <!-- 用户信息卡片 -->
    <div class="user-card">
      <van-image
        round
        width="80"
        height="80"
        :src="user?.avatar || defaultAvatar"
        fit="cover"
      />
      <div class="user-info">
        <h2>{{ user?.username }}</h2>
        <p>{{ user?.email }}</p>
        <van-tag :type="roleTagType">{{ roleText }}</van-tag>
      </div>
    </div>

    <!-- 统计信息 -->
    <van-cell-group inset class="stats-group">
      <van-cell title="我创建的日程" :value="stats.created" is-link @click="filterSchedules('created')" />
      <van-cell title="待办事项" :value="stats.pending" is-link @click="filterSchedules('pending')" />
      <van-cell title="进行中" :value="stats.inProgress" is-link @click="filterSchedules('in-progress')" />
      <van-cell title="已完成" :value="stats.completed" is-link @click="filterSchedules('completed')" />
    </van-cell-group>

    <!-- 功能菜单 -->
    <van-cell-group inset class="menu-group">
      <van-cell
        v-if="isAdmin"
        title="管理后台"
        icon="manager-o"
        is-link
        @click="router.push('/admin')"
      />
      <van-cell title="关于" icon="info-o" is-link @click="showAbout = true" />
      <van-cell
        title="退出登录"
        icon="revoke"
        @click="handleLogout"
        class="logout-cell"
      />
    </van-cell-group>

    <!-- 关于对话框 -->
    <van-dialog
      v-model:show="showAbout"
      title="关于"
      confirm-button-text="确定"
    >
      <div class="about-content">
        <h3>日程管理系统</h3>
        <p>版本：v1.0.0</p>
        <p>一个支持多人实时协作的日程管理与分享平台</p>
        <p class="copyright">© 2025 All Rights Reserved</p>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { useAuthStore } from '../../stores/auth';
import { useScheduleStore } from '../../stores/schedule';

const router = useRouter();
const authStore = useAuthStore();
const scheduleStore = useScheduleStore();

const showAbout = ref(false);
const defaultAvatar = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg';

const user = computed(() => authStore.user);
const isAdmin = computed(() => authStore.isAdmin);

// 角色标签
const roleTagType = computed(() => {
  const roleMap: Record<string, any> = {
    'super-admin': 'danger',
    'admin': 'warning',
    'editor': 'primary',
    'viewer': 'default',
  };
  return roleMap[user.value?.role || 'viewer'];
});

const roleText = computed(() => {
  const roleMap: Record<string, string> = {
    'super-admin': '超级管理员',
    'admin': '管理员',
    'editor': '编辑者',
    'viewer': '查看者',
  };
  return roleMap[user.value?.role || 'viewer'];
});

// 统计数据
const stats = ref({
  created: 0,
  pending: 0,
  inProgress: 0,
  completed: 0,
});

// 加载统计数据
const loadStats = async () => {
  try {
    // 获取用户的所有日程
    await scheduleStore.fetchSchedules({ page: 1, limit: 1000 });

    const schedules = scheduleStore.schedules;

    stats.value = {
      created: schedules.filter((s) => {
        const createdBy = typeof s.createdBy === 'string' ? s.createdBy : s.createdBy?.id;
        return createdBy === user.value?.id;
      }).length,
      pending: schedules.filter((s) => s.status === 'pending').length,
      inProgress: schedules.filter((s) => s.status === 'in-progress').length,
      completed: schedules.filter((s) => s.status === 'completed').length,
    };
  } catch (error) {
    console.error('加载统计数据失败:', error);
  }
};

// 筛选日程
const filterSchedules = (type: string) => {
  // 跳转到首页并应用筛选
  router.push({
    path: '/user/dashboard',
    query: { filter: type },
  });
};

// 退出登录
const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出登录吗？',
    });

    authStore.logout();
    showToast('已退出登录');
    router.push('/login');
  } catch (error) {
    // 用户取消
  }
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped>
.profile-page {
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

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
}

.user-info h2 {
  font-size: 24px;
  margin: 0 0 8px 0;
}

.user-info p {
  font-size: 14px;
  margin: 0 0 12px 0;
  opacity: 0.9;
}

.stats-group,
.menu-group {
  margin: 16px 0;
}

:deep(.van-cell__value) {
  font-weight: bold;
  color: #2c5aa0;
}

.logout-cell {
  color: #ee0a24;
}

.about-content {
  padding: 24px;
  text-align: center;
}

.about-content h3 {
  font-size: 20px;
  margin: 0 0 16px 0;
  color: #323233;
}

.about-content p {
  font-size: 14px;
  color: #969799;
  margin: 8px 0;
}

.copyright {
  margin-top: 24px !important;
  font-size: 12px !important;
}
</style>
