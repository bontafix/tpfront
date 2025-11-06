<template>
  <v-custom-modal ref="customModal">
    <template #modal>
      <div class="v-secondary-change-password">
        <h2 class="modal-title">Смена пароля</h2>

        <form @submit.prevent>
          <div class="modal-field col">
            <label for="newPassword" class="modal-field__subtitle">Текущий пароль</label>
            <div class="v-change-password__input" :class="{'password-hidden': hiddenInput[0]}" >
              <div class="v-change-passowrd__input-images" @click="() => toggleHiddenInput(0)">
                <div class="v-change-password__input-image on">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.833252 9.99992C0.833252 9.99992 4.16658 3.33325 9.99992 3.33325C15.8333 3.33325 19.1666 9.99992 19.1666 9.99992C19.1666 9.99992 15.8333 16.6666 9.99992 16.6666C4.16658 16.6666 0.833252 9.99992 0.833252 9.99992Z" stroke="#717680" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9.99992 12.4999C11.3806 12.4999 12.4999 11.3806 12.4999 9.99992C12.4999 8.61921 11.3806 7.49992 9.99992 7.49992C8.61921 7.49992 7.49992 8.61921 7.49992 9.99992C7.49992 11.3806 8.61921 12.4999 9.99992 12.4999Z" stroke="#717680" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>

                </div>
                <div class="v-change-password__input-image off">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_11026_14550)">
                    <path d="M8.24992 3.53325C8.82353 3.39898 9.4108 3.33187 9.99992 3.33325C15.8333 3.33325 19.1666 9.99992 19.1666 9.99992C18.6607 10.9463 18.0575 11.8372 17.3666 12.6582M11.7666 11.7666C11.5377 12.0122 11.2617 12.2092 10.955 12.3459C10.6484 12.4825 10.3173 12.556 9.98166 12.5619C9.64598 12.5678 9.31255 12.5061 9.00126 12.3803C8.68997 12.2546 8.40719 12.0674 8.16979 11.83C7.93239 11.5926 7.74525 11.3099 7.61951 10.9986C7.49377 10.6873 7.43202 10.3539 7.43795 10.0182C7.44387 9.6825 7.51734 9.35146 7.65398 9.04479C7.79062 8.73813 7.98763 8.46212 8.23325 8.23325M0.833252 0.833252L19.1666 19.1666M14.9499 14.9499C13.5254 16.0358 11.7908 16.6373 9.99992 16.6666C4.16658 16.6666 0.833252 9.99992 0.833252 9.99992C1.86983 8.06816 3.30753 6.38042 5.04992 5.04992L14.9499 14.9499Z" stroke="#717680" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_11026_14550">
                    <rect width="20" height="20" fill="white"/>
                    </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>

              <input
                placeholder="Придумайте пароль"
                id="newPassword"
                v-model="currentPassword"
                :type="inputType(2)"
                class="custom-input"
                :class="{error: currentPasswordErrors && currentPassword.length}"
              />
            </div>


            <div v-if="currentPasswordeRRORS && currentPassword.length" class="text-red">{{ currentPasswordErrors }}</div>
          </div>
          <div class="modal-field col">
            <label for="newPassword" class="modal-field__subtitle">Новый пароль</label>
            <div class="v-change-password__input" :class="{'password-hidden': hiddenInput[0]}" >
              <div class="v-change-passowrd__input-images" @click="() => toggleHiddenInput(0)">
                <div class="v-change-password__input-image on">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.833252 9.99992C0.833252 9.99992 4.16658 3.33325 9.99992 3.33325C15.8333 3.33325 19.1666 9.99992 19.1666 9.99992C19.1666 9.99992 15.8333 16.6666 9.99992 16.6666C4.16658 16.6666 0.833252 9.99992 0.833252 9.99992Z" stroke="#717680" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9.99992 12.4999C11.3806 12.4999 12.4999 11.3806 12.4999 9.99992C12.4999 8.61921 11.3806 7.49992 9.99992 7.49992C8.61921 7.49992 7.49992 8.61921 7.49992 9.99992C7.49992 11.3806 8.61921 12.4999 9.99992 12.4999Z" stroke="#717680" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>

                </div>
                <div class="v-change-password__input-image off">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_11026_14550)">
                    <path d="M8.24992 3.53325C8.82353 3.39898 9.4108 3.33187 9.99992 3.33325C15.8333 3.33325 19.1666 9.99992 19.1666 9.99992C18.6607 10.9463 18.0575 11.8372 17.3666 12.6582M11.7666 11.7666C11.5377 12.0122 11.2617 12.2092 10.955 12.3459C10.6484 12.4825 10.3173 12.556 9.98166 12.5619C9.64598 12.5678 9.31255 12.5061 9.00126 12.3803C8.68997 12.2546 8.40719 12.0674 8.16979 11.83C7.93239 11.5926 7.74525 11.3099 7.61951 10.9986C7.49377 10.6873 7.43202 10.3539 7.43795 10.0182C7.44387 9.6825 7.51734 9.35146 7.65398 9.04479C7.79062 8.73813 7.98763 8.46212 8.23325 8.23325M0.833252 0.833252L19.1666 19.1666M14.9499 14.9499C13.5254 16.0358 11.7908 16.6373 9.99992 16.6666C4.16658 16.6666 0.833252 9.99992 0.833252 9.99992C1.86983 8.06816 3.30753 6.38042 5.04992 5.04992L14.9499 14.9499Z" stroke="#717680" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_11026_14550">
                    <rect width="20" height="20" fill="white"/>
                    </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>

              <input
                placeholder="Придумайте пароль"
                id="newPassword"
                v-model="newPassword"
                :type="inputType(0)"
                class="custom-input"
                :class="{error: firstPasswordError && newPassword.length}"
              />
            </div>


            <div v-if="firstPasswordError && newPassword.length" class="text-red">{{ firstPasswordError }}</div>
          </div>

          <div class="modal-field col password-field">
            <label for="newPassword2" class="modal-field__subtitle">Повторите новый пароль</label>
            <div class="v-change-password__input" :class="{'password-hidden': hiddenInput[1]}">
              <div class="v-change-passowrd__input-images" @click="() => toggleHiddenInput(1)">
                <div class="v-change-password__input-image on">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.833252 9.99992C0.833252 9.99992 4.16658 3.33325 9.99992 3.33325C15.8333 3.33325 19.1666 9.99992 19.1666 9.99992C19.1666 9.99992 15.8333 16.6666 9.99992 16.6666C4.16658 16.6666 0.833252 9.99992 0.833252 9.99992Z" stroke="#717680" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9.99992 12.4999C11.3806 12.4999 12.4999 11.3806 12.4999 9.99992C12.4999 8.61921 11.3806 7.49992 9.99992 7.49992C8.61921 7.49992 7.49992 8.61921 7.49992 9.99992C7.49992 11.3806 8.61921 12.4999 9.99992 12.4999Z" stroke="#717680" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>

                </div>
                <div class="v-change-password__input-image off">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_11026_14550)">
                    <path d="M8.24992 3.53325C8.82353 3.39898 9.4108 3.33187 9.99992 3.33325C15.8333 3.33325 19.1666 9.99992 19.1666 9.99992C18.6607 10.9463 18.0575 11.8372 17.3666 12.6582M11.7666 11.7666C11.5377 12.0122 11.2617 12.2092 10.955 12.3459C10.6484 12.4825 10.3173 12.556 9.98166 12.5619C9.64598 12.5678 9.31255 12.5061 9.00126 12.3803C8.68997 12.2546 8.40719 12.0674 8.16979 11.83C7.93239 11.5926 7.74525 11.3099 7.61951 10.9986C7.49377 10.6873 7.43202 10.3539 7.43795 10.0182C7.44387 9.6825 7.51734 9.35146 7.65398 9.04479C7.79062 8.73813 7.98763 8.46212 8.23325 8.23325M0.833252 0.833252L19.1666 19.1666M14.9499 14.9499C13.5254 16.0358 11.7908 16.6373 9.99992 16.6666C4.16658 16.6666 0.833252 9.99992 0.833252 9.99992C1.86983 8.06816 3.30753 6.38042 5.04992 5.04992L14.9499 14.9499Z" stroke="#717680" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_11026_14550">
                    <rect width="20" height="20" fill="white"/>
                    </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>

              <input
                placeholder="Введите новый пароль повторно"
                v-model="newPassword2"
                id="newPassword2"
                :type="inputType(1)"
                class="custom-input"
                :class="{error: passwordMatchError && newPassword2.length}"
              />
            </div>

            <div v-if="passwordMatchError && newPassword2.length" class="text-red">{{ passwordMatchError }}</div>
          </div>

          <a href="" class="contact-link">Забыли пароль?</a>
        </form>
      </div>
    </template>

    <template #button>
      <button class="custom-btn blue" :class="{unactive: firstPasswordError || passwordMatchError}" @click="handleSave">
        Сохранить
      </button>
    </template>
  </v-custom-modal>
</template>
<script setup>
import { ref, computed } from 'vue'
import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'

const emit = defineEmits(['toggle-modal'])
const customModal = ref(null)

const currentPassword = ref('')
const newPassword = ref('')
const newPassword2 = ref('')
const wasSubmitted = ref(false)

const hiddenInput = ref([false, false, false])

// Список всех ошибок
const passwordErrors = computed(() => {
  const errors = []
  const password = newPassword.value

  if (password.length < 8) {
    errors.push('Пароль должен содержать не менее 8 символов')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Должна быть хотя бы одна заглавная латинская буква')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Должна быть хотя бы одна строчная латинская буква')
  }
  if (!/^[A-Za-z0-9~!?@#$%^&*_\-+()\[\]{}><\/\\|"'.,:]*$/.test(password)) {
    errors.push('Допустимы только латинские буквы, арабские цифры и специальные символы')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Должна быть хотя бы одна цифра')
  }
  if (/\s/.test(password)) {
    errors.push('Пробелы недопустимы')
  }
  console.log('Проверяем пароль')
  return errors
})

// Только первая ошибка
const firstPasswordError = computed(() =>  passwordErrors.value[0])

// Проверка совпадения паролей
const passwordMatchError = computed(() =>
 newPassword.value !== newPassword2.value
    ? 'Пароли не совпадают'
    : null
)

const inputType = (input_index) => {
  return hiddenInput.value[input_index] ? 'password' : 'text'
}

const toggleHiddenInput = (input_index) => {
  console.log(input_index, hiddenInput.value[input_index])
  hiddenInput.value[input_index] = !hiddenInput.value[input_index]
}

// Обработка клика на кнопку "Сохранить"
const handleSave = () => {
  wasSubmitted.value = true

  if (!passwordErrors.value.length && !passwordMatchError.value) {
    // здесь логика отправки формы
    console.log('Пароль успешно сохранён')

    customModal.value.close()
    emit('toggle-modal', 'passwordSaved')
  }
}
</script>
