import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '知识库总览', icon: 'HomeFilled', requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '数据看板', icon: 'BarChart3', requiresAuth: true }
  },
  {
    path: '/add',
    name: 'AddNote',
    component: () => import('../views/AddNote.vue'),
    meta: { title: '新建笔记', icon: 'Plus', requiresAuth: true }
  },
  {
    path: '/edit/:id',
    name: 'EditNote',
    component: () => import('../views/EditNote.vue'),
    meta: { title: '编辑笔记', icon: 'Edit', requiresAuth: true }
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('../views/Category.vue'),
    meta: { title: '分类管理', icon: 'Folder', requiresAuth: true }
  },
  {
    path: '/tag',
    name: 'Tag',
    component: () => import('../views/Tag.vue'),
    meta: { title: '标签管理', icon: 'Tag', requiresAuth: true }
  },
  {
    path: '/recycle',
    name: 'Recycle',
    component: () => import('../views/Recycle.vue'),
    meta: { title: '回收站', icon: 'Delete', requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { title: '系统设置', icon: 'Setting', requiresAuth: true }
  },
  {
    path: '/note/:id',
    name: 'NoteDetail',
    component: () => import('../views/NoteDetail.vue'),
    meta: { title: '笔记详情', icon: 'Document', requiresAuth: true }
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 个人笔记与知识库` : '个人笔记与知识库'
  
  const authStore = useAuthStore()
  authStore.init()
  
  const isLoggedIn = authStore.isLoggedIn
  
  if (to.meta.requiresAuth === false) {
    if (isLoggedIn && to.path !== '/login') {
      next('/')
    } else {
      next()
    }
  } else {
    if (isLoggedIn) {
      next()
    } else {
      next('/login')
    }
  }
})
