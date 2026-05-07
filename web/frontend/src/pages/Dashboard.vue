<template>
  <div class="dashboard-page">
    <!-- 信息卡片 -->
    <el-row :gutter="16" class="info-cards">
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="info-card cpu-card">
          <div class="card-icon">
            <el-icon :size="36"><Cpu /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-label">CPU 使用率</div>
            <div class="card-value">{{ systemInfo.cpu.usage || 0 }}%</div>
            <el-progress
              :percentage="systemInfo.cpu.usage || 0"
              :stroke-width="6"
              :show-text="false"
              :color="getProgressColor(systemInfo.cpu.usage)"
            />
            <div class="card-detail">{{ systemInfo.cpu.cores || '-' }} 核 {{ systemInfo.cpu.model || '' }}</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <div class="info-card memory-card">
          <div class="card-icon">
            <el-icon :size="36"><Coin /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-label">内存使用率</div>
            <div class="card-value">{{ systemInfo.memory.usage || 0 }}%</div>
            <el-progress
              :percentage="systemInfo.memory.usage || 0"
              :stroke-width="6"
              :show-text="false"
              :color="getProgressColor(systemInfo.memory.usage)"
            />
            <div class="card-detail">
              {{ formatBytes(systemInfo.memory.used) }} / {{ formatBytes(systemInfo.memory.total) }}
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <div class="info-card disk-card">
          <div class="card-icon">
            <el-icon :size="36"><Box /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-label">磁盘使用率</div>
            <div class="card-value">{{ systemInfo.disk.usage || 0 }}%</div>
            <el-progress
              :percentage="systemInfo.disk.usage || 0"
              :stroke-width="6"
              :show-text="false"
              :color="getProgressColor(systemInfo.disk.usage)"
            />
            <div class="card-detail">
              {{ formatBytes(systemInfo.disk.used) }} / {{ formatBytes(systemInfo.disk.total) }}
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <div class="info-card network-card">
          <div class="card-icon">
            <el-icon :size="36"><Connection /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-label">网络流量</div>
            <div class="card-value">{{ formatBytes(systemInfo.network.down) }}/s</div>
            <div class="network-detail">
              <span class="upload">
                <el-icon><Top /></el-icon>
                {{ formatBytes(systemInfo.network.up) }}/s
              </span>
              <span class="download">
                <el-icon><Bottom /></el-icon>
                {{ formatBytes(systemInfo.network.down) }}/s
              </span>
            </div>
            <div class="card-detail">运行时间: {{ formatUptime(systemInfo.uptime) }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 系统负载和进程信息 -->
    <el-row :gutter="16" class="info-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="page-card mini-card">
          <div class="mini-card-header">
            <el-icon><Monitor /></el-icon>
            <span>系统负载</span>
          </div>
          <div class="mini-card-body">
            <div class="load-avg">
              <div class="load-item">
                <span class="load-label">1分钟</span>
                <span class="load-value">{{ systemInfo.load?.one ?? '-' }}</span>
              </div>
              <div class="load-item">
                <span class="load-label">5分钟</span>
                <span class="load-value">{{ systemInfo.load?.five ?? '-' }}</span>
              </div>
              <div class="load-item">
                <span class="load-label">15分钟</span>
                <span class="load-value">{{ systemInfo.load?.fifteen ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="page-card mini-card">
          <div class="mini-card-header">
            <el-icon><Setting /></el-icon>
            <span>进程信息</span>
          </div>
          <div class="mini-card-body">
            <div class="process-info">
              <div class="process-item">
                <span class="process-label">总进程数</span>
                <span class="process-value">{{ systemInfo.process?.total || '-' }}</span>
              </div>
              <div class="process-item">
                <span class="process-label">运行中</span>
                <span class="process-value text-success">{{ systemInfo.process?.running || '-' }}</span>
              </div>
              <div class="process-item">
                <span class="process-label">睡眠中</span>
                <span class="process-value">{{ systemInfo.process?.sleeping || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="page-card mini-card">
          <div class="mini-card-header">
            <el-icon><Coin /></el-icon>
            <span>Swap 内存</span>
          </div>
          <div class="mini-card-body">
            <div class="swap-info">
              <el-progress
                :percentage="systemInfo.swap?.usage || 0"
                :stroke-width="8"
                :color="getProgressColor(systemInfo.swap?.usage)"
              />
              <div class="swap-detail">
                <span>{{ formatBytes(systemInfo.swap?.used || 0) }} / {{ formatBytes(systemInfo.swap?.total || 0) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="page-card mini-card">
          <div class="mini-card-header">
            <el-icon><Connection /></el-icon>
            <span>网络连接</span>
          </div>
          <div class="mini-card-body">
            <div class="network-conn">
              <div class="conn-item">
                <span class="conn-label">TCP 连接</span>
                <span class="conn-value">{{ systemInfo.network?.tcp || '-' }}</span>
              </div>
              <div class="conn-item">
                <span class="conn-label">活动连接</span>
                <span class="conn-value text-primary">{{ systemInfo.network?.established || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="16">
        <div class="page-card">
          <div class="page-header">
            <h3 class="page-title">资源使用趋势</h3>
            <el-radio-group v-model="chartTimeRange" size="small">
              <el-radio-button label="1h">1小时</el-radio-button>
              <el-radio-button label="6h">6小时</el-radio-button>
              <el-radio-button label="24h">24小时</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="trendChartRef" class="chart-container"></div>
        </div>
      </el-col>

      <el-col :xs="24" :lg="8">
        <div class="page-card">
          <div class="page-header">
            <h3 class="page-title">系统信息</h3>
          </div>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="主机名">{{ systemInfo.hostname || '-' }}</el-descriptions-item>
            <el-descriptions-item label="操作系统">{{ systemInfo.os || '-' }}</el-descriptions-item>
            <el-descriptions-item label="内核版本">{{ systemInfo.kernel || '-' }}</el-descriptions-item>
            <el-descriptions-item label="运行时间">{{ formatUptime(systemInfo.uptime) }}</el-descriptions-item>
            <el-descriptions-item label="CPU 型号">{{ systemInfo.cpu.model || '-' }}</el-descriptions-item>
            <el-descriptions-item label="CPU 核心">{{ systemInfo.cpu.cores || '-' }} 核</el-descriptions-item>
            <el-descriptions-item label="总内存">{{ formatBytes(systemInfo.memory.total) }}</el-descriptions-item>
            <el-descriptions-item label="总磁盘">{{ formatBytes(systemInfo.disk.total) }}</el-descriptions-item>
            <el-descriptions-item label="系统架构">{{ systemInfo.arch || '-' }}</el-descriptions-item>
            <el-descriptions-item label="面板版本">{{ systemInfo.version || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useAppStore } from '@/stores/app';
import * as echarts from 'echarts';

const appStore = useAppStore();
const systemInfo = ref(appStore.systemInfo);
const trendChartRef = ref(null);
const chartTimeRange = ref('1h');

let trendChart = null;
let refreshTimer = null;

function getProgressColor(value) {
  if (value >= 90) return '#f56c6c';
  if (value >= 70) return '#e6a23c';
  return '#67c23a';
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
}

function formatUptime(uptime) {
  if (!uptime) return '-';
  // API 返回中文格式如 "已不间断运行: 0天11小时39分钟"
  if (typeof uptime === 'string') {
    // 提取 "已不间断运行:" 后面的部分
    const match = uptime.match(/(\d+天\d+小时\d+分钟)/);
    if (match) return match[1];
    // 如果已经是纯时间格式，直接返回
    if (uptime.includes('天') || uptime.includes('小时') || uptime.includes('分钟')) {
      return uptime.replace('已不间断运行: ', '');
    }
    return uptime;
  }
  // 如果是秒数
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const mins = Math.floor((uptime % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  parts.push(`${mins}分钟`);
  return parts.join('');
}

function initTrendChart() {
  if (!trendChartRef.value) return;

  trendChart = echarts.init(trendChartRef.value);

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: { color: '#303133' },
    },
    legend: {
      data: ['CPU', '内存', '磁盘'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '3%',
      top: '10%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: generateTimeLabels(),
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#909399' },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f2f5' } },
      axisLabel: { color: '#909399', formatter: '{value}%' },
    },
    series: [
      {
        name: 'CPU',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
          ]),
        },
        data: generateMockData(),
      },
      {
        name: '内存',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#67c23a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' },
          ]),
        },
        data: generateMockData(),
      },
      {
        name: '磁盘',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#e6a23c' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
            { offset: 1, color: 'rgba(230, 162, 60, 0.05)' },
          ]),
        },
        data: generateMockData(),
      },
    ],
  };

  trendChart.setOption(option);
}

function generateTimeLabels() {
  const labels = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now - i * 5 * 60 * 1000);
    labels.push(
      `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
    );
  }
  return labels;
}

function generateMockData() {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 60 + 20));
}

async function refreshData() {
  try {
    await appStore.fetchSystemInfo();
    systemInfo.value = appStore.systemInfo;
  } catch {
    // 静默处理
  }
}

onMounted(async () => {
  await refreshData();
  await nextTick();
  initTrendChart();

  // 每 5 秒刷新数据
  refreshTimer = setInterval(refreshData, 5000);

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  if (trendChart) trendChart.dispose();
  window.removeEventListener('resize', handleResize);
});

function handleResize() {
  if (trendChart) trendChart.resize();
}
</script>

<style lang="scss" scoped>
.dashboard-page {
  .info-cards {
    margin-bottom: 16px;
  }

  .info-card {
    background: #ffffff;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    margin-bottom: 16px;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      flex-shrink: 0;
    }

    .card-info {
      flex: 1;
      min-width: 0;

      .card-label {
        font-size: 13px;
        color: #909399;
        margin-bottom: 4px;
      }

      .card-value {
        font-size: 24px;
        font-weight: 700;
        color: #303133;
        margin-bottom: 8px;
      }

      .card-detail {
        font-size: 12px;
        color: #909399;
        margin-top: 6px;
      }
    }
  }

  .cpu-card .card-icon { background: linear-gradient(135deg, #409eff, #66b1ff); }
  .memory-card .card-icon { background: linear-gradient(135deg, #67c23a, #85ce61); }
  .disk-card .card-icon { background: linear-gradient(135deg, #e6a23c, #ebb563); }
  .network-card .card-icon { background: linear-gradient(135deg, #f56c6c, #f89898); }

  .network-detail {
    display: flex;
    gap: 16px;
    margin-bottom: 4px;

    .upload, .download {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #606266;
    }

    .upload .el-icon { color: #f56c6c; }
    .download .el-icon { color: #67c23a; }
  }

  .info-row {
    margin-bottom: 16px;

    .mini-card {
      margin-bottom: 16px;

      .mini-card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;

        .el-icon {
          color: #409eff;
        }
      }

      .mini-card-body {
        .load-avg {
          display: flex;
          justify-content: space-between;

          .load-item {
            text-align: center;

            .load-label {
              display: block;
              font-size: 12px;
              color: #909399;
              margin-bottom: 4px;
            }

            .load-value {
              font-size: 18px;
              font-weight: 600;
              color: #303133;
            }
          }
        }

        .process-info {
          display: flex;
          justify-content: space-between;

          .process-item {
            text-align: center;

            .process-label {
              display: block;
              font-size: 12px;
              color: #909399;
              margin-bottom: 4px;
            }

            .process-value {
              font-size: 18px;
              font-weight: 600;
              color: #303133;

              &.text-success { color: #67c23a; }
              &.text-primary { color: #409eff; }
            }
          }
        }

        .swap-info {
          .swap-detail {
            margin-top: 8px;
            text-align: center;
            font-size: 13px;
            color: #606266;
          }
        }

        .network-conn {
          display: flex;
          justify-content: space-between;

          .conn-item {
            text-align: center;

            .conn-label {
              display: block;
              font-size: 12px;
              color: #909399;
              margin-bottom: 4px;
            }

            .conn-value {
              font-size: 18px;
              font-weight: 600;
              color: #303133;

              &.text-primary { color: #409eff; }
            }
          }
        }
      }
    }
  }

  .chart-row {
    .page-card {
      margin-bottom: 16px;
    }
  }

  .chart-container {
    width: 100%;
    height: 320px;
  }
}
</style>
