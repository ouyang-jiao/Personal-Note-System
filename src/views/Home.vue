<template>
  <div class="page-container">
    <div class="welcome-bar animate-fade-in">
      <div class="welcome-left">
        <div class="user-avatar">{{ currentUser.charAt(0).toUpperCase() }}</div>
        <div class="welcome-text">
          <div class="welcome-greeting">{{ greeting }}，{{ currentUser }}</div>
          <div class="welcome-sub">欢迎回到您的个人知识库</div>
        </div>
      </div>
      <div class="welcome-date">{{ todayDate }}</div>
    </div>

    <div class="stats-row">
      <div class="stat-card animate-fade-in" style="animation-delay: 0.1s">
        <div class="stat-icon blue">📚</div>
        <div class="stat-info">
          <div class="stat-value">{{ notes.length }}</div>
          <div class="stat-label">总笔记数</div>
        </div>
      </div>
      <div class="stat-card animate-fade-in" style="animation-delay: 0.2s">
        <div class="stat-icon green">📌</div>
        <div class="stat-info">
          <div class="stat-value">{{ topNotes.length }}</div>
          <div class="stat-label">置顶笔记</div>
        </div>
      </div>
      <div class="stat-card animate-fade-in" style="animation-delay: 0.3s">
        <div class="stat-icon orange">📁</div>
        <div class="stat-info">
          <div class="stat-value">{{ categories.length }}</div>
          <div class="stat-label">分类数</div>
        </div>
      </div>
      <div class="stat-card animate-fade-in" style="animation-delay: 0.4s">
        <div class="stat-icon purple">🏷️</div>
        <div class="stat-info">
          <div class="stat-value">{{ tags.length }}</div>
          <div class="stat-label">标签数</div>
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-left">
        <el-select
          v-model="filterCategory"
          placeholder="全部分类"
          class="filter-select"
          @change="handleFilter"
        >
          <el-option label="全部" value="全部" />
          <el-option
            v-for="cat in categories"
            :key="cat.id"
            :label="cat.name"
            :value="cat.name"
          />
        </el-select>
        <el-select
          v-model="filterTag"
          placeholder="全部标签"
          class="filter-select"
          @change="handleFilter"
        >
          <el-option label="全部" value="全部" />
          <el-option
            v-for="tag in tags"
            :key="tag.id"
            :label="tag.name"
            :value="tag.name"
          />
        </el-select>
        <el-select
          v-model="filterPriority"
          placeholder="优先级"
          class="filter-select"
          @change="handleFilter"
        >
          <el-option label="全部" value="all" />
          <el-option label="高" value="high" />
          <el-option label="中" value="medium" />
          <el-option label="低" value="low" />
        </el-select>
      </div>
      <div class="filter-right">
        <el-select
          v-model="sortBy"
          placeholder="排序方式"
          class="filter-select"
          @change="handleSort"
        >
          <el-option label="创建时间" value="createdAt" />
          <el-option label="修改时间" value="updatedAt" />
          <el-option label="置顶优先" value="top" />
        </el-select>
        <el-button type="primary" @click="goToAdd" class="add-btn">
          <Plus class="btn-icon" />
          新建笔记
        </el-button>
      </div>
    </div>

    <div v-if="filteredNotes.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <div class="empty-text">暂无笔记</div>
      <div class="empty-desc">点击右上角按钮创建您的第一条笔记</div>
    </div>

    <div v-else class="notes-grid">
      <div
        v-for="note in paginatedNotes"
        :key="note.id"
        class="note-card card-hover animate-slide-in"
        @click="goToDetail(note.id)"
      >
        <div class="card-header">
          <h3 class="note-title">{{ note.title }}</h3>
          <div v-if="note.isTop" class="top-badge">
            📌 置顶
          </div>
        </div>
        
        <p class="note-preview">{{ truncateContent(note.content) }}</p>
        
        <div class="card-meta">
          <div class="meta-left">
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
          <span class="update-time">{{ formatDate(note.updatedAt) }}</span>
        </div>
        
        <div class="card-tags">
          <span
            v-for="tag in note.tags.slice(0, 3)"
            :key="tag"
            class="note-tag"
            @click.stop="handleTagClick(tag)"
          >
            {{ tag }}
          </span>
          <span v-if="note.tags.length > 3" class="more-tags">
            +{{ note.tags.length - 3 }}
          </span>
        </div>
        
        <div class="card-actions">
          <button class="action-btn edit" @click.stop="goToEdit(note.id)">
            <Edit class="action-icon" />
            编辑
          </button>
          <button
            class="action-btn"
            :class="note.isTop ? 'unpin' : 'pin'"
            @click.stop="handleToggleTop(note.id)"
          >
            📌 {{ note.isTop ? '取消置顶' : '置顶' }}
          </button>
          <button class="action-btn delete" @click.stop="handleDelete(note.id)">
            <Delete class="action-icon" />
            删除
          </button>
        </div>
      </div>
    </div>

    <div v-if="filteredNotes.length > 0" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="filteredNotes.length"
        :page-sizes="[5, 10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useNoteStore } from '../stores/note'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const noteStore = useNoteStore()
const authStore = useAuthStore()

const currentUser = computed(() => authStore.currentUser?.username || '用户')

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const todayDate = computed(() => {
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]}`
})

const notes = computed(() => noteStore.notes)
const topNotes = computed(() => noteStore.topNotes)
const categories = computed(() => noteStore.categories)
const tags = computed(() => noteStore.tags)

const filterCategory = ref('全部')
const filterTag = ref('全部')
const filterPriority = ref('all')
const sortBy = ref('updatedAt')
const currentPage = ref(1)
const pageSize = ref(10)

const filteredNotes = computed(() => {
  let result = [...notes.value]
  
  if (filterCategory.value !== '全部') {
    result = result.filter(n => n.category === filterCategory.value)
  }
  
  if (filterTag.value !== '全部') {
    result = result.filter(n => n.tags.includes(filterTag.value))
  }
  
  if (filterPriority.value !== 'all') {
    result = result.filter(n => n.priority === filterPriority.value)
  }
  
  if (sortBy.value === 'top') {
    result.sort((a, b) => (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0))
  } else {
    result.sort((a, b) => new Date(b[sortBy.value]) - new Date(a[sortBy.value]))
  }
  
  return result
})

const paginatedNotes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredNotes.value.slice(start, end)
})

onMounted(() => {
  initFilters()
})

watch(() => route.query, () => {
  initFilters()
}, { deep: true })

function initFilters() {
  if (route.query.category) {
    filterCategory.value = route.query.category
  } else {
    filterCategory.value = '全部'
  }
  if (route.query.tag) {
    filterTag.value = route.query.tag
  } else {
    filterTag.value = '全部'
  }
  if (route.query.keyword) {
    const searchResult = noteStore.searchNotes(route.query.keyword)
    filterCategory.value = '全部'
    filterTag.value = '全部'
    router.push({ path: '/' })
  }
  currentPage.value = 1
}

function goToAdd() {
  router.push('/add')
}

function goToDetail(id) {
  router.push(`/note/${id}`)
}

function goToEdit(id) {
  router.push(`/edit/${id}`)
}

function handleDelete(id) {
  noteStore.deleteNote(id)
  ElMessage.success('笔记已移入回收站')
}

function handleToggleTop(id) {
  noteStore.toggleTop(id)
  ElMessage.success('置顶状态已更新')
}

function handleTagClick(tag) {
  filterTag.value = tag
}

function handleFilter() {
  currentPage.value = 1
}

function handleSort() {
  currentPage.value = 1
}

function handleSizeChange(val) {
  pageSize.value = val
  currentPage.value = 1
}

function handlePageChange(val) {
  currentPage.value = val
}

function truncateContent(content, maxLength = 120) {
  if (!content) return ''
  return content.length > maxLength ? content.slice(0, maxLength) + '...' : content
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`

  return date.toLocaleDateString('zh-CN')
}

function getCategoryColor(category) {
  const cat = categories.value.find(c => c.name === category)
  return cat ? cat.color : '#909399'
}

function getPriorityText(priority) {
  const map = { high: '高', medium: '中', low: '低' }
  return map[priority] || '中'
}
</script>

<style scoped>
.welcome-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, rgba(32, 189, 153, 0.08) 0%, rgba(76, 175, 80, 0.05) 100%);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(32, 189, 153, 0.15);
  position: relative;
  overflow: hidden;
}

.welcome-bar::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(32, 189, 153, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.welcome-left {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.user-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #20BD99 0%, #1ABC9C 100%);
  color: white;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(32, 189, 153, 0.3);
}

.welcome-greeting {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.welcome-sub {
  font-size: 13px;
  color: var(--text-secondary);
}

.welcome-date {
  font-size: 14px;
  color: var(--text-secondary);
  position: relative;
  z-index: 1;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.blue {
  background: rgba(32, 189, 153, 0.1);
}

.stat-icon.green {
  background: rgba(76, 175, 80, 0.1);
}

.stat-icon.orange {
  background: rgba(255, 183, 77, 0.1);
}

.stat-icon.purple {
  background: rgba(116, 130, 137, 0.1);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.filter-left,
.filter-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-select {
  width: 140px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-icon {
  font-size: 16px;
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

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.note-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.note-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: var(--shadow-lg);
  border-color: rgba(32, 189, 153, 0.3);
}

.note-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(32, 189, 153, 0.05), transparent);
  transform: skewX(-25deg);
  transition: left 0.7s ease;
}

.note-card:hover::after {
  left: 200%;
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

.top-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  font-size: 12px;
  border-radius: var(--radius-sm);
}

.note-preview {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.meta-left {
  display: flex;
  gap: 8px;
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

.update-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.note-tag {
  padding: 3px 8px;
  background: rgba(32, 189, 153, 0.1);
  color: var(--primary-color);
  font-size: 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.note-tag:hover {
  background: rgba(32, 189, 153, 0.2);
  transform: translateY(-2px);
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

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 13px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
  background: transparent;
}

.action-btn:hover {
  background: var(--sidebar-hover);
}

.action-btn.edit:hover {
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.1);
}

.action-btn.pin:hover {
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.1);
}

.action-btn.unpin:hover {
  color: #909399;
  background: rgba(144, 147, 153, 0.1);
}

.action-btn.delete:hover {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
}

.action-icon {
  font-size: 14px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.el-pagination {
  background: var(--card-bg);
  padding: 12px 24px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
</style>
