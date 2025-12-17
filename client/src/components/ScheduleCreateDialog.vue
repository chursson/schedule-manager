<template>
  <van-dialog
    v-model:show="visible"
    title="创建日程"
    show-cancel-button
    :before-close="handleBeforeClose"
    :close-on-click-overlay="false"
    class="schedule-create-dialog"
  >
    <van-form ref="formRef" @submit="handleSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.title"
          name="title"
          label="标题"
          placeholder="请输入日程标题"
          :rules="[{ required: true, message: '请输入标题' }]"
        />
        <van-field
          v-model="form.description"
          name="description"
          label="描述"
          type="textarea"
          placeholder="请输入日程描述（选填）"
          rows="2"
          autosize
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
      </van-cell-group>
    </van-form>

    <template #footer>
      <van-button block type="primary" :loading="loading" @click="handleSubmit">
        创建
      </van-button>
    </template>
  </van-dialog>

  <!-- 开始时间选择器 -->
  <van-popup v-model:show="showStartTimePicker" position="bottom">
    <van-date-picker
      v-model="startTimePickerValue"
      type="datetime"
      title="选择开始时间"
      :min-date="minDate"
      @confirm="handleStartTimeConfirm"
      @cancel="showStartTimePicker = false"
    />
  </van-popup>

  <!-- 结束时间选择器 -->
  <van-popup v-model:show="showEndTimePicker" position="bottom">
    <van-date-picker
      v-model="endTimePickerValue"
      type="datetime"
      title="选择结束时间"
      :min-date="form.startTime || minDate"
      @confirm="handleEndTimeConfirm"
      @cancel="showEndTimePicker = false"
    />
  </van-popup>

  <!-- 标签输入对话框 -->
  <van-dialog
    v-model:show="showTagInput"
    title="添加标签"
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
import type { ScheduleForm } from '../types';

interface Props {
  show: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:show', 'created']);

const scheduleStore = useScheduleStore();

const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
});

const formRef = ref();
const loading = ref(false);
const minDate = new Date();

// 表单数据
const form = ref<ScheduleForm>({
  title: '',
  description: '',
  startTime: new Date(),
  endTime: new Date(Date.now() + 60 * 60 * 1000), // 默认1小时后
  tags: [],
});

const showStartTimePicker = ref(false);
const showEndTimePicker = ref(false);
const showTagInput = ref(false);
const tagInput = ref('');

// DatePicker需要的数组格式值
const startTimePickerValue = ref<string[]>([]);
const endTimePickerValue = ref<string[]>([]);

// 将Date转换为DatePicker需要的数组格式
const dateToPickerValue = (date: Date): string[] => {
  return [
    date.getFullYear().toString(),
    (date.getMonth() + 1).toString().padStart(2, '0'),
    date.getDate().toString().padStart(2, '0'),
    date.getHours().toString().padStart(2, '0'),
    date.getMinutes().toString().padStart(2, '0'),
  ];
};

// 将DatePicker的数组格式转换为Date
const pickerValueToDate = (values: string[]): Date => {
  return new Date(
    parseInt(values[0]),
    parseInt(values[1]) - 1,
    parseInt(values[2]),
    parseInt(values[3]),
    parseInt(values[4])
  );
};

// 格式化时间显示
const startTimeText = computed(() => {
  if (!form.value.startTime) return '';
  return formatDateTime(form.value.startTime);
});

const endTimeText = computed(() => {
  if (!form.value.endTime) return '';
  return formatDateTime(form.value.endTime);
});

const tagsText = computed(() => {
  if (!form.value.tags || form.value.tags.length === 0) return '';
  return form.value.tags.join(', ');
});

// 格式化日期时间
const formatDateTime = (date: Date) => {
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 确认开始时间
const handleStartTimeConfirm = () => {
  form.value.startTime = pickerValueToDate(startTimePickerValue.value);
  showStartTimePicker.value = false;
  // 如果结束时间早于开始时间，自动调整
  if (form.value.endTime <= form.value.startTime) {
    form.value.endTime = new Date(form.value.startTime.getTime() + 60 * 60 * 1000);
  }
};

// 确认结束时间
const handleEndTimeConfirm = () => {
  form.value.endTime = pickerValueToDate(endTimePickerValue.value);
  showEndTimePicker.value = false;
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
};

// 关闭前确认
const handleBeforeClose = (action: string) => {
  if (action === 'confirm') {
    return handleSubmit();
  }
  resetForm();
  return true;
};

// 提交表单
const handleSubmit = async () => {
  loading.value = true;
  try {
    await formRef.value?.validate();

    // 验证时间
    if (form.value.endTime <= form.value.startTime) {
      showToast('结束时间必须晚于开始时间');
      return false;
    }

    await scheduleStore.createSchedule(form.value);

    showToast({
      message: '创建成功',
      type: 'success',
    });

    visible.value = false;
    resetForm();
    emit('created');
    return true;
  } catch (error: any) {
    console.error('创建失败:', error);
    return false;
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(Date.now() + 60 * 60 * 1000),
    tags: [],
  };
  tagInput.value = '';
};

// 监听对话框打开，重置表单
watch(visible, (val) => {
  if (val) {
    resetForm();
  }
});

// 监听开始时间选择器打开，初始化值
watch(showStartTimePicker, (val) => {
  if (val) {
    startTimePickerValue.value = dateToPickerValue(form.value.startTime);
  }
});

// 监听结束时间选择器打开，初始化值
watch(showEndTimePicker, (val) => {
  if (val) {
    endTimePickerValue.value = dateToPickerValue(form.value.endTime);
  }
});
</script>

<style scoped>
.schedule-create-dialog {
  max-height: 80vh;
  overflow-y: auto;
}

:deep(.van-dialog__content) {
  padding: 16px 0;
}

:deep(.van-cell-group) {
  margin: 0;
}

:deep(.van-button--primary) {
  background: #2c5aa0;
  border-color: #2c5aa0;
}
</style>
