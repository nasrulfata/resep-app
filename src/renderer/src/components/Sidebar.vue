<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ref, watch } from 'vue'

defineProps<{
  isOpen?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

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

// Close sidebar on mobile when route changes
watch(() => router.currentRoute.value.path, () => {
  emit('close')
})
</script>

<template>
  <!-- Mobile Backdrop overlay -->
  <div v-if="isOpen" class="sidebar-overlay" @click="emit('close')"></div>

  <div class="sidebar" :class="{ collapsed: isCollapsed, 'mobile-open': isOpen }">
    <div class="logo">
      <h2 v-if="!isCollapsed">🍳 Resep App</h2>
      <h2 v-else class="logo-collapsed">R</h2>
      <button v-if="isCollapsed" class="toggle-btn desktop-only" @click="toggleSidebar" title="Buka menu">➡️</button>
      <button v-else class="toggle-btn desktop-only" @click="toggleSidebar" title="Tutup menu">⬅️</button>
      <button class="close-btn mobile-only" @click="emit('close')">✕</button>
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
        <span class="label" :class="{ 'desktop-hidden': isCollapsed }">{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 998;
}

.sidebar {
  width: 250px;
  background: linear-gradient(135deg, #312e81 0%, #4338ca 45%, #7c3aed 100%);
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  box-shadow: 10px 0 30px rgba(49, 46, 129, 0.25);
  transition: width 0.3s ease, transform 0.3s ease;
  position: relative;
  z-index: 999;
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

.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .sidebar-overlay {
    display: block;
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .sidebar {
    width: 250px !important;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%);
    box-shadow: 15px 0 40px rgba(15, 23, 42, 0.3);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .logo {
    padding: 1.2rem 1rem;
  }

  .logo h2 {
    display: block !important;
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.16);
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    padding: 0.35rem 0.6rem;
    border-radius: 50%;
    transition: background 0.3s;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.28);
  }

  .menu {
    padding: 0.8rem 0.7rem;
  }

  .menu-item {
    padding: 0.85rem 0.95rem;
    justify-content: flex-start;
    gap: 0.8rem;
    border-radius: 14px;
  }

  .label {
    display: block !important;
  }
  
  .desktop-hidden {
    display: block !important;
  }
}
</style>
