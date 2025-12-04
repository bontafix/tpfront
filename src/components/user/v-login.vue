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
            id="password"
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
import { resolveApiMessage } from '@/api/apiMessages'
import { domain, getAccessToken, cookieUtils } from '@/utils'


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
  console.log('🔵 [LOGIN] Начало submitForm')
  console.log('🔵 [LOGIN] isValid:', isValid.value)
  console.log('🔵 [LOGIN] form:', { username: form.value.username, password: '***' })
  
  try {
    if (!isValid.value) {
      console.log('❌ [LOGIN] Форма невалидна, выход')
      return
    }

    console.log('🟡 [LOGIN] Вызов loginUser...')
    const response = await loginUser(form.value)
    console.log('🟢 [LOGIN] Ответ от loginUser получен:')
    console.log('  - response:', response)
    console.log('  - response.status:', response?.status)
    console.log('  - response.data:', response?.data)
    console.log('  - response.data?.user_type:', response?.data?.user_type)

    // Проверяем успешность ответа (статус 2xx)
    if (response && response.status >= 200 && response.status < 300) {
      console.log('✅ [LOGIN] Статус ответа успешный (2xx)')
      
      // Берём тип пользователя из ответа
      const userType = response.data?.user_type
      console.log('🔵 [LOGIN] Определённый userType из ответа:', userType)

      if (userType) {
        console.log('✅ [LOGIN] userType найден:', userType)
        
        // Устанавливаем состояние авторизации СРАЗУ после успешной авторизации
        // Не ждём проверки токена, так как он может быть в HttpOnly cookie
        store.isAuth = true
        store.user_type = userType
        localStorage.setItem('user_type', userType)
        console.log('  - Установлен store.isAuth:', store.isAuth)
        console.log('  - Установлен store.user_type:', store.user_type)
        console.log('  - Установлен localStorage.user_type:', localStorage.getItem('user_type'))
        
        // Небольшая задержка, чтобы cookie успел установиться
        await new Promise(resolve => setTimeout(resolve, 100))
        console.log('  - Задержка для установки cookie завершена')
        
        // Проверка куков после авторизации
        console.log('🍪 [COOKIES] Проверка куков после авторизации:')
        console.log('  - Все куки (document.cookie):', document.cookie)
        const allCookies = document.cookie.split(';').map(c => c.trim())
        console.log('  - Список всех куков:', allCookies)
        
        // Проверяем наличие токена в куках
        const tokenFromCookie = getAccessToken()
        console.log('  - Токен из getAccessToken():', tokenFromCookie ? '✅ Найден' : '❌ Не найден')
        if (tokenFromCookie) {
          console.log('  - Длина токена:', tokenFromCookie.length)
          console.log('  - Первые 20 символов токена:', tokenFromCookie.substring(0, 20) + '...')
        }
        
        // Проверяем конкретные имена куков, которые могут содержать токен
        const possibleTokenNames = ['access_token', 'accessToken', 'token', 'auth_token', 'jwt', 'session']
        possibleTokenNames.forEach(name => {
          const cookieValue = cookieUtils.getCookie(name)
          if (cookieValue) {
            console.log(`  - ✅ Кука "${name}" найдена (длина: ${cookieValue.length})`)
          } else {
            console.log(`  - ❌ Кука "${name}" не найдена`)
          }
        })

        if (userType === 'teacher') {
          console.log('🟡 [LOGIN] Редирект на home_teacher...')
          await router.push({ name: 'home_teacher' })
          console.log('🟢 [LOGIN] Редирект на home_teacher выполнен')
        } else if (userType === 'student') {
          console.log('🟡 [LOGIN] Редирект на student_cabinet...')
          await router.push({ name: 'student_cabinet' })
          console.log('🟢 [LOGIN] Редирект на student_cabinet выполнен')
        } else {
          console.log('⚠️ [LOGIN] Неизвестный userType:', userType)
        }

        // Сообщение об успехе: сначала берём из ответа/конфига, fallback — старый текст
        const successMessage = resolveApiMessage('login', response, {
          defaultSuccess: 'Вы успешно вошли в систему',
        })

        console.log('🟡 [LOGIN] Отправка уведомления об успехе...')
        emitter.emit('notify', {
          type: 'success',
          message: successMessage,
        })
        errorLogin.value = false
        console.log('✅ [LOGIN] Авторизация завершена успешно')
        return
      } else {
        console.log('❌ [LOGIN] userType не найден!')
        console.log('  - response.data:', response.data)
        console.log('  - store.user_type:', store.user_type)
        console.log('  - localStorage.user_type:', localStorage.getItem('user_type'))

        const message = resolveApiMessage('login', response, {
          defaultError: 'Не удалось определить тип пользователя',
        })

        emitter.emit('notify', {
          type: 'error',
          message,
        })
        errorLogin.value = true
        return
      }
    } else {
      console.log('❌ [LOGIN] Статус ответа не успешный')
      console.log('  - response:', response)
      console.log('  - response?.status:', response?.status)
      console.log('  - response?.data:', response?.data)
      
      const errorMessage = resolveApiMessage('login', response, {
        defaultError: 'Неверный логин или пароль',
      })

      console.log('  - errorMessage:', errorMessage)
      emitter.emit('notify', {
        type: 'error',
        message: errorMessage,
      })
      errorLogin.value = true
    }
  } catch (error) {
    console.error('❌ [LOGIN] Ошибка в catch блоке:', error)
    console.error('  - error.message:', error?.message)
    console.error('  - error.response:', error?.response)
    console.error('  - error.response?.status:', error?.response?.status)
    console.error('  - error.response?.data:', error?.response?.data)
    const message = resolveApiMessage('login', error, {
      defaultError: 'Произошла ошибка при авторизации, попробуйте позже',
    })

    errorLogin.value = true
    emitter.emit('notify', {
      type: 'error',
      message,
    })
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
    // Сначала проверяем и игнорируем сообщения от расширений браузера (Яндекс.Метрика и т.д.)
    // Это нужно делать ДО проверки origin, чтобы не парсить невалидные сообщения
    if (typeof event.data === 'string') {
      const trimmed = event.data.trim()
      // Игнорируем сообщения от Яндекс.Метрики и других расширений
      if (trimmed.startsWith('__ym__') || trimmed.startsWith('__')) {
        return
      }
      // Проверяем, что строка начинается с { или [, иначе это не JSON
      if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        return
      }
    }

    // Проверяем origin только для валидных сообщений
    if (!allowedOrigins.includes(event.origin)) {
      console.warn('Недопустимый origin:', event.origin)
      return
    }

    // Проверяем, что данные являются объектом (ожидаем JSON от OAuth)
    if (typeof event.data === 'object' && event.data !== null) {
      console.log('✅ Авторизация успешна:', event.data)
      router.push({ name: 'home_teacher' })
    } else if (typeof event.data === 'string') {
      // Пытаемся распарсить JSON, если это строка
      try {
        const data = JSON.parse(event.data)
        console.log('✅ Авторизация успешна:', data)
        router.push({ name: 'home_teacher' })
      } catch (error) {
        // Игнорируем ошибки парсинга для не-JSON сообщений
        // Не логируем ошибки для сообщений от расширений
        const trimmed = event.data.trim()
        if (!trimmed.startsWith('__ym__') && !trimmed.startsWith('__')) {
          console.warn('Не удалось распарсить данные сообщения:', event.data)
        }
      }
    }
  }

  window.addEventListener('message', messageListener, { once: true })
}

onMounted(()=>{
  console.log(document.cookie)
})

</script>
