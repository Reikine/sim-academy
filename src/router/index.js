import { ref, watch } from 'vue';

// Cek apakah ada riwayat halaman aktif sebelumnya di localStorage, jika tidak default ke 'login'
const savedView = localStorage.getItem('active_view') || 'login';

export const currentView = ref(savedView);

// Pantau setiap perubahan halaman dan simpan otomatis ke localStorage
watch(currentView, (newView) => {
    localStorage.setItem('active_view', newView);
});