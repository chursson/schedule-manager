<template>
  <div class="statistics">
    <el-row :gutter="16">
      <!-- 用户统计 -->
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总用户数" :value="stats.users.total">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="活跃用户" :value="stats.users.active">
            <template #prefix>
              <el-icon style="color: #67c23a"><CircleCheckFilled /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="近7天新增" :value="stats.users.recent">
            <template #prefix>
              <el-icon style="color: #409eff"><TrendCharts /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总日程数" :value="stats.schedules.total">
            <template #prefix>
              <el-icon><Calendar /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 日程统计 -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="待办日程" :value="stats.schedules.pending">
            <template #prefix>
              <el-icon style="color: #909399"><Clock /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="进行中" :value="stats.schedules.inProgress">
            <template #prefix>
              <el-icon style="color: #409eff"><Loading /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="已完成" :value="stats.schedules.completed">
            <template #prefix>
              <el-icon style="color: #67c23a"><SuccessFilled /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="近7天新增" :value="stats.schedules.recent">
            <template #prefix>
              <el-icon style="color: #409eff"><TrendCharts /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表 -->
    <el-card style="margin-top: 16px">
      <template #header>
        <span>日程状态分布</span>
      </template>
      <div ref="chartRef" style="width: 100%; height: 400px"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import {
  User,
  CircleCheckFilled,
  TrendCharts,
  Calendar,
  Clock,
  Loading,
  SuccessFilled,
} from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { getStatistics, type Statistics } from '../../api/admin';

const stats = ref<Statistics>({
  users: { total: 0, active: 0, recent: 0 },
  schedules: { total: 0, pending: 0, inProgress: 0, completed: 0, recent: 0 },
});

const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

/**
 * 加载统计数据
 */
const loadStatistics = async () => {
  try {
    stats.value = await getStatistics();

    // 渲染图表
    await nextTick();
    renderChart();
  } catch (error) {
    console.error('加载统计数据失败:', error);
    ElMessage.error('加载统计数据失败');
  }
};

/**
 * 渲染图表
 */
const renderChart = () => {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '日程状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: stats.value.schedules.pending, name: '待办' },
          { value: stats.value.schedules.inProgress, name: '进行中' },
          { value: stats.value.schedules.completed, name: '已完成' },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  chartInstance.setOption(option);

  // 响应式
  window.addEventListener('resize', () => {
    chartInstance?.resize();
  });
};

onMounted(() => {
  loadStatistics();
});
</script>

<style scoped lang="scss">
.statistics {
  .el-card {
    :deep(.el-statistic__head) {
      margin-bottom: 8px;
    }
  }
}
</style>
