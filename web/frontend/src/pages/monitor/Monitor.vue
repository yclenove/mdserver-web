<template>
  <div class="monitor-page">
    <!-- 实时监控卡片 -->
    <el-row :gutter="16" class="realtime-cards">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="monitor-card cpu-card">
          <div class="card-header">
            <el-icon :size="24"><Cpu /></el-icon>
            <span>CPU 使用率</span>
          </div>
          <div class="card-body">
            <el-progress
              type="dashboard"
              :percentage="cpuUsage"
              :color="getProgressColor(cpuUsage)"
              :width="120"
            >
              <template #default>
                <span class="progress-text">{{ cpuUsage }}%</span>
              </template>
            </el-progress>
          </div>
          <div class="card-footer">
            <span>核心数: {{ cpuCores }}</span>
            <span>温度: {{ cpuTemp }}°C</span>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="monitor-card memory-card">
          <div class="card-header">
            <el-icon :size="24"><Coin /></el-icon>
            <span>内存使用率</span>
          </div>
          <div class="card-body">
            <el-progress
              type="dashboard"
              :percentage="memoryUsage"
              :color="getProgressColor(memoryUsage)"
              :width="120"
            >
              <template #default>
                <span class="progress-text">{{ memoryUsage }}%</span>
              </template>
            </el-progress>
          </div>
          <div class="card-footer">
            <span>已用: {{ formatBytes(memoryUsed) }}</span>
            <span>总计: {{ formatBytes(memoryTotal) }}</span>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="monitor-card disk-card">
          <div class="card-header">
            <el-icon :size="24"><Box /></el-icon>
            <span>磁盘使用率</span>
          </div>
          <div class="card-body">
            <el-progress
              type="dashboard"
              :percentage="diskUsage"
              :color="getProgressColor(diskUsage)"
              :width="120"
            >
              <template #default>
                <span class="progress-text">{{ diskUsage }}%</span>
              </template>
            </el-progress>
          </div>
          <div class="card-footer">
            <span>已用: {{ formatBytes(diskUsed) }}</span>
            <span>总计: {{ formatBytes(diskTotal) }}</span>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="monitor-card network-card">
          <div class="card-header">
            <el-icon :size="24"><Connection /></el-icon>
            <span>网络流量</span>
          </div>
          <div class="card-body">
            <div class="network-stats">
              <div class="network-item">
                <el-icon><Top /></el-icon>
                <span class="network-label">上行</span>
                <span class="network-value">{{ formatBytes(networkUp) }}/s</span>
              </div>
              <div class="network-item">
                <el-icon><Bottom /></el-icon>
                <span class="network-label">下行</span>
                <span class="network-value">{{ formatBytes(networkDown) }}/s</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <span>TCP: {{ tcpConnections }}</span>
            <span>活动: {{ activeConnections }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>CPU 使用趋势</span>
              <el-radio-group v-model="cpuTimeRange" size="small">
                <el-radio-button label="1h">1小时</el-radio-button>
                <el-radio-button label="6h">6小时</el-radio-button>
                <el-radio-button label="24h">24小时</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="cpuChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>内存使用趋势</span>
              <el-radio-group v-model="memoryTimeRange" size="small">
                <el-radio-button label="1h">1小时</el-radio-button>
                <el-radio-button label="6h">6小时</el-radio-button>
                <el-radio-button label="24h">24小时</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="memoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>磁盘 I/O 趋势</span>
              <el-radio-group v-model="diskTimeRange" size="small">
                <el-radio-button label="1h">1小时</el-radio-button>
                <el-radio-button label="6h">6小时</el-radio-button>
                <el-radio-button label="24h">24小时</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="diskChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>网络流量趋势</span>
              <el-radio-group v-model="networkTimeRange" size="small">
                <el-radio-button label="1h">1小时</el-radio-button>
                <el-radio-button label="6h">6小时</el-radio-button>
                <el-radio-button label="24h">24小时</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="networkChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 进程监控 -->
    <el-card class="process-card">
      <template #header>
        <div class="chart-header">
          <span>进程监控</span>
          <el-button icon="Refresh" @click="refreshProcesses">刷新</el-button>
        </div>
      </template>
      <el-table :data="processList" stripe max-height="400">
        <el-table-column prop="pid" label="PID" width="80" />
        <el-table-column prop="name" label="进程名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="user" label="用户" width="100" />
        <el-table-column prop="cpu" label="CPU %" width="100" sortable>
          <template #default="{ row }">
            <el-progress :percentage="row.cpu" :stroke-width="8" :show-text="false" :color="getProgressColor(row.cpu)" />
            <span class="cpu-value">{{ row.cpu }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="memory" label="内存 %" width="100" sortable>
          <template #default="{ row }">
            <el-progress :percentage="row.memory" :stroke-width="8" :show-text="false" :color="getProgressColor(row.memory)" />
            <span class="cpu-value">{{ row.memory }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'running' ? 'success' : 'info'" size="small">
              {{ row.status === 'running' ? '运行中' : '睡眠' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="start_time" label="启动时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="killProcess(row)">终止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 系统信息 -->
    <el-card class="system-info-card">
      <template #header>
        <span>系统信息</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="主机名">{{ systemInfo.hostname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="操作系统">{{ systemInfo.os || '-' }}</el-descriptions-item>
        <el-descriptions-item label="内核版本">{{ systemInfo.kernel || '-' }}</el-descriptions-item>
        <el-descriptions-item label="系统架构">{{ systemInfo.arch || '-' }}</el-descriptions-item>
        <el-descriptions-item label="运行时间">{{ formatUptime(systemInfo.uptime) }}</el-descriptions-item>
        <el-descriptions-item label="面板版本">{{ systemInfo.version || '-' }}</el-descriptions-item>
        <el-descriptions-item label="CPU 型号">{{ systemInfo.cpu_model || '-' }}</el-descriptions-item>
        <el-descriptions-item label="CPU 核心">{{ systemInfo.cpu_cores || '-' }} 核</el-descriptions-item>
        <el-descriptions-item label="总内存">{{ formatBytes(systemInfo.memory_total) }}</el-descriptions-item>
        <el-descriptions-item label="总磁盘">{{ formatBytes(systemInfo.disk_total) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as echarts from 'echarts';

// 实时数据
const cpuUsage = ref(0);
const cpuCores = ref(0);
const cpuTemp = ref(0);
const memoryUsage = ref(0);
const memoryUsed = ref(0);
const memoryTotal = ref(0);
const diskUsage = ref(0);
const diskUsed = ref(0);
const diskTotal = ref(0);
const networkUp = ref(0);
const networkDown = ref(0);
const tcpConnections = ref(0);
const activeConnections = ref(0);

// 图表引用
const cpuChartRef = ref(null);
const memoryChartRef = ref(null);
const diskChartRef = ref(null);
const networkChartRef = ref(null);

// 时间范围
const cpuTimeRange = ref('1h');
const memoryTimeRange = ref('1h');
const diskTimeRange = ref('1h');
const networkTimeRange = ref('1h');

// 图表实例
let cpuChart = null;
let memoryChart = null;
let diskChart = null;
let networkChart = null;

// 进程列表
const processList = ref([]);

// 系统信息
const systemInfo = ref({
  hostname: '',
  os: '',
  kernel: '',
  arch: '',
  uptime: 0,
  version: '',
  cpu_model: '',
  cpu_cores: 0,
  memory_total: 0,
  disk_total: 0
});

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

function formatUptime(seconds) {
  if (!seconds) return '-';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  parts.push(`${mins}分钟`);
  return parts.join('');
}

function generateTimeLabels(count = 24) {
  const labels = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * 5 * 60 * 1000);
    labels.push(
      `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
    );
  }
  return labels;
}

function generateMockData(count = 24, min = 20, max = 80) {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min) + min));
}

function initChart(ref, title, color1, color2) {
  if (!ref) return null;
  const chart = echarts.init(ref);
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: { color: '#303133' }
    },
    grid: {
      left: '3%',
      right: '3%',
      top: '10%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: generateTimeLabels(),
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#909399' }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f2f5' } },
      axisLabel: { color: '#909399', formatter: '{value}%' }
    },
    series: [{
      name: title,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color: color1 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `rgba(${color2}, 0.3)` },
          { offset: 1, color: `rgba(${color2}, 0.05)` }
        ])
      },
      data: generateMockData()
    }]
  };
  chart.setOption(option);
  return chart;
}

function initNetworkChart() {
  if (!networkChartRef.value) return;
  networkChart = echarts.init(networkChartRef.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: { color: '#303133' }
    },
    legend: {
      data: ['上行', '下行'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '3%',
      top: '10%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: generateTimeLabels(),
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#909399' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f2f5' } },
      axisLabel: {
        color: '#909399',
        formatter: (value) => formatBytes(value) + '/s'
      }
    },
    series: [
      {
        name: '上行',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#f56c6c' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ])
        },
        data: generateMockData(24, 100000, 5000000)
      },
      {
        name: '下行',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#67c23a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
          ])
        },
        data: generateMockData(24, 500000, 20000000)
      }
    ]
  };
  networkChart.setOption(option);
}

function refreshProcesses() {
  // 模拟进程数据
  processList.value = [
    { pid: 1, name: 'nginx', user: 'www', cpu: 2.5, memory: 3.2, status: 'running', start_time: '2024-01-01 00:00:00' },
    { pid: 2, name: 'php-fpm', user: 'www', cpu: 5.1, memory: 8.5, status: 'running', start_time: '2024-01-01 00:00:00' },
    { pid: 3, name: 'mysql', user: 'mysql', cpu: 3.8, memory: 15.2, status: 'running', start_time: '2024-01-01 00:00:00' },
    { pid: 4, name: 'redis', user: 'redis', cpu: 1.2, memory: 4.8, status: 'running', start_time: '2024-01-01 00:00:00' },
    { pid: 5, name: 'sshd', user: 'root', cpu: 0.1, memory: 0.5, status: 'sleeping', start_time: '2024-01-01 00:00:00' }
  ];
}

async function killProcess(process) {
  try {
    await ElMessageBox.confirm(`确定要终止进程 ${process.name} (PID: ${process.pid}) 吗？`, '终止进程', {
      type: 'warning'
    });
    ElMessage.success(`进程 ${process.name} 已终止`);
    refreshProcesses();
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('终止进程失败');
  }
}

async function refreshData() {
  try {
    // 模拟数据更新
    cpuUsage.value = Math.floor(Math.random() * 30 + 20);
    cpuCores.value = 4;
    cpuTemp.value = Math.floor(Math.random() * 20 + 40);
    memoryUsage.value = Math.floor(Math.random() * 20 + 40);
    memoryUsed.value = Math.floor(Math.random() * 4 + 4) * 1024 * 1024 * 1024;
    memoryTotal.value = 8 * 1024 * 1024 * 1024;
    diskUsage.value = Math.floor(Math.random() * 10 + 50);
    diskUsed.value = Math.floor(Math.random() * 100 + 200) * 1024 * 1024 * 1024;
    diskTotal.value = 500 * 1024 * 1024 * 1024;
    networkUp.value = Math.floor(Math.random() * 5000000 + 1000000);
    networkDown.value = Math.floor(Math.random() * 20000000 + 5000000);
    tcpConnections.value = Math.floor(Math.random() * 100 + 50);
    activeConnections.value = Math.floor(Math.random() * 20 + 5);
  } catch {
    // 静默处理
  }
}

function handleResize() {
  if (cpuChart) cpuChart.resize();
  if (memoryChart) memoryChart.resize();
  if (diskChart) diskChart.resize();
  if (networkChart) networkChart.resize();
}

onMounted(async () => {
  await refreshData();
  refreshProcesses();
  await nextTick();

  // 初始化图表
  cpuChart = initChart(cpuChartRef.value, 'CPU', '#409eff', '64, 158, 255');
  memoryChart = initChart(memoryChartRef.value, '内存', '#67c23a', '103, 194, 58');
  diskChart = initChart(diskChartRef.value, '磁盘 I/O', '#e6a23c', '230, 162, 60');
  initNetworkChart();

  // 每 5 秒刷新数据
  refreshTimer = setInterval(refreshData, 5000);

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  if (cpuChart) cpuChart.dispose();
  if (memoryChart) memoryChart.dispose();
  if (diskChart) diskChart.dispose();
  if (networkChart) networkChart.dispose();
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.monitor-page {
  .realtime-cards {
    margin-bottom: 16px;

    .monitor-card {
      margin-bottom: 16px;

      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 16px;

        .el-icon {
          color: #409eff;
        }
      }

      .card-body {
        text-align: center;
        padding: 16px 0;

        .progress-text {
          font-size: 24px;
          font-weight: 700;
        }

        .network-stats {
          display: flex;
          justify-content: space-around;

          .network-item {
            text-align: center;

            .el-icon {
              font-size: 24px;
              color: #409eff;
              margin-bottom: 8px;
            }

            .network-label {
              display: block;
              font-size: 12px;
              color: #909399;
              margin-bottom: 4px;
            }

            .network-value {
              font-size: 16px;
              font-weight: 600;
              color: #303133;
            }
          }
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #909399;
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid #ebeef5;
      }
    }
  }

  .chart-row {
    margin-bottom: 16px;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-container {
      width: 100%;
      height: 300px;
    }
  }

  .process-card {
    margin-bottom: 16px;

    .cpu-value {
      font-size: 12px;
      margin-left: 8px;
    }
  }

  .system-info-card {
    margin-bottom: 16px;
  }
}
</style>
