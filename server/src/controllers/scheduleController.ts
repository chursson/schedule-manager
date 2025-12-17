import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Schedule from '../models/Schedule';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

/**
 * 创建日程
 */
export const createSchedule = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未认证' });
      return;
    }

    const { title, description, startTime, endTime, tags } = req.body;

    // 创建日程
    const schedule = await Schedule.create({
      title,
      description,
      startTime,
      endTime,
      tags: tags || [],
      participants: [
        {
          userId: req.user.id,
          permission: 'owner',
        },
      ],
      createdBy: req.user.id,
    });

    // 获取创建者信息
    const creator = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'avatar'],
    });

    res.status(201).json({
      message: '日程创建成功',
      schedule: {
        ...schedule.toJSON(),
        createdBy: creator,
      },
    });
  } catch (error: any) {
    console.error('创建日程错误:', error);

    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((err: any) => err.message);
      res.status(400).json({ message: messages.join(', ') });
    } else {
      res.status(500).json({ message: '服务器错误' });
    }
  }
};

/**
 * 获取日程列表（分页）
 */
export const getSchedules = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未认证' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // 查询条件
    const where: any = {
      [Op.or]: [
        { createdBy: req.user.id },
        // 简化版：暂时只查询自己创建的
      ],
    };

    // 状态过滤
    if (req.query.status) {
      where.status = req.query.status;
    }

    // 时间范围过滤
    if (req.query.startDate && req.query.endDate) {
      where.startTime = {
        [Op.between]: [new Date(req.query.startDate as string), new Date(req.query.endDate as string)],
      };
    }

    const { count, rows: schedules } = await Schedule.findAndCountAll({
      where,
      limit,
      offset,
      order: [['startTime', 'DESC']],
    });

    // 获取所有创建者信息
    const creatorIds = [...new Set(schedules.map(s => s.createdBy))];
    const creators = await User.findAll({
      where: { id: creatorIds },
      attributes: ['id', 'username', 'email', 'avatar'],
    });

    const creatorMap = Object.fromEntries(creators.map(c => [c.id, c.toJSON()]));

    const schedulesWithCreators = schedules.map(s => ({
      ...s.toJSON(),
      createdBy: creatorMap[s.createdBy],
    }));

    res.json({
      schedules: schedulesWithCreators,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('获取日程列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 获取单个日程详情
 */
export const getScheduleById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未认证' });
      return;
    }

    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      res.status(404).json({ message: '日程不存在' });
      return;
    }

    // 获取创建者信息
    const creator = await User.findByPk(schedule.createdBy, {
      attributes: ['id', 'username', 'email', 'avatar'],
    });

    res.json({
      schedule: {
        ...schedule.toJSON(),
        createdBy: creator,
      },
    });
  } catch (error) {
    console.error('获取日程详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 更新日程
 */
export const updateSchedule = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未认证' });
      return;
    }

    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      res.status(404).json({ message: '日程不存在' });
      return;
    }

    // 版本冲突检测
    if (req.body.version !== undefined && req.body.version !== schedule.version) {
      res.status(409).json({
        message: '日程已被其他人修改，请刷新后重试',
        currentVersion: schedule.version,
      });
      return;
    }

    // 更新字段
    const updateFields = ['title', 'description', 'startTime', 'endTime', 'tags', 'status'];
    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (schedule as any)[field] = req.body[field];
      }
    });

    // 增加版本号
    schedule.version += 1;
    await schedule.save();

    // 获取创建者信息
    const creator = await User.findByPk(schedule.createdBy, {
      attributes: ['id', 'username', 'email', 'avatar'],
    });

    res.json({
      message: '日程更新成功',
      schedule: {
        ...schedule.toJSON(),
        createdBy: creator,
      },
    });
  } catch (error: any) {
    console.error('更新日程错误:', error);

    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((err: any) => err.message);
      res.status(400).json({ message: messages.join(', ') });
    } else {
      res.status(500).json({ message: '服务器错误' });
    }
  }
};

/**
 * 删除日程
 */
export const deleteSchedule = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未认证' });
      return;
    }

    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      res.status(404).json({ message: '日程不存在' });
      return;
    }

    // 只有创建者可以删除
    if (schedule.createdBy !== req.user.id) {
      res.status(403).json({ message: '只有创建者可以删除日程' });
      return;
    }

    await schedule.destroy();

    res.json({ message: '日程删除成功' });
  } catch (error) {
    console.error('删除日程错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 生成分享token
 */
export const generateShareToken = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未认证' });
      return;
    }

    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      res.status(404).json({ message: '日程不存在' });
      return;
    }

    // 生成唯一的分享token
    const shareToken = crypto.randomBytes(16).toString('hex');
    schedule.shareToken = shareToken;
    await schedule.save();

    res.json({
      message: '分享链接生成成功',
      shareToken,
      shareUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/shared/${schedule.id}?token=${shareToken}`,
    });
  } catch (error) {
    console.error('生成分享token错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 通过分享token访问日程
 */
export const getScheduleByShareToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    if (!token) {
      res.status(400).json({ message: '缺少分享token' });
      return;
    }

    const schedule = await Schedule.findOne({
      where: {
        id: parseInt(id),
        shareToken: token as string,
      },
    });

    if (!schedule) {
      res.status(404).json({ message: '日程不存在或分享链接无效' });
      return;
    }

    // 获取创建者信息
    const creator = await User.findByPk(schedule.createdBy, {
      attributes: ['id', 'username', 'email', 'avatar'],
    });

    res.json({
      schedule: {
        ...schedule.toJSON(),
        createdBy: creator,
      },
    });
  } catch (error) {
    console.error('获取分享日程错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
