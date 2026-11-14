<template>
    <aside :class="['app-sidebar', { collapsed: !isOpen }]">

        <nav class="sidebar-menu">
            <button
                @click="currentView = 'dashboard'"
                :class="{ active: currentView === 'dashboard' }"
            >
                <span class="material-symbols-outlined">dashboard</span>
                <span class="nav-label">Dashboard</span>
            </button>

            <button
                @click="currentView = 'stock'"
                :class="{ active: currentView === 'stock' }"
            >
                <span class="material-symbols-outlined">inventory_2</span>
                <span class="nav-label">Stok Bahan Ajar</span>
            </button>

            <button
                @click="currentView = 'history'"
                :class="{ active: currentView === 'history' }"
            >
                <span class="material-symbols-outlined">shopping_cart</span>
                <span class="nav-label">Pemesanan</span>
            </button>

            <button
                @click="currentView = 'tracking'"
                :class="{ active: currentView === 'tracking' }"
            >
                <span class="material-symbols-outlined">local_shipping</span>
                <span class="nav-label">Tracking Pengiriman</span>
            </button>

            <button
                v-if="isAdmin"
                @click="currentView = 'packageManagement'"
                :class="{ active: currentView === 'packageManagement' }"
            >
                <span class="material-symbols-outlined">docs_add_on</span>
                <span class="nav-label">Paket Bahan Ajar</span>
            </button>
        </nav>
    </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { currentView } from '../router';
import { getAuthUser } from '../services';

defineProps({
    isOpen: {
        type: Boolean,
        default: true
    }
});

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