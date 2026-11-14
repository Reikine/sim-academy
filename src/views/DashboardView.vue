<template>
    <div
        class="dashboard-container"
        v-cloak
    >

        <div class="dashboard-header-section">
            <h2>Dashboard</h2>
            <p>Ringkasan informasi persediaan dan transaksi bahan ajar secara real-time.</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon-wrapper blue">
                    <span class="material-symbols-outlined">menu_book</span>
                </div>
                <div class="stat-info">
                    <h4>Total Bahan Ajar</h4>
                    <p class="stat-value">{{ stockList.length }}</p>
                    <span class="stat-desc">Jenis bahan ajar terdaftar</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon-wrapper green">
                    <span class="material-symbols-outlined">inventory_2</span>
                </div>
                <div class="stat-info">
                    <h4>Total Persediaan</h4>
                    <p class="stat-value">{{ totalAllStock }}</p>
                    <span class="stat-desc">Jumlah seluruh stok fisik</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon-wrapper orange">
                    <span class="material-symbols-outlined">local_shipping</span>
                </div>
                <div class="stat-info">
                    <h4>Paket Bahan Ajar</h4>
                    <p class="stat-value">{{ packageList.length }}</p>
                    <span class="stat-desc">Paket tersedia</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon-wrapper purple">
                    <span class="material-symbols-outlined">search</span>
                </div>
                <div class="stat-info">
                    <h4>Data Tracking</h4>
                    <p class="stat-value">{{ totalTracking }}</p>
                    <span class="stat-desc">Delivery Order aktif</span>
                </div>
            </div>
        </div>

        <div class="panel-box">
            <div class="panel-header-flex">
                <div>
                    <h3>Monitor dan Status Persediaan Stok</h3>
                    <p class="panel-subtitle">Ringkasan kondisi keseluruhan stok dam daftar bahan ajar di bawah safety
                        stock.</p>
                </div>

                <div class="header-status-badges">
                    <span class="badge-safe">Aman: <strong>{{ safeStockCount }}</strong></span>
                    <span class="badge-warning">Perlu Perhatian: <strong>{{ lowStockItems.length }}</strong></span>
                </div>
            </div>

            <div class="reorder-section">
                <h4 class="reorder-title">Daftar Item Perlu Re-Order:</h4>
                <div
                    class="alert-item-list"
                    v-if="lowStockItems.length > 0"
                >
                    <div
                        v-for="(item, index) in lowStockItems"
                        :key="item.itemCode"
                        class="alert-card-item"
                    >
                        <div class="alert-number">{{ index + 1 }}</div>
                        <div class="alert-details">
                            <strong>{{ item.title }}</strong>
                            <span>{{ item.itemCode }} &bull; {{ item.region }}</span>
                        </div>
                        <div class="alert-status-box">
                            <span class="stock-num">{{ item.qty }}</span>
                            <span :class="item.qty === 0 ? 'badge-danger' : 'badge-warning'">
                                {{ item.qty === 0 ? 'Kosong' : 'Menipis' }}
                            </span>
                            <small>Safety: {{ item.safetyStock }}</small>
                        </div>
                    </div>
                </div>
                <p
                    v-else
                    class="empty-stock-alert"
                >Semua stok bahan ajar dalam kondisi aman.</p>
            </div>
        </div>

        <div class="panel-box">
            <div class="panel-header-flex">
                <h3>Ringkasan Stok Bahan Ajar</h3>
                <a
                    href="#"
                    @click.prevent="goToStock"
                    class="link-see-all"
                >Lihat Semua</a>
            </div>
            <p class="panel-subtitle">Persediaan bahan ajar terbaru dari database lokal.</p>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Kode</th>
                            <th>Judul Bahan Ajar</th>
                            <th>UT-Daerah</th>
                            <th>Lokasi Rak</th>
                            <th>Stok</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(item, index) in stockList.slice(0, 5)"
                            :key="item.itemCode"
                        >
                            <td>{{ index + 1 }}</td>
                            <td>{{ item.itemCode }}</td>
                            <td>{{ item.title }}</td>
                            <td>{{ item.region }}</td>
                            <td>{{ item.rackLocation || '-' }}</td>
                            <td>{{ item.qty }}</td>
                            <td>
                                <span :class="{
                                    'badge-aman': item.qty >= item.safetyStock,
                                    'badge-menipis': item.qty < item.safetyStock && item.qty > 5,
                                    'badge-kritis': item.qty <= 5 && item.qty > 0,
                                    'badge-kosong': item.qty === 0
                                }">
                                    {{ item.qty === 0 ? 'Kosong' : (item.qty <=
                                        5
                                        ? 'Kritis'
                                        :
                                        (item.qty
                                            <
                                            item.safetyStock
                                            ? 'Menipis'
                                            : 'Aman'
                                        ))
                                    }}
                                        </span
                                    >
                            </td>
                        </tr>
                        <tr v-if="stockList.length === 0">
                            <td
                                colspan="7"
                                class="text-center"
                            >Memuat data persediaan...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div
            class="panel-box"
            v-if="itemsWithNotes.length > 0"
        >
            <h3>Catatan Bahan Ajar</h3>
            <p class="panel-subtitle">Informasi khusus yang tercatat pada master data.</p>

            <div class="notes-grid">
                <div
                    v-for="item in itemsWithNotes"
                    :key="item.itemCode"
                    class="note-card"
                >
                    <strong>{{ item.title }}</strong>
                    <p>{{ item.notesHTML.replace(/<[^>]*>?/gm, '') }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { loadStockData, loadTrackingData, loadPackageData, getStorage } from '../services';
import { ref, computed, onMounted } from 'vue';
import { currentView } from '../router';

const stockList = ref([]);
const trackingList = ref({});
const packageList = ref([]);

onMounted(() => {
    stockList.value = loadStockData();
    trackingList.value = loadTrackingData();
    packageList.value = loadPackageData();
});

const goToStock = () => {
    currentView.value = 'stock';
};

// Compute total physical stock and active Delivery Order count
const totalAllStock = computed(() => {
    return stockList.value.reduce((sum, item) => sum + Number(item.qty || 0), 0);
});

const totalTracking = computed(() => {
    return Object.keys(trackingList.value).length;
});

// Filter items below safety stock threshold for re-order alerts
const lowStockItems = computed(() => {
    return stockList.value.filter(item => Number(item.qty) < Number(item.safetyStock) || Number(item.qty) === 0);
});

const safeStockCount = computed(() => {
    return stockList.value.length - lowStockItems.value.length;
});

const itemsWithNotes = computed(() => {
    return stockList.value.filter(item => item.notesHTML && item.notesHTML.trim() !== '');
});
</script>

<style>
@import '../assets/css/views/dashboard.css';
</style>
