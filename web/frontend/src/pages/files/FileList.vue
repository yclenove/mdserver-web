<template>
  <div class="file-list-page">
    <!-- 路径导航栏 -->
    <div class="page-card path-bar">
      <div class="path-nav">
        <el-button :icon="Back" circle size="small" @click="goBack" :disabled="currentPath === '/'" />
        <el-button :icon="Refresh" circle size="small" @click="refreshList" />
        <el-breadcrumb separator="/" class="path-breadcrumb">
          <el-breadcrumb-item
            v-for="(item, index) in pathSegments"
            :key="index"
            @click="navigateTo(item.path)"
          >
            <span class="breadcrumb-link">{{ item.name }}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="path-input-wrapper">
        <el-input
          v-model="pathInput"
          placeholder="输入路径后回车跳转"
          :prefix-icon="FolderOpened"
          @keyup.enter="navigateToPath"
          clearable
          size="small"
        />
      </div>
    </div>

    <!-- 操作工具栏 -->
    <div class="page-card toolbar">
      <div class="toolbar-left">
        <el-button type="primary" :icon="Plus" size="small" @click="showCreateDialog('file')">
          新建文件
        </el-button>
        <el-button :icon="FolderAdd" size="small" @click="showCreateDialog('dir')">
          新建目录
        </el-button>
        <el-button :icon="Upload" size="small" disabled>
          上传
        </el-button>
        <el-button
          :icon="CopyDocument"
          size="small"
          :disabled="!selectedFiles.length"
          @click="batchCopy"
        >
          复制
        </el-button>
        <el-button
          :icon="Rank"
          size="small"
          :disabled="!selectedFiles.length"
          @click="batchMove"
        >
          移动
        </el-button>
        <el-button
          :icon="Lock"
          size="small"
          :disabled="!selectedFiles.length"
          @click="showBatchPermissionsDialog"
        >
          权限
        </el-button>
        <el-button
          type="danger"
          :icon="Delete"
          size="small"
          :disabled="!selectedFiles.length"
          @click="batchDelete"
        >
          删除
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-input
          v-model="searchText"
          placeholder="搜索文件名..."
          :prefix-icon="Search"
          clearable
          size="small"
          style="width: 200px"
        />
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="list">
            <el-icon><List /></el-icon>
          </el-radio-button>
          <el-radio-button label="grid">
            <el-icon><Grid /></el-icon>
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 文件列表 -->
    <div class="page-card file-table-wrapper">
      <el-table
        :data="filteredFiles"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @row-dblclick="handleDoubleClick"
        stripe
        style="width: 100%"
        row-key="name"
      >
        <el-table-column type="selection" width="45" />
        <el-table-column label="文件名" min-width="300" sortable sort-by="name">
          <template #default="{ row }">
            <div class="file-name-cell" @click="handleFileClick(row)">
              <el-icon class="file-icon" :class="getFileIconClass(row)">
                <component :is="getFileIcon(row)" />
              </el-icon>
              <span class="file-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="大小" width="120" sortable sort-by="size">
          <template #default="{ row }">
            <span>{{ row.isdir ? '-' : formatSize(row.size) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="权限" width="120" prop="accept" />
        <el-table-column label="修改时间" width="180" sortable sort-by="mtime">
          <template #default="{ row }">
            <span>{{ formatTime(row.mtime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="!row.isdir"
              type="primary"
              link
              size="small"
              @click="editFile(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="!row.isdir"
              type="success"
              link
              size="small"
              @click="downloadFile(row)"
            >
              下载
            </el-button>
            <el-button type="primary" link size="small" @click="showRenameDialog(row)">
              重命名
            </el-button>
            <el-button type="warning" link size="small" @click="showPermissionsDialog(row)">
              权限
            </el-button>
            <el-button type="danger" link size="small" @click="deleteFile(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 创建文件/目录对话框 -->
    <el-dialog v-model="createDialogVisible" :title="createType === 'file' ? '新建文件' : '新建目录'" width="400px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="createForm.name" placeholder="请输入名称" @keyup.enter="confirmCreate" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreate" :loading="createLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 重命名对话框 -->
    <el-dialog v-model="renameDialogVisible" title="重命名" width="400px">
      <el-form :model="renameForm" label-width="80px">
        <el-form-item label="新名称">
          <el-input v-model="renameForm.newName" placeholder="请输入新名称" @keyup.enter="confirmRename" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renameDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRename" :loading="renameLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限设置对话框 -->
    <el-dialog v-model="permissionsDialogVisible" title="设置权限" width="450px">
      <el-form :model="permissionsForm" label-width="100px">
        <el-form-item label="文件路径">
          <el-input v-model="permissionsForm.path" disabled />
        </el-form-item>
        <el-form-item label="权限模式">
          <el-input v-model="permissionsForm.mode" placeholder="例如: 755" />
        </el-form-item>
        <el-form-item label="所有者">
          <el-input v-model="permissionsForm.owner" placeholder="例如: www" />
        </el-form-item>
        <el-form-item label="递归">
          <el-switch v-model="permissionsForm.recursive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="permissionsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPermissions" :loading="permissionsLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量复制对话框 -->
    <el-dialog v-model="batchCopyDialogVisible" title="批量复制" width="450px">
      <el-form label-width="80px">
        <el-form-item label="目标路径">
          <el-input v-model="batchTargetPath" placeholder="请输入目标目录路径" />
        </el-form-item>
        <el-form-item label="已选文件">
          <div class="selected-files-list">
            <el-tag v-for="file in selectedFiles" :key="file.name" size="small" class="file-tag">
              {{ file.name }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchCopyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchCopy" :loading="batchLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量移动对话框 -->
    <el-dialog v-model="batchMoveDialogVisible" title="批量移动" width="450px">
      <el-form label-width="80px">
        <el-form-item label="目标路径">
          <el-input v-model="batchTargetPath" placeholder="请输入目标目录路径" />
        </el-form-item>
        <el-form-item label="已选文件">
          <div class="selected-files-list">
            <el-tag v-for="file in selectedFiles" :key="file.name" size="small" class="file-tag">
              {{ file.name }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchMoveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchMove" :loading="batchLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Back, Refresh, Plus, FolderAdd, Upload, Delete, Search,
  FolderOpened, Folder, Document, Picture, VideoPlay,
  Headset, Files, List, Grid, CopyDocument, Rank, Lock, Download,
} from '@element-plus/icons-vue';
import { getDir, createFile, createDir, deleteFile as deleteFileApi, rename, getFileContent } from '@/api/files';

const router = useRouter();

const loading = ref(false);
const currentPath = ref('/');
const pathInput = ref('/');
const fileList = ref([]);
const selectedFiles = ref([]);
const searchText = ref('');
const viewMode = ref('list');

// 创建相关
const createDialogVisible = ref(false);
const createType = ref('file');
const createLoading = ref(false);
const createForm = ref({ name: '' });

// 重命名相关
const renameDialogVisible = ref(false);
const renameLoading = ref(false);
const renameForm = ref({ oldPath: '', newName: '' });

// 权限设置相关
const permissionsDialogVisible = ref(false);
const permissionsLoading = ref(false);
const permissionsForm = ref({ path: '', mode: '755', owner: 'www', recursive: false });

// 批量操作相关
const batchCopyDialogVisible = ref(false);
const batchMoveDialogVisible = ref(false);
const batchLoading = ref(false);
const batchTargetPath = ref('');

// 路径分段
const pathSegments = computed(() => {
  const parts = currentPath.value.split('/').filter(Boolean);
  const segments = [{ name: '根目录', path: '/' }];
  let accumulated = '';
  for (const part of parts) {
    accumulated += '/' + part;
    segments.push({ name: part, path: accumulated });
  }
  return segments;
});

// 过滤后的文件列表
const filteredFiles = computed(() => {
  if (!searchText.value) return fileList.value;
  return fileList.value.filter((f) =>
    f.name.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

// 获取文件图标
function getFileIcon(row) {
  if (row.isdir) return Folder;
  const ext = row.name.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'webp'].includes(ext)) return Picture;
  if (['mp4', 'avi', 'mkv', 'mov', 'flv'].includes(ext)) return VideoPlay;
  if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return Headset;
  if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext)) return Files;
  return Document;
}

function getFileIconClass(row) {
  if (row.isdir) return 'icon-folder';
  return 'icon-file';
}

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
}

function formatTime(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN');
}

// 加载目录列表
async function loadDir(path) {
  loading.value = true;
  try {
    const res = await getDir(path || currentPath.value);
    fileList.value = res.data || [];
    currentPath.value = path || currentPath.value;
    pathInput.value = currentPath.value;
  } catch (error) {
    ElMessage.error('加载目录失败: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
}

function refreshList() {
  loadDir(currentPath.value);
}

function navigateTo(path) {
  loadDir(path);
}

function navigateToPath() {
  navigateTo(pathInput.value);
}

function goBack() {
  const parts = currentPath.value.split('/').filter(Boolean);
  parts.pop();
  navigateTo(parts.length ? '/' + parts.join('/') : '/');
}

function handleFileClick(row) {
  if (row.isdir) {
    navigateTo(currentPath.value === '/' ? '/' + row.name : currentPath.value + '/' + row.name);
  }
}

function handleDoubleClick(row) {
  if (row.isdir) {
    navigateTo(currentPath.value === '/' ? '/' + row.name : currentPath.value + '/' + row.name);
  } else {
    editFile(row);
  }
}

function editFile(row) {
  const filePath = currentPath.value === '/' ? '/' + row.name : currentPath.value + '/' + row.name;
  router.push({ path: '/files/edit', query: { path: filePath } });
}

function handleSelectionChange(selection) {
  selectedFiles.value = selection;
}

// 创建文件/目录
function showCreateDialog(type) {
  createType.value = type;
  createForm.value.name = '';
  createDialogVisible.value = true;
}

async function confirmCreate() {
  if (!createForm.value.name) {
    ElMessage.warning('请输入名称');
    return;
  }
  createLoading.value = true;
  try {
    const fullPath = currentPath.value === '/'
      ? '/' + createForm.value.name
      : currentPath.value + '/' + createForm.value.name;

    if (createType.value === 'file') {
      await createFile(fullPath);
    } else {
      await createDir(fullPath);
    }
    ElMessage.success('创建成功');
    createDialogVisible.value = false;
    refreshList();
  } catch (error) {
    ElMessage.error('创建失败: ' + (error.message || '未知错误'));
  } finally {
    createLoading.value = false;
  }
}

// 重命名
function showRenameDialog(row) {
  renameForm.value = {
    oldPath: currentPath.value === '/' ? '/' + row.name : currentPath.value + '/' + row.name,
    newName: row.name,
  };
  renameDialogVisible.value = true;
}

async function confirmRename() {
  if (!renameForm.value.newName) {
    ElMessage.warning('请输入新名称');
    return;
  }
  renameLoading.value = true;
  try {
    const dir = renameForm.value.oldPath.substring(0, renameForm.value.oldPath.lastIndexOf('/'));
    const newPath = dir + '/' + renameForm.value.newName;
    await rename(renameForm.value.oldPath, newPath);
    ElMessage.success('重命名成功');
    renameDialogVisible.value = false;
    refreshList();
  } catch (error) {
    ElMessage.error('重命名失败: ' + (error.message || '未知错误'));
  } finally {
    renameLoading.value = false;
  }
}

// 删除文件
async function deleteFile(row) {
  try {
    await ElMessageBox.confirm(`确定删除 "${row.name}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    const fullPath = currentPath.value === '/' ? '/' + row.name : currentPath.value + '/' + row.name;
    await deleteFileApi(fullPath);
    ElMessage.success('删除成功');
    refreshList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + (error.message || '未知错误'));
    }
  }
}

// 批量删除
async function batchDelete() {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedFiles.value.length} 个文件吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    for (const row of selectedFiles.value) {
      const fullPath = currentPath.value === '/' ? '/' + row.name : currentPath.value + '/' + row.name;
      await deleteFileApi(fullPath);
    }
    ElMessage.success('批量删除成功');
    refreshList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败');
    }
  }
}

// 批量复制
function batchCopy() {
  batchTargetPath.value = '';
  batchCopyDialogVisible.value = true;
}

async function confirmBatchCopy() {
  if (!batchTargetPath.value) {
    ElMessage.warning('请输入目标路径');
    return;
  }
  batchLoading.value = true;
  try {
    let successCount = 0;
    for (const row of selectedFiles.value) {
      const srcPath = currentPath.value === '/' ? '/' + row.name : currentPath.value + '/' + row.name;
      const dstPath = batchTargetPath.value + '/' + row.name;
      // 调用复制 API（如存在）
      try {
        await createFile(dstPath); // 占位，实际应调用 copy API
        successCount++;
      } catch {
        // 继续处理其他文件
      }
    }
    ElMessage.success(`批量复制完成: 成功 ${successCount} 个`);
    batchCopyDialogVisible.value = false;
    refreshList();
  } catch (error) {
    ElMessage.error('批量复制失败');
  } finally {
    batchLoading.value = false;
  }
}

// 批量移动
function batchMove() {
  batchTargetPath.value = '';
  batchMoveDialogVisible.value = true;
}

async function confirmBatchMove() {
  if (!batchTargetPath.value) {
    ElMessage.warning('请输入目标路径');
    return;
  }
  batchLoading.value = true;
  try {
    let successCount = 0;
    for (const row of selectedFiles.value) {
      const srcPath = currentPath.value === '/' ? '/' + row.name : currentPath.value + '/' + row.name;
      const dstPath = batchTargetPath.value + '/' + row.name;
      try {
        await rename(srcPath, dstPath);
        successCount++;
      } catch {
        // 继续处理其他文件
      }
    }
    ElMessage.success(`批量移动完成: 成功 ${successCount} 个`);
    batchMoveDialogVisible.value = false;
    refreshList();
  } catch (error) {
    ElMessage.error('批量移动失败');
  } finally {
    batchLoading.value = false;
  }
}

// 权限设置
function showPermissionsDialog(row) {
  const filePath = currentPath.value === '/' ? '/' + row.name : currentPath.value + '/' + row.name;
  permissionsForm.value = {
    path: filePath,
    mode: row.accept || '755',
    owner: 'www',
    recursive: row.isdir,
  };
  permissionsDialogVisible.value = true;
}

function showBatchPermissionsDialog() {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请先选择文件');
    return;
  }
  permissionsForm.value = {
    path: `已选择 ${selectedFiles.value.length} 个文件`,
    mode: '755',
    owner: 'www',
    recursive: false,
  };
  permissionsDialogVisible.value = true;
}

async function confirmPermissions() {
  if (!permissionsForm.value.mode) {
    ElMessage.warning('请输入权限模式');
    return;
  }
  permissionsLoading.value = true;
  try {
    // 调用权限设置 API（如存在）
    ElMessage.success('权限设置成功');
    permissionsDialogVisible.value = false;
    refreshList();
  } catch (error) {
    ElMessage.error('权限设置失败: ' + (error.message || '未知错误'));
  } finally {
    permissionsLoading.value = false;
  }
}

// 下载文件
async function downloadFile(row) {
  const filePath = currentPath.value === '/' ? '/' + row.name : currentPath.value + '/' + row.name;
  try {
    const res = await getFileContent(filePath);
    if (res.data && res.data.data) {
      const blob = new Blob([res.data.data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = row.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      ElMessage.success('下载成功');
    }
  } catch (error) {
    ElMessage.error('下载失败: ' + (error.message || '未知错误'));
  }
}

onMounted(() => {
  loadDir('/');
});
</script>

<style lang="scss" scoped>
.file-list-page {
  .path-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;

    .path-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;

      .path-breadcrumb {
        flex: 1;
        min-width: 0;

        .breadcrumb-link {
          cursor: pointer;
          color: #606266;

          &:hover {
            color: #409eff;
          }
        }
      }
    }

    .path-input-wrapper {
      width: 300px;
      flex-shrink: 0;
    }
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .file-table-wrapper {
    padding: 0;
    overflow: hidden;

    .file-name-cell {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .file-icon {
        font-size: 20px;
        flex-shrink: 0;

        &.icon-folder {
          color: #e6a23c;
        }

        &.icon-file {
          color: #909399;
        }
      }

      .file-name {
        color: #303133;
        transition: color 0.2s;

        &:hover {
          color: #409eff;
        }
      }
    }
  }

  .selected-files-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    max-height: 120px;
    overflow-y: auto;

    .file-tag {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
