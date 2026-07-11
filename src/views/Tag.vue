<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">🏷️ 标签管理</h1>
      <el-button type="primary" @click="handleAdd" class="add-btn">
        <Plus class="btn-icon" />
        新增标签
      </el-button>
    </div>

    <div class="tag-stats">
      <div class="stat-item">
        <span class="stat-num">{{ tags.length }}</span>
        <span class="stat-text">总标签</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">{{ avgNotesPerTag }}</span>
        <span class="stat-text">平均笔记数</span>
      </div>
    </div>

    <div class="tag-list-section">
      <h3 class="section-title">标签列表</h3>
      <el-table :data="tagTableData" border stripe style="width: 100%">
        <el-table-column prop="name" label="标签名称" />
        <el-table-column prop="count" label="关联笔记数" />
        <el-table-column prop="color" label="颜色">
          <template #default="scope">
            <span class="color-block" :style="{ backgroundColor: scope.row.color }"></span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑标签' : '新增标签'"
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
            placeholder="请输入标签名称"
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

const tags = computed(() => noteStore.tags)

const tagTableData = computed(() => {
  return tags.value.map(tag => ({
    ...tag,
    count: getNoteCount(tag.name)
  }))
})

const avgNotesPerTag = computed(() => {
  if (tags.value.length === 0) return 0
  const total = tags.value.reduce((sum, tag) => sum + getNoteCount(tag.name), 0)
  return Math.round(total / tags.value.length)
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
    { required: true, message: '请输入标签名称', trigger: 'blur' },
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

function handleEdit(tag) {
  isEdit.value = true
  editingId.value = tag.id
  form.name = tag.name
  form.color = tag.color
  dialogVisible.value = true
}

function handleDelete(tag) {
  const noteCount = getNoteCount(tag.name)
  if (noteCount > 0) {
    ElMessageBox.confirm(
      `该标签关联了 ${noteCount} 条笔记，删除后笔记将不再包含此标签，确定删除吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      noteStore.deleteTag(tag.id)
      ElMessage.success('标签删除成功')
    }).catch(() => {
      ElMessage.info('已取消删除')
    })
  } else {
    ElMessageBox.confirm(
      '确定删除该标签吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      noteStore.deleteTag(tag.id)
      ElMessage.success('标签删除成功')
    }).catch(() => {
      ElMessage.info('已取消删除')
    })
  }
}

function handleSave() {
  formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        noteStore.updateTag(editingId.value, {
          name: form.name.trim(),
          color: form.color
        })
        ElMessage.success('标签更新成功')
      } else {
        noteStore.addTag({
          name: form.name.trim(),
          color: form.color
        })
        ElMessage.success('标签创建成功')
      }
      dialogVisible.value = false
    } else {
      ElMessage.error('请填写完整信息')
    }
  })
}

function getNoteCount(tagName) {
  return noteStore.notes.filter(n => n.tags.includes(tagName)).length
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

.tag-stats {
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



.tag-list-section {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.color-block {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.el-color-picker {
  width: 100%;
}
</style>
