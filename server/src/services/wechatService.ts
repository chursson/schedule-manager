import axios from 'axios';
import crypto from 'crypto';

// 微信access_token缓存
let accessTokenCache: {
  token: string;
  expiresAt: number;
} | null = null;

// 微信jsapi_ticket缓存
let jsapiTicketCache: {
  ticket: string;
  expiresAt: number;
} | null = null;

/**
 * 获取微信access_token
 */
export const getAccessToken = async (): Promise<string> => {
  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('微信配置未设置');
  }

  // 检查缓存
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now()) {
    return accessTokenCache.token;
  }

  try {
    const response = await axios.get(
      'https://api.weixin.qq.com/cgi-bin/token',
      {
        params: {
          grant_type: 'client_credential',
          appid: appId,
          secret: appSecret,
        },
      }
    );

    if (response.data.errcode) {
      throw new Error(`获取access_token失败: ${response.data.errmsg}`);
    }

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in || 7200;

    // 缓存token，提前5分钟过期
    accessTokenCache = {
      token,
      expiresAt: Date.now() + (expiresIn - 300) * 1000,
    };

    return token;
  } catch (error: any) {
    console.error('获取微信access_token错误:', error);
    throw new Error('获取微信access_token失败');
  }
};

/**
 * 获取微信jsapi_ticket
 */
export const getJsapiTicket = async (): Promise<string> => {
  // 检查缓存
  if (jsapiTicketCache && jsapiTicketCache.expiresAt > Date.now()) {
    return jsapiTicketCache.ticket;
  }

  try {
    const accessToken = await getAccessToken();

    const response = await axios.get(
      'https://api.weixin.qq.com/cgi-bin/ticket/getjsapi_ticket',
      {
        params: {
          access_token: accessToken,
          type: 'jsapi',
        },
      }
    );

    if (response.data.errcode !== 0) {
      throw new Error(`获取jsapi_ticket失败: ${response.data.errmsg}`);
    }

    const ticket = response.data.ticket;
    const expiresIn = response.data.expires_in || 7200;

    // 缓存ticket，提前5分钟过期
    jsapiTicketCache = {
      ticket,
      expiresAt: Date.now() + (expiresIn - 300) * 1000,
    };

    return ticket;
  } catch (error: any) {
    console.error('获取jsapi_ticket错误:', error);
    throw new Error('获取jsapi_ticket失败');
  }
};

/**
 * 生成微信JS-SDK签名
 */
export const generateSignature = async (url: string): Promise<{
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
}> => {
  const appId = process.env.WECHAT_APP_ID;

  if (!appId) {
    throw new Error('微信配置未设置');
  }

  try {
    const jsapiTicket = await getJsapiTicket();
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = generateNonceStr();

    // 签名算法
    const string1 = `jsapi_ticket=${jsapiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
    const signature = crypto
      .createHash('sha1')
      .update(string1)
      .digest('hex');

    return {
      appId,
      timestamp,
      nonceStr,
      signature,
    };
  } catch (error: any) {
    console.error('生成微信签名错误:', error);
    throw error;
  }
};

/**
 * 生成随机字符串
 */
const generateNonceStr = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
