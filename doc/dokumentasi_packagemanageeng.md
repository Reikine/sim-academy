# Dokumentasi Teknis Modul Manajemen Paket (`PackageManagementView.vue`)

Modul ini berfungsi untuk mengelola daftar bundel (*package*) bahan ajar yang akan digunakan sebagai referensi pilihan saat membuat transaksi pengiriman pada halaman **Delivery Order** (`TrackingView.vue`). Seluruh antarmuka tabel utama dan modal pembuatan paket dikelola dalam satu komponen mandiri[cite: 19].

---

## 1. Struktur State & Lifecycle

| State / Hook | Tipe | Fungsi & Peran dalam Komponen |
| :--- | :--- | :--- |
| `packageList` | `ref([])` | Menyimpan daftar seluruh bundel paket bahan ajar yang tampil pada tabel utama[cite: 19]. |
| `stockList` | `ref([])` | Menyimpan master data item buku dari inventaris stok sebagai opsi pilihan di dalam modal[cite: 19]. |
| `isModalOpen` | `ref(false)` | Mengontrol visibilitas modal **Tambah Paket Bahan Ajar Baru** (`v-if="isModalOpen"`)[cite: 19]. |
| `newPackage` | `ref(Object)` | Menyimpan input formulir paket baru (`code`, `name`, dan array `selectedItems`)[cite: 19]. |
| `onMounted()` | Lifecycle Hook | Memuat data paket melalui `loadPackageData()` dan data master buku melalui `loadStockData()` saat komponen pertama kali dirender[cite: 19]. |

---

## 2. Helper Normalisasi Skema Data Buku

Karena struktur properti objek buku dari sumber data lokal dapat bervariasi penamaannya, komponen ini menyediakan tiga fungsi *adapter* agar pembacaan data tetap konsisten[cite: 19]:

1. **`getBookCode(book)`**: Mengambil kode unik buku dengan urutan prioritas `code` $\rightarrow$ `kode` $\rightarrow$ `id` $\rightarrow$ `itemCode` $\rightarrow$ `courseCode`, atau nilai properti pertama (`Object.values(book)[0]`) sebagai *fallback*[cite: 19].
2. **`getBookName(book)`**: Mengambil judul mata kuliah dari properti `name`, `nama`, `title`, atau `bookName` dengan nilai bawaan `'Buku Tanpa Nama'`[cite: 19].
3. **`getBookPrice(book)`**: Mengonversi nilai harga satuan dari properti `price`, `harga`, atau `cost` menjadi tipe `Number` (default `0`)[cite: 19].

---

## 3. Reaktivitas & Perhitungan Harga Otomatis

* **`calculatedPrice` (`computed`)**:
  * Menghitung akumulasi harga total paket secara *real-time* setiap kali pengguna mencentang atau menghapus centang *checkbox* item buku (`newPackage.selectedItems`)[cite: 19].
  * Menggunakan metode `.reduce()` untuk mencocokkan setiap `itemCode` terpilih terhadap `stockList` via `getBookCode(b)` lalu menjumlahkan harganya dengan `getBookPrice(book)`[cite: 19].
  * Nilai ini langsung ditampilkan pada kotak **Total Harga Otomatis (Rp)** beserta informasi jumlah buku yang terpilih[cite: 19].

---

## 4. Alur Penyimpanan Paket Baru (`handleSavePackage`)

Ketika tombol **Simpan Paket** ditekan, komponen menjalankan langkah validasi dan persistensi berikut[cite: 19]:

1. **Validasi Kelengkapan Identitas**: Memastikan `newPackage.code` dan `newPackage.name` tidak kosong[cite: 19]. Jika kosong, memicu peringatan `showToast('Kode dan Nama Paket wajib diisi!', 'warning')`[cite: 19].
2. **Validasi Minimal Item**: Memastikan `newPackage.selectedItems.length > 0`[cite: 19]. Jika belum ada buku yang dicentang, muncul peringatan `showToast('Pilih minimal satu item buku untuk paket ini!', 'warning')`[cite: 19].
3. **Pembentukan Objek & Penyimpanan**:
   * Membentuk objek `pkgData` dengan nilai `code` dan `name` yang sudah dibersihkan spasinya (`.trim()`), `price` dari `calculatedPrice.value`, serta salinan array `[...newPackage.selectedItems]`[cite: 19].
   * Menambahkan `pkgData` ke array `packageList` dan menyimpannya secara permanen melalui `savePackageData(packageList.value)`[cite: 19].
4. **Reset Antarmuka**: Menampilkan notifikasi sukses, menutup modal (`isModalOpen = false`), dan mengembalikan `newPackage` ke kondisi kosong awal[cite: 19].