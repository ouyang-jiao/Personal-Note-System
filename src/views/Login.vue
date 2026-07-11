<template>
  <div class="login-page">
    <div class="login-bg"></div>
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <span class="logo-icon">📝</span>
            <span class="logo-text">个人笔记</span>
          </div>
          <p class="login-desc">登录您的个人知识库</p>
          <div class="default-hint">
            <span class="hint-icon">💡</span>
            <span class="hint-text">默认账户：admin / 123456</span>
          </div>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
          <el-form-item prop="username">
            <el-select
              v-if="authStore.rememberedUsers.length > 0"
              v-model="form.username"
              placeholder="请选择用户"
              size="large"
              clearable
              class="user-select"
              @change="handleUserSelect"
            >
              <el-option
                v-for="user in authStore.rememberedUsers"
                :key="user.username"
                :label="user.username"
                :value="user.username"
              />
            </el-select>
            <el-input
              v-else
              v-model="form.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              size="large"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="form.rememberMe">记住我</el-checkbox>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              @click="handleLogin"
              :loading="loading"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <span>还没有账号？</span>
          <router-link to="/register" class="register-link">立即注册</router-link>
        </div>
      </div>

      <div class="login-info">
        <div class="info-card">
          <div class="info-icon">🎯</div>
          <div class="info-content">
            <h3>高效管理</h3>
            <p>智能分类，快速搜索</p>
          </div>
        </div>
        <div class="info-card">
          <div class="info-icon">🔒</div>
          <div class="info-content">
            <h3>安全存储</h3>
            <p>本地加密，数据安全</p>
          </div>
        </div>
        <div class="info-card">
          <div class="info-icon">📱</div>
          <div class="info-content">
            <h3>随时随地</h3>
            <p>多设备同步访问</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const loading = ref(false)

const form = ref({
  username: '',
  password: '',
  rememberMe: false
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

onMounted(() => {
  authStore.init()
  if (authStore.currentUser) {
    form.value.username = authStore.currentUser.username || ''
    form.value.rememberMe = authStore.rememberMe
  } else if (authStore.rememberedUsers.length > 0) {
    const lastUser = authStore.rememberedUsers.sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin))[0]
    form.value.username = lastUser.username || ''
    form.value.password = lastUser.password || ''
    form.value.rememberMe = true
  }
})

function handleUserSelect(username) {
  const user = authStore.rememberedUsers.find(u => u.username === username)
  if (user) {
    form.value.password = user.password || ''
    form.value.rememberMe = true
  } else {
    form.value.password = ''
  }
}

function handleLogin() {
  formRef.value.validate((valid) => {
    if (!valid) return

    loading.value = true

    setTimeout(() => {
      const result = authStore.login(form.value.username, form.value.password, form.value.rememberMe)

      if (result.success) {
        ElMessage.success(result.message)
        router.push('/')
      } else {
        ElMessage.error(result.message)
      }

      loading.value = false
    }, 800)
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #F3FAF8 0%, #E8F5F1 50%, #F0FFF7 100%);
}

.login-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(32, 189, 153, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(32, 189, 153, 0.08) 0%, transparent 60%);
}

.login-container {
  display: flex;
  gap: 80px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.login-card {
  width: 420px;
  background: #FFFFFF;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(32, 189, 153, 0.15), 0 8px 24px rgba(32, 189, 153, 0.08);
  animation: fadeInUp 0.6s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.logo-icon {
  font-size: 40px;
  animation: float 4s ease-in-out infinite;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #20BD99 0%, #1ABC9C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.default-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  padding: 10px 16px;
  background: rgba(32, 189, 153, 0.08);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.hint-icon {
  font-size: 14px;
}

.hint-text {
  font-weight: 500;
}

.login-form {
  margin-bottom: 24px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 4px 12px;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(32, 189, 153, 0.5);
  box-shadow: 0 0 0 3px rgba(32, 189, 153, 0.1);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: #20BD99;
  box-shadow: 0 0 0 3px rgba(32, 189, 153, 0.15);
}

.user-select :deep(.el-select__wrapper) {
  border-radius: 12px;
  padding: 4px 12px;
}

.user-select :deep(.el-select__wrapper:hover) {
  border-color: rgba(32, 189, 153, 0.5);
  box-shadow: 0 0 0 3px rgba(32, 189, 153, 0.1);
}

.user-select :deep(.el-select__wrapper.is-focus) {
  border-color: #20BD99;
  box-shadow: 0 0 0 3px rgba(32, 189, 153, 0.15);
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-options :deep(.el-checkbox__label) {
  color: var(--text-secondary);
  font-size: 14px;
}

.login-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #20BD99 0%, #1ABC9C 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(32, 189, 153, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.login-footer {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.register-link {
  color: #20BD99;
  font-weight: 500;
  margin-left: 4px;
  transition: all 0.2s ease;
}

.register-link:hover {
  color: #1ABC9C;
  text-decoration: underline;
}

.login-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateX(10px);
  box-shadow: 0 8px 24px rgba(32, 189, 153, 0.15);
}

.info-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(32, 189, 153, 0.1);
  border-radius: 14px;
}

.info-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.info-content p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@media (max-width: 900px) {
  .login-container {
    flex-direction: column;
    gap: 32px;
  }
  
  .login-card {
    width: 90%;
    max-width: 400px;
  }
  
  .login-info {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .info-card {
    width: calc(50% - 12px);
  }
}
</style>