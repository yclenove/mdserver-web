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
        <el-button :icon="Download" size="small" @click="showRemoteDownloadDialog">
          远程下载
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
          :disabled="selectedFiles.length < 1"
          size="small"
          @click="showZipDialog"
        >
          压缩
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
        <el-checkbox v-model="showHidden" @change="refreshList" size="small">显示隐藏文件</el-checkbox>
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
        <el-table-column label="操作" width="310" fixed="right">
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
              @click="downloadFileLocal(row)"
            >
              下载
            </el-button>
            <el-button
              v-if="isArchiveFile(row.name)"
              type="warning"
              link
              size="small"
              @click="showUnzipDialog(row)"
            >
              解压
            </el-button>
            <el-button type="primary" link size="small" @click="showRenameDialog(row)">
              重命名
            </el-button>
            <el-button type="info" link size="small" @click="showDirSize(row)" v-if="row.isdir">
              大小
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

    <!-- 压缩对话框 -->
    <el-dialog v-model="zipDialogVisible" title="压缩文件" width="500px">
      <el-form :model="zipForm" label-width="100px">
        <el-form-item label="待压缩文件">
          <div class="selected-files-list">
            <el-tag v-for="file in selectedFiles" :key="file.name" size="small" class="file-tag">
              {{ file.name }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="压缩格式">
          <el-select v-model="zipForm.type">
            <el-option label=".tar.gz" value="tar_gz" />
            <el-option label=".zip" value="zip" />
            <el-option label=".tar.bz2" value="tar_bz2" />
          </el-select>
        </el-form-item>
        <el-form-item label="压缩文件名">
          <el-input v-model="zipForm.dfile" placeholder="例如: backup.tar.gz" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="zipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmZip" :loading="zipLoading">开始压缩</el-button>
      </template>
    </el-dialog>

    <!-- 解压对话框 -->
    <el-dialog v-model="unzipDialogVisible" title="解压文件" width="450px">
      <el-form :model="unzipForm" label-width="100px">
        <el-form-item label="压缩文件">
          <el-input :value="unzipForm.sfile" disabled />
        </el-form-item>
        <el-form-item label="解压到">
          <el-input v-model="unzipForm.dfile" placeholder="解压目标路径" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="unzipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUnzip" :loading="zipLoading">开始解压</el-button>
      </template>
    </el-dialog>

    <!-- 远程下载对话框 -->
    <el-dialog v-model="remoteDownloadVisible" title="远程下载" width="500px">
      <el-form :model="remoteDownloadForm" label-width="100px">
        <el-form-item label="下载地址">
          <el-input v-model="remoteDownloadForm.url" placeholder="请输入文件URL" />
        </el-form-item>
        <el-form-item label="保存路径">
          <el-input v-model="remoteDownloadForm.path" placeholder="保存到目录" />
        </el-form-item>
        <el-form-item label="文件名">
          <el-input v-model="remoteDownloadForm.filename" placeholder="保存文件名（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="remoteDownloadVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRemoteDownload" :loading="remoteDownloadLoading">开始下载</el-button>
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
import { getDir, createFile, createDir, deleteFile as deleteFileApi, rename, copyFile, getFileContent, getFileAccess, setFileAccess, zipFile, unzipFile, downloadFile as remoteDownload, getDirSize, getLastBody } from '@/api/files';

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

// 隐藏文件
const showHidden = ref(false);

// 压缩相关
const zipDialogVisible = ref(false);
const zipLoading = ref(false);
const zipForm = ref({ type: 'tar_gz', dfile: '' });

// 解压相关
const unzipDialogVisible = ref(false);
const unzipForm = ref({ sfile: '', dfile: '', type: '' });

// 远程下载相关
const remoteDownloadVisible = ref(false);
const remoteDownloadLoading = ref(false);
const remoteDownloadForm = ref({ url: '', path: '', filename: '' });

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

// 解析文件条目 "name;size;mtime;mode;owner;" 或 "name;size;mtime;mode;owner; -> link"
function parseFileEntry(entry, isdir) {
  const parts = entry.split(';');
  const name = parts[0] || '';
  const size = parseInt(parts[1]) || 0;
  const mtime = parseInt(parts[2]) || 0;
  const mode = parts[3] || '';
  const owner = parts[4] || '';
  // 检查是否有符号链接
  const linkTarget = entry.includes(' -> ') ? entry.split(' -> ')[1].trim() : '';
  return { name, size, mtime, mode, owner, isdir, link: linkTarget };
}

// 加载目录列表
async function loadDir(path) {
  loading.value = true;
  try {
    const res = await getDir(path || currentPath.value, showHidden.value);
    if (res && res.dir) {
      // 解析目录和文件列表
      const dirs = (res.dir || []).map(e => parseFileEntry(e, true));
      const files = (res.files || []).map(e => parseFileEntry(e, false));
      fileList.value = [...dirs, ...files];
    } else {
      fileList.value = res.data || [];
    }
    currentPath.value = path || res.path || currentPath.value;
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
      try {
        await copyFile(srcPath, dstPath);
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
async function showPermissionsDialog(row) {
  const filePath = currentPath.value === '/' ? '/' + row.name : currentPath.value + '/' + row.name;
  permissionsForm.value = {
    path: filePath,
    mode: row.accept || '755',
    owner: row.owner || 'www',
    recursive: row.isdir,
    isBatch: false,
  };
  permissionsDialogVisible.value = true;
  // 获取当前权限
  try {
    const res = await getFileAccess(filePath);
    if (res && res.data) {
      permissionsForm.value.mode = res.data.access || permissionsForm.value.mode;
      permissionsForm.value.owner = res.data.user || permissionsForm.value.owner;
    }
  } catch {
    // 使用默认值
  }
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
    isBatch: true,
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
    if (permissionsForm.value.isBatch) {
      let successCount = 0;
      for (const row of selectedFiles.value) {
        const fp = currentPath.value === '/' ? '/' + row.name : currentPath.value + '/' + row.name;
        try {
          await setFileAccess(fp, permissionsForm.value.owner, permissionsForm.value.mode);
          successCount++;
        } catch {
          // continue
        }
      }
      ElMessage.success(`权限设置完成: 成功 ${successCount} 个`);
    } else {
      await setFileAccess(permissionsForm.value.path, permissionsForm.value.owner, permissionsForm.value.mode);
      ElMessage.success('权限设置成功');
    }
    permissionsDialogVisible.value = false;
    refreshList();
  } catch (error) {
    ElMessage.error('权限设置失败: ' + (error.message || '未知错误'));
  } finally {
    permissionsLoading.value = false;
  }
}

// 下载文件（本地导出）
async function downloadFileLocal(row) {
  const filePath = currentPath.value === '/' ? '/' + row.name : currentPath.value + '/' + row.name;
  try {
    const res = await getFileContent(filePath);
    const content = res.data?.data || res.data;
    if (content) {
      const blob = new Blob([content], { type: 'text/plain' });
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

// 压缩文件
function showZipDialog() {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请先选择要压缩的文件');
    return;
  }
  const firstFile = selectedFiles.value[0];
  zipForm.value = {
    type: 'tar_gz',
    dfile: (firstFile.name || 'archive') + '.tar.gz',
  };
  zipDialogVisible.value = true;
}

async function confirmZip() {
  if (!zipForm.value.dfile) {
    ElMessage.warning('请输入压缩文件名');
    return;
  }
  zipLoading.value = true;
  try {
    const sfiles = selectedFiles.value.map(f =>
      currentPath.value === '/' ? '/' + f.name : currentPath.value + '/' + f.name
    ).join(',');
    const dfilePath = currentPath.value === '/' ? '/' + zipForm.value.dfile : currentPath.value + '/' + zipForm.value.dfile;
    await zipFile(sfiles, dfilePath, zipForm.value.type, currentPath.value);
    ElMessage.success('压缩成功');
    zipDialogVisible.value = false;
    refreshList();
  } catch (error) {
    ElMessage.error('压缩失败: ' + (error.message || '未知错误'));
  } finally {
    zipLoading.value = false;
  }
}

// 判断是否为压缩文件
function isArchiveFile(name) {
  const ext = (name || '').split('.').pop().toLowerCase();
  return ['zip', 'tar', 'gz', 'tgz', 'tar.gz', 'tar.bz2', 'rar', '7z', 'bz2'].includes(ext);
}

// 解压文件
function showUnzipDialog(row) {
  const filePath = currentPath.value === '/' ? '/' + row.name : currentPath.value + '/' + row.name;
  unzipForm.value = {
    sfile: filePath,
    dfile: currentPath.value,
    type: 'extract',
  };
  unzipDialogVisible.value = true;
}

async function confirmUnzip() {
  zipLoading.value = true;
  try {
    await unzipFile(unzipForm.value.sfile, unzipForm.value.dfile, unzipForm.value.type, currentPath.value);
    ElMessage.success('解压成功');
    unzipDialogVisible.value = false;
    refreshList();
  } catch (error) {
    ElMessage.error('解压失败: ' + (error.message || '未知错误'));
  } finally {
    zipLoading.value = false;
  }
}

// 远程下载
function showRemoteDownloadDialog() {
  remoteDownloadForm.value = {
    url: '',
    path: currentPath.value,
    filename: '',
  };
  remoteDownloadVisible.value = true;
}

async function confirmRemoteDownload() {
  if (!remoteDownloadForm.value.url) {
    ElMessage.warning('请输入下载地址');
    return;
  }
  remoteDownloadLoading.value = true;
  try {
    await remoteDownload(
      remoteDownloadForm.value.url,
      remoteDownloadForm.value.path,
      remoteDownloadForm.value.filename
    );
    ElMessage.success('远程下载任务已提交');
    remoteDownloadVisible.value = false;
    // 延迟刷新列表
    setTimeout(() => refreshList(), 3000);
  } catch (error) {
    ElMessage.error('远程下载失败: ' + (error.message || '未知错误'));
  } finally {
    remoteDownloadLoading.value = false;
  }
}

// 查看目录大小
async function showDirSize(row) {
  const dirPath = currentPath.value === '/' ? '/' + row.name : currentPath.value + '/' + row.name;
  try {
    const res = await getDirSize(dirPath);
    const size = res.data || res;
    ElMessageBox.alert(
      `<div>目录: <strong>${row.name}</strong></div><div>大小: <strong>${typeof size === 'string' ? size : formatSize(size)}</strong></div>`,
      '目录大小',
      { dangerouslyUseHTMLString: true }
    );
  } catch (error) {
    ElMessage.error('获取目录大小失败');
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
