<template>
    <div class="toast-container">
        <transition-group name="toast">
            <div
                v-for="toast in toasts"
                :key="toast.id"
                :class="['toast-item', toast.type]"
                @click="removeToast(toast.id)"
            >
                <span>{{ toast.message }}</span>
                <span class="toast-close-btn">&times;</span>
            </div>
        </transition-group>
    </div>
</template>

<script setup>
import { useToast } from '../composables/useToast';

const { toasts, removeToast } = useToast();
</script>