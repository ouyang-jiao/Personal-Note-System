<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">📁 分类管理</h1>
      <el-button type="primary" @click="handleAdd" class="add-btn">
        <Plus class="btn-icon" />
        新增分类
      </el-button>
    </div>

    <div class="category-stats">
      <div class="stat-item">
        <span class="stat-num">{{ categories.length }}</span>
        <span class="stat-text">总分类</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">{{ noteCount }}</span>
        <span class="stat-text">关联笔记</span>
      </div>
    </div>

    <div class="category-list">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="category-card card-hover"
      >
        <div class="card-left">
          <div class="cat-color" :style="{ backgroundColor: cat.color }"></div>
          <div class="cat-info">
            <h3 class="cat-name">{{ cat.name }}</h3>
            <div class="cat-meta">
              <span class="cat-notes">{{ getNoteCount(cat.name) }} 条笔记</span>
              <span class="cat-date">{{ formatDate(cat.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div class="card-actions">
          <el-button size="small" @click="handleEdit(cat)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(cat)">删除</el-button>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入分类名称"
            size="large"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker
            v-model="form.color"
            show-alpha="false"
            size="large"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useNoteStore } from '../stores/note'

const noteStore = useNoteStore()
const formRef = ref(null)

const categories = computed(() => noteStore.categories)

const noteCount = computed(() => {
  return noteStore.notes.length
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref(null)

const form = reactive({
  name: '',
  color: '#6366f1'
})

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 20, message: '名称长度在1到20个字符之间', trigger: 'blur' }
  ]
}

function handleAdd() {
  isEdit.value = false
  editingId.value = null
  form.name = ''
  form.color = '#6366f1'
  dialogVisible.value = true
}

function handleEdit(cat) {
  isEdit.value = true
  editingId.value = cat.id
  form.name = cat.name
  form.color = cat.color
  dialogVisible.value = true
}

function handleDelete(cat) {
  const noteCount = getNoteCount(cat.name)
  if (noteCount > 0) {
    ElMessageBox.confirm(
      `该分类下有 ${noteCount} 条笔记，删除后笔记将归为"未分类"，确定删除吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      noteStore.deleteCategory(cat.id)
      ElMessage.success('分类删除成功')
    }).catch(() => {
      ElMessage.info('已取消删除')
    })
  } else {
    ElMessageBox.confirm(
      '确定删除该分类吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      noteStore.deleteCategory(cat.id)
      ElMessage.success('分类删除成功')
    }).catch(() => {
      ElMessage.info('已取消删除')
    })
  }
}

function handleSave() {
  formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        noteStore.updateCategory(editingId.value, {
          name: form.name.trim(),
          color: form.color
        })
        ElMessage.success('分类更新成功')
      } else {
        noteStore.addCategory({
          name: form.name.trim(),
          color: form.color
        })
        ElMessage.success('分类创建成功')
      }
      dialogVisible.value = false
    } else {
      ElMessage.error('请填写完整信息')
    }
  })
}

function getNoteCount(categoryName) {
  return noteStore.notes.filter(n => n.category === categoryName).length
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
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

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-icon {
  font-size: 16px;
}

.category-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
  box-shadow: var(--shadow-sm);
}

.stat-num {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.category-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.category-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.card-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.cat-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.cat-info {
  flex: 1;
}

.cat-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: var(--text-primary);
}

.cat-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}

.card-actions {
  display: flex;
  gap: 8px;
}

.el-color-picker {
  width: 100%;
}
</style>
