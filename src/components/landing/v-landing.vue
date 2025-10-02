<template>
  <main>
    <Header />
    <div class="welcome-container" :class="{ 'welcome-container--hidden': contentVisible }">
      <WelcomeSection />
    </div>
    <div class="content-container" ref="contentContainer">
      <FunctionsSection />
      <StudentCabinetSection />
      <TarifsSection />
      <ReviewsSection />
      <FAQSection />
      <BlogSection />
      <Footer />
    </div>
  </main>
</template>

<style scoped lang="scss">
main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1;
  padding-top: 120px;
  background: linear-gradient(180deg, #ffffff 0%, #edf2ff 81.21%);
  transform: translateZ(0);
  transition: transform 0.3s ease-out;

  &--hidden {
    transform: translate3d(0, -100%, 0);
  }
}

.content-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  z-index: 2;
  background-color: #fff;
  margin-top: 100vh;
  transform: translateZ(0);
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import '../../assets/scss/landing.scss'

import Header from './blocks/Header.vue'

import WelcomeSection from './blocks/sections/WelcomeSection.vue'
import FunctionsSection from './blocks/sections/FunctionsSection.vue'
import StudentCabinetSection from './blocks/sections/StudentCabinetSection.vue'
import TarifsSection from './blocks/sections/TarifsSection.vue'
import ReviewsSection from './blocks/sections/ReviewsSection.vue'
import FAQSection from './blocks/sections/FAQSection.vue'
import BlogSection from './blocks/sections/BlogSection.vue'

import Footer from './blocks/Footer.vue'

const contentContainer = ref<HTMLElement>()
const contentVisible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (contentContainer.value) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          contentVisible.value = entry.isIntersecting
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -90% 0px'
      }
    )

    observer.observe(contentContainer.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>
