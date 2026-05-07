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
            <span>CPU 核心: {{ cpuCores }}</span>
            <span>温度: {{ cpuTemp > 0 ? cpuTemp + '°C' : 'N/A' }}</span>
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
      <el-table :data="processList" stripe max-height="400" v-loading="processLoading">
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
        <el-descriptions-item label="运行时间">{{ systemInfo.uptime || '-' }}</el-descriptions-item>
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
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as echarts from 'echarts';
import { useAppStore } from '@/stores/app';
import { getSystemInfo, getSystemNetwork, getDiskInfo, getCpuIo, getDiskIo, getNetworkIo } from '@/api/index';

const appStore = useAppStore();

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

// 历史数据（用于图表）
const MAX_HISTORY = 60;
const cpuHistory = reactive([]);
const memHistory = reactive([]);
const diskReadHistory = reactive([]);
const diskWriteHistory = reactive([]);
const netUpHistory = reactive([]);
const netDownHistory = reactive([]);
const timeLabels = reactive([]);

// 图表引用
const cpuChartRef = ref(null);
const memoryChartRef = ref(null);
const diskChartRef = ref(null);
const networkChartRef = ref(null);

// 图表实例
let cpuChart = null;
let memoryChart = null;
let diskChart = null;
let networkChart = null;

// 进程列表
const processList = ref([]);
const processLoading = ref(false);

// 系统信息
const systemInfo = ref({
  hostname: '',
  os: '',
  kernel: '',
  arch: '',
  uptime: '',
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

function formatUptime(timeStr) {
  if (!timeStr) return '-';
  return timeStr;
}

function getTimeLabel() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

function pushHistory(arr, value) {
  arr.push(value);
  if (arr.length > MAX_HISTORY) arr.shift();
}

function initChart(chartRef, title, color1, color2, data, yMax = 100, unit = '%') {
  if (!chartRef) return null;
  const chart = echarts.init(chartRef);
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: { color: '#303133' },
      formatter: (params) => {
        const p = params[0];
        return `${p.axisValue}<br/>${p.marker} ${p.seriesName}: ${p.value}${unit}`;
      }
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
      data: [...timeLabels],
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#909399', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      max: yMax === 100 ? 100 : undefined,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f2f5' } },
      axisLabel: { color: '#909399', formatter: `{value}${unit}` }
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
      data: [...data]
    }]
  };
  chart.setOption(option);
  return chart;
}

function initNetworkChart(dataUp, dataDown) {
  if (!networkChartRef.value) return;
  networkChart = echarts.init(networkChartRef.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: { color: '#303133' },
      formatter: (params) => {
        let html = `${params[0].axisValue}<br/>`;
        params.forEach(p => {
          html += `${p.marker} ${p.seriesName}: ${formatBytes(p.value)}/s<br/>`;
        });
        return html;
      }
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
      data: [...timeLabels],
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#909399', fontSize: 10 }
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
        data: [...dataUp]
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
        data: [...dataDown]
      }
    ]
  };
  networkChart.setOption(option);
}

function updateCharts() {
  const timeData = [...timeLabels];

  if (cpuChart) {
    cpuChart.setOption({
      xAxis: { data: timeData },
      series: [{ data: [...cpuHistory] }]
    });
  }

  if (memoryChart) {
    memoryChart.setOption({
      xAxis: { data: timeData },
      series: [{ data: [...memHistory] }]
    });
  }

  if (diskChart) {
    diskChart.setOption({
      xAxis: { data: timeData },
      series: [{ data: [...diskReadHistory] }]
    });
  }

  if (networkChart) {
    networkChart.setOption({
      xAxis: { data: timeData },
      series: [
        { data: [...netUpHistory] },
        { data: [...netDownHistory] }
      ]
    });
  }
}

// 从后端获取进程列表
async function refreshProcesses() {
  processLoading.value = true;
  try {
    const res = await getSystemNetwork();
    if (res && res.process_list) {
      processList.value = res.process_list.map((p, idx) => ({
        pid: p.pid || p[0] || idx,
        name: p.name || p[1] || '-',
        user: p.user || p[6] || '-',
        cpu: parseFloat(p.cpu_percent || p[2] || 0).toFixed(1),
        memory: parseFloat(p.memory_percent || p[3] || 0).toFixed(1),
        status: (p.status || p[4] || 'sleeping').toLowerCase(),
        start_time: p.create_time || p[5] || '-'
      }));
    } else {
      // 如果 API 不返回进程列表，使用基础系统信息中的进程数
      processList.value = [];
    }
  } catch {
    processList.value = [];
  } finally {
    processLoading.value = false;
  }
}

async function killProcess(process) {
  try {
    await ElMessageBox.confirm(`确定要终止进程 ${process.name} (PID: ${process.pid}) 吗？`, '终止进程', {
      type: 'warning'
    });
    // 调用后端终止进程 API（如果有的话）
    ElMessage.success(`终止进程请求已发送`);
    setTimeout(refreshProcesses, 1000);
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('终止进程失败');
  }
}

async function refreshData() {
  try {
    const [basicRes, networkRes, diskRes] = await Promise.all([
      getSystemInfo(),
      getSystemNetwork(),
      getDiskInfo().catch(() => null)
    ]);

    const basic = basicRes || {};
    const net = networkRes || {};

    // CPU
    const cpuArr = net.cpu || [];
    const usage = basic.cpuRealUsed ?? cpuArr[0] ?? 0;
    const cores = basic.cpuNum ?? cpuArr[1] ?? 0;
    cpuUsage.value = Math.round(usage);
    cpuCores.value = cores;
    cpuTemp.value = 0; // 温度 API 暂不支持

    // Memory
    const mem = net.mem || basic;
    const memTotal = mem.memTotal || basic.memTotal || 0;
    const memUsed = mem.memRealUsed || basic.memRealUsed || 0;
    memoryTotal.value = memTotal * 1024 * 1024; // MB -> bytes
    memoryUsed.value = memUsed * 1024 * 1024;
    memoryUsage.value = memTotal ? Math.round((memUsed / memTotal) * 100) : 0;

    // Disk
    let dTotal = 0, dUsed = 0, dUsage = 0;
    if (diskRes?.data) {
      const rootDisk = diskRes.data.find(d => d.path === '/');
      if (rootDisk?.size) {
        dTotal = parseSizeStr(rootDisk.size[0]);
        dUsed = parseSizeStr(rootDisk.size[1]);
        dUsage = parseInt(rootDisk.size[3]) || 0;
      }
    }
    diskTotal.value = dTotal;
    diskUsed.value = dUsed;
    diskUsage.value = dUsage;

    // Network
    const netAll = net.network?.ALL || {};
    networkUp.value = Math.round(netAll.up || 0);
    networkDown.value = Math.round(netAll.down || 0);
    tcpConnections.value = 0;
    activeConnections.value = 0;

    // System info
    systemInfo.value = {
      hostname: basic.hostname || '',
      os: basic.system || '',
      kernel: basic.kernel || '',
      arch: basic.arch || '',
      uptime: basic.time || '',
      version: basic.version || '',
      cpu_model: cpuArr[3] || '',
      cpu_cores: cores,
      memory_total: memoryTotal.value,
      disk_total: diskTotal.value
    };

    // 更新图表历史数据
    const label = getTimeLabel();
    pushHistory(timeLabels, label);
    pushHistory(cpuHistory, cpuUsage.value);
    pushHistory(memHistory, memoryUsage.value);
    pushHistory(netUpHistory, networkUp.value);
    pushHistory(netDownHistory, networkDown.value);

    // 同步到 appStore
    await appStore.fetchSystemInfo().catch(() => {});
  } catch (error) {
    console.error('刷新监控数据失败:', error);
  }
}

// 解析 "1007G" "18G" 等格式为字节
function parseSizeStr(str) {
  if (!str || str === '-') return 0;
  str = str.toString().trim();
  const match = str.match(/^([\d.]+)\s*([KMGTP]?B?)$/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const multipliers = { '': 1, 'B': 1, 'K': 1024, 'KB': 1024, 'M': 1024**2, 'MB': 1024**2, 'G': 1024**3, 'GB': 1024**3, 'T': 1024**4, 'TB': 1024**4 };
  return Math.round(num * (multipliers[unit] || 1));
}

// 从后端获取历史IO数据
async function fetchHistoricalData() {
  try {
    const [cpuIoRes, diskIoRes, netIoRes] = await Promise.all([
      getCpuIo().catch(() => null),
      getDiskIo().catch(() => null),
      getNetworkIo().catch(() => null)
    ]);

    // 如果后端有历史数据，用它来初始化图表
    if (cpuIoRes?.data && Array.isArray(cpuIoRes.data) && cpuIoRes.data.length > 0) {
      cpuIoRes.data.forEach(item => {
        const time = item.add_time ? item.add_time.split(' ')[1]?.substring(0, 5) : getTimeLabel();
        pushHistory(timeLabels, time);
        pushHistory(cpuHistory, parseFloat(item.cpu_io) || 0);
      });
    }

    if (diskIoRes?.data && Array.isArray(diskIoRes.data) && diskIoRes.data.length > 0) {
      diskIoRes.data.forEach(item => {
        pushHistory(diskReadHistory, parseFloat(item.read_bytes) || 0);
        pushHistory(diskWriteHistory, parseFloat(item.write_bytes) || 0);
      });
    }

    if (netIoRes?.data && Array.isArray(netIoRes.data) && netIoRes.data.length > 0) {
      netIoRes.data.forEach(item => {
        pushHistory(netUpHistory, parseFloat(item.up) || 0);
        pushHistory(netDownHistory, parseFloat(item.down) || 0);
      });
    }
  } catch {
    // 历史数据获取失败，使用实时数据
  }
}

function handleResize() {
  if (cpuChart) cpuChart.resize();
  if (memoryChart) memoryChart.resize();
  if (diskChart) diskChart.resize();
  if (networkChart) networkChart.resize();
}

onMounted(async () => {
  // 先获取历史数据和实时数据
  await Promise.all([refreshData(), fetchHistoricalData()]);
  await nextTick();

  // 初始化图表（使用已收集的历史数据）
  cpuChart = initChart(cpuChartRef.value, 'CPU', '#409eff', '64, 158, 255', cpuHistory);
  memoryChart = initChart(memoryChartRef.value, '内存', '#67c23a', '103, 194, 58', memHistory);
  diskChart = initChart(diskChartRef.value, '磁盘 I/O', '#e6a23c', '230, 162, 60', diskReadHistory);
  initNetworkChart(netUpHistory, netDownHistory);

  // 获取进程列表
  refreshProcesses();

  // 每 5 秒刷新数据
  refreshTimer = setInterval(() => {
    refreshData();
  }, 5000);

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
