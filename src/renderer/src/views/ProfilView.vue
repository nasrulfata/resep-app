<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useProfilStore } from '../stores/profil'
import type { Profil } from '../stores/profil'

const auth = useAuthStore()
const profilStore = useProfilStore()

const isEditing = ref(false)
const form = ref<Profil>({
  nama: '',
  email: '',
  noTelp: '',
  alamat: '',
  kota: '',
  provinsi: '',
  kodePos: '',
  perusahaan: '',
  jabatan: ''
})

onMounted(async () => {
  if (auth.user) {
    await profilStore.fetchProfil(auth.user.id)
    if (profilStore.profil) {
      form.value = { ...profilStore.profil }
    }
  }
})

const startEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  if (profilStore.profil) {
    form.value = { ...profilStore.profil }
  }
}

const saveProfil = async () => {
  if (!auth.user) return

  try {
    await profilStore.updateProfil(auth.user.id, form.value)
    alert('Profil berhasil diperbarui!')
    isEditing.value = false
  } catch (err) {
    alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
  }
}
</script>

<template>
  <div class="profil-container">
    <h1>👤 Profil Pengguna</h1>

    <div class="profil-card">
      <div v-if="!isEditing" class="profil-view">
        <div class="profil-header">
          <div class="avatar">{{ auth.user?.nama.charAt(0).toUpperCase() }}</div>
          <div class="user-info">
            <h2>{{ form.nama || auth.user?.nama }}</h2>
            <p class="role">Role: {{ auth.user?.role === 'admin' ? 'Administrator' : 'User' }}</p>
          </div>
        </div>

        <div class="profil-details">
          <div class="section">
            <h3>📧 Informasi Kontak</h3>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">{{ form.email || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">No. Telepon:</span>
              <span class="value">{{ form.noTelp || '-' }}</span>
            </div>
          </div>

          <div class="section">
            <h3>📍 Alamat</h3>
            <div class="detail-row">
              <span class="label">Alamat:</span>
              <span class="value">{{ form.alamat || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Kota:</span>
              <span class="value">{{ form.kota || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Provinsi:</span>
              <span class="value">{{ form.provinsi || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Kode Pos:</span>
              <span class="value">{{ form.kodePos || '-' }}</span>
            </div>
          </div>

          <div class="section">
            <h3>💼 Pekerjaan</h3>
            <div class="detail-row">
              <span class="label">Perusahaan:</span>
              <span class="value">{{ form.perusahaan || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Jabatan:</span>
              <span class="value">{{ form.jabatan || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-primary" @click="startEdit">✏️ Edit Profil</button>
        </div>
      </div>

      <div v-else class="profil-edit">
        <h2>Edit Profil</h2>
        <div class="form-section">
          <h3>Informasi Pribadi</h3>
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input v-model="form.nama" type="text" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email" />
            </div>
            <div class="form-group">
              <label>No. Telepon</label>
              <input v-model="form.noTelp" type="tel" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Alamat</h3>
          <div class="form-group">
            <label>Alamat Lengkap</label>
            <textarea v-model="form.alamat" rows="3"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Kota</label>
              <input v-model="form.kota" type="text" />
            </div>
            <div class="form-group">
              <label>Provinsi</label>
              <input v-model="form.provinsi" type="text" />
            </div>
            <div class="form-group">
              <label>Kode Pos</label>
              <input v-model="form.kodePos" type="text" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Pekerjaan</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Perusahaan</label>
              <input v-model="form.perusahaan" type="text" />
            </div>
            <div class="form-group">
              <label>Jabatan</label>
              <input v-model="form.jabatan" type="text" />
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-secondary" @click="cancelEdit">Batal</button>
          <button class="btn btn-primary" @click="saveProfil">Simpan Profil</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profil-container {
  width: 100%;
}

h1 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: clamp(1.3rem, 5vw, 1.8rem);
}

.profil-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  padding: 1.8rem;
}

.profil-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e0e0e0;
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4338ca 0%, #7c3aed 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  flex-shrink: 0;
  box-shadow: 0 10px 24px rgba(99, 102, 241, 0.25);
}

.user-info h2 {
  margin: 0 0 0.35rem 0;
  color: #333;
  font-size: 1.2rem;
}

.role {
  margin: 0;
  color: #999;
  font-size: 0.9rem;
}

.profil-details {
  margin-bottom: 1.5rem;
}

.section {
  margin-bottom: 1.2rem;
}

.section h3 {
  font-size: 0.95rem;
  margin: 0 0 0.75rem 0;
  color: #555;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.35rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.6rem 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 1rem;
  flex-wrap: wrap;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #555;
  min-width: 120px;
  flex-shrink: 0;
}

.value {
  color: #333;
  text-align: right;
  flex: 1;
  word-break: break-word;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-section h3 {
  font-size: 0.95rem;
  margin: 0 0 0.75rem 0;
  color: #555;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.35rem;
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

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
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

/* Mobile Responsive */
@media (max-width: 768px) {
  .profil-card {
    padding: 1rem;
  }

  .profil-header {
    gap: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
  }

  .avatar {
    width: 60px;
    height: 60px;
    font-size: 1.4rem;
  }

  .user-info h2 {
    font-size: 1rem;
  }

  .role {
    font-size: 0.85rem;
  }

  .profil-details {
    margin-bottom: 1rem;
  }

  .section {
    margin-bottom: 1rem;
  }

  .section h3 {
    font-size: 0.9rem;
    margin: 0 0 0.5rem 0;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.5rem 0;
    gap: 0.25rem;
  }

  .label {
    min-width: auto;
    text-align: left;
  }

  .value {
    text-align: left;
    flex: 1;
  }

  .form-section {
    margin-bottom: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .form-group label {
    font-size: 0.9rem;
  }

  .form-group input,
  .form-group textarea {
    padding: 0.6rem;
    font-size: 16px; /* Prevent zoom on iOS */
  }

  .actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
