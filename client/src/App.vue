<template>
  <router-view />
</template>

<script setup lang="ts">
// 全局样式和配置在main.ts中已经引入
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  html {
    font-size: 14px;
  }
}

/* 桌面端 */
@media screen and (min-width: 769px) {
  html {
    font-size: 16px;
  }
}
</style>
