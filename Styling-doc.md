```markdown
# Dokumentasi Arsitektur Styling — SITTA (Cool Slate & Deep Navy)

Dokumentasi ini menjelaskan standar sistem desain, hierarki token warna, struktur modular CSS, serta aturan tata letak yang diterapkan pada aplikasi **SITTA**. Arsitektur ini mengusung pendekatan **Single-Theme** dan **Zero-Bloat** tanpa ketergantungan pada *toggle* tema terang/gelap.

---

## 1. Prinsip Desain & Arsitektur

1. **Zero-Bloat & Single-Theme**: Seluruh aturan *override* multi-tema (`body.dark-mode`), properti duplikat, dan nilai *fallback* usang telah dieliminasi. Setiap komponen merujuk langsung ke satu sumber kebenaran (*Single Source of Truth*) pada `:root` di `base.css`.
2. **Bebas Putih Murni (`#ffffff`)**: Titik paling terang pada seluruh antarmuka dikunci pada **`#CCD0CE`** (`--text-main`) untuk mencegah silau (*eye strain*) dan menjaga harmoni spektrum warna *slate*.
3. **Kedalaman Permukaan (*Surface Elevation*)**: Hierarki visual dibangun melalui kontras bertingkat antar-lapisan gelap:
   - **Lapisan Terdalam (`#06141B`)**: Latar halaman utama dan elemen *inset* (kolom *input*, *alert card*, kotak daftar item).
   - **Lapisan Permukaan (`#11212D`)**: Kartu konten (`.content-card`, `.panel-box`), *header*, *sidebar*, modal, dan *toast*.
   - **Lapisan Terangkat (`#253745`)**: Tombol sekunder, status *hover* menu, *border* struktural, serta kolom *readonly*/*disabled*.

---

## 2. Sistem Token Warna (`:root`)

Seluruh variabel global didefinisikan di `src/assets/css/base.css` dengan `color-scheme: dark;` agar kontrol bawaan browser (seperti *scrollbar* dan *datepicker*) mengikuti tema gelap secara otomatis.

### A. Palet Inti (*Cool Slate & Deep Navy*)

| Token CSS | Nilai Hex | Peran & Penggunaan Utama |
| :--- | :--- | :--- |
| `--bg-page` | `#06141B` | Latar belakang utama aplikasi, latar *input* aktif, dan elemen *inset* di dalam kartu. |
| `--bg-card` | `#11212D` | Latar belakang kartu utama, *sidebar*, *sticky header*, *footer*, modal, dan *toast*. |
| `--bg-elevated` | `#253745` | Latar belakang tombol sekunder, *hover* baris/menu, dan kolom *input* `readonly`/`disabled`. |
| `--slate-accent` | `#4A5C6A` | Warna teks *placeholder*, aksen *border* saat *hover*, dan *hover* tombol sekunder. |
| `--text-muted` | `#9BA8AB` | Teks pendukung, sub-judul, label *form*, *header* tabel (`<th>`), dan keterangan waktu. |
| `--text-main` | `#CCD0CE` | Teks utama, nilai data, judul kartu, dan teks tombol aksi (titik paling terang aplikasi). |
| `--border-color` | `#253745` | Garis pembatas kartu, pemisah *header*/*sidebar*, garis tabel, dan *border* *input*. |
| `--border-hover` | `#4A5C6A` | Garis batas interaktif saat kartu atau tombol sekunder disorot kursor. |

### B. Aksen Utama & Semantik

| Token CSS | Nilai | Peran & Penggunaan Utama |
| :--- | :--- | :--- |
| `--primary` | `#6366f1` | Tombol aksi utama (`.btn-primary`), menu *sidebar* aktif, dan fokus *input*. |
| `--primary-hover` | `#4f46e5` | Status *hover* untuk tombol aksi utama. |
| `--primary-light` | `rgba(99, 102, 241, 0.16)` | Latar *badge* status info, *ring* fokus *input*, dan aksen ikon biru. |
| `--primary-text` | `#a5b4fc` | Teks judul *brand*, kode paket, nomor resi DO, dan tautan interaktif. |
| `--success` / `--success-bg` | `#34d399` / `rgba(..., 0.14)` | Status stok **Aman**, tombol setujui (*approve*), dan indikator *toast* sukses. |
| `--warning` / `--warning-bg` | `#fbbf24` / `rgba(..., 0.14)` | Status stok **Menipis** dan tombol filter *Re-order* aktif. |
| `--critical` / `--critical-bg` | `#fb923c` / `rgba(..., 0.14)` | Status stok **Kritis**. |
| `--danger` / `--danger-bg` | `#f87171` / `rgba(..., 0.14)` | Status stok **Kosong**, pesan galat, tombol tolak/keluar, dan *toast* galat. |
| `--table-th-bg` | `#182936` | Latar khusus kepala tabel (`.data-table th`). |

---

## 3. Struktur Direktori CSS Modular

```text
src/assets/css/
├── base.css              # Token global, reset, shell layout, tabel, form, tombol, badge
├── toast.css             # Komponen notifikasi mengambang (Toast) & transisi Vue
└── views/
    ├── layout.css        # Sticky header, sidebar navigasi, panel notifikasi, modal konfirmasi
    ├── dashboard.css     # Kartu statistik KPI, panel peringatan stok, grid catatan
    ├── history.css       # Halaman riwayat aktivitas & log sistem
    ├── login.css         # Halaman autentikasi (Login/Register) & modal reset sandi
    ├── package.css       # Manajemen paket bahan ajar & modal pemilih item buku
    ├── stock.css         # Filter multi-kriteria, tabel stok interaktif, paginasi, modal CRUD
    └── tracking.css      # Pelacakan Delivery Order (DO), timeline pengiriman, modal buat DO

```

---

## 4. Rincian Modul & Konvensi Komponen

### 1. `base.css` (Fondasi Global)

* **Layout Shell**: `.app-layout-container` menggunakan *flexbox* layar penuh (`100vh` × `100vw`) dengan `.app-main-wrapper` yang dapat digulir secara vertikal dan *padding* konten `28px` (`.app-content-body`).
* **Tombol Simetris**: `.btn-primary` dan `.btn-secondary` menggunakan `display: inline-flex; align-items: center; justify-content: center; gap: 8px;` sehingga ikon Material Symbols selalu sejajar presisi dengan label teks.
* **Proteksi Browser Autofill**: Aturan `input:-webkit-autofill` menggunakan `-webkit-box-shadow: 0 0 0 1000px var(--bg-page) inset` dan `-webkit-text-fill-color: var(--text-main)` untuk mencegah browser (Chrome/Brave) mengubah latar *input* menjadi putih saat riwayat *autocomplete* dipilih.
* **Status Badge Universal**: `.badge-aman`, `.badge-menipis`, `.badge-kritis`, dan `.badge-kosong` menggunakan latar *translucent* dengan *border* tipis `rgba` agar menyatu natural di atas permukaan `#11212D`.

### 2. `toast.css` (Sistem Notifikasi)

* Menggunakan permukaan kartu gelap (`var(--bg-card)`) dengan garis indikator semantik `4px` di sisi kiri (`border-left-width: 4px`) untuk membedakan status `.success`, `.error`, `.warning`, dan `.info` tanpa mengurangi keterbacaan teks.
* Mendukung kelas transisi Vue (`toast-enter-from`, `toast-enter-to`, `toast-leave-from`, `toast-leave-to`).

### 3. `views/layout.css` (Kerangka Navigasi)

* **Sticky Header (`.app-header`)**: Tinggi tetap `70px`, menempel di atas (`position: sticky; top: 0`), dilengkapi panel *dropdown* notifikasi (`.notification-panel`) dengan daftar item bergaya *inset* (`.notif-item`).
* **Sidebar (`.app-sidebar`)**: Lebar tetap `260px` dengan latar `#11212D` yang menyatu dengan *header*. Menu aktif (`.sidebar-menu button.active`) disorot menggunakan `var(--primary)` dengan teks `var(--text-main)`.

### 4. `views/dashboard.css` (Ringkasan & Analitik)

* **KPI Cards (`.stats-grid`)**: Grid responsif (`repeat(auto-fit, minmax(240px, 1fr))`) dengan efek mikro-interaksi `translateY(-2px)` dan perubahan warna *border* saat di-*hover*.
* **Alert & Notes**: `.alert-card-item` dan `.note-card` memakai permukaan `#06141B` di dalam `.panel-box` (`#11212D`) untuk menciptakan pemisahan visual yang tegas.

### 5. `views/stock.css` (Manajemen Stok)

* **Filter Panel (`.filter-panel`)**: Menggunakan `align-items: flex-end` dengan `margin-bottom: 0` pada `.filter-panel .form-group` agar seluruh input, tombol filter status (`.btn-filter-status`), dan tombol reset persegi (`42px` × `42px`, `.btn-icon-reset`) sejajar pada satu garis horizontal.
* **Paginasi (`.pagination-container`)**: Terintegrasi langsung di bagian bawah `.table-wrapper` dengan latar `var(--bg-page)`.

### 6. `views/package.css` (Manajemen Paket)

* **Modal Buat Paket (`.package-modal-card`)**: Lebar maksimal `620px` agar judul mata kuliah tampil utuh dalam satu baris.
* **Pemilih Item Buku (`.stock-selector-container`)**: Kontainer gulir (`max-height: 210px`) dengan baris item `.stock-selector-item` (`display: flex; align-items: center; gap: 10px`) yang mengisolasi aturan `label { display: block }` milik `.form-group`.
* **Total Harga Otomatis**: Kolom harga terkunci diarahkan ke `var(--bg-elevated)` (`#253745`) agar tetap gelap dan mudah dibedakan dari kolom input biasa.

### 7. `views/tracking.css` (Pelacakan Delivery Order)

* **Pencarian Simetris (`.search-input-wrapper`)**: Input pencarian dan tombol **Cari** disamakan tingginya pada `44px` dengan jarak `24px` terhadap kartu hasil di bawahnya.
* **Timeline Pengiriman (`.timeline-list`)**: Daftar riwayat vertikal dengan garis panduan kiri `2px solid var(--border-hover)`.

### 8. `views/login.css` & `views/history.css`

* **Autentikasi (`login.css`)**: Latar halaman menggunakan gradasi gelap `linear-gradient(135deg, var(--bg-page) 0%, var(--bg-card) 100%)` dengan kontainer formulir terpusat (`max-width: 420px`).
* **Riwayat (`history.css`)**: Memanfaatkan `.table-wrapper` dan `.data-table` global dengan *badge* aktivitas khusus (`.status-badge`).

---

## 5. Hierarki Lapisan (`z-index`)

Untuk memastikan tidak ada elemen antarmuka yang saling bertabrakan atau tertutup efek *backdrop-filter*, urutan lapisan dikunci sebagai berikut:

| Komponen / Selektor | Nilai `z-index` | Keterangan |
| --- | --- | --- |
| `.app-header` | `100` | *Sticky header* di atas konten halaman yang digulir. |
| `.notification-panel` | `1000` | Panel *dropdown* notifikasi di bawah tombol lonceng *header*. |
| `.package-modal-overlay` | `9999` | *Backdrop* modal pembuatan paket bahan ajar. |
| `.modal-overlay` / `.modal-backdrop` | `99999` | *Backdrop* modal global (konfirmasi logout, edit stok, buat DO, reset sandi). |
| `.toast-container` | `100000` | Lapisan paling atas agar notifikasi *toast* selalu tampil tajam di depan *blur* modal. |

```

```