import { Router } from 'express';
import { getJsSdkConfig } from '../controllers/wechatController';

const router = Router();

/**
 * 获取微信JS-SDK配置
 * GET /api/wechat/jssdk-config?url=xxx
 */
router.get('/jssdk-config', getJsSdkConfig);

export default router;
