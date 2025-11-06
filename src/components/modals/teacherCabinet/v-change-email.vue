<template>
  <v-custom-modal>
    <template #modal>
      <div class="v-change-email">
        <h2 class="modal-title">Смена почты</h2>

        <div class="modal-field col">
          <p class="modal-field__subtitle">
            Новый адрес электронной почты
          </p>
          <input v-model="email" class="custom-input" @input="inputEmail" :class="{blue: isValid && currentStep}" placeholder="Введите почту" type="email">
        </div>

        <!-- <div class="modal-field col" v-show="currentStep && isValid">
          <p class="modal-field__subtitle">
            Код
          </p>
          <input type="number" v-model="code" class="custom-input" placeholder="Введите код">
          <div class="modal-subtitle">
            Мы отправили код на вашу почту
          </div>
        </div> -->

      </div>
    </template>
    <!-- <template #button>
      <button class="custom-btn gray" :class="{gray: !isValid, blue: isValid}" @click="continueStep">
        Продолжить
      </button>
    </template> -->
    <template #button>
      <button class="custom-btn blue" @click="submitForm">
        Обновить
      </button>
    </template>
  </v-custom-modal>
</template>
<script setup>
import { ref, computed, readonly } from 'vue';

import vCustomModal from '@/components/generalComponents/v-custom-modal.vue';
import { changeEmail, updateStudentProfile, updateTeacherProfile } from '@/api/requests';

const email = ref('')
const code = ref(null)

const currentStep = ref(0)

const emit = defineEmits(['toggle-modal'])

const continueStep = () => {
  currentStep.value++
  if(code.value) {
    emit('toggle-modal', 'passwordSaved')
  }
}

const inputEmail = () => {
  if(!isValid.value) {
    currentStep.value = 0
  }
}


const submitForm = async () => {

  await changeEmail(email.value)
}

const isValid = computed(()=>{
  return email.value.length > 8 &&  email.value.includes('@')
})
</script>
