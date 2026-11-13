<template>
    <div v-if="isOpen" class="modal-backdrop">
        <div class="modal-card">
            <h3>{{ isConfirmStep ? 'Konfirmasi Delivery Order' : 'Tambah Delivery Order Baru' }}</h3>

            <!-- Form Input DO -->
            <form v-if="!isConfirmStep" @submit.prevent="$emit('proceed-confirm')">
                <div class="form-grid-modal">
                    <div class="form-group">
                        <label>NOMOR DO (OTOMATIS):</label>
                        <input type="text" :value="modelValue.doNumber" readonly class="form-control readonly-input" />
                    </div>

                    <div class="form-group">
                        <label>NIM MAHASISWA:</label>
                        <input type="number" :value="modelValue.nim" @input="updateField('nim', $event.target.value)"
                            placeholder="Masukkan NIM..." class="form-control" required />
                    </div>

                    <div class="form-group">
                        <label>NAMA MAHASISWA:</label>
                        <input type="text" :value="modelValue.name" @input="updateField('name', $event.target.value)"
                            placeholder="Masukkan Nama..." class="form-control" required />
                    </div>

                    <div class="form-group">
                        <label>EKSPEDISI PENGIRIMAN:</label>
                        <select :value="modelValue.courier" @input="updateField('courier', $event.target.value)"
                            class="form-control" required>
                            <option value="" disabled selected hidden>Pilih Ekspedisi</option>
                            <option v-for="c in deliveryList" :key="c.code" :value="c.name">
                                {{ c.name }}
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>PAKET BAHAN AJAR:</label>
                        <select :value="modelValue.packageCode" @input="updateField('packageCode', $event.target.value)"
                            class="form-control" required>
                            <option value="" disabled selected hidden>Pilih Paket Bahan Ajar</option>
                            <option v-for="pkg in packageList" :key="pkg.code" :value="pkg.code">
                                {{ pkg.code }} - {{ pkg.name }} (Rp {{ Number(pkg.price || 0).toLocaleString('id-ID')
                                }})
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>TANGGAL KIRIM:</label>
                        <input type="date" :value="modelValue.shipmentDate"
                            @input="updateField('shipmentDate', $event.target.value)"
                            :min="new Date().toISOString().split('T')[0]" class="form-control" />
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-primary">Tinjau Pesanan</button>
                    <button type="button" @click="$emit('close')" class="btn-secondary">Batal</button>
                </div>
            </form>

            <!-- Langkah Konfirmasi DO -->
            <div v-else class="confirmation-step">
                <p class="confirmation-desc">
                    Mohon periksa kembali detail pesanan dan daftar bahan ajar sebelum memproses pembuatan DO:
                </p>

                <div class="info-grid confirmation-grid">
                    <div class="info-item">
                        <span class="info-label">NO. DO</span>
                        <span class="info-value">{{ modelValue.doNumber }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">NIM / NAMA</span>
                        <span class="info-value">{{ modelValue.nim }} - {{ modelValue.name }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">EKSPEDISI</span>
                        <span class="info-value">{{ modelValue.courier }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">TANGGAL KIRIM</span>
                        <span class="info-value">{{ modelValue.shipmentDate }}</span>
                    </div>
                </div>

                <div class="package-details-card">
                    <span class="info-label package-label">RINCIAN ISI PAKET BAHAN AJAR:</span>
                    <ul class="package-item-list">
                        <li v-for="item in selectedPackageItemsDetails" :key="item.code">
                            <strong>[{{ item.code }}]</strong> {{ item.title }}
                        </li>
                    </ul>
                </div>

                <div class="form-actions">
                    <button type="button" @click="$emit('save')" class="btn-primary">Buat DO</button>
                    <button type="button" @click="$emit('back')" class="btn-secondary">Edit Data</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    isOpen: Boolean,
    isConfirmStep: Boolean,
    modelValue: Object,
    deliveryList: Array,
    packageList: Array,
    selectedPackageItemsDetails: Array
});

const emit = defineEmits(['update:modelValue', 'proceed-confirm', 'save', 'back', 'close']);

const updateField = (key, val) => {
    emit('update:modelValue', { ...props.modelValue, [key]: val });
};
</script>

<style>
@import '../assets/css/views/tracking.css';
</style>
