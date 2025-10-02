<template>
  <div class="v-user-drop" v-click-outside="closeMenu">
    <button
      ref="toggleButton"
      class="v-user-drop__toggle"
      @click="toggleDropdown"
      type="button"
      data-toggle="dropdown"
      aria-expanded="false"
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="40" height="40" rx="20" fill="#F3F4F6" />
        <path
          d="M28 29V27C28 25.9391 27.5786 24.9217 26.8284 24.1716C26.0783 23.4214 25.0609 23 24 23H16C14.9391 23 13.9217 23.4214 13.1716 24.1716C12.4214 24.9217 12 25.9391 12 27V29M24 15C24 17.2091 22.2091 19 20 19C17.7909 19 16 17.2091 16 15C16 12.7909 17.7909 11 20 11C22.2091 11 24 12.7909 24 15Z"
          stroke="#717680"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div ref="dropdownMenu" :class="['v-user-drop__menu', menuPosition]" v-if="isDropdownopen">
      <div class="v-user-drop__menu-block">
        <router-link class="v-user-drop__menu-item" :to="{name: 'teacher_cabinet'}">
          <span class="icon">
            <img src="../../assets/images/icons/avatar.svg" alt="" class="day-el" />
            <img src="../../assets/images/user-night.svg" alt="" class="night-el" />
          </span>
          <div class="flex flex-col gap-1">
            <span class="text" v-if="userInfo">{{ userInfo.name || userInfo.first_name || userInfo.username || 'Имя не найдено' }}</span>
            <span class="caption">{{ userInfo.email }}</span>
          </div>
        </router-link>

         <router-link :to="{name: 'teacher_cabinet'}" class="custom-btn light-blue" href="subscribe.html" v-if="!isStudent">
          <span class="text">Подписка: Эксперт</span>
        </router-link>

        <!-- <router-link class="v-user-drop__emnu-item">
          <span class="text">
            Помощь
          </span>
        </router-link> -->

         <router-link :to="{name: 'teacher_cabinet'}" class="v-user-drop__menu-item">
          <span class="icon">
            <img src="../../assets/images/icons/settings.svg" alt="" class="day-el" />
          </span>
          <span class="text">Настройки профиля</span>
        </router-link>


        <a class="v-user-drop__menu-item" href="https://t.me/teacherplanner" target="_blank">
          <span class="icon">
            <img src="../../assets/images/icons/message.svg" alt="" class="day-el" />
          </span>
          <span class="text">Поддержка</span>
        </a>

        <a class="v-user-drop__menu-item" href="#" v-if="isStudent">
          <span class="icon">
            <img src="../../assets/images/icons/faq.svg" alt="" class="day-el" />
          </span>
          <span class="text">FAQ</span>
        </a>
      </div>

      <div class="v-user-drop__menu-block" v-if="isStudent">
        <a class="v-user-drop__menu-item" href="#!">
          <span class="icon">
            <img src="../../assets/images/icons/lock.svg" alt="" class="day-el" />
          </span>
          <span class="text">Установить постоянный пароль</span>
        </a>

        <a class="v-user-drop__menu-item" href="#!">
          <span class="icon">
            <img src="../../assets/images/icons/mail.svg" alt="" class="day-el" />
          </span>
          <span class="text">Привязать другую почту</span>
        </a>
      </div>

      <a class="v-user-drop__menu-item" @click.prevent="logout"  href="#!">
        <span class="icon">
          <img src="../../assets/images/icons/log-out.svg" alt="" class="day-el" />
        </span>
        <span class="text">Выйти</span>
      </a>

      <a class="v-user-drop__menu-item" href="#!" v-if="isStudent">
        <span class="icon">
          <img src="../../assets/images/red-trash.svg" alt="" class="day-el" />
        </span>
        <span class="red-text">Удалить аккаунт</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

import { useMyStore } from '@/stores/myStore'
import { logoutUser } from '@/api/requests'

const props = defineProps({
  userInfo: {
    type: Object,
    require: true
  },
  isStudent: {
    type: Boolean,
    require: true
  }
})

const isDropdownopen = ref(false)
const menuPosition = ref('right') // 'right' или 'left'

const toggleButton = ref(null)
const dropdownMenu = ref(null)

/* const userInfo = ref() */
const store = useMyStore()


const router = useRouter()

const closeMenu = () => {
  isDropdownopen.value = false
}

const logout = async () => {
  await logoutUser()
  router.push({name: 'landing'})

}

const toggleDropdown = async () => {
  isDropdownopen.value = !isDropdownopen.value

  if (isDropdownopen.value) {
    await nextTick()

    const buttonRect = toggleButton.value.getBoundingClientRect()
    const menuWidth = dropdownMenu.value.offsetWidth
    const screenWidth = window.innerWidth

    // Если справа не помещается — открываем влево
    if (buttonRect.left + menuWidth > screenWidth) {
      menuPosition.value = 'left'
    } else {
      menuPosition.value = 'right'
    }
  }
}

const loadData = async () => {
 /*  await store.setMyInfo()
  userInfo.value = store.info
  /* console.log(store.info) */
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* меню открывается вправо (по умолчанию) */
.v-user-drop__menu.right {
  left: 0;
}

/* меню открывается влево */
.v-user-drop__menu.left {
  right: 0;
}
</style>
