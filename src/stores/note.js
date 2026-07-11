import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'notebook_data'

function loadData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch {}
  return getDefaultData()
}

function getDefaultData() {
  return {
    notes: [
      {
        id: '1',
        title: '欢迎使用个人笔记',
        content: '这是您的第一条笔记！\n\n您可以：\n- 创建新笔记\n- 添加分类和标签\n- 置顶重要笔记\n- 搜索和筛选笔记\n\n祝您使用愉快！',
        category: '学习笔记',
        tags: ['欢迎', '入门'],
        priority: 'high',
        isTop: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: '项目开发计划',
        content: '本周开发计划：\n\n1. 完成笔记编辑功能\n2. 实现分类管理\n3. 添加标签系统\n4. 测试数据持久化',
        category: '工作记录',
        tags: ['计划', '开发'],
        priority: 'medium',
        isTop: false,
        isDeleted: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    categories: [
      { id: '1', name: '学习笔记', color: '#409EFF', createdAt: new Date().toISOString() },
      { id: '2', name: '工作记录', color: '#67C23A', createdAt: new Date().toISOString() },
      { id: '3', name: '生活感悟', color: '#E6A23C', createdAt: new Date().toISOString() },
      { id: '4', name: '技术文档', color: '#909399', createdAt: new Date().toISOString() },
      { id: '5', name: '待办事项', color: '#F56C6C', createdAt: new Date().toISOString() }
    ],
    tags: [
      { id: '1', name: '欢迎', color: '#409EFF' },
      { id: '2', name: '入门', color: '#67C23A' },
      { id: '3', name: '计划', color: '#E6A23C' },
      { id: '4', name: '开发', color: '#909399' },
      { id: '5', name: '重要', color: '#F56C6C' }
    ],
    settings: {
      theme: 'light',
      pageSize: 10,
      autoSave: true,
      defaultCategory: '学习笔记'
    }
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const useNoteStore = defineStore('note', () => {
  const data = ref(loadData())
  
  const notes = computed(() => data.value.notes.filter(n => !n.isDeleted))
  const deletedNotes = computed(() => data.value.notes.filter(n => n.isDeleted))
  const categories = computed(() => data.value.categories)
  const tags = computed(() => data.value.tags)
  const settings = computed(() => data.value.settings)

  const topNotes = computed(() => notes.value.filter(n => n.isTop))
  const normalNotes = computed(() => notes.value.filter(n => !n.isTop))

  function save() {
    saveData(data.value)
  }

  function addNote(note) {
    const newNote = {
      id: Date.now().toString(),
      ...note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    data.value.notes.unshift(newNote)
    save()
    return newNote
  }

  function updateNote(id, updates) {
    const index = data.value.notes.findIndex(n => n.id === id)
    if (index !== -1) {
      data.value.notes[index] = {
        ...data.value.notes[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      save()
      return data.value.notes[index]
    }
    return null
  }

  function deleteNote(id) {
    const index = data.value.notes.findIndex(n => n.id === id)
    if (index !== -1) {
      data.value.notes[index].isDeleted = true
      data.value.notes[index].updatedAt = new Date().toISOString()
      save()
      return true
    }
    return false
  }

  function restoreNote(id) {
    const index = data.value.notes.findIndex(n => n.id === id)
    if (index !== -1) {
      data.value.notes[index].isDeleted = false
      data.value.notes[index].updatedAt = new Date().toISOString()
      save()
      return true
    }
    return false
  }

  function permanentDelete(id) {
    const index = data.value.notes.findIndex(n => n.id === id)
    if (index !== -1) {
      data.value.notes.splice(index, 1)
      save()
      return true
    }
    return false
  }

  function clearRecycle() {
    data.value.notes = data.value.notes.filter(n => !n.isDeleted)
    save()
  }

  function toggleTop(id) {
    const note = data.value.notes.find(n => n.id === id)
    if (note) {
      note.isTop = !note.isTop
      note.updatedAt = new Date().toISOString()
      save()
    }
  }

  function getNoteById(id) {
    return data.value.notes.find(n => n.id === id)
  }

  function addCategory(category) {
    const newCategory = {
      id: Date.now().toString(),
      ...category,
      createdAt: new Date().toISOString()
    }
    data.value.categories.push(newCategory)
    save()
    return newCategory
  }

  function updateCategory(id, updates) {
    const index = data.value.categories.findIndex(c => c.id === id)
    if (index !== -1) {
      data.value.categories[index] = { ...data.value.categories[index], ...updates }
      save()
      return data.value.categories[index]
    }
    return null
  }

  function deleteCategory(id) {
    const category = data.value.categories.find(c => c.id === id)
    if (category) {
      data.value.notes.forEach(note => {
        if (note.category === category.name) {
          note.category = '未分类'
        }
      })
      data.value.categories = data.value.categories.filter(c => c.id !== id)
      save()
      return true
    }
    return false
  }

  function addTag(tag) {
    const newTag = {
      id: Date.now().toString(),
      ...tag
    }
    data.value.tags.push(newTag)
    save()
    return newTag
  }

  function updateTag(id, updates) {
    const index = data.value.tags.findIndex(t => t.id === id)
    if (index !== -1) {
      const oldName = data.value.tags[index].name
      data.value.tags[index] = { ...data.value.tags[index], ...updates }
      if (updates.name && updates.name !== oldName) {
        data.value.notes.forEach(note => {
          note.tags = note.tags.map(t => t === oldName ? updates.name : t)
        })
      }
      save()
      return data.value.tags[index]
    }
    return null
  }

  function deleteTag(id) {
    const tag = data.value.tags.find(t => t.id === id)
    if (tag) {
      data.value.notes.forEach(note => {
        note.tags = note.tags.filter(t => t !== tag.name)
      })
      data.value.tags = data.value.tags.filter(t => t.id !== id)
      save()
      return true
    }
    return false
  }

  function updateSettings(newSettings) {
    data.value.settings = { ...data.value.settings, ...newSettings }
    save()
  }

  function getNotesByCategory(category) {
    if (category === '全部') return notes.value
    return notes.value.filter(n => n.category === category)
  }

  function getNotesByTag(tag) {
    return notes.value.filter(n => n.tags.includes(tag))
  }

  function searchNotes(keyword) {
    if (!keyword) return notes.value
    const lowerKeyword = keyword.toLowerCase()
    return notes.value.filter(n =>
      n.title.toLowerCase().includes(lowerKeyword) ||
      n.content.toLowerCase().includes(lowerKeyword)
    )
  }

  function getNotesByPriority(priority) {
    if (priority === 'all') return notes.value
    return notes.value.filter(n => n.priority === priority)
  }

  return {
    notes,
    deletedNotes,
    categories,
    tags,
    settings,
    topNotes,
    normalNotes,
    addNote,
    updateNote,
    deleteNote,
    restoreNote,
    permanentDelete,
    clearRecycle,
    toggleTop,
    getNoteById,
    addCategory,
    updateCategory,
    deleteCategory,
    addTag,
    updateTag,
    deleteTag,
    updateSettings,
    getNotesByCategory,
    getNotesByTag,
    searchNotes,
    getNotesByPriority
  }
})
