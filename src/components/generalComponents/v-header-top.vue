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
              <p class="notifications">{{ notificationsCount }}</p>
            </div>
          </router-link>
        </div>

        <div class="v-header-top__login">
          <!-- Информация о пользователе -->
          <div class="v-header-top__user-info" v-if="currentInfo">
            <div class="v-header-top__user-name">
              {{ userName }}
            </div>
            <div class="v-header-top__user-type">
              {{ userTypeLabel }}
            </div>
          </div>
          
          <router-link :to="{name: 'notifications'}" v-if="isStudent">
            <div class="v-header-top__login-notifications flex gap-2">
              <img src="/src/assets/images/left-menu/notification.svg" alt="" />
              <p class="notifications">{{ notificationsCount }}</p>
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
  // Всегда возвращаем массив, даже если notifications null
  return Array.isArray(myStore.notifications) ? myStore.notifications : []
})

const notificationsCount = computed(()=> {
  return notifications.value.length
})

const isStudent = computed(()=>{
  if(myStore.userInfo && myStore.userInfo instanceof Object) {
    return true
  }
  return false
})

const currentInfo = computed(()=>{
  // Возвращаем объект пользователя или null (безопасно для v-if в дочернем компоненте)
  return isStudent.value ? myStore.userInfo : myStore.info
})

const userName = computed(() => {
  if (!currentInfo.value) return 'Загрузка...'
  
  // Для учителя
  if (!isStudent.value && currentInfo.value) {
    return currentInfo.value.name || currentInfo.value.first_name || currentInfo.value.username || 'Пользователь'
  }
  
  // Для студента
  if (isStudent.value && currentInfo.value) {
    return currentInfo.value.name || currentInfo.value.first_name || currentInfo.value.username || 'Пользователь'
  }
  
  return 'Пользователь'
})

const userTypeLabel = computed(() => {
  const userType = myStore.user_type || localStorage.getItem('user_type')
  
  if (userType === 'teacher') {
    return 'Учитель'
  } else if (userType === 'student') {
    return 'Ученик'
  }
  
  return 'Пользователь'
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
  const userType = myStore.user_type || localStorage.getItem('user_type')
  // Загружаем информацию в зависимости от типа пользователя
  if (userType === 'student') {
    await myStore.setUserInfo()
  } else if (userType === 'teacher') {
    await myStore.setMyInfo()
  }
}

onMounted(() => {
  loadData()
  isNightMode.value
    ? document.body.classList.add('night__mode')
    : document.body.classList.remove('night__mode')
})
</script>

<style scoped>
.v-header-top__user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-end;
  padding-right: 8px;
}

.v-header-top__user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--custom-black-text);
  line-height: 1.2;
}

.v-header-top__user-type {
  font-size: 12px;
  font-weight: 400;
  color: #717680;
  line-height: 1.2;
}

/* Стили для ночного режима */
.night__mode .v-header-top__user-name {
  color: var(--custom-white);
}

.night__mode .v-header-top__user-type {
  color: #a0a0a0;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .v-header-top__user-info {
    display: none;
  }
}
</style>
