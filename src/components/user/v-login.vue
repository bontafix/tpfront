<template>
  <div class="v-login">
    <div class="v-login__container container">
      <h1 class="v-login__title text-title">TeacherPlanner</h1>
      <p class="v-login__subtitle">
        Войдите в систему или
        <router-link class="contact-link" :to="{ name: 'register' }">
          зарегистрируйтесь
        </router-link>, если у вас еще нет аккаунта.
      </p>

      <!-- <div class="v-login__column">
        <button @click="signInWithProvider('google')" class="v-login__button">
          <img src="/src/assets/images/google-icon.svg" alt="" />
          Продолжить с Google
        </button>
        <button @click="signInWithProvider('yandex')" class="v-login__button">
          <img src="/src/assets/images/yandex-icon.svg" alt="" />
          Продолжить с Яндекс
        </button>
      </div>
 -->
      <form class="v-login__form" @submit.prevent="submitForm">
        <div class="v-login__form-field">
          <label class="v-login-form-field-subtitle" for="email"></label>
          <input
            v-model="form.username"
            @change="errorLogin = false"
            type="text"
            class="custom-input"
            :class="{error: errorLogin}"
            id="email"
            placeholder="Введите адрес электронной почты или логин"
          />
        </div>
        <div class="v-login__form-field password-field">
          <label class="v-login-form-field-subtitle" for="email"></label>
          <input
            v-model="form.password"
            :type="passwordInputType"
            class="custom-input"
            :class="{error: errorLogin}"
            id="email"
            placeholder="Введите пароль"
          />
          <img v-if="passwordInputType === 'password'" @click="changeInputType" src="/src/assets/images/eye-off.svg" class="password-image" alt="">
          <img v-else @click="changeInputType" class="password-image" src="/src/assets/images/eye.svg" alt="">
        </div>
        <template v-if="errorLogin">
          <p class="caption red-text mb-2">
            Неверный логин или пароль
          </p>
        </template>
        <button type="submit" class="custom-btn" :class="{ white: !isValid, blue: isValid }">
          Продолжить
        </button>

        <div class="v-login__form-checkboxes">
         <!--  <div class="v-login__form-checkbox">
            <div class="styled-checkbox">
              <input type="checkbox" id="age-accept" v-model="form.ageAccept" />
              <label for="age-accept"></label>
            </div>
            <label for="age-accept">
              Я подтверждаю, что мне исполнилось 18 лет или у меня есть разрешение родителя/опекуна
              на использование платформы
            </label>
          </div>

          <div class="v-login__form-checkbox">
            <div class="styled-checkbox">
              <input type="checkbox" id="ads-accept" v-model="form.adsAccept" />
              <label for="ads-accept"></label>
            </div>
            <label for="ads-accept">
              Я согласен на получение рекламных рассылок
            </label>
          </div> -->
        </div>
      </form>

      <div class="v-login__warning">
        Продолжая, вы соглашаетесь с
        <a class="contact-link" href="/Пользовательское соглашение.pdf" target="_blank">Условиями использования</a> и
        <a class="contact-link" href="/Политика обработки ПДН.pdf" target="_blank">Политикой конфиденциальности.</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { loginUser } from '@/api/requests'
import { useRouter } from 'vue-router'
import { useMyStore } from '@/stores/myStore'
import emitter from '@/eventBus'
import { domain } from '@/utils'


const router = useRouter()

const form = ref({
  username: '',
  password: '',
})

const errorLogin = ref(false)

const isValid = computed(() => {
  return form.value.username && form.value.password.length >= 8
})

const passwordInputType = ref('password')

const store = useMyStore()

const changeInputType = () => {
  passwordInputType.value = passwordInputType.value === 'password' ? 'text' : 'password'
}


const submitForm = async () => {
  try {
    if (isValid.value) {
      // Здесь логика отправки email-авторизации
      const response = await loginUser(form.value)
      let message = ''
      console.log(response)
      if(response.status) {
        if(response.data.user_type) {
          store.user_type = response.data.user_type
          localStorage.setItem('user_type', response.data.user_type)
          if(response.data.user_type === 'teacher') {
             router.push({name: 'home_teacher'})
          } else {
            router.push({name: 'student_cabinet'})
          }
        }

        emitter.emit('notify', {
          type: 'success',
          message: 'Вы успешно вошли в систему'
        })
        return
      } else {
        message = 'Произошла ошибка при авторизации, попробуйте позже'
      }

      emitter.emit('notify', {
          type: 'error',
          message: message
        })
    }
  } catch(error) {
    console.error('Ошибка при авторизации:', error)
    errorLogin.value = true
  }

}

function signInWithProvider(provider) {
  const width = 500
  const height = 600
  const left = (screen.width - width) / 2
  const top = (screen.height - height) / 2

  const popup = window.open(
    `${domain}/api/auth/${provider}?origin=${window.location.origin}`,
    'OAuthLogin',
    `width=${width},height=${height},top=${top},left=${left}`
  )

  if (!popup) {
    alert('Не удалось открыть окно авторизации. Пожалуйста, отключите блокировщик всплывающих окон.')
    return
  }

  const allowedOrigins = [
    'http://localhost:5173',
    'https://dev.teacherplanner.ru',
    'https://api.dev-teacherplanner.ru',
    'https://api.teacherplanner.ru'
  ]

  const messageListener = (event) => {
    if (!allowedOrigins.includes(event.origin)) {
      console.warn('Недопустимый origin:', event.origin)
      return
    }

    console.log('✅ Авторизация успешна:', event.data)

    router.push({ name: 'home_teacher' })
  }

  window.addEventListener('message', messageListener, { once: true })
}

onMounted(()=>{
  console.log(document.cookie)
})

</script>
