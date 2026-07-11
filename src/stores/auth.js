import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const AUTH_STORAGE_KEY = 'notebook_auth'

function loadAuthData() {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch {}
  return getDefaultAuthData()
}

function getDefaultAuthData() {
  return {
    users: [
      {
        id: 'default_admin',
        username: 'admin',
        password: '56d4416b',
        createdAt: new Date().toISOString()
      }
    ],
    currentUser: null,
    rememberedUsers: [],
    rememberMe: false
  }
}

function saveAuthData(data) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
}

export const useAuthStore = defineStore('auth', () => {
  const users = ref([])
  const currentUser = ref(null)
  const rememberedUsers = ref([])
  const rememberMe = ref(false)

  const isLoggedIn = computed(() => currentUser.value !== null)

  function init() {
    const data = loadAuthData()
    users.value = data.users || []
    currentUser.value = data.currentUser || null
    rememberedUsers.value = data.rememberedUsers || []
    rememberMe.value = data.rememberMe || false
  }

  function save() {
    saveAuthData({
      users: users.value,
      currentUser: currentUser.value,
      rememberedUsers: rememberedUsers.value,
      rememberMe: rememberMe.value
    })
  }

  function register(username, password, confirmPassword) {
    if (!username || !password || !confirmPassword) {
      return { success: false, message: '请填写完整信息' }
    }

    if (password.length < 6) {
      return { success: false, message: '密码长度至少6位' }
    }

    if (password !== confirmPassword) {
      return { success: false, message: '两次输入的密码不一致' }
    }

    const existingUser = users.value.find(u => u.username === username)
    if (existingUser) {
      return { success: false, message: '用户名已存在' }
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashPassword(password),
      createdAt: new Date().toISOString()
    }

    users.value.push(newUser)
    save()

    return { success: true, message: '注册成功' }
  }

  function login(username, password, remember = false) {
    if (!username || !password) {
      return { success: false, message: '请填写用户名和密码' }
    }

    const user = users.value.find(u => u.username === username)
    if (!user) {
      return { success: false, message: '用户名或密码错误' }
    }

    if (user.password !== hashPassword(password)) {
      return { success: false, message: '用户名或密码错误' }
    }

    const userInfo = {
      id: user.id,
      username: user.username,
      lastLogin: new Date().toISOString()
    }
    
    currentUser.value = userInfo
    
    if (remember) {
      const existingIndex = rememberedUsers.value.findIndex(u => u.username === username)
      if (existingIndex >= 0) {
        rememberedUsers.value[existingIndex] = {
          username: username,
          password: password,
          lastLogin: new Date().toISOString()
        }
      } else {
        rememberedUsers.value.push({
          username: username,
          password: password,
          lastLogin: new Date().toISOString()
        })
      }
    }
    rememberMe.value = remember
    
    save()

    return { success: true, message: '登录成功' }
  }

  function logout() {
    currentUser.value = null
    save()
  }

  function changePassword(oldPassword, newPassword, confirmPassword) {
    if (!currentUser.value) {
      return { success: false, message: '请先登录' }
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      return { success: false, message: '请填写完整信息' }
    }

    if (newPassword.length < 6) {
      return { success: false, message: '新密码长度至少6位' }
    }

    if (newPassword !== confirmPassword) {
      return { success: false, message: '两次输入的新密码不一致' }
    }

    const user = users.value.find(u => u.id === currentUser.value.id)
    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    if (user.password !== hashPassword(oldPassword)) {
      return { success: false, message: '原密码错误' }
    }

    user.password = hashPassword(newPassword)
    save()

    return { success: true, message: '密码修改成功' }
  }

  function getUsers() {
    return users.value.map(u => ({ id: u.id, username: u.username, createdAt: u.createdAt }))
  }

  function hashPassword(password) {
    let hash = 0
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(16)
  }

  return {
    users,
    currentUser,
    rememberedUsers,
    rememberMe,
    isLoggedIn,
    init,
    register,
    login,
    logout,
    changePassword,
    getUsers,
    save
  }
})