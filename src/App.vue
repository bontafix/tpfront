<script setup>
import { computed } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { onMounted } from 'vue';
import { isUserAuth } from '@/utils';
import { connectWebSocket } from './ws';
import { useMyStore } from './stores/myStore';

import vNotification from './components/generalComponents/v-notification.vue';

const router = useRouter();

const store = useMyStore()

const userAuth = async () => {
  return await isUserAuth()
}

const loadData = async () => {
  await store.setUserAuthenticated()
  const authenticated = store.isAuth
  if (!authenticated) {
    router.push({ name: 'login' });
  }
}

onMounted(() => {
  loadData()
  connectWebSocket()
  /* if(!isUserAuth()) {
    router.push({ name: 'login' });
  } */
});
</script>

<template>
  <RouterView />
  <v-notification />
</template>

<style>
@import './output.css';
@import './assets/scss/style.scss';
</style>
