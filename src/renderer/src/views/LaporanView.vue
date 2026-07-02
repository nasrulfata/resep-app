<script setup lang="ts">
import { computed } from 'vue'
import { useResepStore } from '../stores/resep'
import { useBarangStore } from '../stores/barang'

const resepStore = useResepStore()
const barangStore = useBarangStore()

// const filterType = ref<'all' | 'resep' | 'barang'>('all')

const stats = computed(() => ({
  totalResep: resepStore.items.length,
  totalBarang: barangStore.items.length,
  totalHargaResep: resepStore.items.reduce((sum, r) => sum + r.totalHarga, 0),
  totalStokBarang: barangStore.items.reduce((sum, b) => sum + b.stok, 0)
}))

const exportResepAsCSV = () => {
  if (resepStore.items.length === 0) {
    alert('Tidak ada data resep untuk diekspor')
    return
  }

  const headers = ['ID', 'Nama Resep', 'Porsi', 'Total Harga', 'Harga Per Porsi', 'Jumlah Bahan']
  const rows = resepStore.items.map(r => [
    r.id,
    r.nama,
    r.porsi,
    r.totalHarga,
    r.hargaPerPorsi,
    r.bahan.length
  ])

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  downloadCSV(csv, 'resep-laporan.csv')
}

const exportBarangAsCSV = () => {
  if (barangStore.items.length === 0) {
    alert('Tidak ada data barang untuk diekspor')
    return
  }

  const headers = ['ID', 'Nama Barang', 'Harga', 'Satuan', 'Stok']
  const rows = barangStore.items.map(b => [
    b.id,
    b.nama,
    b.harga,
    b.satuan,
    b.stok
  ])

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  downloadCSV(csv, 'barang-laporan.csv')
}

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const backupDatabase = () => {
  const backup = {
    timestamp: new Date().toISOString(),
    resep: resepStore.items,
    barang: barangStore.items
  }

  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `backup-${new Date().toISOString().split('T')[0]}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  alert('Backup database berhasil dibuat!')
}

const restoreDatabase = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const backup = JSON.parse(e.target?.result as string)
      localStorage.setItem('resep', JSON.stringify(backup.resep))
      localStorage.setItem('barang', JSON.stringify(backup.barang))
      alert('Database berhasil di-restore!')
      location.reload()
    } catch (err) {
      alert('Error merestorasi backup: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="laporan-container">
    <h1>📈 Laporan & Backup</h1>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalResep }}</div>
        <div class="stat-label">Total Resep</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalBarang }}</div>
        <div class="stat-label">Total Barang</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">Rp {{ stats.totalHargaResep.toLocaleString('id-ID') }}</div>
        <div class="stat-label">Total Harga Resep</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalStokBarang }}</div>
        <div class="stat-label">Total Stok Barang</div>
      </div>
    </div>

    <!-- Export Section -->
    <div class="section">
      <h2>📥 Export Data</h2>
      <div class="export-buttons">
        <button class="btn btn-export" @click="exportResepAsCSV">
          📊 Export Resep (CSV)
        </button>
        <button class="btn btn-export" @click="exportBarangAsCSV">
          📦 Export Barang (CSV)
        </button>
      </div>
    </div>

    <!-- Backup Section -->
    <div class="section">
      <h2>💾 Backup Database</h2>
      <div class="backup-buttons">
        <button class="btn btn-backup" @click="backupDatabase">
          💾 Download Backup
        </button>
        <label class="btn btn-restore">
          📂 Restore Backup
          <input type="file" accept=".json" @change="restoreDatabase" style="display: none" />
        </label>
      </div>
      <p class="info">
        Backup berisi semua data resep dan barang. Anda bisa merestornya kapan saja.
      </p>
    </div>

    <!-- Resep Report -->
    <div class="section">
      <h2>📋 Laporan Resep</h2>
      <div v-if="resepStore.items.length" class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Resep</th>
              <th>Porsi</th>
              <th>Total Harga</th>
              <th>Harga/Porsi</th>
              <th>Bahan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(resep, index) in resepStore.items" :key="resep.id">
              <td>{{ index + 1 }}</td>
              <td>{{ resep.nama }}</td>
              <td>{{ resep.porsi }}</td>
              <td>Rp {{ resep.totalHarga.toLocaleString('id-ID') }}</td>
              <td>Rp {{ resep.hargaPerPorsi.toLocaleString('id-ID') }}</td>
              <td>{{ resep.bahan.length }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty">Belum ada data resep</div>
    </div>

    <!-- Barang Report -->
    <div class="section">
      <h2>📦 Laporan Barang</h2>
      <div v-if="barangStore.items.length" class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Barang</th>
              <th>Harga</th>
              <th>Satuan</th>
              <th>Stok</th>
              <th>Total Nilai</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(barang, index) in barangStore.items" :key="barang.id">
              <td>{{ index + 1 }}</td>
              <td>{{ barang.nama }}</td>
              <td>Rp {{ barang.harga.toLocaleString('id-ID') }}</td>
              <td>{{ barang.satuan }}</td>
              <td>{{ barang.stok }}</td>
              <td>Rp {{ (barang.harga * barang.stok).toLocaleString('id-ID') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty">Belum ada data barang</div>
    </div>
  </div>
</template>

<style scoped>
.laporan-container {
  width: 100%;
}

h1 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: clamp(1.3rem, 5vw, 1.8rem);
}

h2 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #555;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.4rem;
  text-align: center;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  transition: all 0.3s;
}

.stat-card:hover {
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.1);
  transform: translateY(-4px);
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #4338ca;
  margin-bottom: 0.35rem;
  word-break: break-word;
}

.stat-label {
  color: #999;
  font-size: 0.8rem;
}

.section {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.6rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.export-buttons,
.backup-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  font-size: 0.9rem;
}

.btn-export {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  flex: 1;
  min-width: 150px;
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
  font-weight: 600;
  border-radius: 12px;
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.28);
}

.btn-backup {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  flex: 1;
  min-width: 150px;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2);
  font-weight: 600;
  border-radius: 12px;
}

.btn-backup:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.28);
}

.btn-restore {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  color: white;
  flex: 1;
  min-width: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(245, 158, 11, 0.2);
  font-weight: 600;
  border-radius: 12px;
}

.btn-restore:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(245, 158, 11, 0.28);
}

.info {
  color: #999;
  font-size: 0.85rem;
  margin: 0;
}

.table-container {
  overflow-x: auto;
  margin-top: 1rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.table thead {
  background: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
}

.table th,
.table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.table tbody tr:hover {
  background: #f9f9f9;
}

.empty {
  padding: 2rem 1rem;
  text-align: center;
  color: #999;
  background: #f9f9f9;
  border-radius: 5px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .laporan-container {
    width: 100%;
  }

  h1 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 0.95rem;
    margin-bottom: 0.75rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.2rem;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .section {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 6px;
  }

  .export-buttons,
  .backup-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    min-width: auto;
  }

  .btn-export,
  .btn-backup,
  .btn-restore {
    flex: none;
    min-width: auto;
  }

  .info {
    font-size: 0.8rem;
  }

  .table {
    font-size: 0.8rem;
  }

  .table th,
  .table td {
    padding: 0.5rem;
  }

  .empty {
    padding: 1.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
