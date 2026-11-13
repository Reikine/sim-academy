import { ref, watch } from 'vue';

const savedView = localStorage.getItem('active_view') || 'login';

export const currentView = ref(savedView);

watch(currentView, (newView) => {
    localStorage.setItem('active_view', newView);
});