<template>
  <div class="page-container">
    <div class="form-header">
      <el-button @click="goBack" class="back-btn">
        <ArrowLeft class="btn-icon" />
        返回
      </el-button>
      <h1 class="form-title">✏️ 新建笔记</h1>
      <div class="header-actions">
        <el-button @click="handleReset">清空</el-button>
        <el-button @click="handlePreview">预览</el-button>
        <el-button type="primary" @click="handleSubmit">保存笔记</el-button>
      </div>
    </div>

    <div class="form-wrapper">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="note-form"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入笔记标题（最多50个字符）"
            size="large"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select
            v-model="form.category"
            placeholder="请选择分类"
            size="large"
            style="width: 100%"
          >
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="form.tags"
            placeholder="请选择标签（可多选）"
            size="large"
            multiple
            style="width: 100%"
          >
            <el-option
              v-for="tag in tags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.name"
            />
          </el-select>
          <div class="tag-tip">已选 {{ form.tags.length }} 个标签</div>
        </el-form-item>

        <el-form-item label="优先级">
          <el-radio-group v-model="form.priority" size="large">
            <el-radio-button value="high" class="priority-high">
              <span class="priority-dot" style="background: #f56c6c"></span>
              高
            </el-radio-button>
            <el-radio-button value="medium" class="priority-medium">
              <span class="priority-dot" style="background: #e6a23c"></span>
              中
            </el-radio-button>
            <el-radio-button value="low" class="priority-low">
              <span class="priority-dot" style="background: #67c23a"></span>
              低
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="置顶">
          <el-switch
            v-model="form.isTop"
            active-text="置顶"
            inactive-text="不置顶"
            active-color="#6366f1"
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            type="textarea"
            v-model="form.content"
            placeholder="请输入笔记内容..."
            :rows="15"
            size="large"
            maxlength="5000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item class="form-actions">
          <el-button type="primary" size="large" @click="handleSubmit">
            <Check class="btn-icon" />
            保存笔记
          </el-button>
          <el-button size="large" @click="handleReset">
            <RefreshRight class="btn-icon" />
            清空表单
          </el-button>
          <el-button size="large" @click="handlePreview">
            <View class="btn-icon" />
            预览
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-dialog
      v-model="previewVisible"
      title="笔记预览"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="preview-content">
        <h3 class="preview-title">{{ form.title || '无标题' }}</h3>
        <div class="preview-meta">
          <span class="preview-category">{{ form.category || '未分类' }}</span>
          <span class="preview-priority" :class="'priority-' + form.priority">
            {{ getPriorityText(form.priority) }}
          </span>
          <span v-if="form.isTop" class="preview-top">置顶</span>
        </div>
        <div class="preview-tags">
          <span
            v-for="tag in form.tags"
            :key="tag"
            class="preview-tag"
          >
            {{ tag }}
          </span>
        </div>
        <p class="preview-body">{{ form.content || '暂无内容' }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check, RefreshRight, View } from '@element-plus/icons-vue'
import { useNoteStore } from '../stores/note'

const router = useRouter()
const noteStore = useNoteStore()
const formRef = ref(null)

const categories = computed(() => noteStore.categories)
const tags = computed(() => noteStore.tags)

const form = reactive({
  title: '',
  category: '',
  tags: [],
  priority: 'medium',
  isTop: false,
  content: ''
})

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 1, max: 50, message: '标题长度在1到50个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 1, max: 5000, message: '内容长度在1到5000个字符之间', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
}

const previewVisible = ref(false)

function goBack() {
  router.push('/')
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      noteStore.addNote({
        title: form.title.trim(),
        category: form.category,
        tags: [...form.tags],
        priority: form.priority,
        isTop: form.isTop,
        content: form.content.trim()
      })
      ElMessage.success('笔记创建成功')
      router.push('/')
    } else {
      ElMessage.error('请填写完整信息')
    }
  })
}

function handleReset() {
  formRef.value.resetFields()
  form.tags = []
  form.priority = 'medium'
  form.isTop = false
}

function handlePreview() {
  previewVisible.value = true
}

function getPriorityText(priority) {
  const map = { high: '高优先级', medium: '中优先级', low: '低优先级' }
  return map[priority] || '中优先级'
}
</script>

<style scoped>
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-icon {
  font-size: 16px;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.form-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.note-form {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-md);
  animation: fadeInUp 0.5s ease-out;
}

.tag-tip {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
}

.priority-high,
.priority-medium,
.priority-low {
  display: flex;
  align-items: center;
  gap: 6px;
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.preview-content {
  padding: 16px;
}

.preview-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.preview-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.preview-category {
  padding: 4px 10px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  font-size: 13px;
  border-radius: var(--radius-sm);
}

.preview-priority {
  padding: 4px 10px;
  font-size: 13px;
  border-radius: var(--radius-sm);
}

.preview-priority.priority-high {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.preview-priority.priority-medium {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.preview-priority.priority-low {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.preview-top {
  padding: 4px 10px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  font-size: 13px;
  border-radius: var(--radius-sm);
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.preview-tag {
  padding: 4px 10px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  font-size: 12px;
  border-radius: var(--radius-sm);
}

.preview-body {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-secondary);
  white-space: pre-wrap;
}
</style>
