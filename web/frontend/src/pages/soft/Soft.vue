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

const fetchSoftList = async () => {
  loading.value = true;
  try {
    // 模拟软件列表数据
    softList.value = [
      {
        id: 1,
        name: 'Nginx',
        version: '1.24.0',
        description: '高性能HTTP和反向代理服务器',
        category: 'web',
        icon: 'Connection',
        icon_color: '#67c23a',
        installed: true,
        status: 'running',
        install_path: '/www/server/nginx',
        config_path: '/www/server/nginx/conf/nginx.conf'
      },
      {
        id: 2,
        name: 'MySQL',
        version: '8.0.35',
        description: '流行的关系型数据库管理系统',
        category: 'database',
        icon: 'Coin',
        icon_color: '#409eff',
        installed: true,
        status: 'running',
        install_path: '/www/server/mysql',
        config_path: '/etc/my.cnf'
      },
      {
        id: 3,
        name: 'PHP',
        version: '8.2.13',
        description: '广泛使用的开源脚本语言',
        category: 'language',
        icon: 'Document',
        icon_color: '#9b59b6',
        installed: true,
        status: 'running',
        install_path: '/www/server/php/82',
        config_path: '/www/server/php/82/etc/php.ini'
      },
      {
        id: 4,
        name: 'Redis',
        version: '7.2.3',
        description: '开源的内存数据结构存储',
        category: 'cache',
        icon: 'Coin',
        icon_color: '#e74c3c',
        installed: true,
        status: 'running',
        install_path: '/www/server/redis',
        config_path: '/www/server/redis/redis.conf'
      },
      {
        id: 5,
        name: 'Node.js',
        version: '20.10.0',
        description: 'JavaScript运行时环境',
        category: 'language',
        icon: 'Connection',
        icon_color: '#27ae60',
        installed: false
      },
      {
        id: 6,
        name: 'PostgreSQL',
        version: '16.1',
        description: '功能强大的开源关系型数据库',
        category: 'database',
        icon: 'Coin',
        icon_color: '#336791',
        installed: false
      },
      {
        id: 7,
        name: 'MongoDB',
        version: '7.0.4',
        description: 'NoSQL文档数据库',
        category: 'database',
        icon: 'Box',
        icon_color: '#47a248',
        installed: false
      },
      {
        id: 8,
        name: 'Memcached',
        version: '1.6.22',
        description: '高性能分布式内存对象缓存系统',
        category: 'cache',
        icon: 'Coin',
        icon_color: '#f39c12',
        installed: false
      }
    ];
  } catch (error) {
    ElMessage.error('获取软件列表失败');
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
  installForm.value = {
    name: soft.name,
    version: soft.version,
    versions: [soft.version, 'latest'],
    path: '/www/server'
  };
  installDialogVisible.value = true;
};

const confirmInstall = async () => {
  installing.value = true;
  try {
    ElMessage.success(`${installForm.value.name} 安装任务已提交`);
    installDialogVisible.value = false;
    fetchSoftList();
  } catch (error) {
    ElMessage.error('安装失败');
  } finally {
    installing.value = false;
  }
};

const startSoft = () => {
  currentSoft.value.status = 'running';
  ElMessage.success(`${currentSoft.value.name} 已启动`);
};

const stopSoft = async () => {
  try {
    await ElMessageBox.confirm(`确定要停止 ${currentSoft.value.name} 吗？`, '停止确认');
    currentSoft.value.status = 'stopped';
    ElMessage.success(`${currentSoft.value.name} 已停止`);
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('停止失败');
  }
};

const restartSoft = () => {
  ElMessage.success(`${currentSoft.value.name} 已重启`);
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
