<template>
  <van-dialog
    v-model:show="visible"
    title="编辑日程"
    show-cancel-button
    :before-close="handleBeforeClose"
    :close-on-click-overlay="false"
    class="schedule-edit-dialog"
  >
    <van-form ref="formRef" @submit="handleSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.title"
          name="title"
          label="标题"
          placeholder="请输入日程标题"
          :rules="[{ required: true, message: '请输入标题' }]"
          @input="handleInput"
        />
        <van-field
          v-model="form.description"
          name="description"
          label="描述"
          type="textarea"
          placeholder="请输入日程描述（选填）"
          rows="2"
          autosize
          @input="handleInput"
        />
        <van-field
          v-model="startTimeText"
          name="startTime"
          label="开始时间"
          placeholder="选择开始时间"
          readonly
          clickable
          @click="showStartTimePicker = true"
          :rules="[{ required: true, message: '请选择开始时间' }]"
        />
        <van-field
          v-model="endTimeText"
          name="endTime"
          label="结束时间"
          placeholder="选择结束时间"
          readonly
          clickable
          @click="showEndTimePicker = true"
          :rules="[{ required: true, message: '请选择结束时间' }]"
        />
        <van-field
          v-model="tagsText"
          name="tags"
          label="标签"
          placeholder="添加标签（选填）"
          readonly
          clickable
          @click="showTagInput = true"
        />
        <van-field name="status" label="状态">
          <template #input>
            <van-radio-group v-model="form.status" direction="horizontal" @change="handleInput">
              <van-radio name="pending">待办</van-radio>
              <van-radio name="in-progress">进行中</van-radio>
              <van-radio name="completed">已完成</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>
    </van-form>

    <template #footer>
      <van-button block type="primary" :loading="loading" @click="handleSubmit">
        保存
      </van-button>
    </template>
  </van-dialog>

  <!-- 时间选择器 -->
  <van-popup v-model:show="showStartTimePicker" position="bottom">
    <van-datetime-picker
      v-model="formStartTime"
      type="datetime"
      title="选择开始时间"
      @confirm="handleStartTimeConfirm"
      @cancel="showStartTimePicker = false"
    />
  </van-popup>

  <van-popup v-model:show="showEndTimePicker" position="bottom">
    <van-datetime-picker
      v-model="formEndTime"
      type="datetime"
      title="选择结束时间"
      :min-date="formStartTime"
      @confirm="handleEndTimeConfirm"
      @cancel="showEndTimePicker = false"
    />
  </van-popup>

  <!-- 标签输入 -->
  <van-dialog
    v-model:show="showTagInput"
    title="编辑标签"
    show-cancel-button
    @confirm="handleTagConfirm"
  >
    <van-field
      v-model="tagInput"
      placeholder="输入标签，用逗号分隔"
      rows="2"
      autosize
      type="textarea"
    />
  </van-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { showToast } from 'vant';
import { useScheduleStore } from '../stores/schedule';
import { socketClient } from '../utils/socket';
import type { Schedule } from '../types';

interface Props {
  show: boolean;
  schedule: Schedule;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:show', 'updated']);

const scheduleStore = useScheduleStore();

const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
});

const formRef = ref();
const loading = ref(false);

// 表单数据
const form = ref({
  title: '',
  description: '',
  status: 'pending' as 'pending' | 'in-progress' | 'completed',
  tags: [] as string[],
});

const formStartTime = ref(new Date());
const formEndTime = ref(new Date());
const showStartTimePicker = ref(false);
const showEndTimePicker = ref(false);
const showTagInput = ref(false);
const tagInput = ref('');

let inputTimeout: any = null;

// 格式化时间显示
const startTimeText = computed(() => formatDateTime(formStartTime.value));
const endTimeText = computed(() => formatDateTime(formEndTime.value));
const tagsText = computed(() => form.value.tags.join(', '));

const formatDateTime = (date: Date) => {
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 输入事件 - 发送正在输入状态
const handleInput = () => {
  if (inputTimeout) clearTimeout(inputTimeout);

  socketClient.sendUserTyping(props.schedule._id);

  inputTimeout = setTimeout(() => {
    socketClient.sendUserStopTyping(props.schedule._id);
  }, 2000);
};

// 确认时间
const handleStartTimeConfirm = () => {
  showStartTimePicker.value = false;
  if (formEndTime.value <= formStartTime.value) {
    formEndTime.value = new Date(formStartTime.value.getTime() + 60 * 60 * 1000);
  }
  handleInput();
};

const handleEndTimeConfirm = () => {
  showEndTimePicker.value = false;
  handleInput();
};

// 确认标签
const handleTagConfirm = () => {
  if (tagInput.value.trim()) {
    form.value.tags = tagInput.value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);
  }
  showTagInput.value = false;
  handleInput();
};

// 关闭前处理
const handleBeforeClose = (action: string) => {
  if (action === 'confirm') {
    return handleSubmit();
  }
  socketClient.sendUserStopTyping(props.schedule._id);
  return true;
};

// 提交表单
const handleSubmit = async () => {
  loading.value = true;
  try {
    await formRef.value?.validate();

    if (formEndTime.value <= formStartTime.value) {
      showToast('结束时间必须晚于开始时间');
      return false;
    }

    const updateData = {
      title: form.value.title,
      description: form.value.description,
      startTime: formStartTime.value,
      endTime: formEndTime.value,
      status: form.value.status,
      tags: form.value.tags,
      version: props.schedule.version,
    };

    await scheduleStore.updateSchedule(props.schedule._id, updateData);

    // 通过Socket通知其他用户
    socketClient.sendScheduleUpdate(
      props.schedule._id,
      updateData,
      props.schedule.version + 1
    );

    showToast({
      message: '保存成功',
      type: 'success',
    });

    socketClient.sendUserStopTyping(props.schedule._id);
    visible.value = false;
    emit('updated');
    return true;
  } catch (error: any) {
    console.error('更新失败:', error);

    if (error.response?.status === 409) {
      showToast('日程已被其他人修改，请刷新后重试');
    }
    return false;
  } finally {
    loading.value = false;
  }
};

// 初始化表单数据
const initForm = () => {
  form.value = {
    title: props.schedule.title,
    description: props.schedule.description || '',
    status: props.schedule.status,
    tags: props.schedule.tags || [],
  };
  formStartTime.value = new Date(props.schedule.startTime);
  formEndTime.value = new Date(props.schedule.endTime);
  tagInput.value = props.schedule.tags?.join(', ') || '';
};

// 监听对话框打开
watch(visible, (val) => {
  if (val) {
    initForm();
  } else {
    if (inputTimeout) clearTimeout(inputTimeout);
  }
});

// 监听schedule变化
watch(() => props.schedule, () => {
  if (visible.value) {
    initForm();
  }
}, { deep: true });
</script>

<style scoped>
.schedule-edit-dialog :deep(.van-dialog__content) {
  padding: 16px 0;
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.van-cell-group) {
  margin: 0;
}

:deep(.van-button--primary) {
  background: #2c5aa0;
  border-color: #2c5aa0;
}

:deep(.van-radio-group) {
  display: flex;
  gap: 12px;
}
</style>
