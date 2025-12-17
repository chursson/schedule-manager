import { Request, Response } from 'express';
import Schedule from '../models/Schedule';
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

    const { title, description, startTime, endTime, tags, participants } = req.body;

    // 创建日程
    const schedule = new Schedule({
      title,
      description,
      startTime,
      endTime,
      tags,
      participants: [
        {
          userId: req.user._id,
          permission: 'owner',
        },
        ...(participants || []),
      ],
      createdBy: req.user._id,
    });

    await schedule.save();

    // 填充用户信息
    await schedule.populate('participants.userId', 'username email avatar');
    await schedule.populate('createdBy', 'username email avatar');

    res.status(201).json({
      message: '日程创建成功',
      schedule,
    });
  } catch (error: any) {
    console.error('创建日程错误:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
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
    const skip = (page - 1) * limit;

    // 查询条件：用户创建的或参与的日程
    const query = {
      $or: [
        { createdBy: req.user._id },
        { 'participants.userId': req.user._id },
      ],
    };

    // 支持状态过滤
    if (req.query.status) {
      Object.assign(query, { status: req.query.status });
    }

    // 支持时间范围过滤
    if (req.query.startDate && req.query.endDate) {
      Object.assign(query, {
        startTime: {
          $gte: new Date(req.query.startDate as string),
          $lte: new Date(req.query.endDate as string),
        },
      });
    }

    const [schedules, total] = await Promise.all([
      Schedule.find(query)
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit)
        .populate('participants.userId', 'username email avatar')
        .populate('createdBy', 'username email avatar'),
      Schedule.countDocuments(query),
    ]);

    res.json({
      schedules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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

    const schedule = await Schedule.findById(req.params.id)
      .populate('participants.userId', 'username email avatar')
      .populate('createdBy', 'username email avatar');

    if (!schedule) {
      res.status(404).json({ message: '日程不存在' });
      return;
    }

    // 检查权限
    const isParticipant = schedule.participants.some(
      (p) => p.userId._id.toString() === req.user!._id.toString()
    );

    const isCreator = schedule.createdBy._id.toString() === req.user._id.toString();

    if (!isParticipant && !isCreator) {
      res.status(403).json({ message: '无权访问此日程' });
      return;
    }

    res.json({ schedule });
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

    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      res.status(404).json({ message: '日程不存在' });
      return;
    }

    // 检查权限
    const participant = schedule.participants.find(
      (p) => p.userId.toString() === req.user!._id.toString()
    );

    const isOwnerOrEditor =
      participant && ['owner', 'editor'].includes(participant.permission);

    if (!isOwnerOrEditor) {
      res.status(403).json({ message: '无权编辑此日程' });
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
    const updateFields = [
      'title',
      'description',
      'startTime',
      'endTime',
      'tags',
      'status',
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (schedule as any)[field] = req.body[field];
      }
    });

    // 增加版本号
    schedule.version += 1;

    await schedule.save();

    await schedule.populate('participants.userId', 'username email avatar');
    await schedule.populate('createdBy', 'username email avatar');

    res.json({
      message: '日程更新成功',
      schedule,
    });
  } catch (error: any) {
    console.error('更新日程错误:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
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

    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      res.status(404).json({ message: '日程不存在' });
      return;
    }

    // 只有创建者可以删除
    const isCreator = schedule.createdBy.toString() === req.user._id.toString();

    if (!isCreator) {
      res.status(403).json({ message: '只有创建者可以删除日程' });
      return;
    }

    await Schedule.findByIdAndDelete(req.params.id);

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

    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      res.status(404).json({ message: '日程不存在' });
      return;
    }

    // 检查权限
    const participant = schedule.participants.find(
      (p) => p.userId.toString() === req.user!._id.toString()
    );

    if (!participant || participant.permission === 'viewer') {
      res.status(403).json({ message: '无权分享此日程' });
      return;
    }

    // 生成唯一的分享token
    const shareToken = crypto.randomBytes(16).toString('hex');
    schedule.shareToken = shareToken;
    await schedule.save();

    res.json({
      message: '分享链接生成成功',
      shareToken,
      shareUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/shared/${schedule._id}?token=${shareToken}`,
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
      _id: id,
      shareToken: token,
    })
      .populate('participants.userId', 'username email avatar')
      .populate('createdBy', 'username email avatar');

    if (!schedule) {
      res.status(404).json({ message: '日程不存在或分享链接无效' });
      return;
    }

    res.json({ schedule });
  } catch (error) {
    console.error('获取分享日程错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
