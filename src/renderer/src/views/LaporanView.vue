<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useResepStore } from '../stores/resep'
import { useBarangStore } from '../stores/barang'
import { usePenjualanStore } from '../stores/penjualan'

const resepStore = useResepStore()
const barangStore = useBarangStore()
const penjualanStore = usePenjualanStore()

onMounted(async () => {
  await resepStore.fetchResep()
  await barangStore.fetchBarang()
  await penjualanStore.fetchPenjualan()
})

const stats = computed(() => ({
  totalResep: resepStore.items.length,
  totalBarang: barangStore.items.length,
  totalHargaResep: resepStore.items.reduce((sum, r) => sum + r.totalHarga, 0),
  totalStokBarang: barangStore.items.reduce((sum, b) => sum + b.stok, 0)
}))

const salesStats = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Filter sales for the current month
  const thisMonthSales = penjualanStore.items.filter(sale => {
    if (!sale.tanggal) return false
    const date = new Date(sale.tanggal)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const totalPorsiTerjual = thisMonthSales.reduce((sum, s) => sum + s.jumlah, 0)
  const totalPendapatan = thisMonthSales.reduce((sum, s) => sum + s.totalHarga, 0)
  const totalKeuntungan = thisMonthSales.reduce((sum, s) => sum + s.keuntungan, 0)

  // Aggregate item types sold
  const itemsMap: Record<string, { nama: string; jumlah: number; totalHarga: number; keuntungan: number }> = {}
  for (const sale of thisMonthSales) {
    const key = `${sale.resepId}-${sale.namaResep}`
    if (!itemsMap[key]) {
      itemsMap[key] = {
        nama: sale.namaResep,
        jumlah: 0,
        totalHarga: 0,
        keuntungan: 0
      }
    }
    itemsMap[key].jumlah += sale.jumlah
    itemsMap[key].totalHarga += sale.totalHarga
    itemsMap[key].keuntungan += sale.keuntungan
  }

  const itemsSold = Object.values(itemsMap).sort((a, b) => b.jumlah - a.jumlah)

  return {
    totalPorsiTerjual,
    totalPendapatan,
    totalKeuntungan,
    itemsSold
  }
})

const exportResepAsCSV = () => {
  if (resepStore.items.length === 0) {
    alert('Tidak ada data resep untuk diekspor')
    return
  }

  const headers = ['ID', 'Nama Resep', 'Porsi', 'Total HPP', 'HPP Per Porsi', 'Harga Jual', 'Estimasi Keuntungan %']
  const rows = resepStore.items.map(r => [
    r.id,
    r.nama,
    r.porsi,
    r.totalHarga,
    r.hargaPerPorsi,
    r.hargaJual || 0,
    (r.keuntungan || 0).toFixed(2)
  ])

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  downloadCSV(csv, 'resep-laporan.csv')
}

const exportBarangAsCSV = () => {
  if (barangStore.items.length === 0) {
    alert('Tidak ada data barang untuk diekspor')
    return
  }

  const headers = ['ID', 'Nama Barang', 'Jenis', 'Harga', 'Satuan', 'Stok']
  const rows = barangStore.items.map(b => [
    b.id,
    b.nama,
    b.jenis === 'kemasan' ? 'Kemasan' : 'Bahan Baku',
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
    barang: barangStore.items,
    penjualan: penjualanStore.items
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
      if (backup.penjualan) {
        localStorage.setItem('penjualan', JSON.stringify(backup.penjualan))
      }
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
    <h1>📈 Laporan Keuangan & Penjualan</h1>

    <!-- Sales Stats Grid (Bulan Ini) -->
    <div class="stats-title">Metrik Penjualan Bulan Ini</div>
    <div class="stats-grid sales-metrics">
      <div class="stat-card metric-sales">
        <div class="stat-value">{{ salesStats.totalPorsiTerjual }} porsi</div>
        <div class="stat-label">Porsi Terjual</div>
      </div>
      <div class="stat-card metric-revenue">
        <div class="stat-value">Rp {{ salesStats.totalPendapatan.toLocaleString('id-ID') }}</div>
        <div class="stat-label">Pendapatan Kotor</div>
      </div>
      <div class="stat-card metric-profit">
        <div class="stat-value">Rp {{ salesStats.totalKeuntungan.toLocaleString('id-ID') }}</div>
        <div class="stat-label">Keuntungan Bersih</div>
      </div>
      <div class="stat-card metric-margin">
        <div class="stat-value">
          {{ salesStats.totalPendapatan > 0 ? ((salesStats.totalKeuntungan / (salesStats.totalPendapatan - salesStats.totalKeuntungan)) * 100).toFixed(1) : '0' }}%
        </div>
        <div class="stat-label">Margin Keuntungan</div>
      </div>
    </div>

    <!-- Inventory / General Stats -->
    <div class="stats-title">Ringkasan Aset & Data</div>
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
        <div class="stat-label">Total Nilai HPP Resep</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalStokBarang }}</div>
        <div class="stat-label">Total Stok Barang</div>
      </div>
    </div>

    <!-- Resep Terjual Detail -->
    <div class="section">
      <h2>🍳 Detail Resep Terjual (Bulan Ini)</h2>
      <div v-if="salesStats.itemsSold.length" class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Resep</th>
              <th>Jumlah Terjual</th>
              <th>Total Pendapatan</th>
              <th>Total Keuntungan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in salesStats.itemsSold" :key="index">
              <td>{{ index + 1 }}</td>
              <td><strong>{{ item.nama }}</strong></td>
              <td>{{ item.jumlah }} porsi</td>
              <td>Rp {{ item.totalHarga.toLocaleString('id-ID') }}</td>
              <td class="text-profit">Rp {{ item.keuntungan.toLocaleString('id-ID') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty">Belum ada resep terjual bulan ini</div>
    </div>

    <!-- Riwayat Transaksi -->
    <div class="section">
      <h2>📜 Riwayat Transaksi Penjualan</h2>
      <div v-if="penjualanStore.items.length" class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Nama Resep</th>
              <th>Porsi</th>
              <th>Harga Jual/Porsi</th>
              <th>Total Pendapatan</th>
              <th>Total HPP</th>
              <th>Keuntungan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in penjualanStore.items" :key="sale.id">
              <td>{{ sale.tanggal ? new Date(sale.tanggal).toLocaleString('id-ID') : '-' }}</td>
              <td>{{ sale.namaResep }}</td>
              <td>{{ sale.jumlah }}</td>
              <td>Rp {{ sale.hargaJual.toLocaleString('id-ID') }}</td>
              <td>Rp {{ sale.totalHarga.toLocaleString('id-ID') }}</td>
              <td>Rp {{ sale.totalHpp.toLocaleString('id-ID') }}</td>
              <td class="text-profit">Rp {{ sale.keuntungan.toLocaleString('id-ID') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty">Belum ada riwayat transaksi penjualan</div>
    </div>

    <!-- Export Section -->
    <div class="section">
      <h2>📥 Export Data</h2>
      <div class="export-buttons">
        <button class="btn btn-export" @click="exportResepAsCSV">
          📊 Export Resep & HPP (CSV)
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
        Backup berisi semua data resep, barang, and transaksi penjualan.
      </p>
    </div>
  </div>
</template>

<style scoped>
.laporan-container {
  width: 100%;
}

h1 {
  margin-bottom: 1.5rem;
  color: #1f2937;
  font-size: clamp(1.3rem, 5vw, 1.8rem);
  font-weight: 700;
}

h2 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #1e293b;
  border-bottom: 2px solid #6366f1;
  padding-bottom: 0.5rem;
  font-weight: 700;
}

.stats-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #4b5563;
  margin: 1.5rem 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.2rem;
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
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.35rem;
  word-break: break-word;
}

.stat-label {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Sales Metric Highlights */
.sales-metrics .stat-card {
  border-left: 5px solid #cbd5e1;
}

.sales-metrics .metric-sales {
  border-left-color: #6366f1;
}
.sales-metrics .metric-sales .stat-value {
  color: #4f46e5;
}

.sales-metrics .metric-revenue {
  border-left-color: #f59e0b;
}
.sales-metrics .metric-revenue .stat-value {
  color: #d97706;
}

.sales-metrics .metric-profit {
  border-left-color: #10b981;
}
.sales-metrics .metric-profit .stat-value {
  color: #059669;
}

.sales-metrics .metric-margin {
  border-left-color: #8b5cf6;
}
.sales-metrics .metric-margin .stat-value {
  color: #7c3aed;
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
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  font-size: 0.9rem;
}

.btn-export {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  flex: 1;
  min-width: 180px;
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.28);
}

.btn-backup {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  flex: 1;
  min-width: 180px;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2);
}

.btn-backup:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.28);
}

.btn-restore {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  color: white;
  flex: 1;
  min-width: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(245, 158, 11, 0.2);
}

.btn-restore:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(245, 158, 11, 0.28);
}

.info {
  color: #94a3b8;
  font-size: 0.85rem;
  margin: 0;
}

.table-container {
  overflow-x: auto;
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.table thead {
  background: #f8fafc;
}

.table th,
.table td {
  padding: 0.85rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

.table th {
  font-weight: 700;
  color: #312e81;
}

.table tbody tr:hover {
  background: #f8fafc;
}

.text-profit {
  color: #059669;
  font-weight: 700;
}

.empty {
  padding: 2rem 1rem;
  text-align: center;
  color: #64748b;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}

/* Mobile Responsive */
@media (max-width: 768px) {
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
    border-radius: 12px;
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

  .table {
    font-size: 0.85rem;
  }

  .table th,
  .table td {
    padding: 0.65rem;
  }
}
</style>
