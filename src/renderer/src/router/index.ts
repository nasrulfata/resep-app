import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import BarangView from '../views/BarangView.vue'
import ResepCreateView from '../views/ResepCreateView.vue'
import ResepListView from '../views/ResepListView.vue'
import ResepDetailView from '../views/ResepDetailView.vue'
import ProfilView from '../views/ProfilView.vue'
import LaporanView from '../views/LaporanView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginView },
    {
      path: '/',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        { path: 'dashboard', component: DashboardView },
        { path: 'barang', component: BarangView },
        { path: 'resep/create', component: ResepCreateView },
        { path: 'resep', component: ResepListView },
        { path: 'resep/:id', component: ResepDetailView },
        { path: 'profil', component: ProfilView },
        { path: 'laporan', component: LaporanView, meta: { requiresAdmin: true } }
      ]
    }
  ]
})

// Navigation guards
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  
  if (to.meta.requiresAuth && !auth.user) {
    next('/login')
  } else if (to.meta.requiresAdmin && auth.user?.role !== 'admin') {
    alert('Anda tidak memiliki akses ke halaman ini')
    next('/dashboard')
  } else {
    next()
  }
})

export default router