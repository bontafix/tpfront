<template>
  <v-custom-modal @submit="submitForm">
    <template #modal>
      <div class="v-income-modal">
        <h1 class="modal-title">Добавление дохода</h1>
        <div class="v-income-modal__fields">
          <div class="modal-field col" v-if="!notLink">
            <p class="modal-subtitle">Выбор ученика</p>
            <v-styled-select :items="myStudents" :student-icon="true" @update:model-value="studentSelected"/>
          </div>
          <div class="modal-field row">
            <div class="styled-checkbox">
              <input type="checkbox" id="not-link" v-model="notLink" />
              <label for="not-link"></label>
            </div>
            <label class="modal-subtitle" for="not-link">Не привязывать доход к ученику</label>
          </div>

          <div class="modal-field col">
            <label class="modal-subtitle" for="sum">Внесенная сумма (₽)</label>
            <input class="custom-input" type="number" id="sum" v-model="sum" placeholder="Сумма" />
          </div>
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
import { setIncome } from '@/api/requests'

const studentsStore = useStudentsStore()

const emit = defineEmits(['submit'])

const currentStudent = ref(null)
const myStudents = computed(()=>{
  return studentsStore.students
})

const notLink = ref()
const sum = ref(null)

const submitForm = async () => {
  const requestBody = {}

  if(!notLink.value) {
    requestBody['student_id'] = currentStudent.value.id
  }

  requestBody['sum'] = sum.value
  requestBody['comment'] = 'string'

  console.log(requestBody)
  await setIncome(requestBody)

}

const studentSelected = (student) => {
  currentStudent.value = student
}
</script>
