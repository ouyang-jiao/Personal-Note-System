<template>
  <div class="page-container">
    <div v-if="note">
      <div class="detail-header">
        <el-button @click="goBack" class="back-btn">
          <ArrowLeft class="btn-icon" />
          返回
        </el-button>
        <div class="header-actions">
          <el-button @click="goToEdit">
            <Edit class="btn-icon" />
            编辑
          </el-button>
          <el-button type="danger" @click="handleDelete">
            <Delete class="btn-icon" />
            删除
          </el-button>
        </div>
      </div>

      <div class="detail-card animate-scale-in">
        <div class="card-header">
          <h1 class="note-title">{{ note.title }}</h1>
          <div class="header-badges">
            <span v-if="note.isTop" class="top-badge">
              📌 置顶
            </span>
            <span
              class="category-badge"
              :style="{ backgroundColor: getCategoryColor(note.category) + '20', color: getCategoryColor(note.category) }"
            >
              {{ note.category }}
            </span>
            <span
              class="priority-badge"
              :class="'priority-' + note.priority"
            >
              {{ getPriorityText(note.priority) }}
            </span>
          </div>
        </div>

        <div class="card-meta">
          <span>创建于 {{ formatDate(note.createdAt) }}</span>
          <span v-if="note.createdAt !== note.updatedAt">更新于 {{ formatDate(note.updatedAt) }}</span>
        </div>

        <div class="card-tags">
          <span
            v-for="tag in note.tags"
            :key="tag"
            class="note-tag"
            @click="handleTagClick(tag)"
          >
            {{ tag }}
          </span>
        </div>

        <div class="card-content">
          <p>{{ note.content }}</p>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <div class="not-found-icon">🔍</div>
      <div class="not-found-text">笔记不存在或已被删除</div>
      <el-button type="primary" @click="goBack">返回列表</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Edit, Delete } from '@element-plus/icons-vue'
import { useNoteStore } from '../stores/note'

const route = useRoute()
const router = useRouter()
const noteStore = useNoteStore()

const note = ref(null)

onMounted(() => {
  const id = route.params.id
  note.value = noteStore.getNoteById(id)
})

function goBack() {
  router.push('/')
}

function goToEdit() {
  router.push(`/edit/${note.value.id}`)
}

function handleDelete() {
  noteStore.deleteNote(note.value.id)
  ElMessage.success('笔记已移入回收站')
  router.push('/')
}

function handleTagClick(tag) {
  router.push({ path: '/', query: { tag } })
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('zh-CN')
}

function getCategoryColor(category) {
  const cat = noteStore.categories.find(c => c.name === category)
  return cat ? cat.color : '#909399'
}

function getPriorityText(priority) {
  const map = { high: '高优先级', medium: '中优先级', low: '低优先级' }
  return map[priority] || '中优先级'
}
</script>

<style scoped>
.detail-header {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.detail-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-md);
}

.card-header {
  margin-bottom: 20px;
}

.note-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.header-badges {
  display: flex;
  gap: 12px;
}

.top-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  font-size: 13px;
  border-radius: var(--radius-sm);
}

.category-badge,
.priority-badge {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: var(--radius-sm);
}

.priority-badge.priority-high {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.priority-badge.priority-medium {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.priority-badge.priority-low {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.card-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.note-tag {
  padding: 5px 12px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  font-size: 13px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.note-tag:hover {
  background: rgba(99, 102, 241, 0.2);
}

.card-content {
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.card-content p {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
  margin: 0;
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
}

.not-found-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.not-found-text {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}
</style>
