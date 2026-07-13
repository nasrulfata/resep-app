<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useResepStore } from '../stores/resep'
import { useBarangStore } from '../stores/barang'
import type { Resep, BahanResep } from '../stores/resep'

const router = useRouter()
const route = useRoute()
const resepStore = useResepStore()
const barangStore = useBarangStore()

const isEditMode = computed(() => !!route.params.id)
const recipeId = computed(() => Number(route.params.id))

const form = ref<Resep>({
  nama: '',
  deskripsi: '',
  porsi: 1,
  waktuBuat: 0,
  bahan: [],
  totalHarga: 0,
  hargaPerPorsi: 0,
  overhead: 0,
  penyusutan: 0,
  hargaJual: 0,
  keuntungan: 0,
  hpp: 0,
  catatan: ''
})

const selectedBahanId = ref<number | null>(null)
const bahanJumlah = ref<number | null>(null)

const selectedKemasanId = ref<number | null>(null)
const kemasanJumlah = ref<number | null>(null)

onMounted(async () => {
  await barangStore.fetchBarang()
  if (isEditMode.value) {
    await resepStore.fetchResep()
    const existing = resepStore.getResepById(recipeId.value)
    if (existing) {
      form.value = JSON.parse(JSON.stringify(existing))
    }
  }
})

const bahanOptions = computed(() => {
  return barangStore.items.filter(b => !b.jenis || b.jenis === 'bahan')
})

const kemasanOptions = computed(() => {
  return barangStore.items.filter(b => b.jenis === 'kemasan')
})

const addBahan = () => {
  if (!selectedBahanId.value || !bahanJumlah.value || bahanJumlah.value <= 0) {
    alert('Pilih bahan baku dan masukkan jumlah')
    return
  }

  const barang = barangStore.getBarangById(selectedBahanId.value)
  if (!barang) return

  const item: BahanResep = {
    barangId: barang.id!,
    namaBarang: barang.nama,
    jumlah: bahanJumlah.value,
    satuan: barang.satuan,
    hargaSatuan: barang.harga,
    subtotal: barang.harga * bahanJumlah.value,
    jenis: 'bahan'
  }

  form.value.bahan.push(item)
  selectedBahanId.value = null
  bahanJumlah.value = null
}

const addKemasan = () => {
  if (!selectedKemasanId.value || !kemasanJumlah.value || kemasanJumlah.value <= 0) {
    alert('Pilih kemasan/packaging dan masukkan jumlah')
    return
  }

  const barang = barangStore.getBarangById(selectedKemasanId.value)
  if (!barang) return

  const item: BahanResep = {
    barangId: barang.id!,
    namaBarang: barang.nama,
    jumlah: kemasanJumlah.value,
    satuan: barang.satuan,
    hargaSatuan: barang.harga,
    subtotal: barang.harga * kemasanJumlah.value,
    jenis: 'kemasan'
  }

  form.value.bahan.push(item)
  selectedKemasanId.value = null
  kemasanJumlah.value = null
}

const removeBahan = (index: number) => {
  form.value.bahan.splice(index, 1)
}

const totalBahan = computed(() => {
  return form.value.bahan
    .filter(b => b.jenis !== 'kemasan')
    .reduce((sum, b) => sum + b.subtotal, 0)
})

const totalKemasan = computed(() => {
  return form.value.bahan
    .filter(b => b.jenis === 'kemasan')
    .reduce((sum, b) => sum + b.subtotal, 0)
})

const overhead = computed(() => {
  return totalBahan.value * 0.20
})

const penyusutan = computed(() => {
  return totalBahan.value * 0.10
})

const hppTotal = computed(() => {
  return totalBahan.value + overhead.value + penyusutan.value + totalKemasan.value
})

const hppPerPorsi = computed(() => {
  return form.value.porsi > 0 ? hppTotal.value / form.value.porsi : 0
})

const keuntunganPersen = computed(() => {
  if (hppPerPorsi.value <= 0 || !form.value.hargaJual) return 0
  return ((form.value.hargaJual - hppPerPorsi.value) / hppPerPorsi.value) * 100
})

const saveResep = async () => {
  if (!form.value.nama || form.value.bahan.length === 0) {
    alert('Nama resep dan minimal 1 item (bahan/kemasan) harus diisi')
    return
  }

  try {
    const resepData: Resep = {
      ...form.value,
      totalHarga: hppTotal.value,
      hargaPerPorsi: hppPerPorsi.value,
      overhead: overhead.value,
      penyusutan: penyusutan.value,
      hpp: hppTotal.value,
      keuntungan: keuntunganPersen.value
    }
    
    if (isEditMode.value) {
      await resepStore.updateResep(recipeId.value, resepData)
      alert('Resep berhasil diperbarui!')
    } else {
      await resepStore.addResep(resepData)
      alert('Resep berhasil disimpan!')
    }
    router.push('/resep')
  } catch (err) {
    alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
  }
}
</script>

<template>
  <div class="resep-create-container">
    <h1>{{ isEditMode ? '✏️ Edit Resep' : '📝 Input Resep Baru' }}</h1>

    <div class="form-wrapper">
      <!-- Section 1: Informasi Resep -->
      <div class="form-section">
        <h2>Informasi Resep</h2>
        <div class="form-group">
          <label>Nama Resep *</label>
          <input v-model="form.nama" type="text" placeholder="Contoh: Nasi Goreng Spesial" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Jumlah Pcs / Cup / Porsi (Output) *</label>
            <input v-model.number="form.porsi" type="number" min="1" required />
          </div>
          <div class="form-group">
            <label>Waktu Buat (menit)</label>
            <input v-model.number="form.waktuBuat" type="number" min="0" />
          </div>
        </div>
        <div class="form-group">
          <label>Deskripsi / Langkah Pembuatan</label>
          <textarea v-model="form.deskripsi" placeholder="Deskripsi cara membuat..." rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Catatan</label>
          <textarea v-model="form.catatan" placeholder="Catatan tambahan..." rows="2"></textarea>
        </div>
      </div>

      <!-- Section 2: Bahan Baku -->
      <div class="form-section">
        <h2>1. Bahan Baku (Bahan yang Digunakan)</h2>
        <div class="bahan-input">
          <select v-model.number="selectedBahanId">
            <option :value="null">Pilih Bahan Baku...</option>
            <option v-for="b in bahanOptions" :key="b.id" :value="b.id">
              {{ b.nama }} ({{ b.satuan }}) - Rp {{ b.harga.toLocaleString('id-ID') }}
            </option>
          </select>
          <input v-model.number="bahanJumlah" type="number" min="0" step="0.01" placeholder="Jumlah" />
          <button class="btn btn-add" @click="addBahan">+ Tambah Bahan</button>
        </div>

        <div v-if="form.bahan.filter(b => b.jenis !== 'kemasan').length" class="bahan-list">
          <table class="table">
            <thead>
              <tr>
                <th>Bahan Baku</th>
                <th>Jumlah</th>
                <th>Harga Satuan</th>
                <th>Subtotal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(bahan, index) in form.bahan" :key="index">
                <template v-if="bahan.jenis !== 'kemasan'">
                  <td>{{ bahan.namaBarang }}</td>
                  <td>{{ bahan.jumlah }} {{ bahan.satuan }}</td>
                  <td>Rp {{ bahan.hargaSatuan.toLocaleString('id-ID') }}</td>
                  <td>Rp {{ bahan.subtotal.toLocaleString('id-ID') }}</td>
                  <td>
                    <button class="btn btn-sm btn-delete" @click="removeBahan(index)">Hapus</button>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty">Belum ada bahan baku ditambahkan</div>
      </div>

      <!-- Section 3: Kemasan / Packaging -->
      <div class="form-section">
        <h2>2. Kemasan / Packaging</h2>
        <div class="bahan-input">
          <select v-model.number="selectedKemasanId">
            <option :value="null">Pilih Kemasan...</option>
            <option v-for="b in kemasanOptions" :key="b.id" :value="b.id">
              {{ b.nama }} ({{ b.satuan }}) - Rp {{ b.harga.toLocaleString('id-ID') }}
            </option>
          </select>
          <input v-model.number="kemasanJumlah" type="number" min="0" step="0.01" placeholder="Jumlah" />
          <button class="btn btn-add btn-packaging" @click="addKemasan">+ Tambah Kemasan</button>
        </div>

        <div v-if="form.bahan.filter(b => b.jenis === 'kemasan').length" class="bahan-list">
          <table class="table">
            <thead>
              <tr>
                <th>Kemasan</th>
                <th>Jumlah</th>
                <th>Harga Satuan</th>
                <th>Subtotal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(bahan, index) in form.bahan" :key="index">
                <template v-if="bahan.jenis === 'kemasan'">
                  <td>{{ bahan.namaBarang }}</td>
                  <td>{{ bahan.jumlah }} {{ bahan.satuan }}</td>
                  <td>Rp {{ bahan.hargaSatuan.toLocaleString('id-ID') }}</td>
                  <td>Rp {{ bahan.subtotal.toLocaleString('id-ID') }}</td>
                  <td>
                    <button class="btn btn-sm btn-delete" @click="removeBahan(index)">Hapus</button>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty">Belum ada kemasan ditambahkan</div>
      </div>

      <!-- Section 4: Ringkasan Kalkulasi -->
      <div class="summary">
        <h2>Kalkulasi Harga & HPP</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="label">Total Bahan Baku:</span>
            <span class="value">Rp {{ totalBahan.toLocaleString('id-ID') }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Overhead (20%):</span>
            <span class="value">Rp {{ overhead.toLocaleString('id-ID') }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Penyusutan Alat (10%):</span>
            <span class="value">Rp {{ penyusutan.toLocaleString('id-ID') }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Total Kemasan/Packaging:</span>
            <span class="value">Rp {{ totalKemasan.toLocaleString('id-ID') }}</span>
          </div>
          <div class="summary-item highlight">
            <span class="label">HPP Total Resep:</span>
            <span class="value">Rp {{ hppTotal.toLocaleString('id-ID') }}</span>
          </div>
          <div class="summary-item highlight">
            <span class="label">HPP per Pcs / Cup / Porsi:</span>
            <span class="value">Rp {{ Math.round(hppPerPorsi).toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <div class="pricing-section">
          <div class="form-group pricing-input">
            <label>Harga Jual per Pcs / Cup / Porsi (Rp) *</label>
            <input v-model.number="form.hargaJual" type="number" min="0" placeholder="Masukkan harga jual..." />
          </div>
          <div class="pricing-result">
            <span class="label">Estimasi Keuntungan:</span>
            <span :class="['profit-badge', keuntunganPersen >= 0 ? 'profit-positive' : 'profit-negative']">
              {{ keuntunganPersen >= 0 ? '+' : '' }}{{ keuntunganPersen.toFixed(1) }}%
            </span>
          </div>
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
  margin-bottom: 2rem;
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
  grid-template-columns: 1fr 120px 150px;
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
  padding: 1.5rem 1rem;
  text-align: center;
  color: #64748b;
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%);
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.95rem;
}

.summary {
  background: linear-gradient(135deg, #f0f4ff 0%, #ede9fe 100%);
  padding: 1.8rem;
  border-radius: 18px;
  border-left: 5px solid #6366f1;
  margin-top: 2rem;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.12);
}

.summary h2 {
  color: #312e81;
  border-bottom: 2px solid #c7d2fe;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.2rem;
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.summary-item .label {
  color: #4b5563;
  font-size: 0.85rem;
  font-weight: 500;
}

.summary-item .value {
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 700;
}

.summary-item.highlight .label {
  color: #4f46e5;
  font-weight: 700;
}

.summary-item.highlight .value {
  color: #4f46e5;
  font-size: 1.4rem;
  font-weight: 800;
}

.pricing-section {
  border-top: 1px solid rgba(99, 102, 241, 0.2);
  padding-top: 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
}

.pricing-input {
  margin-bottom: 0;
}

.pricing-result {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pricing-result .label {
  color: #4b5563;
  font-size: 0.9rem;
  font-weight: 600;
}

.profit-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 1.3rem;
  font-weight: 800;
  text-align: center;
  width: fit-content;
}

.profit-positive {
  background-color: #d1fae5;
  color: #065f46;
}

.profit-negative {
  background-color: #fee2e2;
  color: #991b1b;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
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
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-add {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2);
}

.btn-add:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.28);
}

.btn-packaging {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 8px 16px rgba(245, 158, 11, 0.2);
}

.btn-packaging:hover {
  box-shadow: 0 10px 20px rgba(245, 158, 11, 0.28);
}

.btn-delete {
  background: #ef4444;
  color: white;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  border-radius: 8px;
}

.btn-delete:hover {
  background: #dc2626;
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
    border-radius: 12px;
  }

  .form-section {
    margin-bottom: 1.5rem;
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
    padding: 0.65rem;
    font-size: 16px;
  }

  .bahan-input {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .btn-add {
    width: 100%;
  }

  .summary {
    padding: 1.2rem;
    margin-top: 1.5rem;
    border-radius: 12px;
  }

  .summary-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .summary-item .value {
    font-size: 1rem;
  }

  .summary-item.highlight .value {
    font-size: 1.15rem;
  }

  .pricing-section {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .actions .btn {
    width: 100%;
  }
}
</style>
