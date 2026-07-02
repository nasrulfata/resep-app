# 🍳 Resep App - Setup & Features Guide

Sistem aplikasi resep yang lengkap dengan fitur CRUD Master Barang, Input Resep dengan perhitungan otomatis, dan Laporan & Backup.

## ✨ Fitur yang Telah Dibuat

### 1. **Layout Admin/User**
- File: `src/renderer/src/layouts/AdminLayout.vue`
- Layout utama dengan topbar dan sidebar
- Menampilkan informasi user dan tombol logout
- Responsive dan modern UI

### 2. **Sidebar Navigation**
- File: `src/renderer/src/components/Sidebar.vue`
- Menu dinamis berdasarkan role user (Admin/User)
- Highlight active page
- Gradien background yang menarik

### 3. **CRUD Master Barang** 📦
- File: `src/renderer/src/views/BarangView.vue`
- Store: `src/renderer/src/stores/barang.ts`
- Fitur:
  - ✅ Create: Tambah barang baru
  - ✅ Read: Lihat daftar barang
  - ✅ Update: Edit barang
  - ✅ Delete: Hapus barang
- Form modal untuk input data
- Tabel responsif dengan sorting
- Data tersimpan di localStorage

### 4. **CRUD Profil** 👤
- File: `src/renderer/src/views/ProfilView.vue`
- Store: `src/renderer/src/stores/profil.ts`
- Fitur:
  - View profil user dengan avatar
  - Edit mode untuk update data
  - Form lengkap: nama, email, telepon, alamat, kota, provinsi, kode pos, perusahaan, jabatan
- Design modern dengan section-based layout

### 5. **Input Resep dengan Perhitungan Harga Otomatis** 📝
- File: `src/renderer/src/views/ResepCreateView.vue`
- Store: `src/renderer/src/stores/resep.ts`
- Fitur:
  - Input nama, deskripsi, porsi, waktu buat
  - Tambah bahan-bahan dari Master Barang
  - **Perhitungan Otomatis:**
    - Subtotal per bahan = harga satuan × jumlah
    - Total harga = jumlah semua subtotal
    - Harga per porsi = total harga ÷ porsi
  - Tampilan ringkasan harga real-time
  - Validasi input
  - Data tersimpan di localStorage

### 6. **Daftar Resep** 📋
- File: `src/renderer/src/views/ResepListView.vue`
- Fitur:
  - Card-based layout untuk resep
  - Lihat detail resep
  - Edit resep (modal form)
  - Hapus resep
  - Filter dan search (siap untuk diperluas)
  - Menampilkan: nama, porsi, total harga, harga per porsi, jumlah bahan

### 7. **Detail Resep** 🔍
- File: `src/renderer/src/views/ResepDetailView.vue`
- Fitur:
  - Tampilkan informasi resep lengkap
  - Tabel bahan dengan detail harga
  - Ringkasan harga
  - Tombol edit dan kembali

### 8. **Laporan dan Backup Database** 📈
- File: `src/renderer/src/views/LaporanView.vue`
- Fitur:
  - **Statistik:**
    - Total resep
    - Total barang
    - Total harga semua resep
    - Total stok barang
  - **Export:**
    - Export resep ke CSV
    - Export barang ke CSV
  - **Backup:**
    - Download backup database (JSON)
    - Restore backup dari file
  - **Laporan:**
    - Tabel laporan resep
    - Tabel laporan barang (dengan total nilai stok)

### 9. **Dashboard** 📊
- File: `src/renderer/src/views/DashboardView.vue`
- Fitur:
  - Welcome message
  - Statistik ringkas
  - Quick access buttons
  - User info

## 📁 Struktur File yang Dibuat

```
src/renderer/src/
├── layouts/
│   └── AdminLayout.vue          # Main layout dengan sidebar
├── components/
│   └── Sidebar.vue              # Navigation sidebar
├── views/
│   ├── LoginView.vue            # ✅ Update - added template
│   ├── DashboardView.vue        # ✅ Update - enhanced dashboard
│   ├── BarangView.vue           # 📦 Master Barang CRUD
│   ├── ResepCreateView.vue      # 📝 Input Resep
│   ├── ResepListView.vue        # 📋 Daftar Resep
│   ├── ResepDetailView.vue      # 🔍 Detail Resep
│   ├── ProfilView.vue           # 👤 Profil User
│   └── LaporanView.vue          # 📈 Laporan & Backup
├── stores/
│   ├── auth.ts                  # ✅ Already exists
│   ├── barang.ts                # 📦 Barang store
│   ├── resep.ts                 # 📝 Resep store
│   └── profil.ts                # 👤 Profil store
└── router/
    └── index.ts                 # ✅ Update - added all routes
```

## 🚀 Cara Menggunakan

### 1. **Login**
- Username: `admin` (atau user yang tersedia)
- Password: (sesuai dengan backend)

### 2. **Master Barang**
- Tambah barang baru dengan harga dan satuan
- Edit atau hapus barang yang sudah ada
- Data akan digunakan saat membuat resep

### 3. **Input Resep**
- Klik "Input Resep" di sidebar
- Isi informasi resep
- Tambahkan bahan-bahan dari Master Barang
- Harga akan dihitung otomatis
- Simpan resep

### 4. **Lihat Daftar Resep**
- Lihat semua resep dalam format card
- Klik "Lihat Detail" untuk melihat detail lengkap
- Edit atau hapus resep dari daftar

### 5. **Edit Profil**
- Update informasi pribadi, alamat, dan pekerjaan
- Profil disimpan per user

### 6. **Laporan & Backup (Admin Only)**
- Export data ke CSV untuk analisis lebih lanjut
- Download backup database
- Restore dari backup jika diperlukan

## 💾 Data Storage

Saat ini aplikasi menggunakan **localStorage** untuk penyimpanan data:
- Data persisten di browser lokal
- Untuk production, perlu integrasi dengan backend API

## 🔐 Authentication & Authorization

- Login dengan username dan password
- Role-based access control (Admin/User)
- Laporan & Backup hanya untuk Admin

## 📝 Notes

### Untuk Development Selanjutnya:

1. **Backend Integration:**
   - Ganti localStorage dengan API calls
   - Implementasi database (PostgreSQL, MySQL, dll)

2. **Enhancements:**
   - Search & filter di daftar resep
   - Category untuk barang dan resep
   - Print recipe & laporan
   - Multi-language support
   - Dark mode

3. **Validation:**
   - Server-side validation
   - Error handling yang lebih robust

4. **Testing:**
   - Unit tests untuk stores
   - E2E tests untuk fitur utama

## 🎨 UI/UX Design

- **Color Scheme:** Gradien ungu (#667eea - #764ba2)
- **Responsive:** Mobile-friendly design
- **Icons:** Emoji-based icons untuk UX yang fun
- **Consistency:** Sama styling di semua halaman

## ✅ Checklist Implementasi

- [x] Layout Admin/User
- [x] Sidebar Navigation
- [x] CRUD Master Barang
- [x] CRUD Profil
- [x] Input Resep dengan perhitungan harga otomatis
- [x] Daftar Resep
- [x] Detail Resep
- [x] Laporan & Backup Database
- [x] Dashboard
- [x] Authentication & Authorization
- [x] Router Configuration

## 🎯 Fitur Siap Digunakan!

Semua fitur sudah siap digunakan. Jalankan aplikasi dengan `npm run dev` di folder `resep-app`.
