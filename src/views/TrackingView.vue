<template>
    <div
        id="app-tracking"
        class="app-layout"
        v-cloak
    >
        <main class="app-main">
            <div class="tracking-page-header">
                <div>
                    <h2>Pelacakan Delivery Order (DO)</h2>
                    <p class="subtitle">Lacak status pengiriman paket bahan ajar.</p>
                </div>
                <div>
                    <button
                        type="button"
                        @click="openDoModal"
                        class="btn-primary"
                    >
                        <span class="material-symbols-outlined icon-18">add</span>
                        Buat Delivery Order Baru
                    </button>
                </div>
            </div>

            <form
                @submit.prevent="handleSearchDo"
                class="search-section"
            >
                <div class="search-box">
                    <div class="form-group-search">
                        <label for="searchQuery">NOMOR DELIVERY ORDER (DO):</label>
                        <div class="search-input-wrapper">
                            <input
                                id="searchQuery"
                                type="text"
                                v-model="searchQuery"
                                placeholder="Contoh: DO2026-001"
                                class="form-control"
                            />
                            <button
                                type="submit"
                                class="btn-primary"
                            >
                                <span class="material-symbols-outlined icon-18">search</span>
                                Cari
                            </button>
                        </div>
                    </div>
                </div>
                <p
                    v-if="searchError"
                    class="error-text"
                >{{ searchError }}</p>
            </form>

            <div
                v-if="searchResult"
                class="tracking-result-card"
            >
                <div class="result-card-header">
                    <h3>Detail Tracking DO: <span>{{ searchResult.doNumber }}</span></h3>
                    <span class="status-badge">{{ searchResult.status }}</span>
                </div>

                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">NIM</span>
                        <span class="info-value">{{ searchResult.nim }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">NAMA MAHASISWA</span>
                        <span class="info-value">{{ searchResult.name }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">EKSPEDISI</span>
                        <span class="info-value">{{ searchResult.courier }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">KODE PAKET</span>
                        <span class="info-value">{{ searchResult.packageCode }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">TANGGAL KIRIM</span>
                        <span class="info-value">{{ searchResult.shipmentDate }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">TOTAL HARGA</span>
                        <span class="info-value text-primary">
                            Rp {{ Number(searchResult.total || 0).toLocaleString('id-ID') }}
                        </span>
                    </div>
                </div>

                <div class="tracking-history-section">
                    <h4>Riwayat Perjalanan Paket</h4>
                    <ul class="timeline-list">
                        <li
                            v-for="(h, index) in searchResult.history"
                            :key="index"
                            class="timeline-item"
                        >
                            <span class="timeline-time">[{{ h.time }}]</span>
                            <span class="timeline-desc">{{ h.description }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </main>

        <TrackingModal
            :isOpen="isDoModalOpen"
            :isConfirmStep="isConfirmStep"
            v-model="newDo"
            :deliveryList="deliveryList"
            :packageList="packageList"
            :selectedPackageItemsDetails="selectedPackageItemsDetails"
            @proceed-confirm="proceedToConfirm"
            @save="saveNewDo"
            @back="backToForm"
            @close="closeModal"
        />
    </div>
</template>

<script setup>
import { useToast } from '../composables/useToast.js';
import {
    requireAuth,
    getStorage,
    setStorage,
    formatDateTime,
    getTodayDateString,
    checkAndPromoteStatus,
    loadTrackingData,
    loadPackageData,
    loadConstants,
    loadStockData
} from '../services';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import TrackingModal from '../components/TrackingModal.vue';

const { toasts, showToast } = useToast();
const currentUser = ref({ name: 'Pengguna', role: 'User' });

let pollInterval = null;

const trackingList = ref({});
const packageList = ref([]);
const deliveryList = ref([]);
const searchQuery = ref('');
const searchResult = ref(null);
const searchError = ref('');
const isDoModalOpen = ref(false);
const isConfirmStep = ref(false);

const newDo = ref({
    doNumber: '',
    nim: '',
    name: '',
    courier: '',
    packageCode: '',
    shipmentDate: getTodayDateString(),
    total: 0,
    history: []
});

onMounted(() => {
    const auth = requireAuth();
    if (!auth) return;

    currentUser.value = auth.user;
    trackingList.value = loadTrackingData();
    packageList.value = loadPackageData();

    const constants = loadConstants();
    deliveryList.value = constants.deliveryList;

    checkAndPromoteStatus(trackingList.value);

    const urlParams = new URLSearchParams(window.location.search);
    const doFromUrl = urlParams.get('do');
    const doFromStorage = getStorage('activeDoDetail');
    const targetDo = doFromUrl || doFromStorage;

    if (targetDo) {
        searchQuery.value = targetDo;
        handleSearchDo();
        localStorage.removeItem('activeDoDetail');
    }

    pollInterval = setInterval(() => {
        const currentData = getStorage('trackingData');
        if (!currentData) return;

        const isPromoted = checkAndPromoteStatus(currentData);
        if (isPromoted) {
            trackingList.value = currentData;
            if (searchResult.value && trackingList.value[searchResult.value.doNumber]) {
                searchResult.value = { ...trackingList.value[searchResult.value.doNumber] };
            }
        }
    }, 2000);
});

onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval);
});

const handleSearchDo = () => {
    if (toasts.value && toasts.value.length > 0) return;

    searchError.value = '';
    searchResult.value = null;

    const query = searchQuery.value.trim();
    if (!query) {
        searchError.value = 'Silakan masukkan nomor Delivery Order (DO).';
        return;
    }

    const matchedKey = Object.keys(trackingList.value).find(
        key => key.toLowerCase() === query.toLowerCase()
    );

    if (matchedKey && trackingList.value[matchedKey]) {
        searchResult.value = trackingList.value[matchedKey];
        return;
    }

    showToast('Paket tidak ditemukan!', 'error', 0);
};

const resolvePackageStock = (packageCode) => {
    if (!packageCode) return null;
    const pkg = packageList.value.find(p => p.code === packageCode);
    if (!pkg) return null;

    const stockList = getStorage('stock_db', null) || loadStockData() || [];
    return { pkg, stockList };
};

const selectedPackageItemsDetails = computed(() => {
    const data = resolvePackageStock(newDo.value.packageCode);
    if (!data || !data.pkg.items) return [];

    return data.pkg.items.map(code => {
        const cleanCode = String(code).trim().toLowerCase();
        const matchedItem = data.stockList.find(s => {
            const sCode = String(s.kode || s.itemCode || s.code || '').trim().toLowerCase();
            return sCode === cleanCode;
        });

        const itemTitle = matchedItem
            ? (matchedItem.namaItem || matchedItem.nama || matchedItem.title || matchedItem.name || matchedItem.itemName)
            : code;

        return { code, title: itemTitle };
    });
});

const validateSelectedPackage = () => {
    const data = resolvePackageStock(newDo.value.packageCode);
    if (!data) {
        showToast('Paket bahan ajar tidak valid!', 'error');
        return null;
    }

    const itemsToDeduct = data.pkg.items || [newDo.value.packageCode];

    for (const code of itemsToDeduct) {
        const stockItem = data.stockList.find(
            s => String(s.itemCode || s.kode || s.code || '').trim().toLowerCase() === String(code).trim().toLowerCase()
        );

        if (stockItem) {
            const currentQty = Number(stockItem.qty || 0);
            const safetyStock = Number(stockItem.safetyStock || 0);

            if (currentQty < safetyStock) {
                const statusText = currentQty === 0 ? 'KOSONG' : 'MENIPIS';
                showToast(`Paket ditolak! Stok ${stockItem.title || code} status ${statusText}`, 'error');
                return null;
            }
        }
    }

    return data.pkg;
};

const openDoModal = () => {
    const year = new Date().getFullYear();
    const count = Object.keys(trackingList.value).length + 1;
    const sequence = String(count).padStart(3, '0');

    newDo.value = {
        doNumber: `DO${year}-${sequence}`,
        nim: '',
        name: '',
        courier: '',
        packageCode: '',
        shipmentDate: getTodayDateString(),
        total: 0,
        history: []
    };

    isDoModalOpen.value = true;
};

const proceedToConfirm = () => {
    if (!newDo.value.nim || !newDo.value.name || !newDo.value.courier || !newDo.value.packageCode) {
        showToast('Semua kolom bertanda wajib harus diisi!', 'warning');
        return;
    }

    const today = getTodayDateString();
    if (newDo.value.shipmentDate < today) {
        showToast('Tanggal kirim tidak boleh menggunakan tanggal yang sudah lalu!', 'warning');
        return;
    }

    const selectedPkg = validateSelectedPackage();
    if (!selectedPkg) return;

    isConfirmStep.value = true;
};

const backToForm = () => {
    isConfirmStep.value = false;
};

const saveNewDo = () => {
    if (!newDo.value.nim || !newDo.value.name || !newDo.value.courier || !newDo.value.packageCode) {
        showToast('Semua kolom bertanda wajib harus diisi!', 'warning');
        return;
    }

    const selectedPkg = validateSelectedPackage();
    if (!selectedPkg) return;

    let stockList = getStorage('stock_db', []);
    if (!stockList || stockList.length === 0) {
        stockList = loadStockData() || [];
    }

    const itemsToDeduct = selectedPkg.items || [newDo.value.packageCode];

    itemsToDeduct.forEach(code => {
        const stockIndex = stockList.findIndex(
            s => String(s.itemCode || s.kode || s.code || '').trim().toLowerCase() === String(code).trim().toLowerCase()
        );

        if (stockIndex !== -1 && stockList[stockIndex].qty > 0) {
            stockList[stockIndex].qty -= 1;
        }
    });

    if (stockList && stockList.length > 0) {
        setStorage('stock_db', stockList);
    } else {
        showToast('Gagal memperbarui stok: Data stok lokal kosong!', 'error');
        return;
    }

    const createdDoNumber = newDo.value.doNumber;

    trackingList.value[createdDoNumber] = {
        doNumber: createdDoNumber,
        nim: newDo.value.nim.toString(),
        name: newDo.value.name.trim(),
        email: currentUser.value.email || '',
        createdBy: currentUser.value.email || currentUser.value.name || '',
        status: 'Diproses',
        courier: newDo.value.courier,
        shipmentDate: newDo.value.shipmentDate,
        packageCode: newDo.value.packageCode,
        total: selectedPkg.price,
        createdAt: Date.now(),
        history: [
            {
                time: formatDateTime(),
                description: 'Penerimaan di Loket: TANGERANG SELATAN. Pengirim: Universitas Terbuka'
            }
        ]
    };

    setStorage('trackingData', trackingList.value);
    showToast(`Delivery Order ${createdDoNumber} berhasil dibuat! Stok telah diperbarui.`, 'success');

    searchQuery.value = createdDoNumber;
    handleSearchDo();
    closeModal();
};

const closeModal = () => {
    isDoModalOpen.value = false;
    isConfirmStep.value = false;
};
</script>

<style>
@import '../assets/css/views/tracking.css';
</style>
