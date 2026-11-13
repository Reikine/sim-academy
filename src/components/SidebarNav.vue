<template>
    <aside class="app-sidebar">
        <div class="sidebar-brand">
            <h2>Universitas Terbuka</h2>
        </div>

        <nav class="sidebar-menu">
            <button
                @click="currentView = 'dashboard'"
                :class="{ active: currentView === 'dashboard' }"
            >
                <span class="material-symbols-outlined">dashboard</span>
                Dashboard
            </button>

            <button
                @click="currentView = 'stock'"
                :class="{ active: currentView === 'stock' }"
            >
                <span class="material-symbols-outlined">inventory_2</span>
                Stok Bahan Ajar
            </button>

            <button
                @click="currentView = 'history'"
                :class="{ active: currentView === 'history' }"
            >
                <span class="material-symbols-outlined">shopping_cart</span>
                Pemesanan
            </button>

            <button
                @click="currentView = 'tracking'"
                :class="{ active: currentView === 'tracking' }"
            >
                <span class="material-symbols-outlined">local_shipping</span>
                Tracking Pengiriman
            </button>

            <button
                v-if="isAdmin"
                @click="currentView = 'packageManagement'"
                :class="{ active: currentView === 'packageManagement' }"
            >
                <span class="material-symbols-outlined">docs_add_on</span>
                Buat Paket Baru
            </button>
        </nav>
    </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { currentView } from '../router';
import { getAuthUser } from '../services';

const currentUser = ref(getAuthUser() || { role: 'User' });

onMounted(() => {
    const user = getAuthUser();
    if (user) {
        currentUser.value = user;
    }
});

const isAdmin = computed(() => {
    const role = String(currentUser.value?.role || '').toLowerCase();
    return role === 'administrator' || role === 'admin';
});
</script>

<style>
@import '../assets/css/views/layout.css';
</style>