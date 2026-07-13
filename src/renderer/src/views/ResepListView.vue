<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useResepStore } from '../stores/resep'
import { usePenjualanStore } from '../stores/penjualan'
import type { Resep } from '../stores/resep'

const router = useRouter()
const resepStore = useResepStore()
const penjualanStore = usePenjualanStore()

onMounted(() => {
  resepStore.fetchResep()
})

const deleteResep = async (id: number) => {
  if (confirm('Hapus resep ini?')) {
    try {
      await resepStore.deleteResep(id)
      alert('Resep berhasil dihapus!')
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }
}

const viewDetail = (resepId: number) => {
  router.push(`/resep/${resepId}`)
}

// Jual Modal Logic
const showJualModal = ref(false)
const selectedResepForJual = ref<Resep | null>(null)
const jualPorsi = ref(1)

const openJualModal = (resep: Resep) => {
  selectedResepForJual.value = resep
  jualPorsi.value = 1
  showJualModal.value = true
}

const closeJualModal = () => {
  showJualModal.value = false
  selectedResepForJual.value = null
}

const submitPenjualan = async () => {
  if (!selectedResepForJual.value || jualPorsi.value <= 0) return

  try {
    const r = selectedResepForJual.value
    const hpp = r.hargaPerPorsi || 0
    const hargaJual = r.hargaJual || 0
    const totalHarga = hargaJual * jualPorsi.value
    const totalHpp = hpp * jualPorsi.value
    const keuntungan = totalHarga - totalHpp

    await penjualanStore.addPenjualan({
      resepId: r.id!,
      namaResep: r.nama,
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
  <div class="resep-list-container">
    <div class="header">
      <h1>📋 Daftar Resep</h1>
      <router-link to="/resep/create" class="btn btn-primary">+ Buat Resep Baru</router-link>
    </div>

    <div v-if="resepStore.loading" class="loading">Loading...</div>

    <div v-if="resepStore.error" class="error">{{ resepStore.error }}</div>

    <div class="cards-container">
      <div v-if="resepStore.items.length" class="cards">
        <div v-for="resep in resepStore.items" :key="resep.id" class="card">
          <div class="card-header">
            <h3>{{ resep.nama }}</h3>
            <span class="badge">{{ resep.porsi }} Pcs/Cup/Porsi</span>
          </div>
          <div class="card-body">
            <p class="description">{{ resep.deskripsi }}</p>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">HPP/Pcs/Cup/Porsi:</span>
                <span class="value">Rp {{ Math.round(resep.hargaPerPorsi || 0).toLocaleString('id-ID') }}</span>
              </div>
              <div class="info-item">
                <span class="label">Harga Jual:</span>
                <span class="value highlight-green">Rp {{ (resep.hargaJual || 0).toLocaleString('id-ID') }}</span>
              </div>
              <div class="info-item">
                <span class="label">Keuntungan:</span>
                <span :class="['value', (resep.keuntungan || 0) >= 0 ? 'profit-pos' : 'profit-neg']">
                  {{ (resep.keuntungan || 0) >= 0 ? '+' : '' }}{{ (resep.keuntungan || 0).toFixed(1) }}%
                </span>
              </div>
              <div class="info-item">
                <span class="label">Bahan Baku:</span>
                <span class="value">{{ resep.bahan.filter(b => b.jenis !== 'kemasan').length }} item</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn btn-sm btn-jual" @click="openJualModal(resep)" title="Catat Penjualan">💰 Jual</button>
            <button class="btn btn-sm btn-info" @click="viewDetail(resep.id!)">Detail</button>
            <router-link :to="`/resep/${resep.id}/edit`" class="btn btn-sm btn-edit">Edit</router-link>
            <button class="btn btn-sm btn-delete" @click="deleteResep(resep.id!)">Hapus</button>
          </div>
        </div>
      </div>
      <div v-else class="empty">
        <p>Belum ada resep. <router-link to="/resep/create">Buat resep baru</router-link></p>
      </div>
    </div>

    <!-- Jual Modal -->
    <div v-if="showJualModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>💰 Catat Transaksi Penjualan</h2>
          <button class="close-btn" @click="closeJualModal">&times;</button>
        </div>
        <div class="modal-body">
          <p>Masukkan jumlah pcs / cup / porsi resep <strong>{{ selectedResepForJual?.nama }}</strong> yang terjual:</p>
          <div class="form-group">
            <label>Jumlah Terjual (Pcs / Cup / Porsi)</label>
            <input v-model.number="jualPorsi" type="number" min="1" required />
          </div>
          <div class="summary-details">
            <div class="detail-line">
              <span>HPP per Pcs/Cup/Porsi:</span>
              <span>Rp {{ Math.round(selectedResepForJual?.hargaPerPorsi || 0).toLocaleString('id-ID') }}</span>
            </div>
            <div class="detail-line">
              <span>Harga Jual per Pcs/Cup/Porsi:</span>
              <span>Rp {{ (selectedResepForJual?.hargaJual || 0).toLocaleString('id-ID') }}</span>
            </div>
            <div class="detail-line total">
              <span>Total Pendapatan:</span>
              <span>Rp {{ ((selectedResepForJual?.hargaJual || 0) * jualPorsi).toLocaleString('id-ID') }}</span>
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
.resep-list-container {
  width: 100%;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: stretch;
}

.header h1 {
  margin: 0;
  color: #1f2937;
  font-size: clamp(1.3rem, 5vw, 1.8rem);
  font-weight: 700;
}

.cards-container {
  min-height: 300px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.card:hover {
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.1);
  transform: translateY(-4px);
}

.card-header {
  background: linear-gradient(135deg, #4338ca 0%, #7c3aed 100%);
  color: white;
  padding: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
}

.card-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  word-break: break-word;
}

.badge {
  background: rgba(255, 255, 255, 0.3);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  white-space: nowrap;
}

.card-body {
  padding: 1rem;
  flex: 1;
}

.description {
  color: #64748b;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item .label {
  color: #94a3b8;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.info-item .value {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.9rem;
  word-break: break-word;
}

.info-item .value.highlight-green {
  color: #16a34a;
}

.profit-pos {
  color: #059669 !important;
}

.profit-neg {
  color: #dc2626 !important;
}

.card-footer {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: space-between;
}

.empty {
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%);
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  color: #64748b;
}

.empty a {
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
}

.empty a:hover {
  text-decoration: underline;
}

.loading,
.error {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.loading {
  background: #e3f2fd;
  color: #1976d2;
}

.error {
  background: #ffebee;
  color: #d32f2f;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 60px;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  width: 100%;
  box-shadow: 0 10px 24px rgba(99, 102, 241, 0.2);
  font-weight: 600;
  border-radius: 12px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(99, 102, 241, 0.28);
}

.btn-jual {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.btn-jual:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.25);
}

.btn-info {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-info:hover {
  background: #e2e8f0;
}

.btn-edit {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.btn-edit:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.25);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

.btn-delete:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.25);
}

.btn-sm {
  padding: 0.4rem 0.6rem;
  font-size: 0.75rem;
  flex: 1;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.15);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  word-break: break-word;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
  flex-shrink: 0;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #1f2937;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-family: inherit;
  box-sizing: border-box;
  font-size: 1rem;
  color: #1f2937;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .header {
    align-items: stretch;
  }

  .header h1 {
    font-size: 1.2rem;
  }

  .cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .card-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    min-width: auto;
  }

  .btn-sm {
    width: 100%;
  }

  .modal {
    padding: 0.5rem;
  }

  .modal-content {
    border-radius: 12px;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>
