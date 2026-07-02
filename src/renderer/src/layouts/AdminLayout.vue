<script setup lang="ts">
import Sidebar from '../components/Sidebar.vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const auth = useAuthStore()
const router = useRouter()
const isSidebarOpen = ref(false)

const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="admin-layout">
    <Sidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />
    <div class="main-content">
      <div class="topbar">
        <button class="hamburger-btn" @click="isSidebarOpen = true">☰</button>
        <div class="topbar-right">
          <span class="user-info">{{ auth.user?.nama }}</span>
          <button class="logout-btn" @click="logout">Logout</button>
        </div>
      </div>
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  flex-direction: row;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.hamburger-btn {
  display: none;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #334155;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.hamburger-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.user-info {
  font-weight: 600;
  color: #334155;
  min-width: auto;
}

.logout-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  font-size: 0.9rem;
  box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2);
}

.logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(239, 68, 68, 0.25);
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: transparent;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .topbar {
    padding: 0.75rem 1rem;
    justify-content: space-between; /* Put hamburger on left and logout on right */
  }

  .hamburger-btn {
    display: block;
  }

  .topbar-right {
    gap: 0.5rem;
  }

  .user-info {
    display: none;
  }

  .logout-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .page-content {
    padding: 1rem;
  }
}
</style>
