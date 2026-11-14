<template>
    <div
        id="app-stock"
        class="app-layout"
        v-cloak
    >
        <main class="app-main">
            <div class="stock-page-header">
                <div>
                    <h2>Informasi Stok Bahan Ajar</h2>
                    <p class="subtitle">Kelola ketersediaan bahan ajar.</p>
                </div>
                <div v-if="isAdmin">
                    <button
                        type="button"
                        @click="toggleNewForm"
                        class="btn-primary"
                    >
                        <span class="material-symbols-outlined icon-18">add</span>
                        {{ showNewForm ? 'Tutup Form' : 'Bahan Ajar' }}
                    </button>
                </div>
            </div>

            <StockFilter
                :regionList="regionList"
                v-model:selectedRegion="selectedRegion"
                v-model:selectedCategory="selectedCategory"
                v-model:searchQuery="searchQuery"
                :isReorderFilterActive="isReorderFilterActive"
                :availableCategories="availableCategories"
                @toggle-reorder="toggleReorderFilter"
                @reset-filters="resetFilters"
            />

            <StockTable
                :filteredStock="filteredStock"
                :isAdmin="isAdmin"
                :sortColumn="sortColumn"
                :sortDirection="sortDirection"
                @sort="handleSort"
                @edit-book="openBookModal"
                @delete-book="openDeleteModal"
            />
        </main>

        <StockFormModal
            :show="showNewForm"
            :isAdmin="isAdmin"
            v-model="newBook"
            @submit="handleRegisterBook"
            @close="toggleNewForm"
        />

        <StockEditModal
            :show="isModalOpen"
            :isAdmin="isAdmin"
            :selectedBook="selectedBook"
            :tempQty="tempQty"
            v-model:actionInput="stockActionInput"
            :activeAction="activeAction"
            @add="addStock"
            @reduce="reduceStock"
            @submit="saveBookChanges"
            @close="closeModal"
        />

        <div
            v-if="isDeleteModalOpen && isAdmin"
            class="modal-backdrop"
        >
            <div class="modal-card modal-card-sm">
                <h3>Konfirmasi Hapus</h3>
                <p>
                    Hapus bahan ajar <strong>{{ bookToDelete?.itemCode }} - {{ bookToDelete?.title }}</strong>?
                </p>
                <div class="form-actions modal-footer-actions">
                    <button
                        type="button"
                        @click="confirmDeleteBook"
                        class="btn-save"
                    >Ya, Hapus</button>
                    <button
                        type="button"
                        @click="closeDeleteModal"
                        class="btn-cancel"
                    >Batal</button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import {
    requireAuth,
    getStorage,
    setStorage,
    loadStockData,
    loadConstants
} from '../services';
import { useToast } from '../composables/useToast.js';
import { ref, computed, watch, onMounted } from 'vue';

import StockFilter from '../components/StockFilter.vue';
import StockTable from '../components/StockTable.vue';
import StockFormModal from '../components/StockFormModal.vue';
import StockEditModal from '../components/StockEditModal.vue';

const regionList = ref([]);
const categoryList = ref([]);
const stock = ref([]);

const { showToast } = useToast();
const currentUser = ref({ name: 'Pengguna', role: 'User' });
const isAdmin = computed(() => currentUser.value?.role?.toLowerCase() === 'administrator');

const selectedRegion = ref('');
const selectedCategory = ref('');
const searchQuery = ref('');
const isReorderFilterActive = ref(false);

const sortColumn = ref('');
const sortDirection = ref('asc');
const showNewForm = ref(false);
const isModalOpen = ref(false);
const selectedBook = ref(null);
const stockActionInput = ref('');
const tempQty = ref(0);
const activeAction = ref(null);

const isDeleteModalOpen = ref(false);
const bookToDelete = ref(null);

const newBook = ref({
    itemCode: '', title: '', category: '', region: '',
    rackLocation: '', price: null, qty: 1, safetyStock: 5, notesHTML: ''
});

onMounted(() => {
    const auth = requireAuth();
    if (!auth) return;
    currentUser.value = auth.user;
    stock.value = loadStockData();

    const constants = loadConstants();
    regionList.value = constants.regions;
    categoryList.value = constants.categories
});

watch(selectedRegion, () => {
    selectedCategory.value = '';
});

watch(searchQuery, (newQuery) => {
    if (newQuery.trim() !== '' && isReorderFilterActive.value) {
        isReorderFilterActive.value = false;
    }
});

const availableCategories = computed(() => {
    let data = stock.value;
    if (selectedRegion.value) {
        data = data.filter(item => item.region === selectedRegion.value);
    }
    return [...new Set(data.map(item => item.category))];
});

const filteredStock = computed(() => {
    let result = stock.value.filter(item => {

        const isRegionMatched = !selectedRegion.value || item.region === selectedRegion.value;
        const isCategoryMatched = !selectedCategory.value || item.category === selectedCategory.value;
        const isSearchMatched = !searchQuery.value ||
            item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            item.itemCode.toLowerCase().includes(searchQuery.value.toLowerCase());

        if (isReorderFilterActive.value) {
            const isReorderNeeded = item.qty < item.safetyStock || item.qty === 0;
            return isRegionMatched && isCategoryMatched && isSearchMatched && isReorderNeeded;
        }

        return isRegionMatched && isCategoryMatched && isSearchMatched;
    });

    if (!sortColumn.value) return result;

    return result.sort((a, b) => {
        const modifier = sortDirection.value === 'asc' ? 1 : -1;
        let valA = a[sortColumn.value];
        let valB = b[sortColumn.value];

        if (sortColumn.value === 'price') {
            valA = typeof valA === 'number' ? valA : (Number(String(valA).replace(/[^0-9]/g, '')) || 0);
            valB = typeof valB === 'number' ? valB : (Number(String(valB).replace(/[^0-9]/g, '')) || 0);
        }

        if (typeof valA === 'string') {
            return valA.localeCompare(valB) * modifier;
        }
        return (valA - valB) * modifier;
    });
});

const toggleReorderFilter = () => {
    isReorderFilterActive.value = !isReorderFilterActive.value;
};

const resetFilters = () => {
    selectedRegion.value = '';
    selectedCategory.value = '';
    searchQuery.value = '';
    isReorderFilterActive.value = false;
    showToast('Filter berhasil direset.', 'info');
};

const handleSort = (column) => {
    if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
        return;
    }
    sortColumn.value = column;
    sortDirection.value = 'asc';
};

const toggleNewForm = () => {
    if (!isAdmin.value) {
        showToast('Akses Ditolak! Fitur ini khusus Administrator.', 'error');
        return;
    }
    showNewForm.value = !showNewForm.value;
};

const handleRegisterBook = () => {
    if (!isAdmin.value) {
        showToast('Akses Ditolak!', 'error');
        return;
    }
    if (!newBook.value.itemCode || !newBook.value.title) {
        showToast('Kode Item dan Judul Buku wajib diisi!', 'warning');
        return;
    }
    const cleanCode = String(newBook.value.itemCode).trim();
    const isDuplicate = stock.value.some(
        item => String(item.itemCode).trim().toLowerCase() === cleanCode.toLowerCase()
    );
    if (isDuplicate) {
        showToast(`Kode Item '${cleanCode}' sudah terdaftar!`, 'warning');
        return;
    }
    stock.value.push({
        ...newBook.value,
        itemCode: cleanCode,
        title: String(newBook.value.title).trim(),
        price: Number(newBook.value.price || 0)
    });
    setStorage('stock_db', stock.value);
    showNewForm.value = false;
    newBook.value = {
        itemCode: '', title: '', category: '', region: '',
        rackLocation: '', price: null, qty: 1, safetyStock: 5, notesHTML: ''
    };
    showToast('Bahan ajar baru berhasil didaftarkan!', 'success');
};

const openBookModal = (book) => {
    if (!isAdmin.value) {
        showToast('Akses Ditolak!', 'error');
        return;
    }
    selectedBook.value = { ...book };
    tempQty.value = Number(book.qty !== undefined ? book.qty : 0);
    stockActionInput.value = '';
    isModalOpen.value = true;
    activeAction.value = null;
};

const addStock = () => {
    if (!selectedBook.value) return;
    const val = Number(stockActionInput.value) || 0;
    if (val <= 0) {
        showToast('Masukkan angka penambahan stok yang valid!', 'warning');
        return;
    }
    tempQty.value = Number(selectedBook.value.qty) + val;
    activeAction.value = 'add';
};

const reduceStock = () => {
    if (!selectedBook.value) return;
    const val = Number(stockActionInput.value) || 0;
    if (val <= 0) {
        showToast('Masukkan angka pengurangan stok yang valid!', 'warning');
        return;
    }
    const current = Number(selectedBook.value.qty);
    if (current - val < 0) {
        showToast('Stok tidak boleh kurang dari 0!', 'warning');
        return;
    }
    tempQty.value = current - val;
    activeAction.value = 'reduce';
};

const saveBookChanges = () => {
    if (!isAdmin.value) {
        showToast('Akses Ditolak!', 'error');
        return;
    }
    if (!selectedBook.value) return;

    const inputVal = Number(stockActionInput.value) || 0;

    if (inputVal > 0 && !activeAction.value) {
        showToast('Pilih aksi (Tambah atau Kurang) terlebih dahulu!', 'warning');
        return;
    }

    let finalQty = Number(selectedBook.value.qty);

    if (activeAction.value === 'add') {
        finalQty += inputVal;
    } else if (activeAction.value === 'reduce') {
        finalQty -= inputVal;
        if (finalQty < 0) {
            showToast('Stok tidak boleh kurang dari 0!', 'warning');
            return;
        }
    }

    const targetCode = String(selectedBook.value.itemCode).trim().toLowerCase();
    const index = stock.value.findIndex(
        item => String(item.itemCode).trim().toLowerCase() === targetCode
    );

    if (index === -1) {
        showToast('Data bahan ajar tidak ditemukan!', 'error');
        return;
    }

    stock.value[index].qty = finalQty;
    setStorage('stock_db', stock.value);

    isModalOpen.value = false;
    stockActionInput.value = '';
    activeAction.value = null;
    showToast('Perubahan stok berhasil disimpan!', 'success');
};

const closeModal = () => {
    isModalOpen.value = false;
};

const openDeleteModal = (book) => {
    if (!isAdmin.value) return;
    bookToDelete.value = book;
    isDeleteModalOpen.value = true;
};

const confirmDeleteBook = () => {
    if (!isAdmin.value || !bookToDelete.value) return;
    const targetCode = String(bookToDelete.value.itemCode).trim().toLowerCase();
    stock.value = stock.value.filter(
        item => String(item.itemCode).trim().toLowerCase() !== targetCode
    );
    setStorage('stock_db', stock.value);
    showToast(`Bahan ajar ${bookToDelete.value.itemCode} berhasil dihapus!`, 'success');
    closeDeleteModal();
};

const closeDeleteModal = () => {
    isDeleteModalOpen.value = false;
    bookToDelete.value = null;
};
</script>

<style>
@import '../assets/css/views/stock.css';
</style>
