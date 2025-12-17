import axios from 'axios';

// 微信JS-SDK配置接口
interface WechatConfig {
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
}

// 微信分享配置接口
interface ShareConfig {
  title: string;
  desc: string;
  link: string;
  imgUrl?: string;
}

/**
 * 判断是否在微信浏览器中
 */
export const isWechat = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('micromessenger') !== -1;
};

/**
 * 获取微信JS-SDK配置
 */
export const getWechatConfig = async (url: string): Promise<WechatConfig> => {
  try {
    const response = await axios.get('/api/wechat/jssdk-config', {
      params: { url },
    });

    if (response.data.success) {
      return response.data.config;
    }

    throw new Error('获取微信配置失败');
  } catch (error: any) {
    console.error('获取微信配置错误:', error);
    throw error;
  }
};

/**
 * 初始化微信JS-SDK
 */
export const initWechatSDK = async (): Promise<boolean> => {
  if (!isWechat()) {
    console.log('不在微信浏览器中，跳过微信SDK初始化');
    return false;
  }

  try {
    // iOS使用进入页面的URL签名
    // Android每次路由变化重新签名
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const url = isIOS
      ? (window.location.href.split('#')[0] || window.location.href)
      : window.location.href;

    const config = await getWechatConfig(url);

    return new Promise((resolve, reject) => {
      // @ts-ignore
      if (typeof wx === 'undefined') {
        reject(new Error('微信JS-SDK未加载'));
        return;
      }

      // @ts-ignore
      wx.config({
        debug: false,
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: [
          'updateAppMessageShareData',
          'updateTimelineShareData',
          'onMenuShareAppMessage',
          'onMenuShareTimeline',
        ],
      });

      // @ts-ignore
      wx.ready(() => {
        console.log('微信JS-SDK初始化成功');
        resolve(true);
      });

      // @ts-ignore
      wx.error((err: any) => {
        console.error('微信JS-SDK初始化失败:', err);
        reject(err);
      });
    });
  } catch (error: any) {
    console.error('初始化微信SDK错误:', error);
    return false;
  }
};

/**
 * 配置微信分享
 */
export const configWechatShare = (config: ShareConfig): void => {
  if (!isWechat()) {
    console.log('不在微信浏览器中，跳过分享配置');
    return;
  }

  // @ts-ignore
  if (typeof wx === 'undefined') {
    console.error('微信JS-SDK未加载');
    return;
  }

  const shareData = {
    title: config.title,
    desc: config.desc,
    link: config.link,
    imgUrl: config.imgUrl || '',
    success: () => {
      console.log('分享成功');
    },
    cancel: () => {
      console.log('取消分享');
    },
  };

  // @ts-ignore
  wx.ready(() => {
    // 新版API（微信7.0.12以上）
    // @ts-ignore
    wx.updateAppMessageShareData(shareData);
    // @ts-ignore
    wx.updateTimelineShareData(shareData);

    // 旧版API（兼容）
    // @ts-ignore
    wx.onMenuShareAppMessage(shareData);
    // @ts-ignore
    wx.onMenuShareTimeline(shareData);
  });
};

/**
 * 禁用微信字体放大
 */
export const disableWechatFontSize = (): void => {
  if (!isWechat()) {
    return;
  }

  // @ts-ignore
  if (typeof WeixinJSBridge === 'object' && typeof WeixinJSBridge.invoke === 'function') {
    handleFontSize();
  } else {
    document.addEventListener('WeixinJSBridgeReady', handleFontSize, false);
  }

  function handleFontSize() {
    // @ts-ignore
    WeixinJSBridge.invoke('setFontSizeCallback', { fontSize: 0 });
    // @ts-ignore
    WeixinJSBridge.on('menu:setfont', function () {
      // @ts-ignore
      WeixinJSBridge.invoke('setFontSizeCallback', { fontSize: 0 });
    });
  }
};
