import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver, ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 自动导入 Vue API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    // 自动导入组件
    Components({
      resolvers: [
        VantResolver(), // Vant 移动端组件
        ElementPlusResolver(), // Element Plus 桌面端组件
      ],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        // 移动端适配：自动将px转换为vw
        require('postcss-px-to-viewport-8-plugin')({
          viewportWidth: 375, // 设计稿宽度
          unitPrecision: 5, // 转换精度
          viewportUnit: 'vw', // 使用的视口单位
          selectorBlackList: ['.ignore', '.desktop'], // 不转换的类名
          minPixelValue: 1, // 最小转换值
          mediaQuery: false, // 是否在媒体查询中转换
          exclude: [/\/admin\//], // 排除B端桌面端页面
        }),
      ],
    },
  },
})
