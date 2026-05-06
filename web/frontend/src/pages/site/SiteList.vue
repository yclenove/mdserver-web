<template>
  <div class="site-list">
    <!-- 搜索和过滤栏 -->
    <el-card class="filter-card">
      <el-row :gutter="16" align="middle">
        <el-col :xs="24" :sm="8" :md="6">
          <el-input
            v-model="searchQuery"
            placeholder="搜索网站名称或备注"
            clearable
            prefix-icon="Search"
            @input="handleSearch"
          />
        </el-col>
        <el-col :xs="24" :sm="8" :md="4">
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="运行中" :value="1" />
            <el-option label="已停止" :value="0" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="8" :md="4">
          <el-select v-model="typeFilter" placeholder="类型筛选" clearable @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="PHP" value="0" />
            <el-option label="Node.js" value="1" />
            <el-option label="Java" value="2" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="24" :md="10" class="action-buttons">
          <el-button type="primary" icon="Plus" @click="showAddSite">添加站点</el-button>
          <el-button icon="Refresh" @click="fetchSites">刷新</el-button>
          <el-button icon="Download" @click="exportSites">导出</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="总站点数" :value="stats.total">
            <template #prefix><el-icon style="color: #409eff"><ChromeFilled /></el-icon></template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="运行中" :value="stats.running">
            <template #prefix><el-icon style="color: #67c23a"><CircleCheckFilled /></el-icon></template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="已停止" :value="stats.stopped">
            <template #prefix><el-icon style="color: #f56c6c"><CircleCloseFilled /></el-icon></template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="SSL 证书" :value="stats.ssl">
            <template #prefix><el-icon style="color: #e6a23c"><Lock /></el-icon></template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 网站列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>网站列表</span>
          <div class="header-actions">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button label="table">表格</el-radio-button>
              <el-radio-button label="card">卡片</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <!-- 表格视图 -->
      <el-table
        v-if="viewMode === 'table'"
        :data="filteredSiteList"
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="网站名称" min-width="180" sortable="custom" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="site-name">
              <el-icon class="site-icon"><ChromeFilled /></el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="根目录" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type_id" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type_id)" size="small">
              {{ getTypeName(row.type_id) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" sortable="custom">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="dark">
              {{ row.status === 1 ? '运行中' : '已停止' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="SSL" width="80" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.ssl" style="color: #67c23a"><Lock /></el-icon>
            <el-icon v-else style="color: #c0c4cc"><Unlock /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="edate" label="到期时间" width="120">
          <template #default="{ row }">
            <span :class="{ 'text-danger': isExpired(row.edate) }">
              {{ row.edate === '0000-00-00' ? '永久' : row.edate }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="160" sortable="custom" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editSite(row)">设置</el-button>
            <el-button :type="row.status === 1 ? 'warning' : 'success'" link @click="toggleSite(row)">
              {{ row.status === 1 ? '停止' : '启动' }}
            </el-button>
            <el-dropdown @command="(cmd) => handleCommand(cmd, row)">
              <el-button type="primary" link>更多</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="ssl">SSL 证书</el-dropdown-item>
                  <el-dropdown-item command="domain">域名管理</el-dropdown-item>
                  <el-dropdown-item command="backup">备份</el-dropdown-item>
                  <el-dropdown-item command="log">日志</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 卡片视图 -->
      <el-row v-else :gutter="16" v-loading="loading">
        <el-col v-for="site in filteredSiteList" :key="site.id" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card shadow="hover" class="site-card" @click="editSite(site)">
            <div class="site-card-header">
              <el-icon :size="32" :style="{ color: site.status === 1 ? '#67c23a' : '#f56c6c' }">
                <ChromeFilled />
              </el-icon>
              <el-tag :type="site.status === 1 ? 'success' : 'danger'" size="small">
                {{ site.status === 1 ? '运行中' : '已停止' }}
              </el-tag>
            </div>
            <h3 class="site-card-name">{{ site.name }}</h3>
            <p class="site-card-path">{{ site.path }}</p>
            <div class="site-card-footer">
              <span class="site-card-type">{{ getTypeName(site.type_id) }}</span>
              <span class="site-card-date">{{ site.add_time }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 批量操作栏 -->
    <transition name="el-zoom-in-bottom">
      <div v-if="selectedSites.length > 0" class="batch-actions">
        <el-card>
          <div class="batch-content">
            <span class="batch-info">已选择 {{ selectedSites.length }} 个站点</span>
            <el-button type="success" @click="batchStart">批量启动</el-button>
            <el-button type="warning" @click="batchStop">批量停止</el-button>
            <el-button type="danger" @click="batchDelete">批量删除</el-button>
            <el-button @click="clearSelection">取消选择</el-button>
          </div>
        </el-card>
      </div>
    </transition>

    <!-- 添加站点对话框 -->
    <el-dialog v-model="addSiteVisible" title="添加站点" width="600px">
      <el-form :model="addSiteForm" :rules="addSiteRules" ref="addSiteFormRef" label-width="100px">
        <el-form-item label="网站名称" prop="name">
          <el-input v-model="addSiteForm.name" placeholder="请输入网站域名" />
        </el-form-item>
        <el-form-item label="根目录" prop="path">
          <el-input v-model="addSiteForm.path" placeholder="请输入网站根目录">
            <template #append>
              <el-button @click="browsePath">浏览</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="网站备注" prop="ps">
          <el-input v-model="addSiteForm.ps" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="PHP版本" prop="php_version">
          <el-select v-model="addSiteForm.php_version" placeholder="选择PHP版本">
            <el-option label="PHP-7.4" value="74" />
            <el-option label="PHP-8.0" value="80" />
            <el-option label="PHP-8.1" value="81" />
            <el-option label="PHP-8.2" value="82" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addSiteVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddSite" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const siteList = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const typeFilter = ref('');
const viewMode = ref('table');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const selectedSites = ref([]);
const sortProp = ref('');
const sortOrder = ref('');
const addSiteVisible = ref(false);
const submitting = ref(false);
const addSiteFormRef = ref(null);

const addSiteForm = ref({
  name: '',
  path: '',
  ps: '',
  php_version: '74'
});

const addSiteRules = {
  name: [
    { required: true, message: '请输入网站名称', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9\-\.]+$/, message: '网站名称格式不正确', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入根目录', trigger: 'blur' }
  ]
};

const stats = computed(() => {
  const total = siteList.value.length;
  const running = siteList.value.filter(s => s.status === 1).length;
  const stopped = total - running;
  const ssl = siteList.value.filter(s => s.ssl).length;
  return { total, running, stopped, ssl };
});

const filteredSiteList = computed(() => {
  let list = [...siteList.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter(s =>
      s.name.toLowerCase().includes(query) ||
      (s.ps && s.ps.toLowerCase().includes(query))
    );
  }

  if (statusFilter.value !== '') {
    list = list.filter(s => s.status === statusFilter.value);
  }

  if (typeFilter.value !== '') {
    list = list.filter(s => String(s.type_id) === typeFilter.value);
  }

  return list;
});

const fetchSites = async () => {
  loading.value = true;
  try {
    // 模拟数据 - 实际应调用 API
    siteList.value = [];
    total.value = 0;
  } catch (error) {
    ElMessage.error('获取网站列表失败');
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

const handleSortChange = ({ prop, order }) => {
  sortProp.value = prop;
  sortOrder.value = order === 'ascending' ? 'asc' : 'desc';
};

const handleSelectionChange = (selection) => {
  selectedSites.value = selection;
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  fetchSites();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchSites();
};

const getTypeName = (typeId) => {
  const types = { 0: 'PHP', 1: 'Node.js', 2: 'Java' };
  return types[typeId] || '未知';
};

const getTypeTag = (typeId) => {
  const types = { 0: '', 1: 'success', 2: 'warning' };
  return types[typeId] || 'info';
};

const isExpired = (edate) => {
  if (edate === '0000-00-00') return false;
  return new Date(edate) < new Date();
};

const showAddSite = () => {
  addSiteForm.value = { name: '', path: '', ps: '', php_version: '74' };
  addSiteVisible.value = true;
};

const browsePath = () => {
  ElMessage.info('文件浏览功能开发中');
};

const submitAddSite = async () => {
  submitting.value = true;
  try {
    ElMessage.success('站点添加成功');
    addSiteVisible.value = false;
    fetchSites();
  } catch (error) {
    ElMessage.error('添加失败');
  } finally {
    submitting.value = false;
  }
};

const editSite = (site) => {
  ElMessage.info(`编辑站点: ${site.name}`);
};

const toggleSite = async (site) => {
  const action = site.status === 1 ? '停止' : '启动';
  try {
    await ElMessageBox.confirm(`确定要${action} ${site.name} 吗？`, '确认');
    ElMessage.success(`${action}成功`);
    fetchSites();
  } catch (error) {
    if (error !== 'cancel') ElMessage.error(`${action}失败`);
  }
};

const handleCommand = (cmd, site) => {
  switch (cmd) {
    case 'ssl':
      ElMessage.info(`SSL管理: ${site.name}`);
      break;
    case 'domain':
      ElMessage.info(`域名管理: ${site.name}`);
      break;
    case 'backup':
      ElMessage.info(`备份: ${site.name}`);
      break;
    case 'log':
      ElMessage.info(`查看日志: ${site.name}`);
      break;
    case 'delete':
      deleteSite(site);
      break;
  }
};

const deleteSite = async (site) => {
  try {
    await ElMessageBox.confirm(`确定要删除 ${site.name} 吗？此操作不可恢复！`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消'
    });
    ElMessage.success('删除成功');
    fetchSites();
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败');
  }
};

const exportSites = () => {
  ElMessage.info('导出功能开发中');
};

const clearSelection = () => {
  selectedSites.value = [];
};

const batchStart = async () => {
  try {
    await ElMessageBox.confirm(`确定要启动选中的 ${selectedSites.value.length} 个站点吗？`, '批量启动');
    ElMessage.success('批量启动成功');
    clearSelection();
    fetchSites();
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('批量启动失败');
  }
};

const batchStop = async () => {
  try {
    await ElMessageBox.confirm(`确定要停止选中的 ${selectedSites.value.length} 个站点吗？`, '批量停止');
    ElMessage.success('批量停止成功');
    clearSelection();
    fetchSites();
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('批量停止失败');
  }
};

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedSites.value.length} 个站点吗？此操作不可恢复！`,
      '批量删除',
      { type: 'warning' }
    );
    ElMessage.success('批量删除成功');
    clearSelection();
    fetchSites();
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('批量删除失败');
  }
};

onMounted(() => fetchSites());
</script>

<style lang="scss" scoped>
.site-list {
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
  }

  .site-name {
    display: flex;
    align-items: center;
    gap: 8px;

    .site-icon {
      color: #409eff;
    }
  }

  .site-card {
    margin-bottom: 16px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .site-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .site-card-name {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .site-card-path {
      font-size: 12px;
      color: #909399;
      margin: 0 0 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .site-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #909399;
    }
  }

  .batch-actions {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    width: 90%;
    max-width: 600px;

    .batch-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;

      .batch-info {
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .text-danger {
    color: #f56c6c;
  }

  .el-pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
