<template>
  <section class="welcome" id="welcome">
    <div class="welcome__head">
      <h1 class="welcome__title title">Teacher Planner</h1>
      <p class="welcome__desc desc inter-400">
        Цифровой инструмент современного репетитора с аналитикой занятий, кабинетом ученика и
        автоматическим учетом финансов
      </p>
    </div>

    <img class="welcome__mobile-image" src="../../../../assets/images/mobile_desktop_main.jpg" alt="Mobile Image" />

    <div class="welcome__buttons">
      <button class="welcome__button welcome__button--secondary secondary-button">
        <div class="welcome__button-content" @click="openModal">
          <img src="../../../../assets/icons/demo.svg" alt="Demo Icon" />
          <span>Запросить демо</span>
        </div>
      </button>
      <button v-if="userAuth" class="welcome__button primary-button" @click="pushToRegister">Главная</button>
      <button v-else class="welcome__button primary-button" @click="pushToRegister">Регистрация</button>
    </div>

    <img class="welcome__main-image" src="../../../../assets/images/desktop_main.png" alt="Main Image" />

    <vPlatformRequest v-if="showModal" @close="closeModal" />
  </section>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue'
import router from '@/router'
import { isUserAuth } from '@/utils'

import vPlatformRequest from '@/components/modals/landing/v-platform-request.vue'

const showModal = ref(false)
const isModalOpen = ref(false)

function openModal() {
  showModal.value = true
  isModalOpen.value = true
}

function closeModal() {
  showModal.value = false
  isModalOpen.value = false
}

const userAuth = ref(false)

watch(isModalOpen, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add('modal-open')
  } else {
    document.documentElement.classList.remove('modal-open')
  }
})

function pushToRegister() {
  if(userAuth.value) {
    router.push({
      name: 'home_teacher',
    })
  } else {
    router.push({
      name: 'register',
      query: {
        from: 'landing-welcome',
      },
    })
  }
}

onMounted(()=>{
  isUserAuth().then(authenticated => {
    userAuth.value = authenticated
  })
})
</script>
