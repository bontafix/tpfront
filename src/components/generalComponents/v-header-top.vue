<template>
  <header class="v-header-top">
    <div class="v-header-top__container container">
      <nav class="v-header-top__nav">
        <h2 class="v-header-top__nav-title">Teacher Planner</h2>

        <!-- @click="toggleModal('burgerModal')" -->
        <div class="buttons-mob">
          <v-user-drop />
          <router-link :to="{name: 'notifications'}">
            <div class="flex gap-2">
              <img src="/src/assets/images/left-menu/notification.svg" alt="" />
              <p class="notifications">{{ notifications.length }}</p>
            </div>
          </router-link>
        </div>

        <div class="v-header-top__login">
          <router-link :to="{name: 'notifications'}" v-if="isStudent">
            <div class="v-header-top__login-notifications flex gap-2">
              <img src="/src/assets/images/left-menu/notification.svg" alt="" />
              <p class="notifications">{{ notifications.length }}</p>
            </div>
          </router-link>
          <div class="switcher custom-switcher">
            <input type="checkbox" @change="switchMode" :checked="isNightMode" />
          </div>
          <v-user-drop :user-info="currentInfo" :is-student="isStudent"/>
        </div>
      </nav>
    </div>
  </header>
  <transition name="fade">
    <v-burger-modal
      :class="{ 'show-modal': modals['burgerModal'] }"
      :id="'burgerModal'"
      v-if="modals.burgerModal"
      @close="() => toggleModal('burgerModal')"
    />
  </transition>
</template>
<script setup>
import { onMounted, ref, computed } from 'vue'

import vUserDrop from './v-user-drop.vue'
import vBurgerModal from '../modals/v-burger-modal.vue'

import { useMyStore } from '@/stores/myStore'
import { useGeneralStore } from '@/stores/generalStore'


const myStore = useMyStore()
const store = useGeneralStore()

const modals = ref({
  burgerModal: false,
})

const isNightMode = computed(() => {
  return store.nightMode
})

const notifications = computed(()=> {
  return myStore.notifications || 0
})

const isStudent = computed(()=>{
  if(myStore.userInfo && myStore.userInfo instanceof Object) {
    return true
  }
  return false
})

const currentInfo = computed(()=>{
  return isStudent.value ? myStore.userInfo : myStore.info
})

const toggleModal = (modalId) => {
  console.log(modalId)
  modals.value[modalId] = !modals.value[modalId]
  console.log(modals.value[modalId], modalId)
}

const switchMode = () => {
  document.body.classList.toggle('night__mode')
  store.setNightMode(document.body.classList.contains('night__mode'))
}

const loadData = async () => {
  await myStore.setNotifications()
  await myStore.setMyInfo()
  await myStore.setUserInfo()
}

onMounted(() => {
  loadData()
  isNightMode.value
    ? document.body.classList.add('night__mode')
    : document.body.classList.remove('night__mode')
})
</script>
