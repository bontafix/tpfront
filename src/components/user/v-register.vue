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
          <label class="v-login-form-field-subtitle" for="username"></label>
          <input
            v-model="form.username"
            type="text"
            class="custom-input"
            id="email"
            placeholder="Введите имя пользователя"
          />
        </div>
        <div class="v-login__form-field">
          <label class="v-login-form-field-subtitle" for="email"></label>
          <input
            v-model="form.email"
            type="email"
            class="custom-input"
            id="email"
            placeholder="Введите адрес электронной почты"
          />
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
          <label class="v-login-form-field-subtitle" for="email"></label>
          <input
            v-model="form.password1"
            :type="passwordInputType"
            class="custom-input"
            id="email"
            placeholder="Введите пароль"
          />
          <img v-if="passwordInputType === 'password'" @click="changeInputType" src="/src/assets/images/eye-off.svg" class="password-image" alt="">
          <img v-else @click="changeInputType" class="password-image" src="/src/assets/images/eye.svg" alt="">
        </div>
        <div class="v-login__form-checkbox mb-5">
            <div class="styled-checkbox">
              <input type="checkbox" id="teacher-register" v-model="form.isTeacher" />
              <label for="teacher-register"></label>
            </div>
            <label for="teacher-register">Зарегистрироваться как учитель?</label>
          </div>
        <button type="submit" class="custom-btn" :class="{ white: !isValid, blue: isValid }">
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

import { registerUser } from '@/api/requests'

const route = useRoute()
const router = useRouter()

const form = ref({
  email: '',
  username: '',
  ageAccept: false,
  adsAccept: false,
  isTeacher: false,
  teacher_ref_cod: ''
})
const isPasswordValid = computed(() => {
  return form.value.password1.length >= 8
})

const isValid = computed(() => {
  return (
    form.value.email &&
    form.value.ageAccept &&
    isPasswordValid.value
  )
})



const passwordInputType = ref('password')

const changeInputType = () => {
  passwordInputType.value = passwordInputType.value === 'password' ? 'text' : 'password'
}
const submitForm = async () => {
  console.log(isValid.value)
  if (isValid.value) {
    const requestBody = {
      username: form.value.username,
      email: form.value.email,
      password: form.value.password1,
      is_teacher: form.value.isTeacher,
      is_student: !form.value.isTeacher,
      teacher_ref_cod: String(form.value.teacher_ref_cod)
    }

    await registerUser(requestBody)
    router.push({ name: 'login' })
  }
  return
}

onMounted(() => {
  form.value.teacher_ref_cod = route.query.ref || ''
})
</script>
