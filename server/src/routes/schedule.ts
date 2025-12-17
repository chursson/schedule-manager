import express from 'express';
import {
  createSchedule,
  getSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  generateShareToken,
  getScheduleByShareToken,
} from '../controllers/scheduleController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 公开路由 - 分享链接访问
router.get('/shared/:id', getScheduleByShareToken);

// 需要认证的路由
router.use(authenticate);

router.post('/', createSchedule);
router.get('/', getSchedules);
router.get('/:id', getScheduleById);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);
router.post('/:id/share', generateShareToken);

export default router;
