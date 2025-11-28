<script setup>
import { RouterView, useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { isUserAuth } from '@/utils'
import { connectWebSocket } from './ws'
import { useMyStore } from './stores/myStore'

import vNotification from './components/generalComponents/v-notification.vue'

const router = useRouter()
const route = useRoute()

const store = useMyStore()

const userAuth = async () => {
  return await isUserAuth()
}

const loadData = async () => {
  await store.setUserAuthenticated()
  const authenticated = store.isAuth

  if (
    !authenticated &&
    route.name !== 'landing' &&
    route.name !== 'blogs' &&
    route.name !== 'blog' &&
    route.name !== 'faq'
  ) {
    await router.push({ name: 'login' })
  } else if (authenticated && route.name === 'landing') {
    if (store.user_type === 'teacher') {
      await router.push({ name: 'home_teacher' })
    } else if (store.user_type === 'student') {
      await router.push({ name: 'student_cabinet' })
    }
  }
}

onMounted(async () => {
  await loadData()
  // Подключаем WebSocket только если пользователь авторизован
  if (store.isAuth) {
    connectWebSocket()
  }
  /* if(!isUserAuth()) {
    router.push({ name: 'login' });
  } */
})
</script>

<template>
  <RouterView />
  <v-notification />
</template>

<style>
@import './output.css';
@import './assets/scss/style.scss';
</style>
