<template>
  <v-custom-modal @submit="submitForm">
    <template #modal>
      <div class="v-add-result-modal">
        <h2 class="modal-title">Отзыв о платформе</h2>
        <form action="" class="modal-form">
          <div class="modal-field col">
            <p class="modal-field__title">Ваше имя</p>
            <input
              type="text"
              class="custom-input"
              placeholder="Ваше имя"
              v-model="formData.name"
              :readonly="isReadonly"
            />
          </div>

          <div class="modal-field col">
            <p class="modal-field__title">Предмет, который вы преподаете</p>
            <input
              type="text"
              class="custom-input"
              placeholder="Предмет, который вы преподаете"
              v-model="formData.subject"
              :readonly="isReadonly"
            />
          </div>

          <div class="modal-field col">
            <p class="modal-field__title">Ваш отзыв</p>
            <v-custom-textarea
              v-model="formData.text"
              placeholder="Текст отзыва"
              :readonly="isReadonly"
            />
          </div>

          <div class="landing-caption pd">Отправляя свои данные, я подтверждаю, что ознакомился и согласен с <u>Политикой конфиденциальности</u> и <u>пользовательским соглашением</u></div>

          <div class="modal-field flex justify-between">
            <div class="flex gap-3 items-center">
              <div class="styled-checkbox">
                <input
                  type="checkbox"
                  v-model="pd_accepted"
                  id="pd_accepted"
                  :checked="pd_accepted"
                  :disabled="isReadonly"
                />
                <label for="pd_accepted"></label>
              </div>
              <label for="pd_accepted" class="landing-caption">Я даю согласие на обработку своих персональных данных согласно <u>политике конфиденциальности</u></label>
            </div>
          </div>

          <div class="modal-field flex justify-between">
            <div class="flex gap-3 items-center">
              <div class="styled-checkbox">
                <input
                  type="checkbox"
                  v-model="ads_accepted"
                  id="ads_accepted"
                  :checked="ads_accepted"
                  :disabled="isReadonly"
                />
                <label for="ads_accepted"></label>
              </div>
              <label for="ads_accepted" class="landing-caption">Я даю согласие на получение рекламно-информационных рассылок</label>
            </div>
          </div>
        </form>
      </div>
    </template>

    <template #button>
      <button class="custom-btn blue" @click="submitForm">Отправить</button>
    </template>
  </v-custom-modal>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

import { useCurrentStudentStore } from '@/stores/currentStudentStore'
import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'
import vCustomTextarea from '@/components/generalComponents/v-custom-textarea.vue'

import '@vuepic/vue-datepicker/dist/main.css'

const currentStudentStore = useCurrentStudentStore()

const props = defineProps({
  readonly: {
    type: Boolean,
    default: false,
  },
})

const studentName = computed(()=>{
  return currentStudentStore.student?.student_name
})

const route = useRoute()

const isReadonly = props.readonly

const pd_accepted = ref(false)
const ads_accepted = ref(false)
const formData = ref({
  pd_accepted: pd_accepted.value,
  ads_accepted: ads_accepted.value,
  name: studentName.value || '',
  subject: '',
  text: '',
})

const submitForm = () => {
  const studentId = route.params.id
  const requestBody = {
    student_id: studentId || null,
    name: formData.value.name,
    subject: formData.value.subject,
    text: formData.value.text,
    pd_accepted: pd_accepted.value,
    ads_accepted: ads_accepted.value,
  }
  console.log('Form submitted with data:', requestBody)
}
</script>
