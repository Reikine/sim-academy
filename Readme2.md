Ah, maaf banget! Teks markdown dokumentasinya tidak tampil otomatis di chat ya.

Ini dia **template teks lengkap untuk file `sitta_documentation.md**` yang mencakup struktur folder terbaru kamu secara akurat, arsitektur *router* manual, serta pengaman *LocalStorage* untuk `stock_db`:

```markdown
# Dokumentasi Proyek SITTA (Sistem Informasi Tugas & Bahan Ajar)
**Universitas Terbuka**

SITTA adalah aplikasi *Single Page Application* (SPA) berbasis web administratif yang dirancang untuk mengelola stok bahan ajar dan pelacakan pengiriman (*Delivery Order*) secara efisien menggunakan pendekatan *Zero-Bloat Architecture*.

---

## 📁 Struktur Direktori Proyek

Proyek ini terorganisir secara modular untuk memisahkan logika, komponen UI, layanan data, dan *styling* halaman:

```text
SIM_ACADEMIC/
├── .vscode/
├── node_modules/
├── public/
├── src/
│   ├── assets/
│   │   └── css/
│   │       ├── base.css
│   │       ├── toast.css
│   │       └── views/          # CSS khusus per halaman (terpisah dari file .vue)
│   ├── components/             # Komponen modular reusable
│   │   ├── Header.vue
│   │   ├── SidebarNav.vue
│   │   ├── StockEditModal.vue
│   │   ├── StockFilter.vue
│   │   ├── StockFormModal.vue
│   │   ├── StockTable.vue
│   │   ├── Toast.vue
│   │   └── TrackingModal.vue
│   ├── composables/            # Reusable Composition API logic
│   │   └── useToast.js
│   ├── data/                   # Master data statis
│   │   └── data.json
│   ├── router/                 # State-based routing manual
│   │   └── index.js
│   ├── services/               # Layanan LocalStorage & API data
│   │   ├── index.js
│   │   └── storageServices.js
│   ├── views/                  # Halaman utama aplikasi
│   │   ├── DashboardView.vue
│   │   ├── HistoryView.vue
│   │   ├── LoginView.vue
│   │   ├── StockView.vue
│   │   └── TrackingView.vue
│   ├── App.vue                 # Root component & Layout Switcher
│   └── main.js                 # Entry point utama aplikasi Vite
├── .gitignore
├── index.html
├── package-lock.json
└── package.json

```

---

## Arsitektur & Teknologi Utama

1. **Framework**: Vue 3 dengan *Composition API* (`<script setup>`) dan Vite bundler.
2. **Routing System**: Manual *State-Based Routing* menggunakan reaktif `currentView` di `src/router/index.js` yang dirender secara dinamis melalui `<component :is="...">` di `App.vue`.
3. **State & Storage**:
* Mengandalkan `localStorage` untuk persistensi data klien.
* Menggunakan kunci utama: `stock_db`, `trackingData`, `user_session`, dan `activeDoDetail`.


4. **UI Styling**: Pendekatan Indigo-Slate SaaS Theme dengan pemisahan file CSS per *view* di dalam folder `src/assets/css/views/` untuk menjaga kode `.vue` tetap bersih dari blok styling yang panjang (*zero-clutter*).

---

## Keamanan & Penanganan Bug Kritis (`stock_db`)

Untuk mencegah data stok (`stock_db`) terhapus atau tertimpa array kosong (`[]`) saat proses pembuatan *Delivery Order* (DO) atau perenderan ulang komponen:

* Penerapan *guard clause* pada fungsi `saveNewDo` di `TrackingView.vue`.
* Validasi data menggunakan `loadStockData()` sebelum melakukan manipulasi pengurangan stok (`qty -= 1`).
* Pengecekan ketat agar operasi penyimpanan LocalStorage tidak pernah menimpa database dengan data kosong.

---

## Cara Menjalankan Proyek

1. **Instalasi Dependensi**:
```bash
npm install

```


2. **Menjalankan Server Pengembangan (Dev Server)**:
```bash
npm run dev

```


3. **Membangun untuk Produksi (Build)**:
```bash
npm run build

```
STSI4302
STSI4309