# Dokumentasi Komponen: `LoginView.vue`

Komponen `LoginView.vue` merupakan gerbang autentikasi aplikasi SITTA yang menangani tiga alur utama dalam satu tampilan (*Single-Page Auth*): **Login Pengguna**, **Registrasi Akun Baru**, dan **Permintaan Reset Password** melalui modal.

---

## 1. Arsitektur & State Reaktif

Komponen ini menggunakan Vue 3 **Composition API** (`<script setup>`) dan terhubung ke router global (`../router`), layanan penyimpanan lokal (`../services`), serta sistem notifikasi *toast* (`../composables/useToast.js`).

### A. State Data (`ref` & `reactive`)

| Nama State | Jenis | Tipe Data | Fungsi |
| :--- | :--- | :--- | :--- |
| `userDb` | `ref` | `Array<Object>` | Menyimpan daftar seluruh akun pengguna yang dimuat dari database lokal (`user_db`). |
| `showPassword` | `ref` | `Boolean` | Mengatur visibilitas teks kata sandi (`text` vs `password`) pada formulir login. |
| `loginForm` | `reactive` | `Object` | Menyimpan input `email` dan `password` saat proses masuk. |
| `regForm` | `reactive` | `Object` | Menyimpan input `name`, `email`, `password`, dan `location` saat pendaftaran akun baru. |
| `isResetModalOpen` | `ref` | `Boolean` | Mengontrol buka/tutup modal permintaan reset kata sandi. |
| `resetEmail` | `ref` | `String` | Menyimpan alamat email yang diajukan untuk reset kata sandi. |

### B. Aset & Siklus Hidup (`onMounted` & `watch`)
* **Resolusi Logo Dinamis**: `logoUrl` dimuat menggunakan `new URL('../assets/logo-ut.png', import.meta.url).href` agar path aset tetap valid saat proses *bundling* Vite.
* **Inisialisasi Data (`onMounted`)**: Memanggil `loadUserData()` untuk mengisi `userDb.value` dengan data pengguna bawaan maupun pengguna yang sudah terdaftar di `localStorage`.
* **Pembersihan Form Otomatis (`watch`)**: Memantau perubahan pada `currentView`. Setiap kali pengguna berpindah antara mode `'login'` dan `'register'`, seluruh kolom pada `loginForm` dan `regForm` otomatis dikosongkan menggunakan `Object.assign(...)`.

---

## 2. Alur Logika & Fungsi Utama

### 1. Login Pengguna (`handleLogin`)
1. Membersihkan spasi berlebih pada `loginForm.email` dan `loginForm.password` dengan `.trim()`.
2. Mencari kecocokan kredensial di dalam `userDb.value` menggunakan `.find()`.
3. **Jika cocok**:
   - Menyimpan objek pengguna ke penyimpanan lokal dengan kunci `'auth_token'` (`setStorage('auth_token', found)`).
   - Menampilkan notifikasi sukses (`showToast`) dan mengarahkan pengguna ke halaman utama (`currentView.value = 'dashboard'`) setelah jeda `1000ms`.
4. **Jika gagal**: Menampilkan pesan kesalahan `'Email atau password salah.'` bertipe `'error'`.

### 2. Registrasi Akun Baru (`handleRegister`)
1. Mengecek keunikan email di `userDb.value` menggunakan `.some()`. Jika sudah terdaftar, proses dihentikan dengan peringatan `'Email sudah terdaftar di sistem!'`.
2. Membuat objek `newUser` dengan peran (*RBAC role*) bawaan yang dibatasi sebagai `'User'` serta `id` berurutan (`userDb.value.length + 1`).
3. Menambahkan `newUser` ke `userDb.value`, menyimpannya ke `'user_db'`, mengosongkan `regForm`, dan mengembalikan tampilan ke mode `'login'`.

### 3. Permintaan Reset Password (`submitForgotPassword`)
1. Memvalidasi bahwa `resetEmail` tidak kosong dan terdaftar di dalam `userDb.value`.
2. Jika email tidak ditemukan, menampilkan *toast* galat persisten (`showToast(..., 'error', 0)` — durasi `0` artinya tidak tertutup otomatis sampai diklik).
3. Mengambil antrean `'resetRequests'` dari `localStorage` dan menambahkan email tersebut jika belum ada di antrean (mencegah duplikasi permintaan).
4. Menutup modal (`closeResetModal()`) dan memberi konfirmasi bahwa permintaan telah dikirim ke Admin.

---

## 3. Struktur Antarmuka (`<template>`)

* **Kontainer Utama (`#app-auth`)**: Menggunakan `v-cloak` untuk mencegah kedipan (*flash*) template mentah sebelum Vue selesai *mounting*.
* **Kartu Login (`#loginBox`)**: Ditampilkan menggunakan `v-show="currentView === 'login'"`, dilengkapi tombol pengalih visibilitas kata sandi (`.password-toggle-btn`) dengan ikon Material Symbols (`visibility` / `visibility_off`).
* **Kartu Registrasi (`#regBox`)**: Ditampilkan menggunakan `v-show="currentView === 'register'"` untuk pendaftaran pengguna baru beserta lokasi UPBJJ/Pusat.
* **Modal Reset Password (`.modal-overlay`)**: Dirender secara kondisional (`v-if="isResetModalOpen"`) di lapisan atas halaman dengan fokus otomatis (`autofocus`) pada kolom input email.

---

## 4. Catatan Pemeliharaan Kode (Opsional)

* **Variabel & Impor Tidak Terpakai**: Variabel `idleTimer` (baris 158) serta impor `onUnmounted`, `toasts`, dan `removeToast` tidak digunakan di dalam skrip dan dapat dihapus agar kode lebih bersih.
* **Konflik Nama Variabel `currentView`**: Di dalam komponen ini, `currentView` yang diimpor dari `../router` digunakan bersamaan untuk mengatur rute global (`'dashboard'`) sekaligus sub-tampilan internal (`'login'` / `'register'`). Untuk keterbacaan jangka panjang, sub-tampilan internal dapat dipisahkan ke `ref('login')` lokal (misalnya `authMode`) agar tidak bercampur dengan *state* router utama.