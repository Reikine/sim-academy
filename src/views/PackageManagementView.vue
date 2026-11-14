<template>
    <div class="package-container">
        <div class="package-header-flex">
            <div>
                <h1 class="package-title">Manajemen Paket Bahan Ajar</h1>
                <p class="package-subtitle">Kelola bundel paket mata kuliah untuk keperluan pengiriman Delivery Order.
                </p>
            </div>
            <button
                @click="isModalOpen = true"
                class="btn-primary"
            >
                + Buat Paket Baru
            </button>
        </div>

        <div class="package-table-wrapper">
            <table class="package-table">
                <thead>
                    <tr>
                        <th>Kode Paket</th>
                        <th>Nama Paket</th>
                        <th>Harga (Rp)</th>
                        <th>Daftar Item Buku</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="pkg in packageList"
                        :key="pkg.code"
                    >
                        <td class="pkg-code">{{ pkg.code }}</td>
                        <td>{{ pkg.name }}</td>
                        <td>Rp {{ Number(pkg.price).toLocaleString('id-ID') }}</td>
                        <td>
                            <span
                                v-for="item in pkg.items"
                                :key="item"
                                class="badge-item"
                            >
                                {{ item }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div
            v-if="isModalOpen"
            class="package-modal-overlay"
        >
            <div class="package-modal-card">
                <h3 class="package-modal-title">Tambah Paket Bahan Ajar Baru</h3>

                <div class="form-group">
                    <label>Kode Paket</label>
                    <input
                        v-model="newPackage.code"
                        type="text"
                        class="form-input"
                        placeholder="Contoh: PAKET-UT-003"
                    />
                </div>

                <div class="form-group">
                    <label>Nama Paket</label>
                    <input
                        v-model="newPackage.name"
                        type="text"
                        class="form-input"
                        placeholder="Contoh: Paket Jaringan Komputer"
                    />
                </div>

                <div class="form-group">
                    <label>Total Harga Otomatis (Rp)</label>
                    <div class="auto-price-box">
                        Rp {{ calculatedPrice.toLocaleString('id-ID') }}
                        <span class="auto-price-note">(Akumulasi dari {{ newPackage.selectedItems.length }} buku
                            terpilih)</span>
                    </div>
                </div>

                <div class="form-group">
                    <label>Pilih Item Buku dalam Paket</label>
                    <div class="stock-selector-container">
                        <label
                            v-for="(book, index) in stockList"
                            :key="getBookCode(book) || index"
                            class="stock-selector-item"
                        >
                            <input
                                type="checkbox"
                                :value="getBookCode(book)"
                                v-model="newPackage.selectedItems"
                            />
                            <span class="book-code-text">{{ getBookCode(book) }}</span>
                            <span class="book-title-text">- {{ getBookName(book) }} (Rp {{
                                getBookPrice(book).toLocaleString('id-ID') }})</span>
                        </label>
                    </div>
                </div>

                <div class="modal-actions">
                    <button
                        @click="isModalOpen = false"
                        class="btn-secondary"
                    >Batal</button>
                    <button
                        @click="handleSavePackage"
                        class="btn-primary"
                    >Simpan Paket</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { loadPackageData, savePackageData, loadStockData } from '../services/storageServices.js';
import { useToast } from '../composables/useToast.js';

const { showToast } = useToast();
const packageList = ref([]);
const stockList = ref([]);
const isModalOpen = ref(false);

const newPackage = ref({
    code: '',
    name: '',
    selectedItems: []
});

onMounted(() => {
    packageList.value = loadPackageData();
    stockList.value = loadStockData();
});

// Normalize stock object properties across varying key conventions
const getBookCode = (book) => {
    return book.code || book.kode || book.id || book.itemCode || book.courseCode || Object.values(book)[0];
};

const getBookName = (book) => {
    return book.name || book.nama || book.title || book.bookName || 'Buku Tanpa Nama';
};

const getBookPrice = (book) => {
    return Number(book.price || book.harga || book.cost || 0);
};

// Automatically calculate total package price from selected book items
const calculatedPrice = computed(() => {
    return newPackage.value.selectedItems.reduce((total, itemCode) => {
        const book = stockList.value.find(b => getBookCode(b) === itemCode);
        return total + getBookPrice(book);
    }, 0);
});

// Validate inputs, persist new package bundle to localStorage, and reset form
const handleSavePackage = () => {
    if (!newPackage.value.code || !newPackage.value.name) {
        showToast('Kode dan Nama Paket wajib diisi!', 'warning');
        return;
    }

    if (newPackage.value.selectedItems.length === 0) {
        showToast('Pilih minimal satu item buku untuk paket ini!', 'warning');
        return;
    }

    const pkgData = {
        code: newPackage.value.code.trim(),
        name: newPackage.value.name.trim(),
        price: calculatedPrice.value,
        items: [...newPackage.value.selectedItems]
    };

    packageList.value.push(pkgData);
    savePackageData(packageList.value);

    showToast(`Paket ${pkgData.code} berhasil ditambahkan!`, 'success');
    isModalOpen.value = false;

    newPackage.value = { code: '', name: '', selectedItems: [] };
};
</script>

<style>
@import '../assets/css/views/package.css';
</style>