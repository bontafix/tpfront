<template>
  <v-custom-modal @submit="submitForm">
    <template #modal>
      <div class="v-additionaly-task-modal">
        <h2 class="modal-title">{{ modalTitle }}</h2>
        <v-custom-textarea :placeholder="'Введите домашнее задание'" v-model="formData.title" />
        <v-files-handler :show-drop-area="true" v-model="formData.files" />

        <div class="v-additionaly-task-modal__row modal-field">
          <div class="v-additionaly-task-modal__block">
            <p class="modal-field__title">Дедлайн</p>
            <VueDatePicker
              class="custom-datepicker"
              v-model="formData.due_date"
              :locale="'ru-ru'"
              :auto-apply="true"
              :format="formatDate"
            >
              <template #clear-icon="{ clear }"> </template>
            </VueDatePicker>
          </div>
          <div class="v-additionaly-task-modal__block">
            <div class="styled-checkbox">
              <input
                type="checkbox"
                v-model="forNext"
                id="next"
                :checked="formData.exams"
              />
              <label for="next"></label>
            </div>
            <label for="next" class="modal-field__title">До следующего занятия</label>
          </div>
        </div>
      </div>
    </template>
  </v-custom-modal>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { formatDate, formatDateToBase } from '@/utils'

import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'
import vFilesHandler from '@/components/generalComponents/v-files-handler.vue'
import vCustomTextarea from '@/components/generalComponents/v-custom-textarea.vue'

import '@vuepic/vue-datepicker/dist/main.css'
import VueDatePicker from '@vuepic/vue-datepicker'

const props = defineProps({
  modalTitle: {
    type: String,
    default: () => 'Дополнительное задание'
  }
})

const emit = defineEmits(['save-homework'])
const forNext = ref(false)

const formData = ref({
  title: '',
  files: [],
  due_date: '',
  no_homework: false,
})

const submitForm = () => {
  formData.value.due_date = new Date(formData.value.due_date).toISOString().split('T')[0]
  formData.value.due_time = '10:00:00.000Z'
  formData.value.conducted_date = formatDateToBase(new Date())
  emit('save-homework', formData.value)
}

onMounted(() => {
  formData.value.due_date = new Date().toISOString().split('T')[0]
})
</script>
