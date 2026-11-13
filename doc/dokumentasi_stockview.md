```markdown
# Dokumentasi Teknis Modul Stok (`StockView.vue` & 4 Sub-Komponen)

Modul manajemen stok bahan ajar dirancang menggunakan pola **Parent-Child Orchestration**[cite: 14]. **`StockView.vue`** bertindak sebagai pusat pengendali (*Single Source of Truth*) yang mengelola data, autentikasi, filter, serta penyimpanan `localStorage`, sementara empat komponen anak menangani antarmuka spesifik secara modular[cite: 14, 15, 16, 17, 18].

---

## 1. Arsitektur & Alur Data Komponen

```text
StockView.vue (Parent / State & Logic Controller)
 ├── StockFilter.vue      ──► Kontrol filter wilayah, kategori, status re-order, & pencarian
 ├── StockTable.vue       ──► Tabel interaktif, pengurutan kolom, badge status, & paginasi
 ├── StockFormModal.vue   ──► Modal pendaftaran bahan ajar baru (khusus Administrator)
 └── StockEditModal.vue   ──► Modal penyesuaian stok masuk/keluar (khusus Administrator)

```

---

## 2. `StockView.vue` (Komponen Induk)

Bertanggung jawab mengorkestrasi seluruh siklus hidup data stok, validasi hak akses berbasis peran (*Role-Based Access Control* / RBAC), dan sinkronisasi ke `localStorage` (`stock_db`).

### A. State & Kontrol Akses (RBAC)

* **`isAdmin` (`computed`)**: Mengecek apakah `currentUser.value.role` bernilai `'administrator'` (case-insensitive). Nilai ini menjadi penjaga (*guard*) ganda—baik di tampilan (menyembunyikan tombol tambah & kolom edit) maupun di dalam fungsi mutasi (`toggleNewForm`, `handleRegisterBook`, `openBookModal`, dan `saveBookChanges`).


* **`onMounted()`**: Memvalidasi sesi pengguna melalui `requireAuth()`, memuat daftar stok dari `loadStockData()`, serta mengambil daftar konstanta wilayah dan kategori dari `loadConstants()`.



### B. Reaktivitas (`watch` & `computed`)

1. **`watch(selectedRegion)`**: Mereset `selectedCategory` kembali ke string kosong (`''`) setiap kali pengguna mengganti **UT-Daerah** agar tidak terjadi kombinasi filter wilayah dan kategori yang tidak valid.


2. **`watch(searchQuery)`**: Otomatis mematikan filter **Perlu Re-order** (`isReorderFilterActive = false`) saat pengguna mulai mengetik di kolom pencarian, mencegah hasil pencarian tersembunyi karena masih terkunci filter stok menipis.


3. **`availableCategories` (`computed`)**: Menghasilkan daftar kategori mata kuliah unik (`[...new Set(...)]`) yang benar-benar tersedia pada `selectedRegion` terpilih.


4. **`filteredStock` (`computed`)**: Menjalankan *pipeline* pemrosesan data dua tahap:


* **Tahap Penyaringan (`filter`)**: Mencocokkan wilayah, kategori, kata kunci pencarian (`title` atau `itemCode`), dan kondisi *re-order* (`item.qty < item.safetyStock || item.qty === 0`).


* **Tahap Pengurutan (`sort`)**: Mengurutkan hasil berdasarkan `sortColumn` dan `sortDirection` (`asc`/`desc`), dengan pembersihan karakter non-numerik khusus kolom `price` serta perbandingan alfabetis (`localeCompare`) untuk tipe *string*.





### C. Manajemen Transaksi Stok

* **Pendaftaran Buku Baru (`handleRegisterBook`)**: Memvalidasi kelengkapan `itemCode` dan `title`, menolak kode duplikat (case-insensitive), menyimpan item baru ke `stock_db`, lalu mereset formulir `newBook`.


* **Simulasi & Simpan Perubahan Stok (`addStock`, `reduceStock`, `saveBookChanges`)**: Menghitung pratinjau stok baru (`tempQty`) terlebih dahulu dan mencegah stok bernilai negatif (`< 0`) sebelum memperbarui array `stock` dan `localStorage`.



---

## 3. `StockFilter.vue` (Panel Filter & Pencarian)

Komponen kontrol input yang menghubungkan interaksi pengguna dengan *state* filter di `StockView.vue` menggunakan pola **Multiple `v-model**` Vue 3.

| Jenis | Nama | Tipe | Fungsi |
| --- | --- | --- | --- |
| **Prop** | `regionList` | `Array` | Daftar pilihan UT-Daerah pada dropdown wilayah.

 |
| **Prop** | `availableCategories` | `Array` | Daftar kategori dinamis yang disesuaikan dengan wilayah terpilih.

 |
| **Prop** | `selectedRegion` | `String` | Nilai filter UT-Daerah aktif (`v-model:selectedRegion`).

 |
| **Prop** | `selectedCategory` | `String` | Nilai filter kategori aktif (`v-model:selectedCategory`).

 |
| **Prop** | `searchQuery` | `String` | Kata kunci pencarian kode/judul buku (`v-model:searchQuery`).

 |
| **Prop** | `isReorderFilterActive` | `Boolean` | Menandai status aktif tombol filter **Perlu Re-order**.

 |
| **Emit** | `update:selectedRegion`, `update:selectedCategory`, `update:searchQuery` | `Event` | Memperbarui *state* filter di komponen induk secara dua arah.

 |
| **Emit** | `toggle-reorder` | `Event` | Mengaktifkan/menonaktifkan mode filter stok menipis & kosong.

 |
| **Emit** | `reset-filters` | `Event` | Mengembalikan seluruh filter ke kondisi awal.

 |

> **Catatan Perilaku UI**: Dropdown **Kategori Mata Kuliah** memiliki atribut `:disabled="!selectedRegion"`, sehingga pengguna wajib memilih UT-Daerah terlebih dahulu sebelum menyaring berdasarkan kategori.
> 
> 

---

## 4. `StockTable.vue` (Tabel Data, Status & Paginasi)

Komponen penyaji data yang menerima array `filteredStock` yang sudah tersaring dan terurut dari induknya, lalu memecahnya menjadi halaman-halaman kecil.

### A. Props & Emits

* **Props**: `filteredStock` (`Array`), `isAdmin` (`Boolean`), `sortColumn` (`String`), `sortDirection` (`String`).


* **Emits**:
* `sort(column)`: Dikirim saat header kolom bertanda `sortable-th` (`itemCode`, `title`, `qty`, `price`) diklik untuk mengubah arah urutan di komponen induk.


* `edit-book(item)`: Dikirim saat tombol **Edit** ditekan (khusus Admin) untuk membuka `StockEditModal`.





### B. Logika Internal Komponen

* **Paginasi Lokal (`currentPage`, `pageSize = 10`)**:
* `totalPages` menghitung total halaman dari `Math.ceil(filteredStock.length / 10)`.


* `paginatedStock` memotong data menggunakan `.slice(start, end)` agar hanya 10 baris yang dirender per halaman.


* **`watch(() => props.filteredStock)`**: Mengembalikan `currentPage` ke `1` setiap kali data hasil filter berubah, mencegah tampilan tabel kosong apabila pengguna sebelumnya berada di halaman akhir.




* **Klasifikasi Status Stok**:
* **Kosong (`badge-kosong`)**: `qty === 0`


* **Kritis (`badge-kritis`)**: `0 < qty <= Math.floor(safetyStock / 2)`


* **Menipis (`badge-menipis`)**: `Math.floor(safetyStock / 2) < qty <= safetyStock`


* **Aman (`badge-aman`)**: `qty > safetyStock`





---

## 5. `StockFormModal.vue` (Modal Tambah Bahan Ajar)

Modal formulir untuk mendaftarkan master data bahan ajar baru. Komponen ini hanya dirender apabila kondisi `v-if="show && isAdmin"` terpenuhi.

* **Props**: `show` (`Boolean`), `isAdmin` (`Boolean`), `modelValue` (`Object` berisi struktur data `newBook`).


* **Emits**: `update:modelValue`, `submit`, `close`.


* **Pola Pembaruan Imutabel (`updateField`)**: Karena *props* di Vue bersifat satu arah (*one-way data flow*), komponen ini tidak mengubah properti `modelValue` secara langsung. Fungsi `updateField(key, val)` memancarkan salinan objek baru (`{ ...props.modelValue, [key]: val }`) melalui `update:modelValue` setiap kali ada input berubah.



---

## 6. `StockEditModal.vue` (Modal Penyesuaian Stok)

Modal khusus Administrator untuk menambah atau mengurangi kuantitas fisik stok pada buku yang dipilih.

* **Props**: `show` (`Boolean`), `isAdmin` (`Boolean`), `selectedBook` (`Object`), `tempQty` (`Number`), `actionInput` (`Number | String`), `activeAction` (`String`: `'add'` atau `'reduce'`).


* **Emits**: `update:actionInput`, `add`, `reduce`, `submit`, `close`.


* **Alur Interaksi Pengguna**:
1. Pengguna memasukkan nominal perubahan pada input `actionInput`.


2. Pengguna menekan tombol **+ Tambah Stok** (`@add`) atau **- Kurangi Stok** (`@reduce`) untuk melihat pratinjau perbandingan **Stok Saat Ini** $\rightarrow$ **Stok Baru (`tempQty`)** secara langsung.


3. Pengguna menekan **Simpan Perubahan** (`@submit`) untuk memvalidasi dan menyimpan hasil akhir ke `localStorage`.


