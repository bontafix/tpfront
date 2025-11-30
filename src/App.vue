<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { isUserAuth } from '@/utils'
import { connectWebSocket } from './ws'
import { useMyStore } from './stores/myStore'
import vCookieModal from './components/generalComponents/v-cookie-modal.vue'

import vNotification from './components/generalComponents/v-notification.vue'

const store = useMyStore()

const userAuth = async () => {
  return await isUserAuth()
}

onMounted(async () => {
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
  <v-cookie-modal />
</template>

<style>
@import './output.css';
@import './assets/scss/style.scss';
</style>
