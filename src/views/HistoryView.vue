<template>
    <div
        id="app-history"
        class="app-layout"
        v-cloak
    >
        <main class="app-main">
            <div class="logs-page-header">
                <div>
                    <h2>Riwayat Pesanan</h2>
                    <p class="subtitle">Daftar paket bahan ajar dan status pengiriman akun Anda.</p>
                </div>
            </div>

            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Tanggal Kirim</th>
                            <th>Nama</th>
                            <th>No. DO</th>
                            <th>Paket Bahan Ajar</th>
                            <th>Ekspedisi</th>
                            <th>Status Pengiriman</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="item in userHistory"
                            :key="item.doNumber"
                        >
                            <td>{{ item.orderDate }}</td>
                            <td>{{ item.name }}</td>
                            <td>{{ item.doNumber }}</td>
                            <td>{{ item.packageName }}</td>
                            <td>{{ item.courier }}</td>
                            <td>
                                <span :class="['status-badge', getStatusBadgeClass(item.status)]">
                                    {{ item.status }}
                                </span>
                            </td>
                            <td>
                                <button
                                    @click="trackPackage(item.doNumber)"
                                    class="btn-edit"
                                >
                                    Lacak Paket
                                </button>
                            </td>
                        </tr>
                        <tr v-if="userHistory.length === 0">
                            <td
                                colspan="7"
                                style="text-align: center; color: var(--text-muted); padding: 30px;"
                            >
                                Anda belum memiliki riwayat pemesanan atau pengiriman bahan ajar.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
</template>

<script setup>
import { useToast } from '../composables/useToast.js';
import {
    requireAuth,
    getStorage,
    setStorage,
    getStatusBadgeClass,
    checkAndPromoteStatus
} from '../services';
import { createApp, ref, computed, onMounted } from 'vue';
import { currentView } from '../router';

const { toasts, showToast, removeToast } = useToast();

// State management
const currentUser = ref({ name: '', email: '', role: 'User', nim: '' });
const trackingList = ref({});

// Sync and hydrate tracking data from localStorage
const loadTrackingData = () => {
    const parsed = getStorage('trackingData', []);

    const isUpdated = checkAndPromoteStatus(parsed);
    trackingList.value = isUpdated ? setStorage('trackingData', parsed) : parsed;
};

// Guard auth session and initialize state on mount
onMounted(() => {
    const auth = requireAuth();
    if (!auth) return;

    currentUser.value = auth.user;
    loadTrackingData();

    setInterval(loadTrackingData, 3000);
});

// Compute shipment history associated with current user session
const userHistory = computed(() => {
    if (!trackingList.value || !currentUser.value) return [];

    const userNim = String(currentUser.value.nim || '').trim().toLowerCase();
    const userName = String(currentUser.value.name || '').trim().toLowerCase();
    const userEmail = String(currentUser.value.email || '').trim().toLowerCase();

    return Object.values(trackingList.value)
        .filter(item => {
            const itemNim = String(item.nim || '').trim().toLowerCase();
            const itemName = String(item.name || '').trim().toLowerCase();
            const itemEmail = String(item.email || '').trim().toLowerCase();
            const itemCreatedBy = String(item.createdBy || '').trim().toLowerCase();

            const isNimMatched = userNim !== '' && itemNim === userNim;
            const isNameMatched = userName !== '' && itemName === userName;
            const isEmailMatched = userEmail !== '' && itemEmail === userEmail;
            const isCreatedByMatched = userEmail !== '' && itemCreatedBy === userEmail;

            return isNimMatched || isNameMatched || isEmailMatched || isCreatedByMatched;
        })
        .map((item, index) => {
            const initialLog = item.history && item.history.length > 0
                ? item.history[0]
                : { time: item.shipmentDate || '-', description: 'Paket diproses' };

            return {
                id: index + 1,
                orderDate: item.shipmentDate || (initialLog.time ? initialLog.time.split(' ')[0] : '-'),
                name: item.name || item.nama || '-',
                doNumber: item.doNumber,
                packageName: item.packageCode || 'PAKET-UT-001',
                courier: item.courier || 'JNE Regular',
                status: item.status || 'Diproses'
            };
        });
});

// Navigation handler for tracking detail view
const trackPackage = (doNumber) => {
    setStorage('activeDoDetail', doNumber);
    showToast(`Membuka pelacakan DO: ${doNumber}`, 'info');
    setTimeout(() => {
        currentView.value = 'tracking';
    }, 400);
};
</script>

<style>
@import '../assets/css/views/history.css';
</style>
