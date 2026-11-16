# SITTA — Sistem Informasi Tracking dan Transaksi Bahan Ajar

Aplikasi web manajemen stok, pembuatan paket mata kuliah, dan pelacakan pengiriman (*Delivery Order*) bahan ajar Universitas Terbuka. Proyek ini merupakan hasil *refactor* dan pengembangan dari arsitektur multi-halaman (Tugas 2) menjadi **Vue 3 Single Page Application (SPA)** berbasis **Vite** untuk **Tugas Praktik 3 — Pemrograman Berbasis Web**.

## Tautan Pengujian
- **Demo Aplikasi (Vercel):** https://sim-academy-theta.vercel.app/
- **Video Presentasi (YouTube):** https://youtu.be/tEBmFfNsN3k

## Peningkatan Utama (Tugas 2 ke Tugas 3)
- **Arsitektur SPA & Routing Dinamis:** Perpindahan antar-halaman instan tanpa *reload* menggunakan `<component :is="activeComponent" />` dengan persistensi halaman aktif di `localStorage`.
- **Komunikasi Komponen Induk–Anak:** Pemecahan kode monolitik menjadi komponen modular (`SidebarNav`, `Header`, `StockFilter`, `StockTable`, `StockFormModal`, `StockEditModal`, `TrackingModal`) menggunakan `defineProps`, `defineEmits`, dan pola `update:modelValue` (*immutability*).
- **Peningkatan Modul Stok & Pelacakan:** Penambahan paginasi 10 baris per halaman dan fitur hapus item (khusus admin) pada manajemen stok, pencarian pelacakan berdasarkan **NIM** maupun **Nomor DO**, pintasan tombol `Esc`, serta pembersihan interval *polling* via `onUnmounted`.
- **Modul Baru:** Penambahan halaman **Manajemen Paket Bahan Ajar** (admin) dengan kalkulasi harga paket otomatis dan halaman **Riwayat Pesanan** (pengguna) yang terhubung langsung ke pelacakan DO.
- **Lapisan Services Terpusat:** Restrukturisasi pengelolaan `localStorage`, *auth guard* berbasis peran (*admin* & *user*), serta simulasi pembaruan status pengiriman otomatis ke dalam folder `src/services/`.

## Struktur Direktori Utama
```text
SIM_ACADEMIC/
├── public/
├── src/
│   ├── assets/
│   │   ├── css/                  # base.css, toast.css, dan views/*.css
│   │   ├── hero.png
│   │   └── logo-ut.png
│   ├── components/
│   │   ├── Header.vue
│   │   ├── SidebarNav.vue
│   │   ├── StockEditModal.vue
│   │   ├── StockFilter.vue
│   │   ├── StockFormModal.vue
│   │   ├── StockTable.vue
│   │   ├── Toast.vue
│   │   └── TrackingModal.vue
│   ├── composables/
│   │   └── useToast.js
│   ├── data/
│   │   └── data.json
│   ├── router/
│   │   └── index.js
│   ├── services/
│   │   ├── index.js
│   │   └── storageServices.js
│   ├── views/
│   │   ├── DashboardView.vue
│   │   ├── HistoryView.vue
│   │   ├── LoginView.vue
│   │   ├── PackageManagementView.vue
│   │   ├── StockView.vue
│   │   └── TrackingView.vue
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
└── vite.config.js

```

## Instalasi dan Menjalankan Aplikasi

Pastikan perangkat sudah memiliki:
* **Node.js**
* **npm**
* **Git** *(opsional, jika mengunduh langsung dari repositori GitHub)*

### 1. Clone Repository
```bash
# Mengunduh repositori proyek dari GitHub
git clone https://github.com/Reikine/sim-academy.git

# Masuk ke direktori proyek
cd sim-academy

```

### 2. Install Dependencies

```bash
# Menginstal seluruh pustaka yang tercantum di dalam package.json
npm install

```

### 3. Menjalankan Development Server

```bash
# Menjalankan aplikasi dalam mode pengembangan lokal
npm run dev

```

### 4. Membuka Aplikasi

Buka alamat lokal yang ditampilkan oleh Vite pada terminal melalui browser, biasanya:

```text
http://localhost:5173

```

### 5. Build untuk Production

```bash
# Mengompilasi dan mengoptimalkan aplikasi ke dalam folder dist/
npm run build

# Mempratinjau hasil build produksi secara lokal
npm run preview

```

