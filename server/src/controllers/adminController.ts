import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Schedule from '../models/Schedule';
import { Op } from 'sequelize';

/**
 * 获取用户列表（分页）
 */
export const getUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未认证' });
      return;
    }

    // 检查权限
    if (!['super-admin', 'admin'].includes(req.user.role)) {
      res.status(403).json({ message: '权限不足' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const status = req.query.status as string;

    // 构建查询条件
    const where: any = {};

    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    });

    res.json({
      users: users.map(u => u.toJSON()),
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 更新用户信息
 */
export const updateUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未认证' });
      return;
    }

    // 检查权限
    if (!['super-admin', 'admin'].includes(req.user.role)) {
      res.status(403).json({ message: '权限不足' });
      return;
    }

    const userId = req.params.id;
    const { username, email, role, status } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    // 只有super-admin可以修改其他admin
    if (user.role === 'super-admin' && req.user.role !== 'super-admin') {
      res.status(403).json({ message: '无权修改超级管理员' });
      return;
    }

    // 更新用户信息
    if (username) user.username = username;
    if (email) user.email = email;
    if (role && req.user.role === 'super-admin') {
      user.role = role;
    }
    if (status !== undefined) user.status = status;

    await user.save();

    res.json({
      message: '用户更新成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: any) {
    console.error('更新用户错误:', error);

    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((err: any) => err.message);
      res.status(400).json({ message: messages.join(', ') });
    } else {
      res.status(500).json({ message: '服务器错误' });
    }
  }
};

/**
 * 重置用户密码
 */
export const resetPassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未认证' });
      return;
    }

    // 检查权限
    if (!['super-admin', 'admin'].includes(req.user.role)) {
      res.status(403).json({ message: '权限不足' });
      return;
    }

    const userId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ message: '密码长度至少6个字符' });
      return;
    }

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    // 只有super-admin可以重置其他admin的密码
    if (user.role === 'super-admin' && req.user.role !== 'super-admin') {
      res.status(403).json({ message: '无权重置超级管理员密码' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: '密码重置成功' });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 删除用户
 */
export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未认证' });
      return;
    }

    // 检查权限
    if (!['super-admin', 'admin'].includes(req.user.role)) {
      res.status(403).json({ message: '权限不足' });
      return;
    }

    const userId = req.params.id;

    // 不能删除自己
    if (userId === req.user.id.toString()) {
      res.status(400).json({ message: '不能删除自己的账号' });
      return;
    }

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    // 只有super-admin可以删除其他admin
    if (user.role === 'super-admin' && req.user.role !== 'super-admin') {
      res.status(403).json({ message: '无权删除超级管理员' });
      return;
    }

    await user.destroy();

    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 获取统计数据
 */
export const getStatistics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未认证' });
      return;
    }

    // 检查权限
    if (!['super-admin', 'admin'].includes(req.user.role)) {
      res.status(403).json({ message: '权限不足' });
      return;
    }

    // 用户统计
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 'active' } });

    // 日程统计
    const totalSchedules = await Schedule.count();
    const pendingSchedules = await Schedule.count({
      where: { status: 'pending' },
    });
    const inProgressSchedules = await Schedule.count({
      where: { status: 'in-progress' },
    });
    const completedSchedules = await Schedule.count({
      where: { status: 'completed' },
    });

    // 最近7天的新增用户
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
    });

    // 最近7天的新增日程
    const recentSchedules = await Schedule.count({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
    });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        recent: recentUsers,
      },
      schedules: {
        total: totalSchedules,
        pending: pendingSchedules,
        inProgress: inProgressSchedules,
        completed: completedSchedules,
        recent: recentSchedules,
      },
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 获取用户角色列表
 */
export const getRoles = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未认证' });
      return;
    }

    // 检查权限
    if (!['super-admin', 'admin'].includes(req.user.role)) {
      res.status(403).json({ message: '权限不足' });
      return;
    }

    const roles = [
      {
        value: 'viewer',
        label: '查看者',
        description: '只能查看日程',
      },
      {
        value: 'editor',
        label: '编辑者',
        description: '可以创建和编辑日程',
      },
      {
        value: 'admin',
        label: '管理员',
        description: '可以管理用户和系统配置',
      },
      {
        value: 'super-admin',
        label: '超级管理员',
        description: '拥有所有权限',
      },
    ];

    res.json({ roles });
  } catch (error) {
    console.error('获取角色列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
