<template>
    <div v-if="show && isAdmin" class="modal-backdrop">
        <div class="modal-card">
            <h3>Form Tambah Bahan Ajar Baru</h3>

            <form @submit.prevent="$emit('submit')">
                <div class="form-grid">
                    <div class="form-group">
                        <label>KODE ITEM:</label>
                        <input type="text" :value="modelValue.itemCode"
                            @input="updateField('itemCode', $event.target.value)" placeholder="Contoh: EKMA4116"
                            class="form-control" required />
                    </div>

                    <div class="form-group">
                        <label>JUDUL BUKU / BAHAN AJAR:</label>
                        <input type="text" :value="modelValue.title" @input="updateField('title', $event.target.value)"
                            placeholder="Nama mata kuliah..." class="form-control" required />
                    </div>

                    <div class="form-group">
                        <label>KATEGORI MATA KULIAH:</label>
                        <select :value="modelValue.category" @input="updateField('category', $event.target.value)"
                            class="form-control" required>
                            <option value="" disabled>Pilih Kategori</option>
                            <option value="MK Wajib">MK Wajib</option>
                            <option value="MK Pilihan">MK Pilihan</option>
                            <option value="Praktikum">Praktikum</option>
                            <option value="Problem-Based">Problem Based</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>UT-DAERAH:</label>
                        <select :value="modelValue.region" @input="updateField('region', $event.target.value)"
                            class="form-control" required>
                            <option value="" disabled>Pilih UT-Daerah</option>
                            <option value="Jakarta">Jakarta</option>
                            <option value="Surabaya">Surabaya</option>
                            <option value="Makassar">Makassar</option>
                            <option value="Padang">Padang</option>
                            <option value="Denpasar">Denpasar</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>LOKASI RAK:</label>
                        <input type="text" :value="modelValue.rackLocation"
                            @input="updateField('rackLocation', $event.target.value)" placeholder="Contoh: R1-A3"
                            class="form-control" />
                    </div>

                    <div class="form-group">
                        <label>HARGA SATUAN (RP):</label>
                        <input type="number" :value="modelValue.price"
                            @input="updateField('price', Number($event.target.value))" placeholder="Contoh: 65000"
                            class="form-control" min="0" required />
                    </div>

                    <div class="form-group">
                        <label>JUMLAH STOK AWAL (QTY):</label>
                        <input type="number" :value="modelValue.qty"
                            @input="updateField('qty', Number($event.target.value))" class="form-control" min="0" />
                    </div>

                    <div class="form-group">
                        <label>SAFETY STOCK (MINIMUM):</label>
                        <input type="number" :value="modelValue.safetyStock"
                            @input="updateField('safetyStock', Number($event.target.value))" class="form-control"
                            min="0" />
                    </div>

                    <div class="form-group form-group-full" style="grid-column: 1 / -1;">
                        <label>CATATAN / KETERANGAN (OPSIONAL):</label>
                        <textarea :value="modelValue.notesHTML" @input="updateField('notesHTML', $event.target.value)"
                            placeholder="Tambahan informasi atau catatan khusus bahan ajar..." class="form-control"
                            rows="2"></textarea>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-save">Simpan Data</button>
                    <button type="button" @click="$emit('close')" class="btn-cancel">Batal</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    show: Boolean,
    isAdmin: Boolean,
    modelValue: Object
});

const emit = defineEmits(['update:modelValue', 'submit', 'close']);

const updateField = (key, val) => {
    emit('update:modelValue', { ...props.modelValue, [key]: val });
};
</script>

<style>
@import '../assets/css/views/stock.css';
</style>
