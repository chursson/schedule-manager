<template>
  <router-view />
</template>

<script setup lang="ts">
// 全局样式和配置在main.ts中已经引入
</script>

<style>
/* App.vue - 应用新的配色方案 */
#app {
  background: var(--bg-primary);
  min-height: 100vh;
}

/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
