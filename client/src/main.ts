import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入Vant样式（移动端）
import 'vant/lib/index.css'

// 导入Element Plus样式（桌面端）
import 'element-plus/dist/index.css'

// 导入全局样式
import './style.css'

// 初始化认证store
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化认证状态
const authStore = useAuthStore()
authStore.init()

app.mount('#app')
