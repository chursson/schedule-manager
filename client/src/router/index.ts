import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/user/dashboard',
  },
  // C端用户页面（移动端）
  {
    path: '/user',
    component: () => import('../views/user/Layout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/user/Dashboard.vue'),
        meta: { title: '首页', requiresAuth: true },
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: () => import('../views/user/Calendar.vue'),
        meta: { title: '日历', requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/user/Profile.vue'),
        meta: { title: '个人中心', requiresAuth: true },
      },
    ],
  },
  // 日程详情页
  {
    path: '/schedule/:id',
    name: 'ScheduleDetail',
    component: () => import('../views/user/ScheduleDetail.vue'),
    meta: { title: '日程详情', requiresAuth: true },
  },
  // 分享页面（无需登录）
  {
    path: '/shared/:id',
    name: 'SharedSchedule',
    component: () => import('../views/user/SharedView.vue'),
    meta: { title: '分享的日程' },
  },
  // 登录注册
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/user/Login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/user/Register.vue'),
    meta: { title: '注册' },
  },
  // B端管理后台（桌面端）
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/users',
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/UserManagement.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'permissions',
        name: 'AdminPermissions',
        component: () => import('../views/admin/PermissionManagement.vue'),
        meta: { title: '权限管理' },
      },
      {
        path: 'statistics',
        name: 'AdminStatistics',
        component: () => import('../views/admin/Statistics.vue'),
        meta: { title: '数据统计' },
      },
      {
        path: 'config',
        name: 'AdminConfig',
        component: () => import('../views/admin/SystemConfig.vue'),
        meta: { title: '系统配置' },
      },
    ],
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '页面不存在' },
  },
];

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
    next('/user/dashboard');
    return;
  }

  // 如果已登录且访问登录页，重定向到首页
  if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    next('/user/dashboard');
    return;
  }

  next();
});

export default router;
