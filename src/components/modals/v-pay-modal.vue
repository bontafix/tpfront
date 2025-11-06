<template>
  <v-custom-modal @submit="submitForm">
    <template #modal>
      <div class="v-pay-modal">
        <h2 class="modal-title">Добавление оплаты</h2>
        <form action="" class="modal-form">
          <div class="modal-field col">
            <h4 class="modal-field__title">Внесенная сумма ({{ currency || '₽' }})</h4>
            <input
              type="number"
              v-model="formData.price"
              class="custom-input"
              placeholder="Сумма"
            />
          </div>
        </form>
      </div>
    </template>
  </v-custom-modal>
</template>
<script setup>
import { ref } from 'vue'
import { useStudentsStore } from '@/stores/studentsStore'

import vCustomModal from '../generalComponents/v-custom-modal.vue'

const store = useStudentsStore()
const emit = defineEmits(['set-payment'])

const currency = store.selectedCurrency

const formData = ref({
  price: '',
})

const submitForm = ()=>{
  const requestBody = {
    amount: formData.value.price,
    discount: 0,
    price: 0,
  }

  emit('set-payment', requestBody)
}
</script>
