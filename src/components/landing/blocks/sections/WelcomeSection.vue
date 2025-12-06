<template>
  <section class="welcome" id="welcome" itemscope itemtype="https://schema.org/Product">
    <meta itemprop="name" content="Teacher Planner" />
    <meta itemprop="description" content="Цифровой инструмент современного репетитора с аналитикой занятий, кабинетом ученика и автоматическим учетом финансов" />
    <meta itemprop="image" content="../../../../assets/images/desktop_main.png" />

    <div class="welcome__head">
      <h1 class="welcome__title title" itemprop="name">Teacher Planner</h1>
      <p class="welcome__desc desc inter-400" itemprop="description">
        Цифровой инструмент современного репетитора с аналитикой занятий, кабинетом ученика и
        автоматическим учетом финансов
      </p>
    </div>

    <img
      class="welcome__mobile-image"
      src="../../../../assets/images/mobile_desktop_main.jpg"
      alt="Teacher Planner для мобильных устройств"
      itemprop="image"
    />

    <div class="welcome__buttons">
      <button class="welcome__button welcome__button--secondary secondary-button">
        <div class="welcome__button-content" @click="openModal">
          <img src="../../../../assets/icons/demo.svg" alt="Иконка запроса демо" />
          <span>Запросить демо</span>
        </div>
      </button>
      <button v-if="userAuth" class="welcome__button primary-button" @click="pushToRegister">Главная</button>
      <button v-else class="welcome__button primary-button" @click="pushToRegister">Регистрация</button>
    </div>

    <img
      class="welcome__main-image"
      src="../../../../assets/images/desktop_main.png"
      alt="Teacher Planner для рабочего стола"
      itemprop="image"
    />

    <vPlatformRequest v-if="showModal" @close="closeModal" />
  </section>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import router from '@/router'
import { useMyStore } from '@/stores/myStore'

import vPlatformRequest from '@/components/modals/landing/v-platform-request.vue'

const showModal = ref(false)
const isModalOpen = ref(false)

const myStore = useMyStore()

// Используем computed для реактивного отслеживания состояния авторизации
// Теперь userAuth будет автоматически обновляться при изменении store.isAuth
const userAuth = computed(() => myStore.isAuth === true)

function openModal() {
  showModal.value = true
  isModalOpen.value = true
}

function closeModal() {
  showModal.value = false
  isModalOpen.value = false
}

watch(isModalOpen, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add('modal-open')
  } else {
    document.documentElement.classList.remove('modal-open')
  }
})

function pushToRegister() {
  if (userAuth.value) {
    // Проверяем тип пользователя для правильного редиректа
    if (myStore.user_type === 'teacher') {
      router.push({ name: 'home_teacher' })
    } else if (myStore.user_type === 'student') {
      router.push({ name: 'student_cabinet' })
    } else {
      router.push({ name: 'home_teacher' })
    }
  } else {
    router.push({ name: 'register', query: { from: 'landing-welcome' } })
  }
}

// Проверяем состояние авторизации при монтировании компонента
onMounted(async () => {
  // setUserAuthenticated обновит store.isAuth, который обновит computed userAuth
  await myStore.setUserAuthenticated()
})
</script>