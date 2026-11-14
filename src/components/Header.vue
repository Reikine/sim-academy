<template>
    <header class="app-header">
        <div class="header-brand">
            <button
                type="button"
                @click="$emit('toggle-sidebar')"
                class="btn-sidebar-toggle"
                title="Buka/Tutup Menu"
            >
                <span class="material-symbols-outlined">menu</span>
            </button>
            <img
                src="../assets/logo-ut.png"
                alt="Logo UT"
                class="header-logo"
            />
            <span class="brand-title">SITTA - Pusat Kelola Bahan Ajar</span>
        </div>

        <div class="header-actions">

            <div
                class="notification-fab-container"
                v-if="isAdmin"
            >
                <button
                    @click="toggleNotifPanel"
                    class="btn-profile"
                    title="Permintaan Reset Password"
                >
                    <span class="material-symbols-outlined">notifications</span>
                    <span
                        v-if="resetRequests.length > 0"
                        class="notif-badge"
                    >
                        {{ resetRequests.length }}
                    </span>
                </button>

                <div
                    v-if="isNotifOpen"
                    class="notification-panel"
                >
                    <div class="notif-header">
                        <span>Permintaan Reset Password</span>
                        <button
                            @click="toggleNotifPanel"
                            class="notif-close-btn"
                        >&times;</button>
                    </div>

                    <p
                        v-if="resetRequests.length === 0"
                        class="notif-empty"
                    >
                        Tidak ada permintaan baru.
                    </p>

                    <ul
                        class="notif-list"
                        v-else
                    >
                        <li
                            v-for="(email, index) in resetRequests"
                            :key="index"
                            class="notif-item"
                        >
                            <div class="notif-email"><strong>{{ email }}</strong></div>
                            <div class="notif-actions">
                                <button
                                    @click="approveReset(email, index)"
                                    class="btn-approve"
                                >Setujui</button>
                                <button
                                    @click="rejectReset(index)"
                                    class="btn-reject"
                                >Tolak</button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <button
                type="button"
                class="btn-profile"
                title="Profil Akun"
            >
                <span class="profile-name">{{ currentUser.name || 'Pengguna' }}</span>
            </button>

            <button
                type="button"
                @click="confirmLogout"
                class="btn-profile"
                title="Keluar"
            >
                <span class="material-symbols-outlined">logout</span>
            </button>
        </div>
    </header>

    <div
        class="modal-overlay"
        v-if="isLogoutModalOpen"
    >
        <div class="modal-content">
            <h3>Konfirmasi Keluar</h3>
            <p>Apakah Anda yakin ingin keluar dari aplikasi SITTA?</p>
            <div id="modalActionArea">
                <button
                    @click="modalConfirmLogout"
                    class="btn-primary"
                >Ya, Keluar</button>
                <button
                    @click="cancelLogoutBtn"
                    class="btn-secondary"
                >Batal</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { currentView } from '../router';
import { logout, getStorage, setStorage, getAuthUser } from '../services';
import { useToast } from '../composables/useToast.js';

defineEmits(['toggle-sidebar']);

const { showToast } = useToast();
const currentUser = ref(getAuthUser() || { name: 'Pengguna', role: 'User' });
const isLogoutModalOpen = ref(false);
const isNotifOpen = ref(false);
const resetRequests = ref([]);

const isAdmin = computed(() => {
    const role = String(currentUser.value?.role || '').toLowerCase();
    return role === 'administrator' || role === 'admin';
});

onMounted(() => {
    const user = getAuthUser();
    if (user) {
        currentUser.value = user;
    }
    fetchResetRequests();

});

const fetchResetRequests = () => {
    resetRequests.value = getStorage('resetRequests', []);
};

const toggleNotifPanel = () => {
    isNotifOpen.value = !isNotifOpen.value;
    if (isNotifOpen.value) {
        fetchResetRequests();
    }
};

const approveReset = (email, index) => {
    let db = getStorage('user_db', []);
    const targetUser = db.find(u => u.email === email);

    if (targetUser) {
        targetUser.password = '123456';
        setStorage('user_db', db);
        showToast(`Password untuk ${email} direset menjadi '123456'`, 'success');
    } else {
        showToast('Pengguna tidak ditemukan di database', 'error');
    }

    resetRequests.value.splice(index, 1);
    setStorage('resetRequests', resetRequests.value);
};

const rejectReset = (index) => {
    resetRequests.value.splice(index, 1);
    setStorage('resetRequests', resetRequests.value);
    showToast('Permintaan reset password ditolak.', 'warning');
};

const confirmLogout = () => {
    isLogoutModalOpen.value = true;
};

const cancelLogoutBtn = () => {
    isLogoutModalOpen.value = false;
};

const modalConfirmLogout = () => {
    showToast('Berhasil keluar.', 'info');
    setTimeout(() => {
        logout();
        currentView.value = 'login';
    }, 600);
};
</script>

<style>
@import '../assets/css/views/layout.css';
</style>