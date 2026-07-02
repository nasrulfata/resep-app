<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useResepStore } from '../stores/resep'
import type { Resep } from '../stores/resep'

const router = useRouter()
const resepStore = useResepStore()

const editingResep = ref<Resep | null>(null)
const showEditForm = ref(false)

onMounted(() => {
  resepStore.fetchResep()
})

const openEdit = (resep: Resep) => {
  editingResep.value = { ...resep }
  showEditForm.value = true
}

const closeEdit = () => {
  showEditForm.value = false
  editingResep.value = null
}

const saveEdit = async () => {
  if (!editingResep.value || !editingResep.value.id) return

  try {
    await resepStore.updateResep(editingResep.value.id, editingResep.value)
    alert('Resep berhasil diperbarui!')
    closeEdit()
  } catch (err) {
    alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
  }
}

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
            <span class="badge">{{ resep.porsi }} Porsi</span>
          </div>
          <div class="card-body">
            <p class="description">{{ resep.deskripsi }}</p>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Total Harga:</span>
                <span class="value">Rp {{ resep.totalHarga.toLocaleString('id-ID') }}</span>
              </div>
              <div class="info-item">
                <span class="label">Harga/Porsi:</span>
                <span class="value">Rp {{ resep.hargaPerPorsi.toLocaleString('id-ID') }}</span>
              </div>
              <div class="info-item">
                <span class="label">Waktu:</span>
                <span class="value">{{ resep.waktuBuat }} menit</span>
              </div>
              <div class="info-item">
                <span class="label">Bahan:</span>
                <span class="value">{{ resep.bahan.length }} item</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn btn-sm btn-info" @click="viewDetail(resep.id!)">Lihat Detail</button>
            <button class="btn btn-sm btn-edit" @click="openEdit(resep)">Edit</button>
            <button class="btn btn-sm btn-delete" @click="deleteResep(resep.id!)">Hapus</button>
          </div>
        </div>
      </div>
      <div v-else class="empty">
        <p>Belum ada resep. <router-link to="/resep/create">Buat resep baru</router-link></p>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditForm" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Edit Resep: {{ editingResep?.nama }}</h2>
          <button class="close-btn" @click="closeEdit">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nama Resep</label>
            <input v-model="editingResep!.nama" type="text" />
          </div>
          <div class="form-group">
            <label>Deskripsi</label>
            <textarea v-model="editingResep!.deskripsi" rows="3"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Porsi</label>
              <input v-model.number="editingResep!.porsi" type="number" min="1" />
            </div>
            <div class="form-group">
              <label>Waktu (menit)</label>
              <input v-model.number="editingResep!.waktuBuat" type="number" min="0" />
            </div>
          </div>
          <div class="form-group">
            <label>Catatan</label>
            <textarea v-model="editingResep!.catatan" rows="2"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEdit">Batal</button>
          <button class="btn btn-primary" @click="saveEdit">Simpan</button>
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
  color: #666;
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
  color: #999;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.info-item .value {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  word-break: break-word;
}

.card-footer {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
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
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  font-size: 0.85rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 70px;
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

.btn-info {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.btn-info:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.25);
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
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  word-break: break-word;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
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
  border: 1.5px solid #dbe2ea;
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

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-family: inherit;
  box-sizing: border-box;
  font-size: 1rem;
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

/* Mobile Responsive */
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
    border-radius: 8px;
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
