# Dokumentasi Komponen: `DashboardView.vue`

Komponen `DashboardView.vue` berfungsi sebagai halaman beranda (*landing dashboard*) setelah pengguna berhasil masuk ke sistem SITTA. Halaman ini menyajikan ringkasan persediaan bahan ajar, peringatan stok menipis (*safety stock*), pratinjau tabel inventaris, serta catatan khusus master data secara *real-time*.

---

## 1. Arsitektur & Alur Data

Komponen ini menggunakan Vue 3 **Composition API** (`<script setup>`) dan mengambil data langsung dari layanan penyimpanan lokal (`../services`).

### A. State Reaktif (`ref`)
| Nama State | Tipe Data | Fungsi |
| :--- | :--- | :--- |
| `stockList` | `Array<Object>` | Menyimpan seluruh daftar item bahan ajar beserta jumlah stok, lokasi rak, dan batas *safety stock*. |
| `trackingList` | `Object` | Menyimpan objek data *Delivery Order* (DO) dengan kunci berupa nomor resi DO. |
| `packageList` | `Array<Object>` | Menyimpan daftar paket bahan ajar yang sudah dibundel. |

### B. Siklus Hidup (`onMounted`)
Saat komponen selesai dipasang ke DOM, `onMounted` memanggil tiga fungsi pemuat data secara sinkron:
- `loadStockData()` $\rightarrow$ mengisi `stockList.value`
- `loadTrackingData()` $\rightarrow$ mengisi `trackingList.value`
- `loadPackageData()` $\rightarrow$ mengisi `packageList.value`

*(Catatan: `getStorage` diimpor pada baris 145, namun belum digunakan di dalam komponen ini dan dapat dihapus jika tidak diperlukan).*

---

## 2. Logika Komputasi (`computed`)

Seluruh angka statistik dan penyaringan daftar dihitung secara otomatis menggunakan `computed` sehingga akan langsung diperbarui apabila `stockList`, `trackingList`, atau `packageList` berubah:

1. **`totalPersediaan`**:
   Menjumlahkan seluruh nilai `qty` (stok fisik) dari setiap item di `stockList` menggunakan `.reduce()`, dengan konversi `Number(item.qty || 0)` untuk mencegah galat penjumlahan string.
2. **`totalTracking`**:
   Menghitung jumlah *Delivery Order* aktif dengan mengambil panjang array kunci objek dari `Object.keys(trackingList.value).length`.
3. **`lowStockItems`**:
   Menyaring `stockList` untuk mencari bahan ajar yang memerlukan perhatian khusus, yaitu item dengan kondisi:
   $$\text{qty} < \text{safetyStock} \quad \text{atau} \quad \text{qty} = 0$$
4. **`safeStockCount`**:
   Menghitung jumlah item yang stoknya aman dengan mengurangi total jenis bahan ajar terhadap jumlah item yang menipis (`stockList.length - lowStockItems.length`).
5. **`itemsWithNotes`**:
   Menyaring bahan ajar yang memiliki properti `notesHTML` tidak kosong untuk ditampilkan pada panel catatan bagian bawah.

---

## 3. Struktur Antarmuka (`<template>`)

Tata letak dibagi menjadi 5 bagian utama di dalam pembungkus `.dashboard-container`:

1. **Header Halaman (`.dashboard-header-section`)**:
   Menampilkan judul halaman dan deskripsi singkat.
2. **Grid Kartu Statistik (`.stats-grid`)**:
   Menampilkan 4 kartu KPI utama:
   - *Total Bahan Ajar* (`stockList.length`)
   - *Total Persediaan* (`totalPersediaan`)
   - *Paket Bahan Ajar* (`packageList.length`)
   - *Data Tracking* (`totalTracking`)
3. **Panel Monitor & Peringatan Stok (`.panel-box`)**:
   - Menampilkan *badge* ringkasan jumlah stok **Aman** vs **Perlu Perhatian**.
   - Merender daftar kartu peringatan (`.alert-card-item`) dari `lowStockItems`. Jika kosong, menampilkan pesan `.empty-stock-alert`.
4. **Panel Ringkasan Tabel Stok**:
   - Menyediakan tautan navigasi cepat **Lihat Semua** (`@click.prevent="goToStock"`) yang mengubah state rute global `currentView.value = 'stock'`.
   - Menampilkan **5 data teratas** menggunakan `stockList.slice(0, 5)` beserta logika penentuan 4 tingkat status stok:
     - **Kosong** (`qty === 0`) $\rightarrow$ `.badge-kosong`
     - **Kritis** (`0 < qty <= 5`) $\rightarrow$ `.badge-kritis`
     - **Menipis** (`5 < qty < safetyStock`) $\rightarrow$ `.badge-menipis`
     - **Aman** (`qty >= safetyStock`) $\rightarrow$ `.badge-aman`
5. **Panel Catatan Bahan Ajar (Kondisional)**:
   - Hanya muncul jika `itemsWithNotes.length > 0`.
   - Membersihkan tag HTML mentah pada `notesHTML` menggunakan ekspresi reguler `.replace(/<[^>]*>?/gm, '')` sebelum ditampilkan sebagai teks biasa agar aman dan rapi.

---

## 4. Saran Penyempurnaan Kecil (Opsional)

- Pada `<p class="panel-subtitle" style="margin-bottom: 0;">` (baris 55), atribut *inline style* tersebut sudah dapat dihapus karena `.panel-subtitle` di `dashboard.css` sudah memiliki aturan `margin: 0;`.
- Logika penentuan status stok pada tabel ringkasan (baris 116–128) dapat diekstrak menjadi fungsi pembantu (*helper function*) seperti `getStockStatus(item)` agar template lebih bersih dan mudah dibaca.