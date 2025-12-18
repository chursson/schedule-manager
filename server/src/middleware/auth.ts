import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import User from '../models/User';
import type { UserAttributes } from '../models/User';

// 扩展Express Request类型
export interface AuthRequest extends Request {
  user?: UserAttributes;
  body: any;
  query: any;
  params: any;
  headers: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: '未提供认证token' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // 验证token
    const decoded = jwt.verify(token, jwtConfig.secret) as { userId: number };

    // 查找用户
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      res.status(401).json({ message: '用户不存在' });
      return;
    }

    if (user.status !== 'active') {
      res.status(403).json({ message: '账号已被禁用' });
      return;
    }

    // 将用户信息添加到请求对象
    req.user = user.toJSON();
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'token无效' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'token已过期' });
    } else {
      res.status(500).json({ message: '服务器错误' });
    }
  }
};
