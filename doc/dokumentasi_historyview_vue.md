# Dokumentasi Komponen: `HistoryView.vue`

Komponen `HistoryView.vue` menampilkan daftar riwayat pemesanan dan pengiriman paket bahan ajar yang terasosiasi dengan akun pengguna yang sedang masuk (*logged-in user*). Halaman ini dilengkapi pembaruan status pengiriman otomatis secara berkala serta integrasi navigasi langsung ke halaman pelacakan (*Tracking*).

---

## 1. Arsitektur & Alur Data

Komponen ini menggunakan Vue 3 **Composition API** (`<script setup>`) dan terhubung dengan *state* sesi pengguna, penyimpanan lokal (`localStorage`), serta sistem notifikasi *toast*.

### A. State Reaktif (`ref`)

| Nama State | Tipe Data | Fungsi |
| :--- | :--- | :--- |
| `currentUser` | `Object` | Menyimpan profil pengguna aktif (`name`, `email`, `role`, `nim`) hasil validasi sesi autentikasi. |
| `trackingList` | `Object` | Menyimpan seluruh koleksi data *Delivery Order* (DO) yang dimuat dari `trackingData`. |

### B. Sinkronisasi Data & Simulasi Status (`loadTrackingData`)

Fungsi `loadTrackingData()` bertugas mengambil data pengiriman sekaligus menjalankan simulasi progres pengiriman otomatis:
1. Membaca data mentah melalui `getStorage('trackingData', [])`.
2. Memanggil `checkAndPromoteStatus(parsed)` dari `../services` untuk mengecek apakah ada paket yang sudah memenuhi syarat waktu untuk naik status (misalnya dari *Diproses* $\rightarrow$ *Dalam Perhatian* $\rightarrow$ *Terkirim*).
3. Jika `isUpdated` bernilai `true`, data terbaru langsung disimpan kembali via `setStorage('trackingData', parsed)` sebelum diperbarui ke `trackingList.value`.

### C. Siklus Hidup (`onMounted`)

Saat komponen dimuat:
1. **Proteksi Sesi (`requireAuth()`)**: Memastikan pengguna memiliki sesi login yang valid. Jika tidak valid (`!auth`), eksekusi dihentikan.
2. **Inisialisasi Data**: Mengisi `currentUser.value = auth.user` dan menjalankan `loadTrackingData()` pertama kali.
3. **Polling Otomatis**: Menjalankan `setInterval(loadTrackingData, 3000)` setiap **3 detik** agar perubahan status pengiriman terlihat secara *real-time* tanpa perlu menyegarkan halaman.

---

## 2. Logika Penyaringan & Transformasi (`computed`)

### `userHistory`
Properti `computed` ini mengubah seluruh data `trackingList` menjadi daftar riwayat yang spesifik untuk pengguna aktif melalui dua tahap:

1. **Tahap Penyaringan (`.filter()`)**:
   Data DO akan ditampilkan jika memenuhi **salah satu** dari empat kriteria pencocokan (*case-insensitive*):
   - **NIM cocok**: `item.nim === currentUser.nim`
   - **Nama cocok**: `item.name === currentUser.name`
   - **Email penerima cocok**: `item.email === currentUser.email`
   - **Email pembuat DO cocok**: `item.createdBy === currentUser.email`

2. **Tahap Normalisasi Data (`.map()`)**:
   Setiap objek DO yang lolos filter dipetakan ke format tabel yang seragam dengan nilai cadangan (*fallback*) apabila properti tertentu kosong:
   - `orderDate`: Mengambil `shipmentDate`, atau memotong tanggal dari log riwayat pertama (`initialLog.time.split(' ')[0]`).
   - `name`: Mengambil `item.name` atau `item.nama`.
   - `packageName`: Mengambil `item.packageCode` (default `'PAKET-UT-001'`).
   - `courier`: Mengambil `item.courier` (default `'JNE Regular'`).
   - `status`: Mengambil `item.status` (default `'Diproses'`).

---

## 3. Interaksi & Navigasi (`trackPackage`)

Ketika pengguna menekan tombol **Lacak Paket** pada salah satu baris tabel, fungsi `trackPackage(doNumber)` menjalankan alur berikut:
1. Menyimpan nomor DO pilihan ke penyimpanan sementara menggunakan `setStorage('activeDoDetail', doNumber)` agar halaman *Tracking* langsung membukanya secara otomatis.
2. Menampilkan notifikasi informasi via `showToast(...)`.
3. Memberi jeda singkat `400ms` (`setTimeout`) sebelum memindahkan tampilan aktif ke halaman pelacakan (`currentView.value = 'tracking'`).

---

## 4. Struktur Antarmuka (`<template>`)

- **Header Halaman (`.logs-page-header`)**: Menampilkan judul **"Riwayat Pesanan"** dan subjudul keterangan.
- **Tabel Riwayat (`.table-wrapper` & `.data-table`)**:
  - Merender baris data dari `userHistory` dengan kunci unik `:key="item.doNumber"`.
  - Menggunakan fungsi pembantu `getStatusBadgeClass(item.status)` dari `../services` untuk menyesuaikan warna *badge* status pengiriman.
  - Menampilkan baris pesan kosong (`v-if="userHistory.length === 0"`) apabila akun pengguna belum memiliki transaksi pengiriman.

---

## 5. Catatan Pemeliharaan Kode (Opsional)

1. **Pembersihan Interval (`onUnmounted`)**: Penggunaan `setInterval(loadTrackingData, 3000)` pada `onMounted` sebaiknya disimpan ke dalam variabel (misalnya `let pollingTimer`) dan dibersihkan menggunakan `clearInterval(pollingTimer)` di dalam hook `onUnmounted` agar proses *polling* berhenti saat pengguna berpindah ke halaman lain.
2. **Impor Tidak Terpakai**: `createApp` dari `'vue'` serta variabel `toasts` dan `removeToast` dari `useToast()` tidak digunakan di dalam komponen ini dan dapat diringkas menjadi `const { showToast } = useToast();`.