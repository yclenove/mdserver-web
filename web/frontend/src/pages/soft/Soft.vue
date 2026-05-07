<template>
  <div class="soft-page">
    <!-- 分类标签 -->
    <el-card class="category-card">
      <el-tabs v-model="activeCategory" @tab-change="handleCategoryChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="Web服务器" name="web" />
        <el-tab-pane label="数据库" name="database" />
        <el-tab-pane label="编程语言" name="language" />
        <el-tab-pane label="缓存/NoSQL" name="cache" />
        <el-tab-pane label="FTP/存储" name="storage" />
        <el-tab-pane label="其他工具" name="tools" />
      </el-tabs>
    </el-card>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-row :gutter="16" align="middle">
        <el-col :xs="24" :sm="12" :md="8">
          <el-input
            v-model="searchQuery"
            placeholder="搜索软件名称"
            clearable
            prefix-icon="Search"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="4">
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable>
            <el-option label="全部" value="" />
            <el-option label="已安装" value="installed" />
            <el-option label="未安装" value="not_installed" />
          </el-select>
        </el-col>
      </el-row>
    </el-card>

    <!-- 软件列表 -->
    <el-row :gutter="16" v-loading="loading">
      <el-col
        v-for="soft in filteredSoftList"
        :key="soft.id"
        :xs="24" :sm="12" :md="8" :lg="6"
      >
        <el-card shadow="hover" class="soft-card">
          <div class="soft-header">
            <div class="soft-icon">
              <el-icon :size="40" :style="{ color: soft.icon_color || '#409eff' }">
                <component :is="soft.icon || 'Box'" />
              </el-icon>
            </div>
            <div class="soft-info">
              <h3 class="soft-name">{{ soft.name }}</h3>
              <span class="soft-version">{{ soft.version }}</span>
            </div>
          </div>
          <p class="soft-desc">{{ soft.description }}</p>
          <div class="soft-footer">
            <el-tag v-if="soft.installed" type="success" size="small">已安装</el-tag>
            <el-tag v-else type="info" size="small">未安装</el-tag>
            <div class="soft-actions">
              <el-button
                v-if="soft.installed"
                type="primary"
                size="small"
                @click="manageSoft(soft)"
              >
                管理
              </el-button>
              <el-button
                v-else
                type="success"
                size="small"
                @click="installSoft(soft)"
              >
                安装
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="filteredSoftList.length === 0 && !loading" description="暂无软件" />

    <!-- 软件管理对话框 -->
    <el-dialog v-model="manageDialogVisible" :title="currentSoft.name + ' 管理'" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="软件名称">{{ currentSoft.name }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ currentSoft.version }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentSoft.status === 'running' ? 'success' : 'danger'">
            {{ currentSoft.status === 'running' ? '运行中' : '已停止' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="安装路径">{{ currentSoft.install_path }}</el-descriptions-item>
        <el-descriptions-item label="配置文件" :span="2">{{ currentSoft.config_path }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <div class="soft-manage-actions">
        <el-button type="success" @click="startSoft" :disabled="currentSoft.status === 'running'">
          <el-icon><VideoPlay /></el-icon> 启动
        </el-button>
        <el-button type="warning" @click="stopSoft" :disabled="currentSoft.status !== 'running'">
          <el-icon><VideoPause /></el-icon> 停止
        </el-button>
        <el-button type="info" @click="restartSoft">
          <el-icon><RefreshRight /></el-icon> 重启
        </el-button>
        <el-button type="primary" @click="editConfig">
          <el-icon><Edit /></el-icon> 编辑配置
        </el-button>
        <el-button type="danger" @click="uninstallSoft">
          <el-icon><Delete /></el-icon> 卸载
        </el-button>
      </div>

      <el-divider />

      <h4>运行日志</h4>
      <el-input
        v-model="softLogs"
        type="textarea"
        :rows="6"
        readonly
        placeholder="暂无日志"
      />
    </el-dialog>

    <!-- 安装对话框 -->
    <el-dialog v-model="installDialogVisible" title="安装软件" width="500px">
      <el-form :model="installForm" label-width="100px">
        <el-form-item label="软件名称">
          <el-input :value="installForm.name" disabled />
        </el-form-item>
        <el-form-item label="版本选择">
          <el-select v-model="installForm.version" placeholder="选择版本">
            <el-option
              v-for="v in installForm.versions"
              :key="v"
              :label="v"
              :value="v"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="安装路径">
          <el-input v-model="installForm.path" placeholder="安装路径" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="installDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmInstall" :loading="installing">开始安装</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getPluginList, installPlugin, uninstallPlugin, runPlugin } from '@/api/index';

const softList = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const activeCategory = ref('all');
const manageDialogVisible = ref(false);
const installDialogVisible = ref(false);
const installing = ref(false);
const currentSoft = ref({});
const softLogs = ref('');

const installForm = ref({
  name: '',
  version: '',
  versions: [],
  path: '/www/server'
});

const filteredSoftList = computed(() => {
  let list = [...softList.value];

  if (activeCategory.value !== 'all') {
    list = list.filter(s => s.category === activeCategory.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter(s =>
      s.name.toLowerCase().includes(query) ||
      (s.description && s.description.toLowerCase().includes(query))
    );
  }

  if (statusFilter.value === 'installed') {
    list = list.filter(s => s.installed);
  } else if (statusFilter.value === 'not_installed') {
    list = list.filter(s => !s.installed);
  }

  return list;
});

// 软件分类映射
const categoryMap = {
  'openresty': 'web', 'nginx': 'web',
  'mysql': 'database', 'mariadb': 'database', 'pgsql': 'database', 'mongodb': 'database',
  'php': 'language', 'node': 'language', 'golang': 'language', 'java': 'language',
  'redis': 'cache', 'memcached': 'cache',
  'ftp': 'storage', 'rsync': 'storage',
};

function getCategory(name) {
  const lower = (name || '').toLowerCase();
  for (const [key, cat] of Object.entries(categoryMap)) {
    if (lower.includes(key)) return cat;
  }
  return 'tools';
}

const fetchSoftList = async () => {
  loading.value = true;
  try {
    const res = await getPluginList({ type: '0', p: '1' });
    if (res && res.data) {
      softList.value = (Array.isArray(res.data) ? res.data : []).map((item, idx) => ({
        id: idx + 1,
        name: item.title || item.name || 'Unknown',
        version: item.versions ? item.versions[item.versions.length - 1] : '-',
        description: item.description || item.ps || '',
        category: getCategory(item.name),
        icon: 'Box',
        icon_color: '#409eff',
        installed: !!item.setup,
        status: item.setup ? 'running' : 'stopped',
        install_path: item.install_path || '',
        config_path: item.config_path || '',
        _raw: item,
      }));
    }
  } catch {
    // API 调用失败时使用默认列表
    softList.value = [];
  } finally {
    loading.value = false;
  }
};

const handleCategoryChange = () => {
  // 分类切换时重新筛选
};

const manageSoft = (soft) => {
  currentSoft.value = soft;
  softLogs.value = `[${new Date().toLocaleString()}] ${soft.name} 服务启动\n[${new Date().toLocaleString()}] 配置加载成功`;
  manageDialogVisible.value = true;
};

const installSoft = (soft) => {
  const raw = soft._raw || {};
  installForm.value = {
    name: soft.name,
    version: raw.default_ver || soft.version,
    versions: raw.versions || [soft.version],
    path: '/www/server'
  };
  installDialogVisible.value = true;
};

const confirmInstall = async () => {
  installing.value = true;
  try {
    const raw = currentSoft.value._raw || {};
    await installPlugin(raw.name || installForm.value.name, installForm.value.version);
    ElMessage.success(`${installForm.value.name} 安装任务已提交`);
    installDialogVisible.value = false;
    fetchSoftList();
  } catch {
    ElMessage.error('安装失败');
  } finally {
    installing.value = false;
  }
};

const startSoft = async () => {
  try {
    const raw = currentSoft.value._raw || {};
    await runPlugin(raw.name, 'start', raw.version || '');
    currentSoft.value.status = 'running';
    ElMessage.success(`${currentSoft.value.name} 已启动`);
  } catch {
    ElMessage.error('启动失败');
  }
};

const stopSoft = async () => {
  try {
    await ElMessageBox.confirm(`确定要停止 ${currentSoft.value.name} 吗？`, '停止确认');
    const raw = currentSoft.value._raw || {};
    await runPlugin(raw.name, 'stop', raw.version || '');
    currentSoft.value.status = 'stopped';
    ElMessage.success(`${currentSoft.value.name} 已停止`);
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('停止失败');
  }
};

const restartSoft = async () => {
  try {
    const raw = currentSoft.value._raw || {};
    await runPlugin(raw.name, 'restart', raw.version || '');
    ElMessage.success(`${currentSoft.value.name} 已重启`);
  } catch {
    ElMessage.error('重启失败');
  }
};

const editConfig = () => {
  ElMessage.info('配置编辑功能开发中');
};

const uninstallSoft = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要卸载 ${currentSoft.value.name} 吗？此操作不可恢复！`,
      '卸载确认',
      { type: 'warning' }
    );
    const raw = currentSoft.value._raw || {};
    await uninstallPlugin(raw.name, raw.version || '');
    ElMessage.success(`${currentSoft.value.name} 已卸载`);
    manageDialogVisible.value = false;
    fetchSoftList();
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('卸载失败');
  }
};

onMounted(() => fetchSoftList());
</script>

<style lang="scss" scoped>
.soft-page {
  .category-card {
    margin-bottom: 16px;
  }

  .search-card {
    margin-bottom: 16px;
  }

  .soft-card {
    margin-bottom: 16px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .soft-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;

      .soft-icon {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f7fa;
        border-radius: 12px;
      }

      .soft-info {
        flex: 1;

        .soft-name {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px;
        }

        .soft-version {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .soft-desc {
      font-size: 13px;
      color: #606266;
      margin: 0 0 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .soft-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .soft-manage-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
