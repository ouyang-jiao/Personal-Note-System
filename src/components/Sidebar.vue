<template>
  <aside class="sidebar" :class="{ dark: isDark }">
    <div class="sidebar-glow"></div>
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">📝</span>
        <span class="logo-text">个人笔记</span>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <el-menu
        :default-active="activeMenu"
        mode="vertical"
        class="sidebar-menu"
        background-color="transparent"
        text-color="#748289"
        active-text-color="#20BD99"
        router
      >
        <el-menu-item 
          v-for="(item, index) in menuItems" 
          :key="item.path" 
          :index="item.path"
          :style="{ animationDelay: `${index * 0.1}s` }"
          class="menu-item-animated"
        >
          <component :is="item.icon" class="menu-icon" />
          <span class="menu-text">{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </nav>

    <div class="sidebar-footer">
      <div class="category-nav">
        <div class="nav-title">分类导航</div>
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="category-item"
          :class="{ active: activeCategory === cat.name }"
          @click="handleCategoryClick(cat.name)"
        >
          <span class="cat-dot" :style="{ backgroundColor: cat.color }"></span>
          <span class="cat-name">{{ cat.name }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeFilled,
  Plus,
  FolderOpened,
  Document,
  Delete,
  Setting,
  PieChart
} from '@element-plus/icons-vue'
import { useNoteStore } from '../stores/note'

const route = useRoute()
const router = useRouter()
const noteStore = useNoteStore()

const isDark = computed(() => noteStore.settings.theme === 'dark')

const menuItems = [
  { path: '/', title: '知识库总览', icon: HomeFilled },
  { path: '/dashboard', title: '数据看板', icon: PieChart },
  { path: '/add', title: '新建笔记', icon: Plus },
  { path: '/category', title: '分类管理', icon: FolderOpened },
  { path: '/tag', title: '标签管理', icon: Document },
  { path: '/recycle', title: '回收站', icon: Delete },
  { path: '/settings', title: '系统设置', icon: Setting }
]

const categories = computed(() => noteStore.categories)

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/edit') || path.startsWith('/note')) {
    return '/'
  }
  return path
})

const activeCategory = computed(() => {
  return route.query.category || ''
})

function handleCategoryClick(category) {
  router.push({ path: '/', query: { category } })
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: linear-gradient(180deg, #FFFFFF 0%, #F3FAF8 100%);
  box-shadow: 4px 0 20px rgba(32, 189, 153, 0.08), 1px 0 4px rgba(32, 189, 153, 0.04);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(32, 189, 153, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.sidebar::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -30%;
  width: 80%;
  height: 80%;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.04) 0%, transparent 60%);
  pointer-events: none;
}

.sidebar.dark {
  background: linear-gradient(180deg, #1A2E28 0%, #152620 100%);
  box-shadow: 4px 0 20px rgba(32, 189, 153, 0.12), 1px 0 4px rgba(32, 189, 153, 0.06);
}

.sidebar.dark::before {
  background: radial-gradient(circle, rgba(32, 189, 153, 0.1) 0%, transparent 70%);
}

.sidebar.dark::after {
  background: radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 60%);
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(32, 189, 153, 0.1);
  animation: slideInLeft 0.4s ease-out;
  position: relative;
  z-index: 1;
}

.sidebar.dark .sidebar-header {
  border-bottom-color: rgba(32, 189, 153, 0.15);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
  animation: float 4s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(32, 189, 153, 0.2));
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #20BD99 0%, #1ABC9C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.logo-text::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #20BD99 0%, #1ABC9C 100%);
  transition: width 0.5s ease;
}

.logo:hover .logo-text::after {
  width: 100%;
}

.sidebar.dark .logo-text {
  background: linear-gradient(135deg, #4DD0AB 0%, #20BD99 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar.dark .logo-text::after {
  background: linear-gradient(90deg, #4DD0AB 0%, #20BD99 100%);
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  position: relative;
  z-index: 1;
}

.sidebar-menu {
  border-right: none;
}

.menu-icon {
  font-size: 16px;
  width: 22px;
  text-align: center;
  transition: all 0.3s ease;
}

.el-menu-item {
  margin: 6px 12px;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.el-menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(32, 189, 153, 0.1), transparent);
  transition: left 0.6s ease;
}

.el-menu-item:hover::before {
  left: 100%;
}

.el-menu-item:hover {
  background: rgba(32, 189, 153, 0.08);
  transform: translateX(6px);
}

.el-menu-item:hover .menu-icon {
  transform: scale(1.15);
  color: #20BD99;
}

.sidebar.dark .el-menu-item:hover {
  background: rgba(32, 189, 153, 0.15);
}

.el-menu-item.is-active {
  background: linear-gradient(135deg, rgba(32, 189, 153, 0.15) 0%, rgba(32, 189, 153, 0.08) 100%) !important;
  border-left: 3px solid #20BD99;
}

.el-menu-item.is-active .menu-icon {
  color: #20BD99;
  animation: pulse-glow 2s ease-in-out infinite;
}

.sidebar.dark .el-menu-item.is-active {
  background: linear-gradient(135deg, rgba(32, 189, 153, 0.2) 0%, rgba(32, 189, 153, 0.1) 100%) !important;
}

.sidebar-footer {
  padding: 20px 16px;
  border-top: 1px solid rgba(32, 189, 153, 0.1);
  position: relative;
  z-index: 1;
}

.sidebar.dark .sidebar-footer {
  border-top-color: rgba(32, 189, 153, 0.15);
}

.category-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-title {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 8px;
  padding-left: 4px;
  position: relative;
}

.nav-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 12px;
  background: linear-gradient(180deg, #20BD99 0%, #1ABC9C 100%);
  border-radius: 2px;
}

.sidebar.dark .nav-title {
  color: var(--text-secondary);
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
}

.category-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, #20BD99 0%, #1ABC9C 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar.dark .category-item {
  color: var(--text-primary);
}

.category-item:hover {
  background: rgba(32, 189, 153, 0.08);
  transform: translateX(6px);
}

.category-item:hover::after {
  opacity: 1;
}

.sidebar.dark .category-item:hover {
  background: rgba(32, 189, 153, 0.15);
}

.category-item.active {
  background: linear-gradient(135deg, rgba(32, 189, 153, 0.12) 0%, rgba(32, 189, 153, 0.06) 100%);
  color: #20BD99;
  transform: translateX(4px);
}

.category-item.active::after {
  opacity: 1;
}

.cat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-item:hover .cat-dot {
  transform: scale(1.3);
}

.category-item.active .cat-dot {
  transform: scale(1.2);
  box-shadow: 0 0 12px rgba(32, 189, 153, 0.4);
}

.cat-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-item-animated {
  animation: menuItemSlideIn 0.5s ease-out forwards;
  opacity: 0;
  transform: translateX(-20px);
}

@keyframes menuItemSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.menu-text {
  position: relative;
}

.el-menu-item:hover .menu-text {
  color: #20BD99;
}

.el-menu-item:hover .menu-text::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #20BD99 0%, #1ABC9C 100%);
  animation: underlineGrow 0.3s ease-out;
}

@keyframes underlineGrow {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

.sidebar-glow {
  position: absolute;
  top: 20%;
  right: -20px;
  width: 40px;
  height: 40px;
  background: radial-gradient(circle, rgba(32, 189, 153, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: glowFloat 6s ease-in-out infinite;
}

@keyframes glowFloat {
  0%, 100% {
    top: 20%;
    opacity: 0.5;
  }
  50% {
    top: 60%;
    opacity: 0.8;
  }
}
</style>
