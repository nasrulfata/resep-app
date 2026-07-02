<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useResepStore } from '../stores/resep'

const router = useRouter()
const route = useRoute()
const resepStore = useResepStore()

const resep = computed(() => {
  const id = Number(route.params.id)
  return resepStore.getResepById(id)
})

const goBack = () => {
  router.push('/resep')
}
</script>

<template>
  <div class="detail-container">
    <div v-if="resep" class="detail-view">
      <div class="header">
        <button class="btn-back" @click="goBack">← Kembali</button>
        <h1>{{ resep.nama }}</h1>
      </div>

      <div class="detail-grid">
        <div class="detail-section">
          <h2>📝 Informasi Resep</h2>
          <div class="info-box">
            <div class="info-row">
              <span class="label">Deskripsi:</span>
              <span class="value">{{ resep.deskripsi }}</span>
            </div>
            <div class="info-row">
              <span class="label">Porsi:</span>
              <span class="value">{{ resep.porsi }} porsi</span>
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

        <div class="detail-section">
          <h2>💰 Harga</h2>
          <div class="price-box">
            <div class="price-row">
              <span class="label">Total Harga:</span>
              <span class="value">Rp {{ resep.totalHarga.toLocaleString('id-ID') }}</span>
            </div>
            <div class="price-row">
              <span class="label">Harga Per Porsi:</span>
              <span class="value highlight">Rp {{ resep.hargaPerPorsi.toLocaleString('id-ID') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bahan-section">
        <h2>🥘 Bahan-Bahan</h2>
        <div v-if="resep.bahan.length" class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Barang</th>
                <th>Jumlah</th>
                <th>Harga Satuan</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(bahan, index) in resep.bahan" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ bahan.namaBarang }}</td>
                <td>{{ bahan.jumlah }} {{ bahan.satuan }}</td>
                <td>Rp {{ bahan.hargaSatuan.toLocaleString('id-ID') }}</td>
                <td>Rp {{ bahan.subtotal.toLocaleString('id-ID') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="actions">
        <router-link :to="`/resep/${resep.id}/edit`" class="btn btn-edit">✏️ Edit</router-link>
        <button class="btn btn-back-to-list" @click="goBack">Kembali ke Daftar</button>
      </div>
    </div>

    <div v-else class="not-found">
      <p>Resep tidak ditemukan</p>
      <button class="btn btn-primary" @click="goBack">Kembali</button>
    </div>
  </div>
</template>

<style scoped>
.detail-container {
  max-width: 1000px;
  margin: 0 auto;
}

.detail-view {
  background: #fff;
  color: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header {
  background: #fff;
  color: #000;
  padding: 2rem;
  border-bottom: 1px solid #ddd;
}

.btn-back {
  background: #f5f5f5;
  color: #000;
  border: 1px solid #ccc;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 1rem;
  transition: 0.3s;
}

.btn-back:hover {
  background: #e5e5e5;
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  color: #000;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
}

.detail-section,
.bahan-section {
  margin-bottom: 2rem;
}

.detail-section h2,
.bahan-section h2 {
  font-size: 1.1rem;
  margin: 0 0 1rem;
  color: #000;
  border-bottom: 2px solid #000;
  padding-bottom: 0.5rem;
}

.info-box,
.price-box {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 1rem;
}

.info-row,
.price-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child,
.price-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #000 !important;
}

.value {
  color: #000 !important;
}

.value.highlight {
  color: #000 !important;
  font-weight: bold;
}

.bahan-section {
  padding: 2rem;
  border-top: 1px solid #ddd;
}

.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.table thead {
  background: #fff;
}

.table th {
  padding: 12px;
  text-align: left;
  border: 1px solid #ddd;
  color: #000 !important;
  font-weight: 600;
  background: #fff;
}

.table td {
  padding: 12px;
  border: 1px solid #ddd;
  color: #000 !important;
  background: #fff;
}

.table tbody tr:hover {
  background: #f5f5f5;
}

.table tbody tr:hover td {
  color: #000 !important;
}

.actions {
  padding: 2rem;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-edit {
  background: #4caf50;
  color: #fff;
}

.btn-edit:hover {
  background: #43a047;
}

.btn-back-to-list {
  background: #e0e0e0;
  color: #000;
}

.btn-back-to-list:hover {
  background: #d5d5d5;
}

.not-found {
  padding: 2rem;
  text-align: center;
  color: #000;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
