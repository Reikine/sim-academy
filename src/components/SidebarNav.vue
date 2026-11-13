<template>
    <aside class="app-sidebar">
        <div class="sidebar-brand">
            <h3>SITTA</h3>
            <p>Universitas Terbuka</p>
        </div>
        <nav class="sidebar-menu">
            <button @click="currentView = 'dashboard'" :class="{ active: currentView === 'dashboard' }">
                <span class="material-symbols-outlined">dashboard</span> Dashboard
            </button>
            <button @click="currentView = 'stock'" :class="{ active: currentView === 'stock' }">
                <span class="material-symbols-outlined">inventory_2</span> Stok Bahan Ajar
            </button>
            <button @click="currentView = 'history'" :class="{ active: currentView === 'history' }">
                <span class="material-symbols-outlined">shopping_cart</span> Pemesanan
            </button>
            <button @click="currentView = 'tracking'" :class="{ active: currentView === 'tracking' }">
                <span class="material-symbols-outlined">local_shipping</span> Tracking Pengiriman
            </button>
        </nav>
    </aside>
</template>

<script setup>
import { currentView } from '../router';
</script>

<style>
@import '../assets/css/views/layout.css';
</style>