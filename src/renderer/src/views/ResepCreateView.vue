<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useResepStore } from '../stores/resep'
import { useBarangStore } from '../stores/barang'
import type { Resep, BahanResep } from '../stores/resep'

const router = useRouter()
const resepStore = useResepStore()
const barangStore = useBarangStore()

const form = ref<Resep>({
  nama: '',
  deskripsi: '',
  porsi: 1,
  waktuBuat: 0,
  bahan: [],
  totalHarga: 0,
  hargaPerPorsi: 0,
  catatan: ''
})

const selectedBarangId = ref<number | null>(null)
const bahanJumlah = ref(0)

onMounted(async () => {
  await barangStore.fetchBarang()
})

const addBahan = () => {
  if (!selectedBarangId.value || bahanJumlah.value <= 0) {
    alert('Pilih barang dan masukkan jumlah')
    return
  }

  const barang = barangStore.getBarangById(selectedBarangId.value)
  if (!barang) return

  const bahan: BahanResep = {
    barangId: barang.id!,
    namaBarang: barang.nama,
    jumlah: bahanJumlah.value,
    satuan: barang.satuan,
    hargaSatuan: barang.harga,
    subtotal: barang.harga * bahanJumlah.value
  }

  form.value.bahan.push(bahan)
  selectedBarangId.value = null
  bahanJumlah.value = 0
}

const removeBahan = (index: number) => {
  form.value.bahan.splice(index, 1)
}

const getTotalHarga = () => {
  return form.value.bahan.reduce((total, b) => total + b.subtotal, 0)
}

const getHargaPerPorsi = () => {
  const total = getTotalHarga()
  return form.value.porsi > 0 ? total / form.value.porsi : 0
}

const saveResep = async () => {
  if (!form.value.nama || form.value.bahan.length === 0) {
    alert('Nama resep dan minimal 1 bahan harus diisi')
    return
  }

  try {
    const resepData: Resep = {
      ...form.value,
      totalHarga: getTotalHarga(),
      hargaPerPorsi: getHargaPerPorsi()
    }
    await resepStore.addResep(resepData)
    alert('Resep berhasil disimpan!')
    router.push('/resep')
  } catch (err) {
    alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
  }
}
</script>

<template>
  <div class="resep-create-container">
    <h1>📝 Input Resep Baru</h1>

    <div class="form-wrapper">
      <div class="form-section">
        <h2>Informasi Resep</h2>
        <div class="form-group">
          <label>Nama Resep *</label>
          <input v-model="form.nama" type="text" placeholder="Contoh: Nasi Goreng" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Porsi *</label>
            <input v-model.number="form.porsi" type="number" min="1" required />
          </div>
          <div class="form-group">
            <label>Waktu Buat (menit)</label>
            <input v-model.number="form.waktuBuat" type="number" min="0" />
          </div>
        </div>
        <div class="form-group">
          <label>Deskripsi</label>
          <textarea v-model="form.deskripsi" placeholder="Deskripsi cara membuat..." rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Catatan</label>
          <textarea v-model="form.catatan" placeholder="Catatan tambahan..." rows="2"></textarea>
        </div>
      </div>

      <div class="form-section">
        <h2>Bahan-Bahan</h2>
        <div class="bahan-input">
          <select v-model.number="selectedBarangId">
            <option :value="null">Pilih Barang...</option>
            <option v-for="b in barangStore.items" :key="b.id" :value="b.id">
              {{ b.nama }} ({{ b.satuan }}) - Rp {{ b.harga.toLocaleString('id-ID') }}
            </option>
          </select>
          <input v-model.number="bahanJumlah" type="number" min="0" step="0.01" placeholder="Jumlah" />
          <button class="btn btn-add" @click="addBahan">+ Tambah</button>
        </div>

        <div v-if="form.bahan.length" class="bahan-list">
          <table class="table">
            <thead>
              <tr>
                <th>Barang</th>
                <th>Jumlah</th>
                <th>Harga Satuan</th>
                <th>Subtotal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(bahan, index) in form.bahan" :key="index">
                <td>{{ bahan.namaBarang }}</td>
                <td>{{ bahan.jumlah }} {{ bahan.satuan }}</td>
                <td>Rp {{ bahan.hargaSatuan.toLocaleString('id-ID') }}</td>
                <td>Rp {{ bahan.subtotal.toLocaleString('id-ID') }}</td>
                <td>
                  <button class="btn btn-sm btn-delete" @click="removeBahan(index)">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty">Belum ada bahan ditambahkan</div>
      </div>

      <div class="summary">
        <h2>Ringkasan Harga</h2>
        <div class="summary-row">
          <span>Total Harga:</span>
          <strong>Rp {{ getTotalHarga().toLocaleString('id-ID') }}</strong>
        </div>
        <div class="summary-row">
          <span>Harga Per Porsi:</span>
          <strong>Rp {{ getHargaPerPorsi().toLocaleString('id-ID') }}</strong>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-secondary" @click="$router.back()">Batal</button>
      <button class="btn btn-primary" @click="saveResep">Simpan Resep</button>
    </div>
  </div>
</template>

<style scoped>
.resep-create-container {
  width: 100%;
}

h1 {
  margin-bottom: 1.5rem;
  color: #1f2937;
  font-size: clamp(1.3rem, 5vw, 1.8rem);
  font-weight: 700;
}

h2 {
  font-size: 1.05rem;
  margin-bottom: 1rem;
  color: #1f2937;
  border-bottom: 2px solid #6366f1;
  padding-bottom: 0.5rem;
  font-weight: 600;
}

.form-wrapper {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.8rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-section:last-of-type {
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.8rem;
  border: 1.5px solid #dbe2ea;
  border-radius: 10px;
  font-family: inherit;
  box-sizing: border-box;
  font-size: 1rem;
  background: white;
  color: #1f2937;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

.bahan-input {
  display: grid;
  grid-template-columns: 1fr 120px 100px;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.bahan-input select,
.bahan-input input {
  padding: 0.75rem;
  width: 100%;
}

.bahan-list {
  margin-top: 1rem;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.95rem;
}

.table thead {
  background: linear-gradient(135deg, #f0f4ff 0%, #eef2ff 100%);
  border-bottom: 2px solid #c7d2fe;
}

.table th,
.table td {
  padding: 0.85rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  color: #334155;
}

.table th {
  color: #312e81;
  font-weight: 700;
}

.table tbody tr:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%);
}

.empty {
  padding: 2rem 1rem;
  text-align: center;
  color: #64748b;
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%);
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.95rem;
}

.summary {
  background: linear-gradient(135deg, #f0f4ff 0%, #ede9fe 100%);
  padding: 1.5rem;
  border-radius: 14px;
  border-left: 4px solid #6366f1;
  margin-top: 1.5rem;
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.12);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.65rem 0;
  font-size: 1rem;
  color: #1f2937;
}

.summary-row strong {
  color: #4338ca;
  word-break: break-word;
  font-weight: 700;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 10px 24px rgba(99, 102, 241, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(99, 102, 241, 0.28);
}

.btn-secondary {
  background: #e5e7eb;
  color: #1f2937;
  font-weight: 600;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-add {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.75rem;
}

.btn-add:hover {
  background: #45a049;
}

.btn-delete {
  background: #f44336;
  color: white;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.btn-delete:hover {
  background: #da190b;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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

  .form-wrapper {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 6px;
  }

  .form-section {
    margin-bottom: 1rem;
  }

  .form-group {
    margin-bottom: 0.75rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .form-group label {
    font-size: 0.9rem;
    margin-bottom: 0.35rem;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 0.6rem;
    font-size: 16px; /* Prevent zoom on iOS */
  }

  .bahan-input {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .bahan-input select,
  .bahan-input input {
    width: 100%;
  }

  .btn-add {
    width: 100%;
  }

  .table {
    font-size: 0.85rem;
  }

  .table th,
  .table td {
    padding: 0.5rem;
  }

  .summary {
    padding: 1rem;
    margin-top: 1rem;
  }

  .summary-row {
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.35rem 0;
    font-size: 0.9rem;
  }

  .btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }

  .actions {
    flex-direction: column;
  }

  .actions .btn {
    width: 100%;
  }
}
</style>
