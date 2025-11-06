<template>
  <v-custom-modal ref="modalRef" @submit="submitForm" :isSaveButtonDisabled="isButtonDisabled">
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
  </v-custom-modal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCurrentStudentStore } from '@/stores/currentStudentStore'
import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'
import vStyledSelect from '@/components/generalComponents/v-styled-select.vue'
import '@vuepic/vue-datepicker/dist/main.css'
import { createDemoRequest, getTypesConnect } from '@/api/requests'

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
  if (
    formData.value.name &&
    formData.value.contact_method &&
    formData.value.contact_type &&
    pd_accepted.value
  ) {
    return false
  }
  return true
})

const modalRef = ref()
const contactTypes = ref()
const isReadonly = props.readonly

const pd_accepted = ref(false)
const ads_accepted = ref(false)
const formData = ref({
  name: studentName.value || '',
  contact_method: '',
  contact_type: null,
  pd_accepted: pd_accepted.value,
  ads_accepted: ads_accepted.value,
})

const submitForm = async () => {
  const requestBody = {
    name: formData.value.name,
    contact_value: formData.value.contact_method,
    type_connect_id: formData.value.contact_type.id,
    agree_personal_data: pd_accepted.value,
    marketing_opt_in: ads_accepted.value,
  }

  const response = await createDemoRequest(requestBody)
  if (response.status === 201) {
    modalRef.value?.close()
  }
}

onMounted(async () => {
  const types = await getTypesConnect()
  const changedTypes = types.map((item) => ({
    id: item.id,
    name: '',
    icon: item.icon,
  }))
  contactTypes.value = [...changedTypes]
})
</script>
