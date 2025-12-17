<template>
  <el-container class="admin-layout">
    <el-aside width="200px">
      <div class="logo">
        <h2>管理后台</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="admin-menu"
      >
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/permissions">
          <el-icon><Lock /></el-icon>
          <span>权限管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据统计</span>
        </el-menu-item>
        <el-menu-item index="/admin/config">
          <el-icon><Setting /></el-icon>
          <span>系统配置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-content">
          <span class="welcome">欢迎，{{ authStore.user?.username }}</span>
          <div class="actions">
            <el-button text @click="goToUserSite">
              <el-icon><House /></el-icon>
              返回前台
            </el-button>
            <el-button text @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-button>
          </div>
        </div>
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../../stores/auth';
import {
  User,
  Lock,
  DataAnalysis,
  Setting,
  House,
  SwitchButton,
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 当前激活的菜单
const activeMenu = computed(() => route.path);

// 返回前台
const goToUserSite = () => {
  router.push('/user/dashboard');
};

// 退出登录
const handleLogout = async () => {
  await authStore.logout();
  ElMessage.success('已退出登录');
  router.push('/login');
};
</script>

<style scoped lang="scss">
.admin-layout {
  height: 100vh;
}

.el-aside {
  background-color: #001529;
  color: #fff;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #002140;

    h2 {
      color: #fff;
      font-size: 18px;
      margin: 0;
    }
  }

  .admin-menu {
    border-right: none;
    background-color: #001529;

    :deep(.el-menu-item) {
      color: rgba(255, 255, 255, 0.65);

      &:hover {
        color: #fff;
        background-color: #002140;
      }

      &.is-active {
        color: #fff;
        background-color: #1890ff;
      }
    }
  }
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  padding: 0 24px;

  .header-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .welcome {
      font-size: 16px;
      color: #333;
    }

    .actions {
      display: flex;
      gap: 16px;
    }
  }
}

.el-main {
  background-color: #f0f2f5;
  padding: 24px;
}
</style>
