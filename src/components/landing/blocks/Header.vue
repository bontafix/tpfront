<template>
  <header class="landing-header">
    <img src="../../../assets/icons/icon.svg" class="logo" alt="logo" />

    <div class="mobile-hidden navigation-buttons">
      <a href="#functions" class="navigation-button">Функции</a>
      <a href="#tarifs" class="navigation-button">Тарифы</a>
      <a href="#reviews" class="navigation-button">Отзывы</a>
      <a href="#faq" class="navigation-button">FAQ</a>
    </div>
    
    <button v-show="!userAuth" class="primary-button login-button" @click="pushToLogin">Вход</button>
    <button v-show="userAuth" class="navigation-button bold" @click="pushToLogin">Главная</button>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import router from '@/router'
import { isUserAuth } from '@/utils'
import { useMyStore } from '@/stores/myStore'

const userAuth = ref(false)
const myStore = useMyStore()

function pushToLogin() {
  if (userAuth.value) {
    if (myStore.user_type === 'teacher') {
      router.push({
        name: 'home_teacher',
      })
    } else if (myStore.user_type === 'student') {
      router.push({
        name: 'student_cabinet',
      })
    }
  } else {
    router.push({
      name: 'login',
    })
  }
}

onMounted(() => {
  isUserAuth().then(authenticated => {
    userAuth.value = authenticated
  })
})
</script>