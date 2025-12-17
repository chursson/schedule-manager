import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

type Role = 'super-admin' | 'admin' | 'editor' | 'viewer';

// 角色权限层级
const roleHierarchy: Record<Role, number> = {
  'super-admin': 4,
  'admin': 3,
  'editor': 2,
  'viewer': 1,
};

/**
 * 检查用户是否有指定角色或更高权限
 */
export const checkRole = (requiredRole: Role) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: '未认证' });
      return;
    }

    const userRoleLevel = roleHierarchy[req.user.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel >= requiredRoleLevel) {
      next();
    } else {
      res.status(403).json({ message: '权限不足' });
    }
  };
};

/**
 * 仅超级管理员可访问
 */
export const requireSuperAdmin = checkRole('super-admin');

/**
 * 管理员及以上可访问
 */
export const requireAdmin = checkRole('admin');

/**
 * 编辑者及以上可访问
 */
export const requireEditor = checkRole('editor');
