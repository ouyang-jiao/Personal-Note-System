<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">🗑️ 回收站</h1>
      <div class="header-actions">
        <el-button
          v-if="deletedNotes.length > 0"
          type="warning"
          @click="handleRestoreAll"
        >
          <RefreshRight class="btn-icon" />
          恢复全部
        </el-button>
        <el-button
          v-if="deletedNotes.length > 0"
          type="danger"
          @click="handleClearAll"
        >
          <Delete class="btn-icon" />
          清空回收站
        </el-button>
      </div>
    </div>

    <div class="recycle-stats">
      <div class="stat-item">
        <span class="stat-num">{{ deletedNotes.length }}</span>
        <span class="stat-text">已删除笔记</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">{{ totalNotes }}</span>
        <span class="stat-text">总笔记数</span>
      </div>
    </div>

    <div v-if="deletedNotes.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <div class="empty-text">回收站为空</div>
      <div class="empty-desc">已删除的笔记会显示在这里，可以随时恢复</div>
    </div>

    <div v-else class="recycle-list">
      <div
        v-for="note in deletedNotes"
        :key="note.id"
        class="recycle-card card-hover"
      >
        <div class="card-content">
          <div class="card-header">
            <h3 class="note-title">{{ note.title }}</h3>
            <span class="delete-time">删除于 {{ formatDate(note.updatedAt) }}</span>
          </div>
          <p class="note-preview">{{ truncateContent(note.content) }}</p>
          <div class="card-meta">
            <span
              class="category-tag"
              :style="{ backgroundColor: getCategoryColor(note.category) + '20', color: getCategoryColor(note.category) }"
            >
              {{ note.category }}
            </span>
            <span
              class="priority-tag"
              :class="'priority-' + note.priority"
            >
              {{ getPriorityText(note.priority) }}
            </span>
          </div>
          <div class="card-tags">
            <span
              v-for="tag in note.tags.slice(0, 3)"
              :key="tag"
              class="note-tag"
            >
              {{ tag }}
            </span>
            <span v-if="note.tags.length > 3" class="more-tags">
              +{{ note.tags.length - 3 }}
            </span>
          </div>
        </div>
        <div class="card-actions">
          <el-button size="small" type="success" @click="handleRestore(note.id)">
            <RefreshRight class="action-icon" />
            恢复
          </el-button>
          <el-button size="small" type="danger" @click="handlePermanentDelete(note.id)">
            <Delete class="action-icon" />
            永久删除
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshRight, Delete } from '@element-plus/icons-vue'
import { useNoteStore } from '../stores/note'

const noteStore = useNoteStore()

const deletedNotes = computed(() => noteStore.deletedNotes)
const totalNotes = computed(() => noteStore.notes.length + deletedNotes.value.length)

function handleRestore(id) {
  noteStore.restoreNote(id)
  ElMessage.success('笔记已恢复')
}

function handleRestoreAll() {
  ElMessageBox.confirm(
    '确定恢复所有已删除的笔记吗？',
    '确认恢复',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    deletedNotes.value.forEach(note => {
      noteStore.restoreNote(note.id)
    })
    ElMessage.success('所有笔记已恢复')
  }).catch(() => {
    ElMessage.info('已取消恢复')
  })
}

function handlePermanentDelete(id) {
  ElMessageBox.confirm(
    '此操作不可恢复，确定要永久删除这条笔记吗？',
    '永久删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    noteStore.permanentDelete(id)
    ElMessage.success('笔记已永久删除')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

function handleClearAll() {
  ElMessageBox.confirm(
    '此操作不可恢复，确定要清空回收站吗？所有笔记将被永久删除！',
    '清空回收站',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    noteStore.clearRecycle()
    ElMessage.success('回收站已清空')
  }).catch(() => {
    ElMessage.info('已取消清空')
  })
}

function truncateContent(content, maxLength = 100) {
  if (!content) return ''
  return content.length > maxLength ? content.slice(0, maxLength) + '...' : content
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

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-icon {
  font-size: 16px;
}

.recycle-stats {
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
  color: #f56c6c;
}

.stat-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

.recycle-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.recycle-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(245, 108, 108, 0.2);
  position: relative;
  overflow: hidden;
}

.recycle-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #f56c6c 0%, #e6a23c 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.note-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 8px;
}

.delete-time {
  font-size: 12px;
  color: #f56c6c;
}

.note-preview {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.category-tag,
.priority-tag {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: var(--radius-sm);
}

.priority-high {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.priority-medium {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.priority-low {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.note-tag {
  padding: 3px 8px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  font-size: 12px;
  border-radius: var(--radius-sm);
}

.more-tags {
  font-size: 12px;
  color: var(--text-secondary);
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.action-icon {
  font-size: 14px;
}
</style>
