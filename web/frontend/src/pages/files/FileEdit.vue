<template>
  <div class="file-edit-page">
    <!-- 顶部工具栏 -->
    <div class="page-card edit-toolbar">
      <div class="toolbar-left">
        <el-button :icon="Back" size="small" @click="goBack">返回</el-button>
        <span class="file-path">
          <el-icon><Document /></el-icon>
          {{ filePath }}
        </span>
      </div>
      <div class="toolbar-right">
        <el-select v-model="currentLanguage" size="small" style="width: 140px" @change="handleLanguageChange">
          <el-option label="Plain Text" value="plaintext" />
          <el-option label="JavaScript" value="javascript" />
          <el-option label="TypeScript" value="typescript" />
          <el-option label="HTML" value="html" />
          <el-option label="CSS" value="css" />
          <el-option label="SCSS" value="scss" />
          <el-option label="JSON" value="json" />
          <el-option label="Python" value="python" />
          <el-option label="Shell" value="shell" />
          <el-option label="SQL" value="sql" />
          <el-option label="YAML" value="yaml" />
          <el-option label="XML" value="xml" />
          <el-option label="Markdown" value="markdown" />
          <el-option label="Go" value="go" />
          <el-option label="Java" value="java" />
          <el-option label="PHP" value="php" />
          <el-option label="Nginx" value="nginx" />
        </el-select>
        <el-select v-model="editorTheme" size="small" style="width: 140px">
          <el-option label="深色主题" value="vs-dark" />
          <el-option label="浅色主题" value="vs" />
          <el-option label="高对比度" value="hc-black" />
        </el-select>
        <el-button type="primary" :icon="Check" size="small" :loading="saving" @click="handleSave">
          保存 (Ctrl+S)
        </el-button>
      </div>
    </div>

    <!-- 编辑器 -->
    <div class="editor-wrapper page-card">
      <FileEditor
        ref="editorRef"
        v-model="fileContent"
        :language="currentLanguage"
        :theme="editorTheme"
        :height="'calc(100vh - 200px)'"
        :loading="loading"
        @save="handleSave"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Back, Document, Check } from '@element-plus/icons-vue';
import FileEditor from '@/components/FileEditor.vue';
import { getFileContent, saveFileContent } from '@/api/files';

const router = useRouter();
const route = useRoute();

const editorRef = ref(null);
const filePath = ref('');
const fileContent = ref('');
const currentLanguage = ref('plaintext');
const editorTheme = ref('vs-dark');
const loading = ref(false);
const saving = ref(false);

function goBack() {
  router.push('/files');
}

function handleLanguageChange(lang) {
  if (editorRef.value) {
    editorRef.value.setLanguage(lang);
  }
}

async function loadFile() {
  const path = route.query.path;
  if (!path) {
    ElMessage.error('未指定文件路径');
    goBack();
    return;
  }

  filePath.value = path;
  loading.value = true;

  try {
    const res = await getFileContent(path);
    fileContent.value = res.data || '';

    // 自动检测语言
    if (editorRef.value) {
      const detected = editorRef.value.detectLanguage(path);
      currentLanguage.value = detected;
    }
  } catch (error) {
    ElMessage.error('读取文件失败: ' + (error.message || '未知错误'));
    goBack();
  } finally {
    loading.value = false;
  }
}

async function handleSave(content) {
  saving.value = true;
  try {
    await saveFileContent(filePath.value, content || fileContent.value);
    ElMessage.success('保存成功');
  } catch (error) {
    ElMessage.error('保存失败: ' + (error.message || '未知错误'));
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadFile();
});
</script>

<style lang="scss" scoped>
.file-edit-page {
  .edit-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .file-path {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #606266;
        font-size: 14px;
        font-family: monospace;
        max-width: 400px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .editor-wrapper {
    padding: 0;
    overflow: hidden;
    margin-top: 0;
  }
}
</style>
