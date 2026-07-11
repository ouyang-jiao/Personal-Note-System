<template>
  <div v-if="!isLoggedIn" class="auth-page">
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </div>
  <div v-else class="app-container" :class="{ dark: isDark }">
    <Sidebar />
    <main class="main-content" :class="{ dark: isDark }">
      <Header />
      <div class="page-wrapper">
        <transition name="fade" mode="out-in">
          <router-view />
        </transition>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, watch, onMounted, ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import { useNoteStore } from './stores/note'
import { useAuthStore } from './stores/auth'

const noteStore = useNoteStore()
const authStore = useAuthStore()

const isDark = computed(() => noteStore.settings.theme === 'dark')
const isLoggedIn = ref(false)

function checkLoginStatus() {
  isLoggedIn.value = authStore.isLoggedIn
}

function updateBodyClass() {
  if (isDark.value) {
    document.body.classList.add('dark')
  } else {
    document.body.classList.remove('dark')
  }
}

onMounted(() => {
  authStore.init()
  checkLoginStatus()
  updateBodyClass()
})

watch(isDark, () => {
  updateBodyClass()
})

watch(() => authStore.isLoggedIn, () => {
  checkLoginStatus()
})
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background: var(--bg-page);
  transition: all 0.3s ease;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
}

.page-wrapper {
  flex: 1;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
