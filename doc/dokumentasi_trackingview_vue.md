```markdown
# Dokumentasi Teknis Modul Pelacakan Delivery Order (`TrackingView.vue` & `TrackingModal.vue`)

Modul ini menangani pelacakan status pengiriman **Delivery Order (DO)** secara *real-time* sekaligus alur pembuatan transaksi DO baru yang terintegrasi langsung dengan pengurangan inventaris stok bahan ajar[cite: 18].

---

## 1. Arsitektur & Alur Kerja Komponen

```text
TrackingView.vue (Controller: Pencarian, Polling Status, Validasi Stok, Mutasi DO)
 └── TrackingModal.vue (UI Modal 2-Tahap: Form Input DO ──► Konfirmasi Rincian Paket)

```

---

## 2. `TrackingView.vue` (Komponen Induk)

### A. Inisialisasi, Deep-Linking & Polling Status (`onMounted` & `onUnmounted`)

1. **Validasi & Pemuatan Master Data**: Memanggil `requireAuth()`, lalu memuat data dari `loadTrackingData()`, `loadPackageData()`, dan daftar jasa ekspedisi (`deliveryList`) dari `loadConstants()`.


2. **Pencarian Otomatis Lintas Halaman (*Deep-Linking*)**: Mengecek parameter URL (`?do=DO2026-xxx`) atau kunci sementara `activeDoDetail` di `localStorage` (yang dikirim saat pengguna menekan tombol **Lacak Paket** di `HistoryView.vue`), mengisi `searchQuery`, langsung menjalankan `handleSearchDo()`, lalu menghapus kunci sementara agar tidak memicu pencarian ulang saat halaman dimuat kembali.


3. **Simulasi Perjalanan Paket Otomatis (`setInterval` 2 detik)**:
* Memanggil `checkAndPromoteStatus(currentData)` secara berkala untuk memajukan tahapan pengiriman DO secara otomatis.


* Apabila ada pembaruan status dan hasil pencarian (`searchResult`) sedang terbuka, objek `searchResult.value` disegarkan (`{ ...trackingList.value[searchResult.value.doNumber] }`) agar *badge* status dan daftar *timeline* langsung bertambah tanpa *reload*.


* `onUnmounted()` membersihkan `pollInterval` menggunakan `clearInterval` untuk mencegah kebocoran memori (*memory leak*) saat pengguna berpindah halaman.





### B. Pencarian Delivery Order (`handleSearchDo`)

* Mencocokkan `searchQuery` secara *case-insensitive* terhadap kunci objek `trackingList`.


* Jika input kosong, menampilkan pesan validasi inline `searchError`; jika nomor DO tidak ditemukan di database lokal, memicu notifikasi `showToast('Paket tidak ditemukan!', 'error', 0)`.



### C. Validasi Stok & Transaksi Pembuatan DO (`saveNewDo`)

1. **Penomoran Otomatis (`openDoModal`)**: Membentuk format nomor resi berurutan `DO{Tahun}-{Urutan 3 Digit}` (contoh: `DO2026-004`) berdasarkan jumlah entri `trackingList` saat ini.


2. **Resolusi Isi Paket (`resolvePackageStock` & `selectedPackageItemsDetails`)**: Memetakan setiap kode buku di dalam `pkg.items` terhadap data `stock_db` agar rincian judul mata kuliah yang tergabung dalam paket dapat ditampilkan pada tahap konfirmasi.


3. **Proteksi Batas Stok Aman (`validateSelectedPackage`)**: Sebelum DO dapat diproses, sistem memeriksa seluruh item buku di dalam paket. Jika ada satu saja buku dengan `qty < safetyStock` atau `qty === 0`, pembuatan DO langsung ditolak dengan pesan peringatan status (`KOSONG` atau `MENIPIS`).


4. **Pemotongan Stok & Pencatatan Riwayat (`saveNewDo`)**:
* Mengurangi kuantitas (`qty -= 1`) untuk setiap item buku yang termasuk dalam paket di `stock_db`.


* Menyimpan objek DO baru ke `trackingData` lengkap dengan metadata pembuat (`email`, `createdBy`) agar otomatis terhubung dengan halaman **Riwayat Pesanan** (`HistoryView.vue`), serta mencatat log perjalanan awal (`Penerimaan di Loket: TANGERANG SELATAN`).


* Otomatis menampilkan hasil pelacakan DO yang baru dibuat pada layar utama.





---

## 3. `TrackingModal.vue` (Modal Pembuatan DO 2-Tahap)

Komponen formulir berpola *two-step wizard* yang dikendalikan oleh prop `isConfirmStep`.

### A. Props & Emits

| Jenis | Nama | Tipe | Fungsi |
| --- | --- | --- | --- |
| **Prop** | `isOpen` | `Boolean` | Mengatur visibilitas modal (`v-if="isOpen"`).

 |
| **Prop** | `isConfirmStep` | `Boolean` | Menentukan tampilan aktif: Formulir Input (`false`) atau Ringkasan Konfirmasi (`true`).

 |
| **Prop** | `modelValue` | `Object` | Objek data `newDo` yang diikat melalui `v-model`.

 |
| **Prop** | `deliveryList` | `Array` | Daftar opsi ekspedisi pada dropdown pengiriman.

 |
| **Prop** | `packageList` | `Array` | Daftar paket bahan ajar beserta harga paketnya.

 |
| **Prop** | `selectedPackageItemsDetails` | `Array` | Daftar rincian kode dan judul buku yang ada di dalam paket terpilih.

 |
| **Emit** | `update:modelValue` | `Event` | Memperbarui properti `newDo` secara imutabel melalui `updateField(key, val)`.

 |
| **Emit** | `proceed-confirm` | `Event` | Memvalidasi isian & stok sebelum beralih ke langkah konfirmasi.

 |
| **Emit** | `save` | `Event` | Mengeksekusi penyimpanan DO dan pemotongan stok di komponen induk.

 |
| **Emit** | `back` | `Event` | Mengembalikan tampilan modal ke langkah pengisian formulir (`isConfirmStep = false`).

 |
| **Emit** | `close` | `Event` | Menutup modal dan mereset tahap konfirmasi.

 |

### B. Tahapan Interaksi Modal

1. **Tahap 1 — Formulir Input (`!isConfirmStep`)**:
* Nomor DO bersifat `readonly` (dihasilkan otomatis).


* Input tanggal kirim membatasi pemilihan tanggal lampau melalui atribut `:min="new Date().toISOString().split('T')[0]"`.


* Menekan **Tinjau Pesanan** memicu `@proceed-confirm` untuk validasi kelengkapan dan ketersediaan stok.




2. **Tahap 2 — Konfirmasi Pesanan (`isConfirmStep === true`)**:
* Menampilkan ringkasan identitas mahasiswa, ekspedisi, tanggal kirim, serta daftar seluruh item buku penyusun paket (`selectedPackageItemsDetails`).


* Pengguna dapat menekan **Edit Data** (`@back`) untuk memperbaiki isian atau **Buat DO** (`@save`) untuk menyelesaikan transaksi.



