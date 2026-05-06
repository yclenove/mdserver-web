<template>
  <div class="logs-page">
    <!-- 搜索和过滤栏 -->
    <el-card class="filter-card">
      <el-row :gutter="16" align="middle">
        <el-col :xs="24" :sm="8" :md="6">
          <el-input
            v-model="searchQuery"
            placeholder="搜索日志内容"
            clearable
            prefix-icon="Search"
            @input="handleSearch"
          />
        </el-col>
        <el-col :xs="24" :sm="8" :md="4">
          <el-select v-model="logType" placeholder="日志类型" clearable @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="系统日志" value="system" />
            <el-option label="访问日志" value="access" />
            <el-option label="错误日志" value="error" />
            <el-option label="操作日志" value="operation" />
            <el-option label="安全日志" value="security" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="8" :md="6">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </el-col>
        <el-col :xs="24" :sm="8" :md="4">
          <el-select v-model="logLevel" placeholder="日志级别" clearable @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="INFO" value="info" />
            <el-option label="WARNING" value="warning" />
            <el-option label="ERROR" value="error" />
            <el-option label="DEBUG" value="debug" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="24" :md="4" class="action-buttons">
          <el-button type="primary" icon="Search" @click="fetchLogs">搜索</el-button>
          <el-button icon="Refresh" @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="总日志数" :value="stats.total">
            <template #prefix><el-icon style="color: #409eff"><Tickets /></el-icon></template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="今日日志" :value="stats.today">
            <template #prefix><el-icon style="color: #67c23a"><Calendar /></el-icon></template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="错误日志" :value="stats.errors">
            <template #prefix><el-icon style="color: #f56c6c"><WarningFilled /></el-icon></template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="警告日志" :value="stats.warnings">
            <template #prefix><el-icon style="color: #e6a23c"><InfoFilled /></el-icon></template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 日志列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
          <div class="header-actions">
            <el-button type="danger" icon="Delete" @click="clearLogs">清空日志</el-button>
            <el-button icon="Download" @click="exportLogs">导出日志</el-button>
            <el-switch
              v-model="autoRefresh"
              active-text="自动刷新"
              inactive-text=""
              @change="toggleAutoRefresh"
            />
          </div>
        </div>
      </template>

      <el-table
        :data="logList"
        stripe
        v-loading="loading"
        @sort-change="handleSortChange"
        :row-class-name="getRowClassName"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="log-detail">
              <p><strong>日志ID:</strong> {{ row.id }}</p>
              <p><strong>类型:</strong> {{ row.type }}</p>
              <p><strong>时间:</strong> {{ row.add_time }}</p>
              <p><strong>内容:</strong></p>
              <pre class="log-content">{{ row.log }}</pre>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="80" sortable="custom" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)" size="small">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="log" label="日志内容" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="log-text" v-html="highlightSearch(row.log)"></span>
          </template>
        </el-table-column>
        <el-table-column prop="uid" label="用户ID" width="80" />
        <el-table-column prop="add_time" label="时间" width="180" sortable="custom" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewLogDetail(row)">详情</el-button>
            <el-button type="danger" link @click="deleteLog(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[20, 50, 100, 200]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 日志详情对话框 -->
    <el-dialog v-model="logDetailVisible" title="日志详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="日志ID">{{ currentLog.id }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ getTypeName(currentLog.type) }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentLog.uid }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ currentLog.add_time }}</el-descriptions-item>
        <el-descriptions-item label="内容">
          <pre class="log-detail-content">{{ currentLog.log }}</pre>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="logDetailVisible = false">关闭</el-button>
        <el-button type="primary" @click="copyLog">复制内容</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const logList = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const logType = ref('');
const logLevel = ref('');
const dateRange = ref(null);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const autoRefresh = ref(false);
const logDetailVisible = ref(false);
const currentLog = ref({});
const sortProp = ref('');
const sortOrder = ref('');

let autoRefreshTimer = null;

const stats = computed(() => {
  const total = logList.value.length;
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = logList.value.filter(l => l.add_time && l.add_time.startsWith(today)).length;
  const errors = logList.value.filter(l => l.type === 'error' || (l.log && l.log.toLowerCase().includes('error'))).length;
  const warnings = logList.value.filter(l => l.type === 'warning' || (l.log && l.log.toLowerCase().includes('warning'))).length;
  return { total, today: todayLogs, errors, warnings };
});

const fetchLogs = async () => {
  loading.value = true;
  try {
    // 模拟数据 - 实际应调用 API
    logList.value = [];
    total.value = 0;
  } catch (error) {
    ElMessage.error('获取日志列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
};

const handleFilter = () => {
  currentPage.value = 1;
};

const handleDateChange = () => {
  currentPage.value = 1;
};

const handleSortChange = ({ prop, order }) => {
  sortProp.value = prop;
  sortOrder.value = order === 'ascending' ? 'asc' : 'desc';
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  fetchLogs();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchLogs();
};

const resetFilters = () => {
  searchQuery.value = '';
  logType.value = '';
  logLevel.value = '';
  dateRange.value = null;
  currentPage.value = 1;
  fetchLogs();
};

const getTypeName = (type) => {
  const types = {
    'system': '系统日志',
    'access': '访问日志',
    'error': '错误日志',
    'operation': '操作日志',
    'security': '安全日志'
  };
  return types[type] || type || '未知';
};

const getTypeTag = (type) => {
  const tags = {
    'system': '',
    'access': 'success',
    'error': 'danger',
    'operation': 'warning',
    'security': 'info'
  };
  return tags[type] || '';
};

const getRowClassName = ({ row }) => {
  if (row.type === 'error' || (row.log && row.log.toLowerCase().includes('error'))) {
    return 'error-row';
  }
  if (row.type === 'warning' || (row.log && row.log.toLowerCase().includes('warning'))) {
    return 'warning-row';
  }
  return '';
};

const highlightSearch = (text) => {
  if (!searchQuery.value || !text) return text;
  const regex = new RegExp(`(${searchQuery.value})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

const viewLogDetail = (log) => {
  currentLog.value = log;
  logDetailVisible.value = true;
};

const copyLog = () => {
  const text = `ID: ${currentLog.value.id}\n类型: ${getTypeName(currentLog.value.type)}\n时间: ${currentLog.value.add_time}\n内容: ${currentLog.value.log}`;
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板');
  }).catch(() => {
    ElMessage.error('复制失败');
  });
};

const deleteLog = async (log) => {
  try {
    await ElMessageBox.confirm('确定要删除这条日志吗？', '删除确认', { type: 'warning' });
    ElMessage.success('删除成功');
    fetchLogs();
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败');
  }
};

const clearLogs = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有日志吗？此操作不可恢复！', '清空日志', {
      type: 'warning',
      confirmButtonText: '确定清空',
      cancelButtonText: '取消'
    });
    ElMessage.success('日志已清空');
    fetchLogs();
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('清空失败');
  }
};

const exportLogs = () => {
  ElMessage.info('导出功能开发中');
};

const toggleAutoRefresh = (val) => {
  if (val) {
    autoRefreshTimer = setInterval(fetchLogs, 30000);
    ElMessage.success('已开启自动刷新（每30秒）');
  } else {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer);
      autoRefreshTimer = null;
    }
    ElMessage.info('已关闭自动刷新');
  }
};

onMounted(() => fetchLogs());

onBeforeUnmount(() => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
  }
});
</script>

<style lang="scss" scoped>
.logs-page {
  .filter-card {
    margin-bottom: 16px;

    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;

      @media (min-width: 768px) {
        margin-top: 0;
      }
    }
  }

  .stats-row {
    margin-bottom: 16px;

    .stat-card {
      text-align: center;
      margin-bottom: 8px;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .log-text {
    :deep(.highlight) {
      background-color: #f56c6c;
      color: #fff;
      padding: 0 2px;
      border-radius: 2px;
    }
  }

  .log-detail {
    padding: 16px;

    p {
      margin: 8px 0;
    }

    .log-content {
      background: #f5f7fa;
      padding: 12px;
      border-radius: 4px;
      white-space: pre-wrap;
      word-break: break-all;
      font-family: monospace;
      max-height: 200px;
      overflow-y: auto;
    }
  }

  .log-detail-content {
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-all;
    font-family: monospace;
    max-height: 300px;
    overflow-y: auto;
  }

  .el-pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }

  :deep(.el-table) {
    .error-row {
      background-color: #fef0f0;
    }

    .warning-row {
      background-color: #fdf6ec;
    }
  }
}
</style>
