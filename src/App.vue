<script setup>
import heroImg from './assets/hero.png'
import viteLogo from './assets/vite.svg'
import vueLogo from './assets/vue.svg'

import { computed, onMounted } from 'vue';
import { currentView } from './router';
import { getStorage } from './services';

import SidebarNav from './components/SidebarNav.vue';
import AppTopHeader from './components/Header.vue';
import Toast from './components/Toast.vue'

import LoginView from './views/LoginView.vue';
import DashboardView from './views/DashboardView.vue';
import StockView from './views/StockView.vue';
import HistoryView from './views/HistoryView.vue';
import TrackingView from './views/TrackingView.vue';

onMounted(() => {
  const session = getStorage('user_session', null);
  if (session) {
    currentView.value = 'dashboard';
  }
});

const viewsMap = {
  login: LoginView,
  register: LoginView,
  dashboard: DashboardView,
  stock: StockView,
  history: HistoryView,
  tracking: TrackingView
};

const activeComponent = computed(() => viewsMap[currentView.value] || LoginView);
</script>

<template>
  <div v-if="currentView === 'login' || currentView === 'register'" class="login-page-wrapper">
    <component :is="LoginView" />
  </div>

  <div v-else class="app-layout-container">
    <SidebarNav />

    <div class="app-main-wrapper">
      <AppTopHeader />

      <main class="app-content-body">
        <component :is="activeComponent" />
      </main>

      <footer class="app-footer">
        <p>SITTA &copy; 2026 Universitas Terbuka</p>
      </footer>
    </div>
  </div>
  <Toast />
</template>

<style>
@import './assets/css/base.css';
@import './assets/css/toast.css';
</style>