<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">⚙️ 系统设置</h1>
      <el-button type="primary" @click="handleSave">保存设置</el-button>
    </div>

    <div class="settings-grid">
      <div class="setting-card">
        <h3 class="card-title">🔐 修改密码</h3>
        
        <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" class="password-form">
          <el-form-item prop="oldPassword">
            <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="请输入原密码"
              size="large"
            />
          </el-form-item>
          
          <el-form-item prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码（至少6位）"
              size="large"
            />
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              size="large"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="change-pwd-btn"
              @click="handleChangePassword"
              :loading="changingPassword"
            >
              修改密码
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="setting-card">
        <h3 class="card-title">📱 显示设置</h3>
        
        <div class="setting-item">
          <div class="item-label">
            <span>页面大小</span>
            <span class="item-desc">每页显示的笔记数量</span>
          </div>
          <el-select v-model="localSettings.pageSize" size="large" style="width: 150px">
            <el-option label="5 条/页" :value="5" />
            <el-option label="10 条/页" :value="10" />
            <el-option label="20 条/页" :value="20" />
            <el-option label="50 条/页" :value="50" />
          </el-select>
        </div>

        <div class="setting-item">
          <div class="item-label">
            <span>默认分类</span>
            <span class="item-desc">新建笔记时的默认分类</span>
          </div>
          <el-select v-model="localSettings.defaultCategory" size="large" style="width: 200px">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.name"
            />
          </el-select>
        </div>
      </div>

      <div class="setting-card">
        <h3 class="card-title">🔄 自动保存</h3>
        
        <div class="setting-item">
          <div class="item-label">
            <span>自动保存</span>
            <span class="item-desc">编辑时自动保存草稿</span>
          </div>
          <el-switch
            v-model="localSettings.autoSave"
            active-text="开启"
            inactive-text="关闭"
            active-color="#6366f1"
          />
        </div>

        <div class="setting-item">
          <div class="item-label">
            <span>保存间隔</span>
            <span class="item-desc">自动保存的时间间隔（秒）</span>
          </div>
          <el-slider
            v-model="localSettings.saveInterval"
            :min="5"
            :max="60"
            :step="5"
            show-input
            size="large"
          />
        </div>
      </div>

      <div class="setting-card">
        <h3 class="card-title">💾 数据管理</h3>
        
        <div class="setting-item">
          <div class="item-label">
            <span>数据备份</span>
            <span class="item-desc">导出所有数据到本地文件</span>
          </div>
          <el-button type="primary" @click="handleExport">
            <Download class="btn-icon" />
            导出数据
          </el-button>
        </div>

        <div class="setting-item">
          <div class="item-label">
            <span>数据导入</span>
            <span class="item-desc">从本地文件导入数据</span>
          </div>
          <el-upload
            class="upload-btn"
            :show-file-list="false"
            :on-success="handleImport"
            :before-upload="beforeImport"
            accept=".json"
          >
            <el-button>
              <Upload class="btn-icon" />
              选择文件
            </el-button>
          </el-upload>
        </div>

        <div class="setting-item">
          <div class="item-label">
            <span>数据统计</span>
            <span class="item-desc">查看当前数据概览</span>
          </div>
          <el-button @click="showStats = true">查看统计</el-button>
        </div>

        <div class="setting-item danger-item">
          <div class="item-label">
            <span>重置数据</span>
            <span class="item-desc danger">⚠️ 清空所有数据，不可恢复</span>
          </div>
          <el-button type="danger" @click="handleReset">
            <RefreshRight class="btn-icon" />
            重置所有
          </el-button>
        </div>
      </div>

      <div class="setting-card">
        <h3 class="card-title">ℹ️ 关于</h3>
        
        <div class="about-item">
          <span class="about-label">版本</span>
          <span class="about-value">v1.0.0</span>
        </div>
        
        <div class="about-item">
          <span class="about-label">开发</span>
          <span class="about-value">个人笔记与知识库</span>
        </div>
        
        <div class="about-item">
          <span class="about-label">技术栈</span>
          <span class="about-value">Vue 3 + Element Plus + Pinia</span>
        </div>
        
        <div class="about-item">
          <span class="about-label">数据存储</span>
          <span class="about-value">LocalStorage</span>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showStats"
      title="数据统计"
      width="500px"
    >
      <div class="stats-content">
        <div class="stat-row">
          <div class="stat-box">
            <div class="stat-icon">📚</div>
            <div class="stat-info">
              <div class="stat-num">{{ notesCount }}</div>
              <div class="stat-label">笔记总数</div>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-icon">🗑️</div>
            <div class="stat-info">
              <div class="stat-num">{{ deletedCount }}</div>
              <div class="stat-label">已删除</div>
            </div>
          </div>
        </div>
        <div class="stat-row">
          <div class="stat-box">
            <div class="stat-icon">📁</div>
            <div class="stat-info">
              <div class="stat-num">{{ categoriesCount }}</div>
              <div class="stat-label">分类数</div>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-icon">🏷️</div>
            <div class="stat-info">
              <div class="stat-num">{{ tagsCount }}</div>
              <div class="stat-label">标签数</div>
            </div>
          </div>
        </div>
        <div class="stat-row">
          <div class="stat-box">
            <div class="stat-icon">📌</div>
            <div class="stat-info">
              <div class="stat-num">{{ topCount }}</div>
              <div class="stat-label">置顶笔记</div>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-icon">📝</div>
            <div class="stat-info">
              <div class="stat-num">{{ totalChars }}</div>
              <div class="stat-label">总字数</div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Upload, RefreshRight } from '@element-plus/icons-vue'
import { useNoteStore } from '../stores/note'
import { useAuthStore } from '../stores/auth'

const noteStore = useNoteStore()
const authStore = useAuthStore()

const categories = computed(() => noteStore.categories)

const localSettings = reactive({
  pageSize: 10,
  autoSave: true,
  saveInterval: 30,
  defaultCategory: '学习笔记'
})

const showStats = ref(false)

const passwordFormRef = ref(null)
const changingPassword = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

function handleChangePassword() {
  passwordFormRef.value.validate((valid) => {
    if (!valid) return

    changingPassword.value = true

    setTimeout(() => {
      const result = authStore.changePassword(
        passwordForm.oldPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      )

      if (result.success) {
        ElMessage.success(result.message)
        passwordForm.oldPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
      } else {
        ElMessage.error(result.message)
      }

      changingPassword.value = false
    }, 500)
  })
}

const notesCount = computed(() => noteStore.notes.length)
const deletedCount = computed(() => noteStore.deletedNotes.length)
const categoriesCount = computed(() => noteStore.categories.length)
const tagsCount = computed(() => noteStore.tags.length)
const topCount = computed(() => noteStore.topNotes.length)
const totalChars = computed(() => {
  return noteStore.notes.reduce((sum, note) => sum + note.content.length, 0)
})

onMounted(() => {
  Object.assign(localSettings, noteStore.settings)
})

function handleSave() {
  noteStore.updateSettings({ ...localSettings })
  ElMessage.success('设置已保存')
}

function handleExport() {
  const data = localStorage.getItem('notebook_data')
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `notebook_backup_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('数据导出成功')
}

function beforeImport(file) {
  const isJson = file.type === 'application/json'
  if (!isJson) {
    ElMessage.error('请选择 JSON 文件')
    return false
  }
  return true
}

function handleImport(response, file) {
  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result)
      localStorage.setItem('notebook_data', JSON.stringify(data))
      ElMessage.success('数据导入成功，刷新页面生效')
    }
    reader.readAsText(file.raw)
  } catch {
    ElMessage.error('数据导入失败')
  }
}

function handleReset() {
  ElMessageBox.confirm(
    '⚠️ 此操作将清空所有数据，包括笔记、分类、标签等，且不可恢复！确定要继续吗？',
    '重置数据',
    {
      confirmButtonText: '确定重置',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    localStorage.removeItem('notebook_data')
    location.reload()
  }).catch(() => {
    ElMessage.info('已取消重置')
  })
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

.password-form {
  margin-top: 8px;
}

.password-form :deep(.el-input__wrapper) {
  border-radius: 8px;
}

.password-form :deep(.el-input__wrapper.is-focus) {
  border-color: #20BD99;
  box-shadow: 0 0 0 3px rgba(32, 189, 153, 0.15);
}

.change-pwd-btn {
  width: 100%;
  background: linear-gradient(135deg, #20BD99 0%, #1ABC9C 100%);
  border: none;
}

.change-pwd-btn:hover {
  box-shadow: 0 4px 12px rgba(32, 189, 153, 0.3);
}

.setting-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
  border-bottom: none;
}

.item-label {
  display: flex;
  flex-direction: column;
}

.item-label span:first-child {
  font-size: 15px;
  font-weight: 500;
}

.item-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.item-desc.danger {
  color: #f56c6c;
}

.danger-item {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--border-color);
}

.btn-icon {
  font-size: 16px;
}

.upload-btn {
  display: inline-block;
}

.about-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
}

.about-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.about-value {
  font-size: 14px;
  font-weight: 500;
}

.stats-content {
  padding: 16px;
}

.stat-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-row:last-child {
  margin-bottom: 0;
}

.stat-box {
  flex: 1;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--border-color);
}

.stat-icon {
  font-size: 28px;
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
