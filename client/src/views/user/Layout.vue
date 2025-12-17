<template>
  <div class="mobile-layout">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>

    <!-- 底部导航栏 -->
    <van-tabbar v-model="activeTab" route :placeholder="true">
      <van-tabbar-item to="/user/dashboard" icon="wap-home-o" name="dashboard">
        首页
      </van-tabbar-item>
      <van-tabbar-item to="/user/calendar" icon="calendar-o" name="calendar">
        日历
      </van-tabbar-item>
      <van-tabbar-item to="/user/profile" icon="manager-o" name="profile">
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeTab = ref('dashboard');

// 监听路由变化，更新激活的tab
watch(
  () => route.path,
  (newPath) => {
    if (newPath.includes('/dashboard')) {
      activeTab.value = 'dashboard';
    } else if (newPath.includes('/calendar')) {
      activeTab.value = 'calendar';
    } else if (newPath.includes('/profile')) {
      activeTab.value = 'profile';
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.mobile-layout {
  width: 100%;
  height: 100%;
  background-color: #f7f8fa;
}
</style>
