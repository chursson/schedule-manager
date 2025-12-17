import { Request, Response } from 'express';
import { generateSignature } from '../services/wechatService';

/**
 * 获取微信JS-SDK配置
 */
export const getJsSdkConfig = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      res.status(400).json({ message: '缺少URL参数' });
      return;
    }

    // 生成签名
    const config = await generateSignature(url);

    res.json({
      success: true,
      config,
    });
  } catch (error: any) {
    console.error('获取微信配置错误:', error);
    res.status(500).json({
      message: error.message || '获取微信配置失败',
    });
  }
};
