<template>
  <header class="landing-header">
    <a href="/" class="logo-link">
      <img src="../../../assets/icons/icon.svg" class="logo" alt="Teacher Planner Logo" />
    </a>

    <nav class="navigation mobile-hidden">
      <a href="#functions" class="navigation-button">Функции</a>
      <a href="#tarifs" class="navigation-button">Тарифы</a>
      <a href="#reviews" class="navigation-button">Отзывы</a>
      <a href="#faq" class="navigation-button">FAQ</a>
    </nav>

    <div class="auth-buttons">
      <button v-show="!userAuth" class="primary-button login-button" @click="pushToLogin">Вход</button>
      <button v-show="userAuth" class="navigation-button bold" @click="pushToLogin">Главная</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import router from '@/router'
import { isUserAuth } from '@/utils'

const userAuth = ref(false)

function pushToLogin() {
  if(userAuth.value) {
    router.push({ name: 'home_teacher' })
  } else {
    router.push({ name: 'login' })
  }
}

onMounted(() => {
  isUserAuth().then(authenticated => {
    userAuth.value = authenticated
  })
})
</script>
