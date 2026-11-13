<template>
    <div
        v-if="show && isAdmin"
        class="modal-backdrop"
    >
        <div class="modal-card modal-card-sm">
            <h3>Kelola Stok Bahan Ajar</h3>

            <div
                v-if="selectedBook"
                class="modal-book-info"
            >
                <p><strong>Kode:</strong> {{ selectedBook.itemCode }}</p>
                <p><strong>Judul:</strong> {{ selectedBook.title }}</p>
                <p><strong>Stok Saat Ini:</strong> <span class="text-primary-bold">{{ selectedBook.qty }}</span>
                    &rarr;
                    <strong>Stok Baru:</strong> <span class="text-primary-bold">{{ tempQty }}</span>
                </p>
            </div>

            <form @submit.prevent="$emit('submit')">
                <div class="form-group form-group-mb">
                    <label>JUMLAH PENAMBAHAN / PENGURANGAN:</label>
                    <input
                        type="number"
                        :value="actionInput"
                        @input="$emit('update:actionInput', Number($event.target.value))"
                        placeholder="Masukkan angka..."
                        class="form-control"
                        min="1"
                        required
                    />
                </div>

                <div class="stock-action-group">
                    <button
                        type="button"
                        @click="$emit('add')"
                        :class="['btn-action', { 'active-add': activeAction === 'add' }]"
                    >
                        <span>+ Tambah Stok</span>
                    </button>
                    <button
                        type="button"
                        @click="$emit('reduce')"
                        :class="['btn-action', { 'active-reduce': activeAction === 'reduce' }]"
                    >
                        <span>- Kurangi Stok</span>
                    </button>
                </div>

                <div class="form-actions modal-footer-actions">
                    <button
                        type="submit"
                        class="btn-save"
                    >Simpan Perubahan</button>
                    <button
                        type="button"
                        @click="$emit('close')"
                        class="btn-cancel"
                    >Batal</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
defineProps({
    show: Boolean,
    isAdmin: Boolean,
    selectedBook: Object,
    tempQty: Number,
    actionInput: [Number, String],
    activeAction: String
});

defineEmits(['update:actionInput', 'submit', 'add', 'reduce', 'close']);
</script>

<style>
@import '../assets/css/views/stock.css';
</style>
