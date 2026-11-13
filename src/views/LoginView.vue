<template>
    <main
        id="app-auth"
        v-cloak
    >

        <div
            id="loginBox"
            v-show="authMode === 'login'"
        >
            <div class="auth-box-header">
                <img
                    :src="logoUrl"
                    class="auth-logo"
                >
                <h2>Login</h2>
            </div>

            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        v-model="loginForm.email"
                        required
                    />
                </div>

                <div class="form-group">
                    <label>Password</label>
                    <div class="password-container">
                        <input
                            :type="showPassword ? 'text' : 'password'"
                            v-model="loginForm.password"
                            autocomplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            @click="togglePassword"
                            class="password-toggle-btn"
                            title="Tampilkan Password"
                        >
                            <span class="material-symbols-outlined">
                                {{ showPassword ? 'visibility_off' : 'visibility' }}
                            </span>
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    class="btn-primary btn-full"
                >Masuk</button>
            </form>

            <div class="login-nav">
                <p>
                    <a
                        href="#"
                        @click.prevent="openResetModal"
                    >Lupa Password</a>
                </p>
                <p>
                    Belum punya akun?
                    <a
                        href="#"
                        @click.prevent="switchMode('register')"
                    >Daftar di sini</a>
                </p>
            </div>
        </div>

        <div
            id="regBox"
            v-show="authMode === 'register'"
        >
            <div class="auth-box-header">
                <img
                    :src="logoUrl"
                    class="auth-logo"
                >
                <h2>Daftar Akun Baru</h2>
            </div>

            <form @submit.prevent="handleRegister">
                <div class="form-group">
                    <label>Nama Lengkap</label>
                    <input
                        type="text"
                        v-model="regForm.name"
                        required
                    />
                </div>

                <div class="form-group">
                    <label>Email Baru</label>
                    <input
                        type="email"
                        v-model="regForm.email"
                        required
                    />
                </div>

                <div class="form-group">
                    <label>Password Baru</label>
                    <input
                        type="password"
                        v-model="regForm.password"
                        autocomplete="new-password"
                        required
                    />
                </div>

                <div class="form-group">
                    <label>Lokasi</label>
                    <input
                        type="text"
                        v-model="regForm.location"
                        placeholder="Contoh: UPBJJ Jakarta / Pusat"
                        required
                    />
                </div>

                <button
                    type="submit"
                    class="btn-primary btn-full"
                >Daftar Sekarang</button>
            </form>

            <div class="login-nav">
                <p>
                    Sudah punya akun?
                    <a
                        href="#"
                        @click.prevent="switchMode('login')"
                    >
                        >Kembali ke Login</a>
                </p>
            </div>
        </div>

        <div
            class="modal-overlay"
            v-if="isResetModalOpen"
        >
            <div class="modal-content">
                <h3>Reset Password</h3>
                <p>Masukkan email akun Anda yang terdaftar untuk mengirim permintaan ke admin.</p>

                <form @submit.prevent="submitForgotPassword">
                    <div class="modal-input-group">
                        <input
                            type="email"
                            v-model="resetEmail"
                            placeholder="Contoh: user@ut.ac.id"
                            required
                            autofocus
                        />
                    </div>

                    <div id="modalActionArea">
                        <button
                            type="submit"
                            class="btn-primary"
                        >Kirim</button>
                        <button
                            type="button"
                            @click="closeResetModal"
                            class="btn-secondary"
                        >Batal</button>
                    </div>
                </form>
            </div>
        </div>

    </main>
</template>

<script setup>
import { useToast } from '../composables/useToast.js';
import { getStorage, setStorage, loadUserData } from '../services';
import { currentView } from '../router';
import { ref, reactive, onMounted, watch } from 'vue';

const { toasts, showToast, removeToast } = useToast();
const logoUrl = new URL('../assets/logo-ut.png', import.meta.url).href;

const userDb = ref([]);
const showPassword = ref(false);

const authMode = ref('login');
const loginForm = reactive({ email: '', password: '' });
const regForm = reactive({ name: '', email: '', password: '', location: '' });

const isResetModalOpen = ref(false);
const resetEmail = ref('');

watch(currentView, () => {
    Object.assign(loginForm, { email: '', password: '' });
    Object.assign(regForm, { name: '', email: '', password: '', location: '' });
    isResetModalOpen.value = false;
});

onMounted(() => {
    userDb.value = loadUserData();
});

const togglePassword = () => {
    showPassword.value = !showPassword.value;
};

// Authenticates user credentials against local storage records.
const handleLogin = () => {
    const email = loginForm.email.trim();
    const password = loginForm.password.trim();

    const found = userDb.value.find(u => u.email === email && u.password === password);
    if (found) {
        setStorage('auth_token', found);
        showToast('Data terverifikasi! Menuju Dashboard...', 'success');
        setTimeout(() => {
            currentView.value = 'dashboard';
        }, 1000);
    } else {
        showToast('Email atau password salah.', 'error');
    }
};

// Registers a new user account with unique email enforcement.
const handleRegister = () => {
    const email = regForm.email.trim();

    if (userDb.value.some(u => u.email === email)) {
        showToast('Email sudah terdaftar di sistem!', 'warning');
        return;
    }

    // Restricted default RBAC role
    const newUser = {
        id: userDb.value.length + 1,
        name: regForm.name.trim(),
        email: email,
        password: regForm.password.trim(),
        role: 'User',
        location: regForm.location.trim()
    };

    userDb.value.push(newUser);
    setStorage('user_db', userDb.value);

    showToast('Akun berhasil terdaftar! Silakan login.', 'success');

    Object.assign(regForm, { name: '', email: '', password: '', location: '' });
    currentView.value = 'login';
};

const openResetModal = () => {
    resetEmail.value = '';
    isResetModalOpen.value = true;
};

const closeResetModal = () => {
    isResetModalOpen.value = false;
};

// Queues a password reset request into localStorage for admin review.
const submitForgotPassword = () => {
    const email = resetEmail.value.trim();
    if (!email) {
        showToast('Email tidak boleh kosong!', 'warning');
        return;
    }

    const userExists = userDb.value.some(u => u.email === email);
    if (!userExists) {
        showToast('Email tidak ditemukan dalam sistem.', 'error', 0);
        return;
    }

    // Append to reset queue without creating duplicates
    const resetRequests = getStorage('resetRequests', []);
    if (!resetRequests.includes(email)) {
        resetRequests.push(email);
        setStorage('resetRequests', resetRequests);
    }

    showToast('Permintaan reset password berhasil dikirim ke Admin.', 'info');
    closeResetModal();
};
</script>

<style>
@import '../assets/css/views/login.css';
</style>
