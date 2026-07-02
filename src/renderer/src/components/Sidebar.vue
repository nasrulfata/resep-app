<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ref } from 'vue'

const router = useRouter()
const auth = useAuthStore()
const isCollapsed = ref(false)

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊', roles: ['admin', 'user'] },
  { label: 'Master Barang', path: '/barang', icon: '📦', roles: ['admin', 'user'] },
  { label: 'Input Resep', path: '/resep/create', icon: '📝', roles: ['admin', 'user'] },
  { label: 'Daftar Resep', path: '/resep', icon: '📋', roles: ['admin', 'user'] },
  { label: 'Profil', path: '/profil', icon: '👤', roles: ['admin', 'user'] },
  { label: 'Laporan & Backup', path: '/laporan', icon: '📈', roles: ['admin'] }
]

const filteredMenu = menuItems.filter(item => item.roles.includes(auth.user?.role || 'user'))

const isActive = (path: string) => router.currentRoute.value.path === path

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="logo">
      <h2 v-if="!isCollapsed">🍳 Resep App</h2>
      <h2 v-else class="logo-collapsed">R</h2>
      <button v-if="isCollapsed" class="toggle-btn" @click="toggleSidebar" title="Buka menu">➡️</button>
      <button v-else class="toggle-btn" @click="toggleSidebar" title="Tutup menu">⬅️</button>
    </div>
    <nav class="menu">
      <router-link
        v-for="item in filteredMenu"
        :key="item.path"
        :to="item.path"
        :class="['menu-item', { active: isActive(item.path) }]"
        :title="isCollapsed ? item.label : ''"
      >
        <span class="icon">{{ item.icon }}</span>
        <span v-if="!isCollapsed" class="label">{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.sidebar {
  width: 250px;
  background: linear-gradient(135deg, #312e81 0%, #4338ca 45%, #7c3aed 100%);
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  box-shadow: 10px 0 30px rgba(49, 46, 129, 0.25);
  transition: width 0.3s ease;
  position: relative;
}

.sidebar.collapsed {
  width: 84px;
}

.logo {
  padding: 1.2rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.logo h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.logo-collapsed {
  font-size: 1.2rem;
  font-weight: 700;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.16);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  transition: background 0.3s, transform 0.2s;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.28);
  transform: scale(1.04);
}

.menu {
  flex: 1;
  padding: 0.8rem 0.7rem;
  overflow-y: auto;
  display: grid;
  gap: 0.35rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.85rem 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: all 0.25s ease;
  border-radius: 14px;
  white-space: nowrap;
  font-weight: 600;
}

.sidebar.collapsed .menu-item {
  padding: 0.82rem;
  justify-content: center;
  gap: 0;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.16);
  color: white;
  transform: translateX(2px);
}

.menu-item.active {
  background: rgba(255, 255, 255, 0.24);
  color: white;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}

.icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.label {
  font-weight: 600;
  flex: 1;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 74px;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 999;
  }

  .sidebar.collapsed {
    width: 74px;
  }

  .logo {
    padding: 0.9rem 0.6rem;
  }

  .logo h2 {
    display: none;
  }

  .logo-collapsed {
    display: block;
  }

  .toggle-btn {
    display: none;
  }

  .menu {
    padding: 0.6rem 0.45rem;
  }

  .menu-item {
    padding: 0.8rem;
    justify-content: center;
    gap: 0;
    border-radius: 12px;
  }

  .label {
    display: none;
  }
}
</style>
