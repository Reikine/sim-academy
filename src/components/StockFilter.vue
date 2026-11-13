<template>
    <div class="filter-panel">
        <div class="form-group">
            <label>UT-Daerah:</label>
            <select
                :value="selectedRegion"
                @input="$emit('update:selectedRegion', $event.target.value)"
                class="form-control"
            >
                <option value="">Semua UT-Daerah</option>
                <option
                    v-for="region in regionList"
                    :key="region"
                    :value="region"
                >
                    {{ region }}
                </option>
            </select>
        </div>

        <div class="form-group">
            <label>STATUS STOK:</label>
            <button
                type="button"
                @click="$emit('toggle-reorder')"
                :class="['btn-filter-status', { active: isReorderFilterActive }]"
            >
                {{ isReorderFilterActive ? 'Tampilkan Semua' : 'Perlu Re-order' }}
            </button>
        </div>

        <div class="form-group">
            <label>Kategori Mata Kuliah:</label>
            <select
                :value="selectedCategory"
                @input="$emit('update:selectedCategory', $event.target.value)"
                class="form-control"
                :disabled="!selectedRegion"
            >
                <option value="">Semua Kategori</option>
                <option
                    v-for="cat in availableCategories"
                    :key="cat"
                    :value="cat"
                >
                    {{ cat }}
                </option>
            </select>
        </div>

        <div class="form-group">
            <label>Cari Bahan Ajar:</label>
            <input
                type="text"
                :value="searchQuery"
                @input="$emit('update:searchQuery', $event.target.value)"
                placeholder="Ketik kode atau judul buku..."
                class="form-control"
            />
        </div>

        <button
            type="button"
            @click="$emit('reset-filters')"
            class="btn-icon-reset"
            title="Reset Filter"
        >
            <span class="material-symbols-outlined">restart_alt</span>
        </button>
    </div>
</template>

<script setup>
defineProps({
    regionList: Array,
    selectedRegion: String,
    selectedCategory: String,
    searchQuery: String,
    isReorderFilterActive: Boolean,
    availableCategories: Array
});

defineEmits([
    'update:selectedRegion',
    'update:selectedCategory',
    'update:searchQuery',
    'toggle-reorder',
    'reset-filters'
]);
</script>

<style>
@import '../assets/css/views/stock.css';
</style>
