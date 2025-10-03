<template>
  <v-custom-modal @submit="submitForm">
    <template #modal>
      <div class="v-add-result-modal">
        <h2 class="landing-modal-title">Отправьте запрос на обзор платформы</h2>
        <p class="modal-description">
          Мы свяжемся с Вами в ближайшее время и запланируем встречу, на которой научим Вас
          пользоваться платформой и поможем перенести ваших учеников.
        </p>
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

          <div class="contact-row">
            <div class="modal-field col">
              <p class="modal-field__title">Способ связи</p>
              <input
                type="text"
                class="custom-input contact-input"
                placeholder="Номер/имя пользователя"
                v-model="formData.contact_method"
                :readonly="isReadonly"
              />
            </div>
            <div class="modal-field col">
              <v-styled-select
                v-model="formData.contact_type"
                :items="contactTypes"
                class="select-contact-method"
              />
            </div>
          </div>
          <!-- todo: add checkbox with telegram, whatsapp and vk icons -->

          <div class="landing-caption pd">
            Отправляя свои данные, я подтверждаю, что ознакомился и согласен с
            <a href="/src/assets/documentation/Политика обработки ПДН.pdf" target="_blank"
              ><u>Политикой конфиденциальности</u></a
            >
            и
            <a href="/src/assets/documentation/Пользовательское соглашение.pdf" target="_blank"
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
                <a href="/src/assets/documentation/Политика обработки ПДН.pdf" target="_blank"
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
  </v-custom-modal>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import { useCurrentStudentStore } from '@/stores/currentStudentStore'
import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'
import vStyledSelect from '@/components/generalComponents/v-styled-select.vue'

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
const contactTypes = ref([
  {
    id: 'telegram',
    name: '',
    icon: '/src/assets/images/telegram.svg',
  },
  {
    id: 'whatsapp',
    name: '',
    icon: '/src/assets/images/whatsapp.svg',
  },
])

const route = useRoute()

const isReadonly = props.readonly

const pd_accepted = ref(false)
const ads_accepted = ref(false)
const formData = ref({
  pd_accepted: pd_accepted.value,
  ads_accepted: ads_accepted.value,
  name: studentName.value || '',
  contact_method: '',
  contact_type: contactTypes.value[0],
})

const submitForm = () => {
  const studentId = route.params.id
  const requestBody = {
    student_id: studentId || null,
    name: formData.value.name,
    contact_method: formData.value.contact_method,
    pd_accepted: pd_accepted.value,
    ads_accepted: ads_accepted.value,
    contact_type: formData.value.contact_type.id,
  }
  console.log('Form submitted with data:', requestBody)
}
</script>
