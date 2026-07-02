<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useResepStore } from '../stores/resep'
import { useBarangStore } from '../stores/barang'
import { computed, onMounted } from 'vue'

const auth = useAuthStore()
const resepStore = useResepStore()
const barangStore = useBarangStore()

onMounted(async () => {
  await resepStore.fetchResep()
  await barangStore.fetchBarang()
})

const stats = computed(() => ({
  totalResep: resepStore.items.length,
  totalBarang: barangStore.items.length,
  averageHargaResep: resepStore.items.length > 0 
    ? resepStore.items.reduce((sum, r) => sum + r.totalHarga, 0) / resepStore.items.length
    : 0
}))
</script>

<template>
  <div class="dashboard">
    <div class="welcome">
      <h1>👋 Selamat Datang, {{ auth.user?.nama }}!</h1>
      <p>Dashboard Aplikasi Resep</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-content">
          <div class="stat-label">Total Resep</div>
          <div class="stat-value">{{ stats.totalResep }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <div class="stat-label">Master Barang</div>
          <div class="stat-value">{{ stats.totalBarang }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-label">Rata-rata Harga Resep</div>
          <div class="stat-value">Rp {{ stats.averageHargaResep.toLocaleString('id-ID') }}</div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h2>⚡ Akses Cepat</h2>
      <div class="action-buttons">
        <router-link to="/resep/create" class="action-btn">
          <span class="icon">📝</span>
          <span class="text">Buat Resep Baru</span>
        </router-link>
        <router-link to="/barang" class="action-btn">
          <span class="icon">📦</span>
          <span class="text">Kelola Barang</span>
        </router-link>
        <router-link to="/resep" class="action-btn">
          <span class="icon">📋</span>
          <span class="text">Lihat Resep</span>
        </router-link>
        <router-link to="/profil" class="action-btn">
          <span class="icon">👤</span>
          <span class="text">Edit Profil</span>
        </router-link>
        <router-link v-if="auth.user?.role === 'admin'" to="/laporan" class="action-btn">
          <span class="icon">📈</span>
          <span class="text">Laporan & Backup</span>
        </router-link>
      </div>
    </div>

    <div class="user-info">
      <h2>👤 Informasi Akun</h2>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Username:</span>
          <span class="info-value">{{ auth.user?.username }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Role:</span>
          <span class="info-value">{{ auth.user?.role === 'admin' ? 'Administrator' : 'User' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  width: 100%;
}

.welcome {
  margin-bottom: 1.5rem;
  padding: 1.6rem 1.8rem;
  border-radius: 20px;
  background: linear-gradient(135deg, #4338ca 0%, #7c3aed 60%, #ec4899 100%);
  color: white;
  box-shadow: 0 18px 40px rgba(99, 102, 241, 0.24);
}

.welcome h1 {
  margin: 0 0 0.5rem 0;
  color: white;
  font-size: clamp(1.3rem, 5vw, 2rem);
  word-break: break-word;
}

.welcome p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.3rem;
  display: flex;
  gap: 1rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  transition: all 0.3s;
}

.stat-card:hover {
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: #4338ca;
  word-break: break-word;
}

.quick-actions,
.user-info {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.4rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.quick-actions h2,
.user-info h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #1f2937;
  border-bottom: 2px solid #6366f1;
  padding-bottom: 0.5rem;
  font-size: clamp(1rem, 4vw, 1.3rem);
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.3s;
  text-align: center;
  box-shadow: 0 10px 24px rgba(99, 102, 241, 0.2);
}

.action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px rgba(99, 102, 241, 0.28);
}

.action-btn .icon {
  font-size: 1.8rem;
}

.action-btn .text {
  font-weight: 600;
  font-size: 0.85rem;
}

.info-box {
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  border-radius: 12px;
  padding: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #475569;
  min-width: 100px;
}

.info-value {
  color: #0f172a;
  text-align: right;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .dashboard {
    padding: 0;
  }

  .welcome h1 {
    font-size: 1.2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    padding: 1rem;
    gap: 0.75rem;
  }

  .stat-icon {
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: 1.2rem;
  }

  .quick-actions {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .quick-actions h2 {
    font-size: 1rem;
    padding-bottom: 0.35rem;
  }

  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .action-btn {
    padding: 0.75rem;
  }

  .action-btn .icon {
    font-size: 1.5rem;
  }

  .action-btn .text {
    font-size: 0.75rem;
  }

  .user-info {
    padding: 1rem;
  }

  .user-info h2 {
    font-size: 1rem;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .info-value {
    text-align: left;
  }
}
</style>