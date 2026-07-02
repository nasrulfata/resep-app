<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBarangStore } from '../stores/barang'
import type { Barang } from '../stores/barang'

const barangStore = useBarangStore()

const showForm = ref(false)
const editingId = ref<number | null>(null)

const form = ref<Barang>({
  nama: '',
  harga: 0,
  satuan: '',
  stok: 0,
  deskripsi: ''
})

onMounted(() => {
  barangStore.fetchBarang()
})

const openForm = (barang?: Barang) => {
  if (barang) {
    form.value = { ...barang }
    editingId.value = barang.id || null
  } else {
    form.value = { nama: '', harga: 0, satuan: '', stok: 0, deskripsi: '' }
    editingId.value = null
  }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingId.value = null
  form.value = { nama: '', harga: 0, satuan: '', stok: 0, deskripsi: '' }
}

const saveBarang = async () => {
  try {
    if (editingId.value) {
      await barangStore.updateBarang(editingId.value, form.value)
      alert('Barang berhasil diperbarui!')
    } else {
      await barangStore.addBarang(form.value)
      alert('Barang berhasil ditambahkan!')
    }
    closeForm()
  } catch (err) {
    alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
  }
}

const deleteBarang = async (id: number) => {
  if (confirm('Hapus barang ini?')) {
    try {
      await barangStore.deleteBarang(id)
      alert('Barang berhasil dihapus!')
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }
}
</script>

<template>
  <div class="barang-container">
    <div class="header">
      <h1>📦 Master Barang</h1>
      <button class="btn btn-primary" @click="openForm()">+ Tambah Barang</button>
    </div>

    <div v-if="barangStore.loading" class="loading">Loading...</div>

    <div v-if="barangStore.error" class="error">{{ barangStore.error }}</div>

    <!-- Desktop Table View -->
    <div class="table-container show-table">
      <table v-if="barangStore.items.length" class="table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Barang</th>
            <th>Harga</th>
            <th>Satuan</th>
            <th>Stok</th>
            <th>Deskripsi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(barang, index) in barangStore.items" :key="barang.id">
            <td>{{ index + 1 }}</td>
            <td>{{ barang.nama }}</td>
            <td>Rp {{ barang.harga.toLocaleString('id-ID') }}</td>
            <td>{{ barang.satuan }}</td>
            <td>{{ barang.stok }}</td>
            <td>{{ barang.deskripsi }}</td>
            <td class="actions">
              <button class="btn btn-sm btn-edit" @click="openForm(barang)">Edit</button>
              <button class="btn btn-sm btn-delete" @click="deleteBarang(barang.id!)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View -->
    <div class="cards-container hide-cards">
      <div v-if="barangStore.items.length" class="cards">
        <div v-for="(barang, index) in barangStore.items" :key="barang.id" class="card">
          <h3 class="card-title">{{ barang.nama }}</h3>
          <div class="card-content">
            <div class="card-row">
              <span class="card-label">No</span>
              <span class="card-value">{{ index + 1 }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Harga</span>
              <span class="card-value">Rp {{ barang.harga.toLocaleString('id-ID') }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Satuan</span>
              <span class="card-value">{{ barang.satuan }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Stok</span>
              <span class="card-value">{{ barang.stok }}</span>
            </div>
            <div v-if="barang.deskripsi" class="card-row">
              <span class="card-label">Deskripsi</span>
              <span class="card-value">{{ barang.deskripsi }}</span>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn btn-sm btn-edit" @click="openForm(barang)">Edit</button>
            <button class="btn btn-sm btn-delete" @click="deleteBarang(barang.id!)">Hapus</button>
          </div>
        </div>
      </div>
      <div v-else class="empty">Belum ada data barang</div>
    </div>

    <!-- Empty State for both -->
    <div v-if="!barangStore.items.length && !barangStore.loading && !barangStore.error" class="empty">
      Belum ada data barang
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingId ? 'Edit Barang' : 'Tambah Barang' }}</h2>
          <button class="close-btn" @click="closeForm">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nama Barang *</label>
            <input v-model="form.nama" type="text" placeholder="Contoh: Tepung Terigu" required />
          </div>
          <div class="form-group">
            <label>Harga *</label>
            <input v-model.number="form.harga" type="number" placeholder="0" required />
          </div>
          <div class="form-group">
            <label>Satuan *</label>
            <input v-model="form.satuan" type="text" placeholder="Contoh: kg, liter, pcs" required />
          </div>
          <div class="form-group">
            <label>Stok *</label>
            <input v-model.number="form.stok" type="number" placeholder="0" required />
          </div>
          <div class="form-group">
            <label>Deskripsi</label>
            <textarea v-model="form.deskripsi" placeholder="Deskripsi barang..." rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeForm">Batal</button>
          <button class="btn btn-primary" @click="saveBarang">Simpan</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.barang-container {
  width: 100%;
  padding: 0;
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
  font-size: 1.6rem;
  font-weight: 700;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  padding: 0.8rem 1.6rem;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  width: 100%;
  box-shadow: 0 10px 24px rgba(99, 102, 241, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(99, 102, 241, 0.28);
}

/* Desktop Table View */
.table-container {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  overflow-x: auto;
  display: none;
}

.table-container.show-table {
  display: block;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: linear-gradient(135deg, #f0f4ff 0%, #eef2ff 100%);
  border-bottom: 2px solid #c7d2fe;
}

.table th,
.table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.table th {
  color: #312e81;
  font-weight: 700;
  font-size: 0.95rem;
}

.table td {
  color: #334155;
  font-size: 0.95rem;
}

.table tbody tr:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%);
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

/* Mobile Card View */
.cards-container {
  display: grid;
  gap: 1rem;
}

.cards-container.hide-cards {
  display: none;
}

.card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  transition: all 0.3s;
}

.card:hover {
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.1);
  transform: translateY(-2px);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
  word-break: break-word;
}

.card-content {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.75rem;
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  color: #475569;
  font-size: 0.9rem;
  font-weight: 600;
}

.card-value {
  color: #0f172a;
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
}

.empty {
  padding: 2rem;
  text-align: center;
  color: #999;
  background: white;
  border-radius: 8px;
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
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  font-size: 0.9rem;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-edit {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.5rem 0.9rem;
  font-size: 0.875rem;
  flex: 1;
  border-radius: 10px;
  box-shadow: 0 6px 12px rgba(16, 185, 129, 0.2);
  font-weight: 600;
}

.btn-edit:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.28);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.5rem 0.9rem;
  font-size: 0.875rem;
  flex: 1;
  border-radius: 10px;
  box-shadow: 0 6px 12px rgba(239, 68, 68, 0.2);
  font-weight: 600;
}

.btn-delete:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.28);
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.875rem;
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
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  background: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
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
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Responsive Breakpoints */
@media (max-width: 768px) {
  .header {
    align-items: stretch;
  }

  .header h1 {
    font-size: 1.3rem;
  }

  .table-container.show-table {
    display: none;
  }

  .cards-container.hide-cards {
    display: grid;
  }

  .card-actions {
    flex-direction: column;
  }

  .btn-edit,
  .btn-delete {
    width: 100%;
    flex: none;
  }
}

@media (min-width: 769px) {
  .header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .header h1 {
    font-size: 1.8rem;
    flex: 1;
  }

  .btn-primary {
    width: auto;
  }

  .table-container.show-table {
    display: block;
  }

  .cards-container.hide-cards {
    display: none;
  }

  .card-actions {
    flex-direction: row;
  }

  .btn-edit,
  .btn-delete {
    width: auto;
    flex: none;
  }
}
</style>
