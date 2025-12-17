import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/permission';
import {
  getUsers,
  updateUser,
  resetPassword,
  deleteUser,
  getStatistics,
  getRoles,
} from '../controllers/adminController';

const router = Router();

// 所有管理接口都需要认证和管理员权限
router.use(authenticate);
router.use(requireAdmin);

/**
 * 用户管理
 */
// 获取用户列表
router.get('/users', getUsers);
// 更新用户
router.put('/users/:id', updateUser);
// 重置密码
router.post('/users/:id/reset-password', resetPassword);
// 删除用户
router.delete('/users/:id', deleteUser);

/**
 * 权限管理
 */
// 获取角色列表
router.get('/roles', getRoles);

/**
 * 数据统计
 */
// 获取统计数据
router.get('/statistics', getStatistics);

export default router;
