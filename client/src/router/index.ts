import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// 直接导入组件（不使用懒加载）
import Login from '../views/user/Login.vue';
import Register from '../views/user/Register.vue';
import Layout from '../views/user/Layout.vue';
import Dashboard from '../views/user/Dashboard.vue';
import Calendar from '../views/user/Calendar.vue';
import Profile from '../views/user/Profile.vue';
import ScheduleDetail from '../views/user/ScheduleDetail.vue';
import SharedView from '../views/user/SharedView.vue';
import AdminLayout from '../views/admin/AdminLayout.vue';
import UserManagement from '../views/admin/UserManagement.vue';
import PermissionManagement from '../views/admin/PermissionManagement.vue';
import Statistics from '../views/admin/Statistics.vue';
import SystemConfig from '../views/admin/SystemConfig.vue';

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  // 登录页面
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录' },
  },
  // 注册页面
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: '注册' },
  },
  // C端用户页面（移动端）
  {
    path: '/user',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '首页', requiresAuth: true },
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: Calendar,
        meta: { title: '日历', requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { title: '个人中心', requiresAuth: true },
      },
    ],
  },
  // 日程详情页
  {
    path: '/schedule/:id',
    name: 'ScheduleDetail',
    component: ScheduleDetail,
    meta: { title: '日程详情', requiresAuth: true },
  },
  // 分享页面（无需登录）
  {
    path: '/shared/:id',
    name: 'SharedSchedule',
    component: SharedView,
    meta: { title: '分享的日程' },
  },
  // 管理后台
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/users',
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: UserManagement,
        meta: { title: '用户管理' },
      },
      {
        path: 'permissions',
        name: 'AdminPermissions',
        component: PermissionManagement,
        meta: { title: '权限管理' },
      },
      {
        path: 'statistics',
        name: 'AdminStatistics',
        component: Statistics,
        meta: { title: '数据统计' },
      },
      {
        path: 'config',
        name: 'AdminConfig',
        component: SystemConfig,
        meta: { title: '系统配置' },
      },
    ],
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // 设置页面标题
  document.title = to.meta.title
    ? `${to.meta.title} - 日程管理系统`
    : '日程管理系统';

  // 检查是否需要登录
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
    return;
  }

  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/login');
    return;
  }

  // 如果已登录且访问登录页，重定向到管理后台
  if (authStore.isAuthenticated && authStore.isAdmin && to.path === '/login') {
    next('/admin');
    return;
  }

  next();
});

export default router;
