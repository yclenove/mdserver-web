<template>
  <div class="login-page">
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      size="large"
      @keyup.enter="handleLogin"
    >
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          placeholder="请输入用户名"
          :prefix-icon="User"
          clearable
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          :prefix-icon="Lock"
          show-password
          clearable
        />
      </el-form-item>

      <el-form-item v-if="showVerifyCode" prop="code">
        <div class="verify-code-row">
          <el-input
            v-model="loginForm.code"
            placeholder="请输入验证码"
            :prefix-icon="Key"
            clearable
            class="verify-input"
          />
          <div class="verify-code-img" @click="refreshCode">
            <img
              v-if="verifyCodeUrl"
              :src="verifyCodeUrl"
              alt="验证码"
              @error="onCodeImgError"
            />
            <span v-else class="loading-text">加载中...</span>
          </div>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          class="login-btn"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登 录' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, Key } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const loginFormRef = ref(null);
const loading = ref(false);
const showVerifyCode = ref(false);
const verifyCodeUrl = ref('');

const loginForm = reactive({
  username: '',
  password: '',
  code: '',
});

// 动态验证规则：验证码字段仅在显示时必填
const loginRules = computed(() => ({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: showVerifyCode.value
    ? [{ required: true, message: '请输入验证码', trigger: 'blur' }]
    : [],
}));

function refreshCode() {
  // 添加时间戳防止缓存
  verifyCodeUrl.value = '/code?t=' + Date.now();
}

function onCodeImgError() {
  // 验证码图片加载失败，隐藏验证码输入
  showVerifyCode.value = false;
  verifyCodeUrl.value = '';
}

async function handleLogin() {
  if (!loginFormRef.value) return;

  try {
    await loginFormRef.value.validate();
  } catch {
    return;
  }

  loading.value = true;
  try {
    await userStore.login(loginForm);
    ElMessage.success('登录成功');

    const redirect = route.query.redirect || '/dashboard';
    router.push(redirect);
  } catch (error) {
    ElMessage.error(error.message || '登录失败，请检查用户名和密码');
    if (showVerifyCode.value) {
      refreshCode();
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  // 加载验证码图片（图片加载成功表示接口可用）
  showVerifyCode.value = true;
  refreshCode();
});
</script>

<style lang="scss" scoped>
.login-page {
  width: 100%;
}

.verify-code-row {
  display: flex;
  gap: 12px;
  width: 100%;

  .verify-input {
    flex: 1;
  }

  .verify-code-img {
    width: 120px;
    height: 40px;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #dcdfe6;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .loading-text {
      font-size: 12px;
      color: #909399;
    }
  }
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  letter-spacing: 4px;
}
</style>
