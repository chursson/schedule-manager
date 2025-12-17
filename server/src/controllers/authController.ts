import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { jwtConfig } from '../config/jwt';
import { AuthRequest } from '../middleware/auth';

/**
 * 用户注册
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // 验证必填字段
    if (!username || !email || !password) {
      res.status(400).json({ message: '请提供用户名、邮箱和密码' });
      return;
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        res.status(400).json({ message: '邮箱已被注册' });
      } else {
        res.status(400).json({ message: '用户名已被使用' });
      }
      return;
    }

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password,
      role: 'editor',
    });

    // 生成JWT token
    const token = jwt.sign({ userId: user.id }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    } as any);

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('注册错误:', error);

    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((err: any) => err.message);
      res.status(400).json({ message: messages.join(', ') });
    } else {
      res.status(500).json({ message: '服务器错误' });
    }
  }
};

/**
 * 用户登录
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 验证必填字段
    if (!email || !password) {
      res.status(400).json({ message: '请提供邮箱和密码' });
      return;
    }

    // 查找用户
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({ message: '邮箱或密码错误' });
      return;
    }

    // 检查账号状态
    if (user.status !== 'active') {
      res.status(403).json({ message: '账号已被禁用' });
      return;
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({ message: '邮箱或密码错误' });
      return;
    }

    // 生成JWT token
    const token = jwt.sign({ userId: user.id }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    } as any);

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未认证' });
      return;
    }

    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        status: req.user.status,
      },
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 刷新token
 */
export const refreshToken = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未认证' });
      return;
    }

    // 生成新的token
    const token = jwt.sign({ userId: req.user.id }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    } as any);

    res.json({
      message: 'Token刷新成功',
      token,
    });
  } catch (error) {
    console.error('刷新token错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
