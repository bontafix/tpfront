<template>
  <main
    class="v-onboarding-start"
    :class="{ gradient: !isMobile.isMobile, 'white-page': isMobile.isMobile }"
  >
    <router-link :to="{ name: 'home' }" class="onboarding-close">
      <img src="/src/assets/images/cross.svg" alt="" />
    </router-link>
    <div class="v-onboarding-start__image">
      <img
        v-if="!isMobile.isMobile"
        src="/src/assets/images/onboarding/general/wellcome.png"
        alt=""
      />
      <img
        v-if="isMobile.isMobile"
        src="/src/assets/images/onboarding/mobile/general/wellcome.svg"
        alt=""
      />
    </div>
    <div class="v-onboarding-start__container container">
      <h1 class="v-onboarding-start__title text-title">
        Как пользоваться <br v-if="!isMobile.isMobile" />
        TeacherPlanner?
      </h1>
      <p class="v-onboarding-start__subtitle">
        Гайд по использованию поможет вам узнать о возможностях нашей платформы и найти ответы на
        вопросы
      </p>
      <router-link
        :to="{ name: 'onboarding_home' }"
        class="v-onboarding-start__button onboarding-button"
        >Начать гайд</router-link
      >
    </div>
  </main>
</template>
<script setup>
import { ref } from 'vue'
import { useIsMobile } from '@/composables/useIsMobile'

const isMobile = ref(useIsMobile(768))
</script>
