<template>
  <div class="calendar-page">
    <van-nav-bar title="日历" :border="false" />

    <!-- 日历组件 -->
    <van-calendar
      v-model:show="showCalendar"
      :min-date="minDate"
      :max-date="maxDate"
      :default-date="selectedDate"
      @confirm="handleDateSelect"
      :formatter="dateFormatter"
      type="single"
      :poppable="false"
      :show-confirm="false"
    />

    <!-- 当天日程列表 -->
    <div class="daily-schedules">
      <div class="daily-header">
        <h3>{{ formatDate(selectedDate) }} 的日程</h3>
        <span class="schedule-count">{{ dailySchedules.length }} 个</span>
      </div>

      <div v-if="loading" class="loading-container">
        <van-loading type="spinner" size="24px">加载中...</van-loading>
      </div>

      <van-empty v-else-if="dailySchedules.length === 0" description="当天暂无日程" />

      <div v-else class="schedule-list">
        <schedule-card
          v-for="schedule in dailySchedules"
          :key="schedule._id"
          :schedule="schedule"
          @click="handleView(schedule._id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScheduleStore } from '../../stores/schedule';
import type { Schedule } from '../../types';
import ScheduleCard from '../../components/ScheduleCard.vue';

const router = useRouter();
const scheduleStore = useScheduleStore();

const showCalendar = ref(true);
const selectedDate = ref(new Date());
const minDate = ref(new Date(2024, 0, 1));
const maxDate = ref(new Date(2026, 11, 31));
const loading = ref(false);
const allSchedules = ref<Schedule[]>([]);

// 当天日程
const dailySchedules = computed(() => {
  const selected = selectedDate.value;
  const startOfDay = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
  const endOfDay = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 23, 59, 59);

  return allSchedules.value.filter((schedule) => {
    const scheduleStart = new Date(schedule.startTime);
    return scheduleStart >= startOfDay && scheduleStart <= endOfDay;
  });
});

// 日期格式化器 - 标记有日程的日期
const dateFormatter = (day: any) => {
  const date = day.date;
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

  const hasSchedule = allSchedules.value.some((schedule) => {
    const scheduleStart = new Date(schedule.startTime);
    return scheduleStart >= startOfDay && scheduleStart <= endOfDay;
  });

  if (hasSchedule) {
    day.bottomInfo = '●';
  }

  return day;
};

// 格式化日期显示
const formatDate = (date: Date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return '今天';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return '明天';
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }
};

// 选择日期
const handleDateSelect = (value: Date) => {
  selectedDate.value = value;
};

// 查看日程详情
const handleView = (id: string) => {
  router.push(`/schedule/${id}`);
};

// 加载所有日程
const loadSchedules = async () => {
  loading.value = true;
  try {
    // 获取未来3个月的日程
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    await scheduleStore.fetchSchedules({
      page: 1,
      limit: 1000,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    allSchedules.value = scheduleStore.schedules;
  } catch (error) {
    console.error('加载日程失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadSchedules();
});
</script>

<style scoped>
.calendar-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

:deep(.van-nav-bar) {
  background-color: #2c5aa0;
}

:deep(.van-nav-bar__title) {
  color: white;
  font-weight: bold;
}

:deep(.van-calendar) {
  padding-top: 0;
}

:deep(.van-calendar__bottom-info) {
  color: #2c5aa0;
  font-size: 16px;
}

.daily-schedules {
  padding: 16px;
}

.daily-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.daily-header h3 {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
  margin: 0;
}

.schedule-count {
  font-size: 14px;
  color: #969799;
}

.loading-container {
  padding: 40px 20px;
  text-align: center;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
