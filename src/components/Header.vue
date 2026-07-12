<template>
  <header class="header" :class="{ dark: isDark }">
    <div class="header-content">
      <div class="header-left">
        <button class="menu-toggle" @click="toggleSidebar">
          <Menu v-if="!sidebarCollapsed" class="toggle-icon" />
          <Expand v-else class="toggle-icon" />
        </button>
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>
      
      <div class="header-right">
        <div class="search-box">
            <Search class="search-icon" />
            <input
              type="text"
              v-model="searchKeyword"
              placeholder="搜索笔记..."
              class="search-input"
              @input="handleSearch"
              @keyup.enter="handleSearch"
            />
          </div>
        
        <div class="header-actions">
          <button class="theme-toggle" @click="toggleTheme" title="切换主题">
            <Sunny v-if="isDark" class="theme-icon" />
            <Moon v-else class="theme-icon" />
          </button>
          <el-badge :value="recycleCount" :hidden="recycleCount === 0">
            <router-link to="/recycle" class="action-btn">
              <Delete class="action-icon" />
            </router-link>
          </el-badge>
          <router-link to="/settings" class="action-btn">
            <Setting class="action-icon" />
          </router-link>
          <div class="user-info">
            <div class="user-name-avatar">{{ displayName.charAt(0).toUpperCase() }}</div>
            <span class="user-name">{{ displayName }}</span>
          </div>
          <button class="action-btn logout-btn" @click="handleLogout" title="退出登录">
            <SwitchButton class="action-icon" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu, Expand, Search, Delete, Setting, Sunny, Moon, SwitchButton } from '@element-plus/icons-vue'
import { useNoteStore } from '../stores/note'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const noteStore = useNoteStore()
const authStore = useAuthStore()

const sidebarCollapsed = ref(false)
const searchKeyword = ref('')

const isDark = computed(() => noteStore.settings.theme === 'dark')

const pageTitle = computed(() => {
  return route.meta.title || '知识库'
})

const recycleCount = computed(() => noteStore.deletedNotes.length)

const displayName = computed(() => authStore.currentUser?.username || '用户')

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function toggleTheme() {
  const newTheme = isDark.value ? 'light' : 'dark'
  noteStore.updateSettings({ theme: newTheme })
}

function handleSearch() {
  const keyword = searchKeyword.value.trim()
  if (keyword) {
    router.push({ path: '/', query: { keyword } })
  } else {
    router.push({ path: '/', query: {} })
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.header {
  height: 64px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  padding: 0 24px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease-out;
}

.header.dark {
  background: rgba(33, 61, 53, 0.85);
  border-bottom-color: var(--border-color);
}

.header-content {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-toggle {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.menu-toggle:hover {
  background: var(--bg-page);
}

.header.dark .menu-toggle:hover {
  background: #2D4A40;
}

.toggle-icon {
  font-size: 20px;
  color: #86909C;
}

.header.dark .toggle-icon {
  color: #646A73;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1D2129;
}

.header.dark .page-title {
  color: #C9CDD4;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 14px;
  color: #86909C;
  width: 16px;
  text-align: center;
}

.header.dark .search-icon {
  color: #646A73;
}

.search-input {
  width: 280px;
  height: 40px;
  padding: 0 12px 0 40px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.15s ease;
  color: var(--text-primary);
}

.header.dark .search-input {
  background: rgba(42, 47, 58, 0.9);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: #20BD99;
  box-shadow: 0 0 0 3px rgba(32, 189, 153, 0.15);
}

.search-input::placeholder {
  color: #86909C;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #86909C;
  cursor: pointer;
  transition: all 0.15s ease;
}

.theme-toggle:hover {
  background: var(--bg-page);
  color: #20BD99;
  transform: scale(1.1);
}

.header.dark .theme-toggle:hover {
  background: #2D4A40;
}

.theme-icon {
  font-size: 18px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  color: #86909C;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: var(--bg-page);
  color: #20BD99;
  transform: scale(1.1);
}

.header.dark .action-btn:hover {
  background: #2D4A40;
}

.action-icon {
  font-size: 18px;
}

.el-badge__content {
  background: #F53F3F;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(32, 189, 153, 0.08);
  transition: all 0.2s ease;
}

.user-info:hover {
  background: rgba(32, 189, 153, 0.15);
}

.header.dark .user-info {
  background: rgba(32, 189, 153, 0.12);
}

.header.dark .user-info:hover {
  background: rgba(32, 189, 153, 0.2);
}

.user-name-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #20BD99 0%, #1ABC9C 100%);
  color: white;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
