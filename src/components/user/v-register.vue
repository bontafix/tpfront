<template>
  <div class="v-login">
    <div class="v-login__container container">
      <h1 class="v-login__title text-title">TeacherPlanner</h1>
      <p class="v-login__subtitle">
        Зарегистрируйтесь в системе, если у вас еще нет аккаунта или <router-link class="contact-link" :to="{name: 'login'}"> войдите</router-link>
      </p>
      <!-- <div class="v-login__column">
        <a target="_blank" href="https://test-api.teacherplanner.ru/api/auth/google" class="v-login__button">
          <img src="/src/assets/images/google-icon.svg" alt="" />
          Продолжить с Google
        </a>
        <a target="_blank" href="https://test-api.teacherplanner.ru/api/auth/yandex" class="v-login__button">
          <img src="/src/assets/images/yandex-icon.svg" alt="" />
          Продолжить с Яндекс
        </a>
      </div> -->

      <form  class="v-login__form" method="POST" @submit.prevent="submitForm">
        <div class="v-login__form-field">
          <label class="v-login-form-field-subtitle" for="username">Имя пользователя *</label>
          <input
            v-model="form.username"
            type="text"
            class="custom-input"
            :class="{ 'error': errors.username && touched.username }"
            id="username"
            placeholder="Введите имя пользователя"
            @blur="touched.username = true"
          />
          <span v-if="errors.username && touched.username" class="error-message">{{ errors.username }}</span>
        </div>
        <div class="v-login__form-field">
          <label class="v-login-form-field-subtitle" for="email">Email *</label>
          <input
            v-model="form.email"
            type="email"
            class="custom-input"
            :class="{ 'error': errors.email && touched.email }"
            id="email"
            placeholder="Введите адрес электронной почты"
            @blur="touched.email = true"
          />
          <span v-if="errors.email && touched.email" class="error-message">{{ errors.email }}</span>
        </div>
        <!-- <div class="v-login__form-field">
          <label class="v-login-form-field-subtitle" for="email"></label>
          <input
            v-model="form.teacher_ref_cod"
            type="number"
            class="custom-input"
            id="teacer_ref_cod"
            placeholder="Введите код, который вас вам прислал учитель"
          />
        </div> -->
        <div class="v-login__form-field password-field">
          <label class="v-login-form-field-subtitle" for="password">Пароль *</label>
          <div class="password-input-wrapper">
            <input
              v-model="form.password1"
              :type="passwordInputType"
              class="custom-input"
              :class="{ 'error': errors.password1 && touched.password1 }"
              id="password"
              placeholder="Введите пароль (минимум 8 символов)"
              @blur="touched.password1 = true"
            />
            <img v-if="passwordInputType === 'password'" @click="changeInputType" src="/src/assets/images/eye-off.svg" class="password-image" alt="">
            <img v-else @click="changeInputType" class="password-image" src="/src/assets/images/eye.svg" alt="">
          </div>
          <span v-if="errors.password1 && touched.password1" class="error-message">{{ errors.password1 }}</span>
        </div>
        <div v-if="requirePasswordConfirmation" class="v-login__form-field password-field">
          <label class="v-login-form-field-subtitle" for="password2">Подтвердите пароль *</label>
          <div class="password-input-wrapper">
            <input
              v-model="form.password2"
              :type="password2InputType"
              class="custom-input"
              :class="{ 'error': errors.password2 && touched.password2 }"
              id="password2"
              placeholder="Повторите пароль"
              @blur="touched.password2 = true"
            />
            <img v-if="password2InputType === 'password'" @click="changePassword2InputType" src="/src/assets/images/eye-off.svg" class="password-image" alt="">
            <img v-else @click="changePassword2InputType" class="password-image" src="/src/assets/images/eye.svg" alt="">
          </div>
          <span v-if="errors.password2 && touched.password2" class="error-message">{{ errors.password2 }}</span>
        </div>
        <div class="v-login__form-checkbox mb-5">
            <div class="styled-checkbox">
              <input type="checkbox" id="teacher-register" v-model="form.isTeacher" />
              <label for="teacher-register"></label>
            </div>
            <label for="teacher-register">Зарегистрироваться как учитель?</label>
          </div>
        <button type="submit" class="custom-btn" :class="{ white: !isValid, blue: isValid }" :disabled="!isValid">
          Продолжить
        </button>
        <div class="v-login__form-checkboxes">
          <div class="v-login__form-checkbox">
            <div class="styled-checkbox">
              <input type="checkbox" id="age-accept" v-model="form.ageAccept" />
              <label for="age-accept"></label>
            </div>
            <label for="age-accept"
              >Я подтверждаю, что мне исполнилось 18 лет или у меня есть разрешение родителя/опекуна
              на использование платформы</label
            >
          </div>
          <div class="v-login__form-checkbox">
            <div class="styled-checkbox">
              <input type="checkbox" id="ads-accept" v-model="form.adsAccept" />
              <label for="ads-accept"></label>
            </div>
            <label for="ads-accept">Я согласен на получение рекламных рассылок</label>
          </div>
        </div>
      </form>

      <div class="v-login__warning">
        Продолжая, вы соглашаетесь с <a class="contact-link" href="/Пользовательское соглашение.pdf" target="_blank"> Условиями использования</a> и
        <a class="contact-link" href="/Политика обработки ПДН.pdf" target="_blank"> Политикой конфиденциальности.</a>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { registerUser } from '@/api/auth'
import { useMyStore } from '@/stores/myStore.js'
import emitter from '@/eventBus'
import { resolveApiMessage } from '@/api/apiMessages'

const route = useRoute()
const router = useRouter()

// Настройка автоматического входа после регистрации
// 'true' - скрытый автовход (форма не показывается, вход происходит автоматически)
// 'visible' - видимый автовход (форма показывается с индикатором автовхода)
// false - ручной вход (только автозаполнение формы, требуется нажать кнопку)
const AUTO_LOGIN_MODE = 'true' // 'true' | 'visible' | false

// Флаг для переключения режима работы формы
// true - требуется подтверждение пароля (два поля)
// false - без подтверждения пароля (одно поле)
const requirePasswordConfirmation = ref(true)

const form = ref({
  email: '',
  username: '',
  password1: '',
  password2: '',
  ageAccept: false,
  adsAccept: false,
  isTeacher: false,
  teacher_ref_cod: ''
})

const touched = ref({
  username: false,
  email: false,
  password1: false,
  password2: false
})

// Валидация email
const isEmailValid = computed(() => {
  if (!form.value.email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(form.value.email)
})

// Валидация пароля
const isPasswordValid = computed(() => {
  return form.value.password1 && form.value.password1.length >= 8
})

// Проверка совпадения паролей
const isPasswordMatch = computed(() => {
  // Если не требуется подтверждение пароля, считаем что пароли совпадают
  if (!requirePasswordConfirmation.value) {
    return true
  }
  return form.value.password1 === form.value.password2 && form.value.password2.length > 0
})

// Объект с ошибками
const errors = computed(() => {
  const baseErrors = {
    username: !form.value.username ? 'Имя пользователя обязательно для заполнения' : 
              form.value.username.length < 3 ? 'Имя пользователя должно содержать минимум 3 символа' : '',
    email: !form.value.email ? 'Email обязателен для заполнения' : 
           !isEmailValid.value ? 'Введите корректный email адрес' : '',
    password1: !form.value.password1 ? 'Пароль обязателен для заполнения' : 
               form.value.password1.length < 8 ? 'Пароль должен содержать минимум 8 символов' : ''
  }
  
  // Добавляем валидацию второго пароля только если требуется подтверждение
  if (requirePasswordConfirmation.value) {
    baseErrors.password2 = !form.value.password2 ? 'Подтвердите пароль' : 
                          !isPasswordMatch.value ? 'Пароли не совпадают' : ''
  } else {
    baseErrors.password2 = ''
  }
  
  return baseErrors
})

// Проверка валидности всей формы
const isValid = computed(() => {
  return (
    form.value.username &&
    form.value.username.length >= 3 &&
    isEmailValid.value &&
    isPasswordValid.value &&
    isPasswordMatch.value &&
    form.value.ageAccept
  )
})

const store = useMyStore();

const passwordInputType = ref('password')
const password2InputType = ref('password')

const changeInputType = () => {
  passwordInputType.value = passwordInputType.value === 'password' ? 'text' : 'password'
}

const changePassword2InputType = () => {
  password2InputType.value = password2InputType.value === 'password' ? 'text' : 'password'
}
const submitForm = async () => {
  console.log('Валидность формы:', isValid.value)
  
  // Помечаем все поля как touched для отображения ошибок
  touched.value.username = true
  touched.value.email = true
  touched.value.password1 = true
  
  // Помечаем второй пароль как touched только если требуется подтверждение
  if (requirePasswordConfirmation.value) {
    touched.value.password2 = true
  }
  
  if (!isValid.value) {
    // Показываем уведомление об ошибках валидации
    emitter.emit('notify', {
      type: 'error',
      message: 'Пожалуйста, исправьте ошибки в форме',
    })
    return
  }
  
  if (isValid.value) {
    const requestBody = {
      username: form.value.username,
      email: form.value.email,
      password: form.value.password1,
      is_teacher: form.value.isTeacher,
      is_student: !form.value.isTeacher,
      teacher_ref_cod: String(form.value.teacher_ref_cod)
    }

    try {
      const response = await registerUser(requestBody);
      
      console.log('🔵 [REGISTER] Ответ от сервера:', response)
      console.log('🔵 [REGISTER] Статус ответа:', response?.status)
      
      // Проверяем, что регистрация прошла успешно (статус 200 или 201)
      if (response && (response.status === 200 || response.status === 201)) {
        console.log('✅ [REGISTER] Регистрация успешна, перенаправление на форму входа...')
        
        // Показываем уведомление об успешной регистрации
        const successMessage = resolveApiMessage('register', response, {
          defaultSuccess: 'Регистрация успешна! Теперь войдите в систему',
        })
        
        emitter.emit('notify', {
          type: 'success',
          message: successMessage,
        })
        
        // После успешной регистрации перенаправляем на форму входа
        // Данные передаются через router.state (безопасно - не попадают в URL)
        const state = {
          username: form.value.username,
          password: form.value.password1
        }
        
        // Добавляем режим автовхода, если он настроен
        if (AUTO_LOGIN_MODE) {
          state.autoLogin = AUTO_LOGIN_MODE
        }
        
        console.log('🔵 [REGISTER] Переход на форму входа с режимом:', AUTO_LOGIN_MODE || 'manual')
        
        await router.push({
          name: 'login',
          state: state  // Данные НЕ попадут в URL и историю браузера
        });
      } else {
        // Регистрация не успешна (код != 200/201)
        console.log('❌ [REGISTER] Регистрация не успешна, код:', response?.status)
        
        const errorMessage = resolveApiMessage('register', response, {
          defaultError: 'Ошибка при регистрации. Попробуйте еще раз',
        })
        
        emitter.emit('notify', {
          type: 'error',
          message: errorMessage,
        })
      }
    } catch (error) {
      console.error('❌ [REGISTER] Ошибка при регистрации:', error)
      
      // Показываем сообщение об ошибке
      const errorMessage = resolveApiMessage('register', error, {
        defaultError: 'Произошла ошибка при регистрации. Попробуйте позже',
      })
      
      emitter.emit('notify', {
        type: 'error',
        message: errorMessage,
      })
    }
  }
}

onMounted(() => {
  form.value.teacher_ref_cod = route.query.ref_code || ''
})
</script>

<style scoped>
.v-login__form-field {
  position: relative;
  margin-bottom: 20px;
}

.v-login-form-field-subtitle {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--custom-black-text);
}

.night__mode .v-login-form-field-subtitle {
  color: rgba(255, 255, 255, 0.87);
}

.error-message {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: #ff3a3a;
  animation: fadeIn 0.3s ease-in;
}

.night__mode .error-message {
  color: #FF7474;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-input.error {
  border-color: #ff3a3a;
  background-color: #ffeded;
}

.night__mode .custom-input.error {
  border-color: #FF7474;
  background-color: rgba(255, 58, 58, 0.1);
}

.custom-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-field {
  position: relative;
}

.password-input-wrapper {
  position: relative;
}

.password-input-wrapper .custom-input {
  padding-right: 45px;
}

.password-image {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  width: 20px;
  height: 20px;
}
</style>
