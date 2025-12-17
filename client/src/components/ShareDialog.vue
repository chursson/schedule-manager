<template>
  <van-dialog
    v-model:show="visible"
    title="分享日程"
    :show-cancel-button="false"
    :show-confirm-button="false"
    class-name="share-dialog"
  >
    <div class="share-content">
      <div class="share-info">
        <p class="share-title">{{ scheduleTitle }}</p>
        <p class="share-desc">点击链接查看日程详情</p>
      </div>

      <!-- 分享链接 -->
      <div class="share-link">
        <van-field
          v-model="shareUrl"
          readonly
          label="分享链接"
          :right-icon="copied ? 'success' : 'copy'"
          @click-right-icon="copyLink"
        />
      </div>

      <!-- 分享方式 -->
      <div class="share-methods">
        <div class="share-method" @click="shareToWechat">
          <van-icon name="wechat" size="40" color="#07c160" />
          <p>微信分享</p>
        </div>
        <div class="share-method" @click="copyLink">
          <van-icon name="link-o" size="40" color="#1989fa" />
          <p>复制链接</p>
        </div>
      </div>

      <!-- 关闭按钮 -->
      <van-button
        block
        round
        type="default"
        class="close-btn"
        @click="visible = false"
      >
        关闭
      </van-button>
    </div>
  </van-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { showToast, showDialog } from 'vant';
import { isWechat, configWechatShare } from '../utils/wechat';

interface Props {
  show: boolean;
  scheduleId: number;
  scheduleTitle: string;
  scheduleDesc?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:show': [value: boolean];
}>();

const visible = ref(props.show);
const copied = ref(false);

// 分享URL
const shareUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${baseUrl}/shared/${props.scheduleId}`;
});

// 监听props变化
watch(
  () => props.show,
  (newVal) => {
    visible.value = newVal;
    if (newVal) {
      copied.value = false;
    }
  }
);

// 监听visible变化
watch(visible, (newVal) => {
  emit('update:show', newVal);
});

/**
 * 复制链接
 */
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    copied.value = true;
    showToast('链接已复制');

    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    // 降级方案：使用input元素复制
    const input = document.createElement('input');
    input.value = shareUrl.value;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);

    copied.value = true;
    showToast('链接已复制');

    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
};

/**
 * 分享到微信
 */
const shareToWechat = () => {
  if (!isWechat()) {
    showDialog({
      message: '请在微信中打开，点击右上角"..."按钮进行分享',
    });
    return;
  }

  // 配置微信分享
  configWechatShare({
    title: props.scheduleTitle,
    desc: props.scheduleDesc || '查看我的日程安排',
    link: shareUrl.value,
    imgUrl: '', // 可以添加日程缩略图
  });

  showDialog({
    message: '请点击右上角"..."按钮进行分享',
  });
};
</script>

<style scoped lang="scss">
.share-content {
  padding: 20px;
}

.share-info {
  text-align: center;
  margin-bottom: 24px;

  .share-title {
    font-size: 18px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 8px;
  }

  .share-desc {
    font-size: 14px;
    color: #969799;
  }
}

.share-link {
  margin-bottom: 24px;

  :deep(.van-field) {
    border: 1px solid #ebedf0;
    border-radius: 8px;
    padding: 12px;
  }
}

.share-methods {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 24px;

  .share-method {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s;

    &:active {
      transform: scale(0.95);
    }

    p {
      margin-top: 8px;
      font-size: 14px;
      color: #646566;
    }
  }
}

.close-btn {
  margin-top: 8px;
}
</style>
