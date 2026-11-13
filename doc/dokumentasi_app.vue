# Dokumentasi Teknis Arsitektur Inti (`main.js`, `App.vue`, `router/index.js`, & `storageServices.js`)

Keempat file ini merupakan fondasi utama (*core layer*) dari aplikasi **SITTA** berbasis Vue 3 SPA, yang menghubungkan proses inisialisasi aplikasi, manajemen navigasi halaman berbasis *state*, kerangka tata letak global, serta lapisan abstraksi penyimpanan data lokal.

---

## 1. `main.js` (Entry Point Aplikasi)

File titik masuk (*entry point*) yang bertugas menginisialisasi instance root Vue dan memasangkannya ke DOM[cite: 19].

* **Pembuatan Instance (`createApp(App)`)**: Mengimpor komponen akar `App.vue` dan me-mount aplikasi ke elemen HTML `#app`[cite: 19].
* **Gaya Global Awal**: Mengimpor `./assets/css/base.css` di tingkat paling atas agar variabel desain (*design tokens*) dan aturan dasar tersedia sebelum komponen pertama dirender[cite: 19].

---

## 2. `router/index.js` (State-Driven Router)

Modul navigasi ringan tanpa dependensi eksternal (*Zero-Bloat*) yang mengatur perpindahan antar-halaman menggunakan reaktivitas bawaan Vue[cite: 21].

| Bagian Kode | Tipe | Fungsi & Peran |
| :--- | :--- | :--- |
| `savedView` | `String` | Membaca kunci `'active_view'` dari `localStorage` saat aplikasi dimuat, dengan nilai bawaan `'login'` jika belum ada riwayat halaman[cite: 21]. |
| `currentView` | `ref(String)` | *Global reactive state* yang diekspor dan dibagikan ke seluruh komponen untuk menentukan tampilan yang sedang aktif[cite: 21]. |
| `watch(currentView)` | Watcher | Secara otomatis menyinkronkan setiap perubahan nilai `currentView` ke `localStorage` (`active_view`), sehingga posisi halaman terakhir tetap bertahan meskipun pengguna melakukan *refresh* browser[cite: 21]. |

---

## 3. `App.vue` (Root Component & Application Shell)

Komponen induk tertinggi yang mengatur tata letak kondisional (*conditional layout*) antara halaman autentikasi dan ruang kerja utama aplikasi[cite: 20].

### A. Pemetaan Halaman (`viewsMap` & `activeComponent`)
* **`viewsMap`**: Objek kamus yang memetakan string `currentView` ke komponen tampilan masing-masing (`login` dan `register` $\rightarrow$ `LoginView`, `dashboard` $\rightarrow$ `DashboardView`, `stock` $\rightarrow$ `StockView`, `history` $\rightarrow$ `HistoryView`, `tracking` $\rightarrow$ `TrackingView`, serta `packageManagement` $\rightarrow$ `PackageManagementView`)[cite: 20].
* **`activeComponent` (`computed`)**: Mengembalikan komponen aktif secara dinamis berdasarkan `currentView.value`, dengan `LoginView` sebagai *fallback* apabila nilai *route* tidak dikenali[cite: 20].

### B. Percabangan Tata Letak Template
1. **Mode Autentikasi (`v-if="currentView === 'login' || currentView === 'register'"`)**: Merender `LoginView` secara penuh di dalam `.login-page-wrapper` tanpa bilah samping maupun header atas[cite: 20].
2. **Mode Aplikasi Utama (`v-else`)**: Merender kerangka *dashboard* yang terdiri atas `SidebarNav` di sisi kiri, `AppTopHeader` (`Header.vue`) di bagian atas, area konten dinamis `<component :is="activeComponent" />`, serta *footer* hak cipta di bagian bawah[cite: 20].
3. **Notifikasi Global (`<Toast />`)**: Ditempatkan di luar percabangan tata letak sehingga pesan *toast* tetap muncul di atas seluruh halaman, baik saat di halaman login maupun di dalam *dashboard*[cite: 20].

### C. Catatan Teknis & Pembersihan Kode (`App.vue`)
* **Konsistensi Kunci Sesi (`onMounted`)**: Pada `App.vue`, `onMounted` memeriksa `getStorage('user_session', null)` untuk mengarahkan pengguna ke `'dashboard'`[cite: 20], sementara `LoginView.vue` menyimpan sesi login menggunakan kunci `'auth_token'`. Pastikan kedua file menggunakan kunci yang sama (misalnya memanggil `getAuthUser()` dari `../services`) agar pengecekan sesi otomatis berjalan konsisten.
* **Pembersihan Import (*Zero-Bloat*)**: Tiga impor aset bawaan template Vite di bagian atas (`heroImg`, `viteLogo`, `vueLogo`) serta `@import './assets/css/base.css';` di blok `<style>
` (karena `base.css` sudah diimpor di `main.js`) tidak digunakan dan dapat dihapus agar kode lebih ramping[cite: 19,
20]. --- ## 4. `services/storageServices.js` (Lapisan Data & Seeding) Modul penyedia data (*data access layer*) yang menghubungkan data awal statis (`../data/data.json`) dengan penyimpanan persisten `localStorage`[cite: 22]. ### A. Mekanisme *Lazy Seeding* Setiap fungsi `load...` memanfaatkan helper `getStorage(key, defaultValue)`[cite: 22]. Jika kunci di `localStorage` belum ada (kunjungan pertama),
aplikasi otomatis mengisi nilai bawaan dari `data.json`;
jika sudah ada,
aplikasi membaca data terbaru hasil perubahan pengguna[cite: 22]: | Fungsi | Kunci `localStorage` | Sumber Bawaan (`data.json`) | Kegunaan | | :--- | :--- | :--- | :--- | | `loadStockData()` | `'stock_db' ` | `rawData.initialStockData` | Memuat daftar persediaan bahan ajar[cite: 22]. | | `loadTrackingData()` | `'trackingData' ` | `rawData.trackingData` | Memuat data transaksi dan riwayat pengiriman DO[cite: 22]. | | `loadUserData()` | `'user_db' ` | `rawData.initialUserData` | Memuat daftar akun pengguna untuk autentikasi[cite: 22]. | | `loadPackageData()` | `'package_db' ` | `rawData.packageList` | Memuat daftar bundel paket bahan ajar[cite: 22]. | | `loadConstants()` | *(Tidak disimpan)* | `regionList`,
`categoryList`,
`deliveryList` | Mengembalikan data referensi statis untuk opsi dropdown filter dan ekspedisi[cite: 22]. | | `savePackageData(packages)` | `'package_db' ` | — | Menyimpan pembaruan daftar paket bahan ajar ke `localStorage`[cite: 22]. |
