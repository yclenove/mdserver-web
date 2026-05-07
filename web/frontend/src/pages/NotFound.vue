<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <div class="actions">
        <el-button type="primary" size="large" @click="goHome">
          <el-icon><HomeFilled /></el-icon> 返回首页
        </el-button>
        <el-button size="large" @click="goBack">
          <el-icon><Back /></el-icon> 返回上页
        </el-button>
      </div>
      <div class="suggestions">
        <h4>您可能想要：</h4>
        <ul>
          <li><router-link to="/dashboard">查看仪表盘</router-link></li>
          <li><router-link to="/site">管理网站</router-link></li>
          <li><router-link to="/files">管理文件</router-link></li>
          <li><router-link to="/soft">软件管理</router-link></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function goHome() {
  router.push('/dashboard');
}

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/dashboard');
  }
}
</script>

<style lang="scss" scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.not-found-content {
  text-align: center;
  max-width: 500px;

  .error-code {
    font-size: 140px;
    font-weight: 800;
    color: transparent;
    background: linear-gradient(135deg, #409eff, #67c23a);
    -webkit-background-clip: text;
    background-clip: text;
    line-height: 1;
    margin-bottom: 16px;
    letter-spacing: -8px;
    text-shadow: none;
  }

  h2 {
    font-size: 24px;
    color: #303133;
    margin: 0 0 12px;
    font-weight: 600;
  }

  p {
    font-size: 15px;
    color: #909399;
    margin: 0 0 32px;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 40px;
  }

  .suggestions {
    text-align: left;
    background: #f5f7fa;
    border-radius: 8px;
    padding: 20px 24px;

    h4 {
      font-size: 14px;
      color: #606266;
      margin: 0 0 12px;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;

      li a {
        color: #409eff;
        text-decoration: none;
        font-size: 14px;
        transition: color 0.2s;

        &:hover {
          color: #337ecc;
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
