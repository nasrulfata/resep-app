<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const isSubmitting = computed(() => auth.loading)

async function login() {
  errorMessage.value = ''
  const result = await auth.login(username.value, password.value)

  if (!result.success) {
    errorMessage.value = result.message || 'Login gagal'
    return
  }

  router.push('/dashboard')
}
</script>

<template>
  <div class="login-shell">
    <div class="login-card">
      <div class="login-illustration">
        <div class="brand-badge">🍳</div>
        <h1>Resep App</h1>
        <p>Kelola resep, barang, dan laporan dengan tampilan yang lebih modern dan praktis.</p>
        <ul>
          <li>Login lancar di browser maupun desktop</li>
          <li>Dashboard yang lebih menarik</li>
          <li>CRUD barang dan resep yang simpel</li>
        </ul>
      </div>

      <div class="login-panel">
        <h2>Masuk ke akun</h2>
        <p class="subtitle">Silakan gunakan akun Anda untuk melanjutkan</p>

        <form @submit.prevent="login" class="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Masukkan password"
              required
            />
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Memproses...' : 'Login' }}
          </button>
        </form>

        <p class="hint">Tip: saat dibuka di browser, sistem akan tetap bisa masuk menggunakan mode demo.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #4338ca 0%, #7c3aed 45%, #ec4899 100%);
}

.login-card {
  width: min(100%, 980px);
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
}

.login-illustration {
  padding: 2.5rem;
  background: linear-gradient(145deg, #312e81 0%, #4338ca 45%, #7c3aed 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand-badge {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  font-size: 1.4rem;
  margin-bottom: 1rem;
}

.login-illustration h1 {
  margin: 0 0 0.75rem;
  font-size: 2rem;
}

.login-illustration p {
  margin: 0 0 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.login-illustration ul {
  padding-left: 1.1rem;
  margin: 0;
  display: grid;
  gap: 0.6rem;
  color: rgba(255, 255, 255, 0.95);
}

.login-panel {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-panel h2 {
  margin: 0 0 0.3rem;
  color: #1f2937;
  font-size: 1.6rem;
}

.subtitle {
  margin: 0 0 1.4rem;
  color: #64748b;
}

.login-form {
  display: grid;
  gap: 1rem;
}

.form-group {
  display: grid;
  gap: 0.45rem;
}

.form-group label {
  font-weight: 600;
  color: #334155;
}

.form-group input {
  width: 100%;
  padding: 0.85rem 0.95rem;
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

.error-message {
  margin: 0;
  color: #dc2626;
  font-size: 0.95rem;
}

.login-form button {
  width: 100%;
  padding: 0.9rem 1rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 10px 24px rgba(99, 102, 241, 0.22);
}

.login-form button:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(99, 102, 241, 0.28);
}

.login-form button:disabled {
  opacity: 0.7;
  cursor: wait;
  transform: none;
}

.hint {
  margin-top: 1rem;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .login-card {
    grid-template-columns: 1fr;
  }

  .login-illustration,
  .login-panel {
    padding: 1.5rem;
  }
}
</style>