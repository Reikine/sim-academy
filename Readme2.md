# Dokumentasi Sistem SITTA (Sistem Pengelolaan Bahan Ajar Universitas Terbuka)

Dokumen ini menyajikan pembaruan komprehensif mengenai arsitektur, struktur direktori lengkap, manajemen *routing* berbasis *state*, serta sistem pengaman persistensi data pada aplikasi **SITTA**.

## 1. Gambaran Umum Proyek

SITTA adalah aplikasi berbasis web bersgaya SaaS (*SaaS-style administrative application*) yang dikembangkan untuk mengelola manajemen inventaris bahan ajar, pembuatan *Delivery Order* (DO), riwayat pesanan, dan pelacakan pengiriman di lingkungan Universitas Terbuka.

* **Framework**: Vue 3 (Composition API dengan `<script setup>`) & Vite
* **Tampilan**: Indigo-Slate SaaS Theme (Desain responsif, modular, bersih, dan menggunakan notifikasi Toast)
* **Penyimpanan**: Browser LocalStorage (`stock_db`, `trackingData`, `user_session`, `user_db`, dll.)

---

## 2. Struktur Direktori Proyek (Clean & Modular Architecture)

Struktur folder disusun secara rapi dan modular untuk memisahkan tanggung jawab (*separation of concerns*) secara presisi:

```text
SIM_ACADEMIC/
├── .vscode/                 # Konfigurasi editor
├── node_modules/            # Dependensi proyek
├── public/                  # Aset publik statis
├── src/
│   ├── assets/              # Aset visual & styling global (base.css, toast.css)
│   ├── components/          # Komponen modular reusable (Header, SidebarNav, Modals, Tables)
│   │   ├── Header.vue
│   │   ├── SidebarNav.vue
│   │   ├── StockEditModal.vue
│   │   ├── StockFilter.vue
│   │   ├── StockFormModal.vue
│   │   ├── StockTable.vue
│   │   ├── Toast.vue
│   │   └── TrackingModal.vue
│   ├── composables/         # Logika reaktif yang dapat digunakan kembali
│   │   └── useToast.js
│   ├── data/                # Master data mentah aplikasi
│   │   └── data.json
│   ├── router/              # Manajemen rute manual berbasis state
│   │   └── index.js
│   ├── services/            # Layanan data dan penyimpanan terpusat
│   │   ├── index.js
│   │   └── storageServices.js
│   ├── views/               # Halaman utama aplikasi
│   │   ├── DashboardView.vue
│   │   ├── HistoryView.vue
│   │   ├── LoginView.vue
│   │   ├── StockView.vue
│   │   └── TrackingView.vue
│   ├── App.vue              # Root component & Layout Switcher
│   └── main.js              # Entry point utama Vite
├── .gitignore
├── index.html
└── package-lock.json
```

---

## 3. Sistem *Routing* & Layout Utama (`App.vue`)

Manajemen halaman tidak lagi bergantung pada *browser history* standar, melainkan dikelola secara reaktif melalui variabel `currentView` di dalam folder `router/index.js`.

* **Tampilan Full-Screen**: Saat `currentView` bernilai `'login'` atau `'register'`, aplikasi merender `LoginView` secara penuh tanpa menampilkan elemen navigasi utama.
* **Tampilan App Shell**: Saat sesi pengguna aktif (`user_session`), aplikasi menampilkan struktur tata letak lengkap berkolom yang terdiri atas `SidebarNav` di kiri, `AppTopHeader` di atas, dan area konten dinamis di tengah menggunakan `<component :is="activeComponent" />`.

---

## 4. Manajemen State & Pengaman Integritas Data

Untuk mengatasi masalah hilangnya inventaris akibat penimpaan state kosong, sistem menerapkan beberapa mekanisme pengaman penting:

1. **Pencegahan Overwrite Kosong**: Fungsi penyimpanan saat membuat *Delivery Order* (DO) dilengkapi dengan *guard clause* ketat untuk memastikan array kosong (`[]`) tidak pernah menimpa database fisik `stock_db`.
2. **Filter & Modifikasi Stok Aman**: Fitur filter interaktif (termasuk tombol `"Perlu Re-order"`) berjalan selaras tanpa merusak struktur pencarian maupun filter wilayah.
3. **Pemisahan Layanan Data**: Logika pembacaan dan penulisan LocalStorage diisolasi secara bersih melalui file-file yang berada di dalam folder `services/`.