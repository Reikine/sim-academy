<template>
    <div class="table-wrapper">
        <table class="data-table">
            <thead>
                <tr>
                    <th @click="$emit('sort', 'itemCode')" class="sortable-th">
                        Kode <span class="material-symbols-outlined sort-icon">{{ getSortIcon('itemCode', sortColumn,
                            sortDirection) }}</span>
                    </th>
                    <th @click="$emit('sort', 'title')" class="sortable-th">
                        NAMA ITEM <span class="material-symbols-outlined sort-icon">{{ getSortIcon('title', sortColumn,
                            sortDirection) }}</span>
                    </th>
                    <th>KATEGORI</th>
                    <th>UT-DAERAH</th>
                    <th>LOKASI RAK</th>
                    <th @click="$emit('sort', 'qty')" class="sortable-th">
                        STOK <span class="material-symbols-outlined sort-icon">{{ getSortIcon('qty', sortColumn,
                            sortDirection) }}</span>
                    </th>
                    <th @click="$emit('sort', 'price')" class="sortable-th">
                        HARGA <span class="material-symbols-outlined sort-icon">{{ getSortIcon('price', sortColumn,
                            sortDirection) }}</span>
                    </th>
                    <th>STOK MIN</th>
                    <th>STATUS</th>
                    <th v-if="isAdmin">AKSI</th>
                    <th>INFO</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in paginatedStock" :key="item.itemCode">
                    <td>{{ item.itemCode }}</td>
                    <td>{{ item.title }}</td>
                    <td>{{ item.category }}</td>
                    <td>{{ item.region }}</td>
                    <td>{{ item.rackLocation }}</td>
                    <td>{{ item.qty }}</td>
                    <td style="white-space: nowrap;">{{ formatPrice(item.price) }}</td>
                    <td>{{ item.safetyStock }}</td>
                    <td>
                        <span :class="{
                            'badge-aman': item.qty > item.safetyStock,
                            'badge-menipis': item.qty <= item.safetyStock && item.qty > Math.floor(item.safetyStock / 2),
                            'badge-kritis': item.qty <= Math.floor(item.safetyStock / 2) && item.qty > 0,
                            'badge-kosong': item.qty === 0
                        }">
                            {{
                                item.qty === 0
                                    ? 'Kosong'
                                    : (item.qty <= Math.floor(item.safetyStock / 2) ? 'Kritis' : (item.qty <= item.safetyStock
                                        ? 'Menipis' : 'Aman')) }} </span>
                    </td>
                    <td v-if="isAdmin">
                        <button type="button" @click="$emit('edit-book', item)" class="btn-edit">
                            Edit
                        </button>
                    </td>
                    <td class="text-center">
                        <span v-if="item.notesHTML" class="material-symbols-outlined icon-info-btn"
                            :title="item.notesHTML.replace(/<[^>]*>?/gm, '')">
                            info
                        </span>
                        <span v-else class="text-muted">-</span>
                    </td>
                </tr>
                <tr v-if="filteredStock.length === 0">
                    <td :colspan="isAdmin ? 11 : 10" class="empty-table-cell">
                        Data bahan ajar tidak ditemukan.
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Navigasi Pagination -->
        <div class="pagination-container" v-if="totalPages > 1">
            <span class="pagination-info">
                Menampilkan halaman {{ currentPage }} dari {{ totalPages }} (Total {{ filteredStock.length }} data)
            </span>
            <div class="pagination-buttons">
                <button type="button" @click="currentPage--" :disabled="currentPage === 1" class="btn-page">
                    &laquo; Sebelumnya
                </button>
                <button v-for="page in totalPages" :key="page" @click="currentPage = page"
                    :class="['btn-page-num', { active: currentPage === page }]">
                    {{ page }}
                </button>
                <button type="button" @click="currentPage++" :disabled="currentPage === totalPages" class="btn-page">
                    Selanjutnya &raquo;
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { getSortIcon, formatPrice } from '../services';

const props = defineProps({
    filteredStock: Array,
    isAdmin: Boolean,
    sortColumn: String,
    sortDirection: String
});

defineEmits(['sort', 'edit-book']);

// Konfigurasi Pagination (Misal 5 item per halaman)
const currentPage = ref(1);
const pageSize = ref(10);

// Reset ke halaman 1 jika filter atau pencarian berubah
watch(() => props.filteredStock, () => {
    currentPage.value = 1;
});

const totalPages = computed(() => {
    return Math.ceil(props.filteredStock.length / pageSize.value) || 1;
});

const paginatedStock = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return props.filteredStock.slice(start, end);
});
</script>

<style>
@import '../assets/css/views/stock.css';
</style>
