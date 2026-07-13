<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useResepStore } from '../stores/resep'
import { usePenjualanStore } from '../stores/penjualan'

const router = useRouter()
const route = useRoute()
const resepStore = useResepStore()
const penjualanStore = usePenjualanStore()

const resep = computed(() => {
  const id = Number(route.params.id)
  return resepStore.getResepById(id)
})

const totalBahan = computed(() => {
  if (!resep.value) return 0
  return resep.value.bahan
    .filter(b => b.jenis !== 'kemasan')
    .reduce((sum, b) => sum + b.subtotal, 0)
})

const totalKemasan = computed(() => {
  if (!resep.value) return 0
  return resep.value.bahan
    .filter(b => b.jenis === 'kemasan')
    .reduce((sum, b) => sum + b.subtotal, 0)
})

const overhead = computed(() => {
  return totalBahan.value * 0.20
})

const penyusutan = computed(() => {
  return totalBahan.value * 0.10
})

const goBack = () => {
  router.push('/resep')
}

// Jual Modal Logic
const showJualModal = ref(false)
const jualPorsi = ref(1)

const openJualModal = () => {
  jualPorsi.value = 1
  showJualModal.value = true
}

const closeJualModal = () => {
  showJualModal.value = false
}

const submitPenjualan = async () => {
  if (!resep.value || jualPorsi.value <= 0) return

  try {
    const hpp = resep.value.hargaPerPorsi || 0
    const hargaJual = resep.value.hargaJual || 0
    const totalHarga = hargaJual * jualPorsi.value
    const totalHpp = hpp * jualPorsi.value
    const keuntungan = totalHarga - totalHpp

    await penjualanStore.addPenjualan({
      resepId: resep.value.id!,
      namaResep: resep.value.nama,
      jumlah: jualPorsi.value,
      hargaJual,
      totalHarga,
      hpp,
      totalHpp,
      keuntungan
    })

    alert(`Berhasil mencatat penjualan ${jualPorsi.value} porsi!`)
    closeJualModal()
  } catch (err) {
    alert('Gagal mencatat penjualan: ' + (err instanceof Error ? err.message : 'Unknown error'))
  }
}
</script>

<template>
  <div class="detail-container">
    <div v-if="resep" class="detail-view">
      <div class="header">
        <button class="btn-back" @click="goBack">← Kembali</button>
        <div class="header-main">
          <h1>{{ resep.nama }}</h1>
          <button class="btn btn-jual" @click="openJualModal">💰 Catat Penjualan</button>
        </div>
      </div>

      <div class="detail-grid">
        <!-- Informasi Resep -->
        <div class="detail-section">
          <h2>📝 Informasi Resep</h2>
          <div class="info-box">
            <div class="info-row">
              <span class="label">Deskripsi:</span>
              <span class="value">{{ resep.deskripsi || 'Tidak ada deskripsi' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Pcs / Cup / Porsi (Output):</span>
              <span class="value">{{ resep.porsi }} pcs/cup/porsi</span>
            </div>
            <div class="info-row">
              <span class="label">Waktu Buat:</span>
              <span class="value">{{ resep.waktuBuat }} menit</span>
            </div>
            <div class="info-row">
              <span class="label">Catatan:</span>
              <span class="value">{{ resep.catatan || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Ringkasan Kalkulasi HPP -->
        <div class="detail-section">
          <h2>📊 Ringkasan HPP & Harga Jual</h2>
          <div class="info-box">
            <div class="info-row">
              <span class="label">Bahan Baku:</span>
              <span class="value">Rp {{ totalBahan.toLocaleString('id-ID') }}</span>
            </div>
            <div class="info-row">
              <span class="label">Overhead (20%):</span>
              <span class="value">Rp {{ overhead.toLocaleString('id-ID') }}</span>
            </div>
            <div class="info-row">
              <span class="label">Penyusutan (10%):</span>
              <span class="value">Rp {{ penyusutan.toLocaleString('id-ID') }}</span>
            </div>
            <div class="info-row">
              <span class="label">Total Kemasan:</span>
              <span class="value">Rp {{ totalKemasan.toLocaleString('id-ID') }}</span>
            </div>
            <div class="info-row highlight-hpp">
              <span class="label">Total HPP 1 Resep:</span>
              <span class="value font-semibold">Rp {{ Math.round(resep.hpp || 0).toLocaleString('id-ID') }}</span>
            </div>
            <div class="info-row">
              <span class="label">Output Resep:</span>
              <span class="value">{{ resep.porsi }} pcs/cup</span>
            </div>
            <div class="info-row highlight-hpp">
              <span class="label">HPP per Pcs/Cup:</span>
              <span class="value">Rp {{ Math.round(resep.hargaPerPorsi || 0).toLocaleString('id-ID') }}</span>
            </div>
            <div class="info-row highlight-price">
              <span class="label">Harga Jual per Pcs/Cup:</span>
              <span class="value">Rp {{ (resep.hargaJual || 0).toLocaleString('id-ID') }}</span>
            </div>
            <div class="info-row highlight-profit">
              <span class="label">Keuntungan:</span>
              <span :class="['profit-badge', (resep.keuntungan || 0) >= 0 ? 'profit-positive' : 'profit-negative']">
                {{ (resep.keuntungan || 0) >= 0 ? '+' : '' }}{{ (resep.keuntungan || 0).toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabel Bahan Baku -->
      <div class="bahan-section">
        <h2>🍳 1. Daftar Bahan Baku</h2>
        <div v-if="resep.bahan.filter(b => b.jenis !== 'kemasan').length" class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Bahan</th>
                <th>Jumlah</th>
                <th>Harga Satuan</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(bahan, idx) in resep.bahan.filter(b => b.jenis !== 'kemasan')" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td>{{ bahan.namaBarang }}</td>
                <td>{{ bahan.jumlah }} {{ bahan.satuan }}</td>
                <td>Rp {{ bahan.hargaSatuan.toLocaleString('id-ID') }}</td>
                <td>Rp {{ bahan.subtotal.toLocaleString('id-ID') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state">Tidak ada bahan baku</div>
      </div>

      <!-- Tabel Kemasan -->
      <div class="bahan-section">
        <h2>📦 2. Daftar Kemasan / Packaging</h2>
        <div v-if="resep.bahan.filter(b => b.jenis === 'kemasan').length" class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kemasan</th>
                <th>Jumlah</th>
                <th>Harga Satuan</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(bahan, idx) in resep.bahan.filter(b => b.jenis === 'kemasan')" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td>{{ bahan.namaBarang }}</td>
                <td>{{ bahan.jumlah }} {{ bahan.satuan }}</td>
                <td>Rp {{ bahan.hargaSatuan.toLocaleString('id-ID') }}</td>
                <td>Rp {{ bahan.subtotal.toLocaleString('id-ID') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state">Tidak ada kemasan</div>
      </div>

      <div class="actions">
        <router-link :to="`/resep/${resep.id}/edit`" class="btn btn-edit">✏️ Edit Resep</router-link>
        <button class="btn btn-back-to-list" @click="goBack">Kembali ke Daftar</button>
      </div>
    </div>

    <div v-else class="not-found">
      <p>Resep tidak ditemukan</p>
      <button class="btn btn-primary" @click="goBack">Kembali</button>
    </div>

    <!-- Jual Modal -->
    <div v-if="showJualModal" class="modal-overlay" @click.self="closeJualModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>💰 Catat Transaksi Penjualan</h3>
          <button class="btn-close" @click="closeJualModal">&times;</button>
        </div>
        <div class="modal-body">
          <p>Masukkan jumlah pcs / cup / porsi resep <strong>{{ resep?.nama }}</strong> yang terjual:</p>
          <div class="form-group">
            <label>Jumlah Terjual (Pcs / Cup / Porsi)</label>
            <input v-model.number="jualPorsi" type="number" min="1" required class="form-control" />
          </div>
          <div class="summary-details">
            <div class="detail-line">
              <span>HPP per Pcs/Cup/Porsi:</span>
              <span>Rp {{ Math.round(resep?.hargaPerPorsi || 0).toLocaleString('id-ID') }}</span>
            </div>
            <div class="detail-line">
              <span>Harga Jual per Pcs/Cup/Porsi:</span>
              <span>Rp {{ (resep?.hargaJual || 0).toLocaleString('id-ID') }}</span>
            </div>
            <div class="detail-line total">
              <span>Total Pendapatan:</span>
              <span>Rp {{ ((resep?.hargaJual || 0) * jualPorsi).toLocaleString('id-ID') }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeJualModal">Batal</button>
          <button class="btn btn-primary" @click="submitPenjualan">Simpan Transaksi</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-container {
  width: 100%;
}

.detail-view {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.header {
  padding: 1.8rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn-back {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 1rem;
  transition: 0.3s;
}

.btn-back:hover {
  background: #e5e7eb;
}

.header h1 {
  margin: 0;
  font-size: clamp(1.4rem, 5vw, 2rem);
  color: #1f2937;
  font-weight: 700;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 1.8rem;
}

.detail-section,
.bahan-section {
  margin-bottom: 1rem;
}

.detail-section h2,
.bahan-section h2 {
  font-size: 1.1rem;
  margin: 0 0 1rem;
  color: #312e81;
  border-bottom: 2px solid #c7d2fe;
  padding-bottom: 0.5rem;
  font-weight: 700;
}

.info-box {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #475569;
}

.value {
  color: #1e293b;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

.highlight-hpp {
  background-color: #faf5ff;
}

.highlight-hpp .value {
  color: #7c3aed;
  font-weight: 700;
}

.highlight-price {
  background-color: #f0fdf4;
}

.highlight-price .value {
  color: #16a34a;
  font-weight: 800;
}

.highlight-profit {
  align-items: center;
}

.profit-badge {
  display: inline-block;
  padding: 0.3rem 0.65rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
}

.profit-positive {
  background-color: #d1fae5;
  color: #065f46;
}

.profit-negative {
  background-color: #fee2e2;
  color: #991b1b;
}

.bahan-section {
  padding: 1.8rem;
  border-top: 1px solid #e2e8f0;
}

.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.table th,
.table td {
  padding: 0.85rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.table th {
  background: #f8fafc;
  color: #312e81;
  font-weight: 700;
}

.table td {
  color: #334155;
}

.table tbody tr:hover {
  background: #f8fafc;
}

.empty-state {
  text-align: center;
  padding: 1.5rem;
  color: #64748b;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}

.actions {
  padding: 1.8rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-edit {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2);
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.28);
}

.btn-jual {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
}

.btn-jual:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.28);
}

.btn-back-to-list {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-back-to-list:hover {
  background: #e5e7eb;
}

.not-found {
  padding: 3rem;
  text-align: center;
  background: white;
  border-radius: 18px;
}

/* Jual Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 18px;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: modalEnter 0.3s ease-out;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #1e293b;
  font-weight: 700;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
}

.modal-body {
  padding: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #334155;
}

.form-control {
  width: 100%;
  padding: 0.8rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 1rem;
}

.summary-details {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
  margin-top: 1.25rem;
}

.detail-line {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  font-size: 0.9rem;
  color: #64748b;
}

.detail-line.total {
  border-top: 1.5px solid #cbd5e1;
  padding-top: 0.65rem;
  margin-top: 0.5rem;
  font-weight: 800;
  color: #1e293b;
  font-size: 1.05rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .header-main {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-jual {
    width: 100%;
  }

  .bahan-section {
    padding: 1rem;
  }

  .actions {
    flex-direction: column;
    padding: 1rem;
  }

  .btn {
    width: 100%;
  }
}
</style>
