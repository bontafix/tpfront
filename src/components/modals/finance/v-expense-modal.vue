<template>
  <v-custom-modal @submit="submitForm">
    <template #modal>
      <div class="v-expense-modal">
        <h1 class="modal-title">Добавление расхода</h1>
        <div class="modal-field col">
          <label class="modal-subtitle" for="sum">Сумма</label>
          <div class="v-expense-modal__field">
            <input type="number" id="sum" class="custom-input" placeholder="Сумма" v-model="formData.sum" />
            <v-styled-select :items="currencyItems" />
          </div>
        </div>
        <div class="modal-field col">
          <label class="modal-subtitle" for="purpose">Назначение</label>
          <input class="custom-input" id="purpose" type="text" placeholder="Назначение" v-model="formData.comment" />
        </div>
      </div>
    </template>
  </v-custom-modal>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useStudentsStore } from '@/stores/studentsStore'

import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'
import vStyledSelect from '@/components/generalComponents/v-styled-select.vue'
import { setExpense } from '@/api/requests'

const store = useStudentsStore()

const props = defineProps({
  studentId: {
    type: Number,
    required: true
  }
})

const formData = ref({
  comment: '',
  sum: null
})

const currencyItems = computed(() => {
  return store.currency
})

const submitForm = async () => {
  const requestBody = {...formData.value, student_id: props.studentId, category_id: 1}
  await setExpense(requestBody)
}
</script>
