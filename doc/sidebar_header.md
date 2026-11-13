# Dokumentasi Teknis Komponen Layout (`Header.vue` & `SidebarNav.vue`)

Kedua komponen ini membentuk kerangka navigasi utama (*application shell*) setelah pengguna berhasil masuk ke sistem[cite: 18, 19]. **`Header.vue`** mengelola identitas sesi pengguna, persetujuan reset kata sandi (khusus Admin), dan alur keluar aplikasi, sedangkan **`SidebarNav.vue`** menangani perpindahan menu antar-halaman[cite: 19].

---

## 1. `Header.vue` (Header Atas, Notifikasi & Logout)

Komponen bilah atas (*sticky header*) yang merender judul aplikasi, tombol profil, tombol keluar, serta *dropdown* notifikasi khusus Administrator[cite: 18].

### A. State & Computed Properties

| Nama | Tipe | Fungsi & Peran |
| :--- | :--- | :--- |
| `currentUser` | `ref(Object)` | Menyimpan objek data pengguna yang sedang aktif dari `getAuthUser()` (default: `{ name: 'Pengguna', role: 'User' }`)[cite: 18]. |
| `isAdmin` | `computed` | Mengecek apakah properti `role` pada `currentUser` bernilai `'administrator'` atau `'admin'` (*case-insensitive*) untuk menampilkan ikon lonceng notifikasi[cite: 18]. |
| `isNotifOpen` | `ref(Boolean)` | Mengontrol buka/tutup panel *dropdown* daftar permintaan reset kata sandi[cite: 18]. |
| `resetRequests` | `ref(Array)` | Menyimpan daftar antrean alamat email yang mengajukan reset kata sandi dari kunci `localStorage` `'resetRequests'`[cite: 18]. |
| `isLogoutModalOpen` | `ref(Boolean)` | Mengontrol visibilitas modal konfirmasi keluar aplikasi[cite: 18]. |

### B. Alur Persetujuan Reset Kata Sandi (RBAC Admin)
Fitur ini terhubung langsung dengan fitur *Lupa Password* pada `LoginView.vue`[cite: 18]:

1. **Sinkronisasi Data (`fetchResetRequests` & `toggleNotifPanel`)**: Daftar permintaan dimuat saat komponen pertama kali dipasang (`onMounted`) dan diperbarui ulang setiap kali panel lonceng dibuka (`isNotifOpen === true`)[cite: 18].
2. **Menyetujui Permintaan (`approveReset(email, index)`)**:
   * Mencari akun pengguna berdasarkan `email` di dalam `localStorage` `'user_db'`[cite: 18].
   * Jika ditemukan, kata sandi akun tersebut diatur ulang menjadi `'123456'` dan disimpan kembali ke `'user_db'`[cite: 18].
   * Menghapus email tersebut dari antrean `resetRequests` dan menampilkan notifikasi sukses[cite: 18].
3. **Menolak Permintaan (`rejectReset(index)`)**: Menghapus email dari antrean `resetRequests` tanpa mengubah data akun pada `'user_db'`[cite: 18].

### C. Alur Keluar Aplikasi (`Logout Flow`)
* Menekan tombol ikon `logout` memanggil `confirmLogout()` untuk membuka modal konfirmasi (`isLogoutModalOpen = true`)[cite: 18].
* Menekan **Ya, Keluar** menjalankan `modalConfirmLogout()` yang menampilkan *toast* informasi, membersihkan sesi melalui `logout()`, lalu mengarahkan `currentView.value = 'login'` setelah jeda `600ms`[cite: 18].

---

## 2. `SidebarNav.vue` (Navigasi Menu Samping)

Komponen bilah samping (*sidebar*) yang menyediakan tombol navigasi utama berbasis *state* global `currentView` dari `../router`[cite: 19].

### A. Daftar Menu & Pemetaan Route

| Label Menu | Nilai `currentView` | Hak Akses |
| :--- | :--- | :--- |
| **Dashboard** | `'dashboard'` | Semua Pengguna[cite: 19] |
| **Stok Bahan Ajar** | `'stock'` | Semua Pengguna[cite: 19] |
| **Pemesanan** | `'history'` | Semua Pengguna[cite: 19] |
| **Tracking Pengiriman** | `'tracking'` | Semua Pengguna[cite: 19] |
| **Buat Paket Baru** | `'packageManagement'` | Khusus `isAdmin` (`v-if="isAdmin"`)[cite: 19] |

* **Indikator Menu Aktif**: Setiap tombol menggunakan *dynamic class binding* `:class="{ active: currentView === '...' }"` untuk menyorot menu yang sedang dibuka secara otomatis[cite: 19].

### B. Catatan Teknis Pengecekan `isAdmin`
Pada `SidebarNav.vue`, `isAdmin` saat ini melakukan pemindaian ke seluruh kunci `localStorage` untuk mencari kata `'administrator'` atau `'admin'`[cite: 19]:
* **Risiko**: Karena data seluruh akun pengguna tersimpan di kunci `'user_db'` dalam `localStorage` (yang di dalamnya pasti terdapat akun bertipe Administrator), pemindaian menyeluruh ke semua kunci `localStorage` akan selalu mengembalikan `true` meskipun pengguna yang sedang *login* berstatus `'User'` biasa[cite: 19].
* **Rekomendasi Perbaikan**: Samakan logika `isAdmin` di `SidebarNav.vue` dengan yang sudah diterapkan di `Header.vue` menggunakan `getAuthUser()` agar pengecekan hak akses hanya membaca sesi akun yang sedang aktif[cite: 18, 19]:

```javascript
import { computed } from 'vue';
import { currentView } from '../router';
import { getAuthUser } from '../services';

const isAdmin = computed(() => {
    const role = String(getAuthUser()?.role || '').toLowerCase();
    return role === 'administrator' || role === 'admin';
});