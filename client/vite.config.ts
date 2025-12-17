import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

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
        // VantResolver({ importStyle: false }), // 暂时禁用Vant自动导入
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
    host: '0.0.0.0', // 允许局域网访问
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
  // css: {
  //   postcss: {
  //     plugins: [
  //       // 移动端适配：自动将px转换为vw
  //       // TODO: Fix dynamic import issue with postcss-px-to-viewport
  //       // require('postcss-px-to-viewport-8-plugin')({
  //       //   viewportWidth: 375,
  //       //   unitPrecision: 5,
  //       //   viewportUnit: 'vw',
  //       //   selectorBlackList: ['.ignore', '.desktop'],
  //       //   minPixelValue: 1,
  //       //   mediaQuery: false,
  //       //   exclude: [/\/admin\//],
  //       // }),
  //     ],
  //   },
  // },
})
