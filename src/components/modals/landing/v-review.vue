<template>
  <v-custom-modal ref="modalRef" @submit="submitForm">
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

          <div class="landing-caption pd">
            Отправляя свои данные, я подтверждаю, что ознакомился и согласен с
            <a href="/Политика обработки ПДН.pdf" target="_blank"
              ><u>Политикой конфиденциальности</u></a
            >
            и
            <a href="/Пользовательское соглашение.pdf" target="_blank"
              ><u>пользовательским соглашением</u></a
            >
          </div>

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
              <label for="pd_accepted" class="landing-caption"
                >Я даю согласие на обработку своих персональных данных согласно
                <a href="/Политика обработки ПДН.pdf" target="_blank"
                  ><u>политике конфиденциальности</u></a
                ></label
              >
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
              <label for="ads_accepted" class="landing-caption"
                >Я даю согласие на получение рекламно-информационных рассылок</label
              >
            </div>
          </div>
        </form>
      </div>
    </template>

    <template #button>
      <button
        class="custom-btn blue"
        :class="isButtonDisabled && 'button-disabled-modal'"
        @click="submitForm"
        :disabled="isButtonDisabled"
      >
        Отправить
      </button>
    </template>
  </v-custom-modal>
</template>

<script setup>
import { ref, computed } from 'vue'

import { useCurrentStudentStore } from '@/stores/currentStudentStore'
import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'
import vCustomTextarea from '@/components/generalComponents/v-custom-textarea.vue'
import { setNewReviews } from '@/api/requests'

import '@vuepic/vue-datepicker/dist/main.css'

const currentStudentStore = useCurrentStudentStore()

const props = defineProps({
  readonly: {
    type: Boolean,
    default: false,
  },
})

const studentName = computed(() => {
  return currentStudentStore.student?.student_name
})
const isButtonDisabled = computed(() => {
  if (formData.value.name && formData.value.subject && formData.value.text && pd_accepted.value) {
    return false
  }
  return true
})

const modalRef = ref()

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

const submitForm = async () => {
  const requestBody = {
    name: formData.value.name,
    subject: formData.value.subject,
    text: formData.value.text,
    agree_personal_data: pd_accepted.value,
    marketing_opt_in: ads_accepted.value,
  }

  const response = await setNewReviews(requestBody)
  if (response.status === 201) {
    modalRef.value?.close()
  }
}
</script>

<style scoped>
.button-disabled-modal {
  opacity: 0.4;
  cursor: auto;
}
</style>
