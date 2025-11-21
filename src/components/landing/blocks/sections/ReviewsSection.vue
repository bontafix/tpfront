<template>
  <section class="reviews-section" id="reviews" itemscope itemtype="https://schema.org/ItemList">
    <meta itemprop="name" content="Отзывы преподавателей о Teacher Planner" />

    <div class="reviews-section__container-row">
      <h2 class="section-title inter-500">Отзывы преподавателей о Teacher Planner</h2>
      <button
        class="primary-button reviews-section__leave-button"
        @click="openModal"
        aria-label="Оставить отзыв о Teacher Planner"
      >
        Оставить отзыв
      </button>
    </div>

    <div class="reviews-section__list">
      <div class="reviews-section__swiper-container" v-if="reviews.length > 3">
        <swiper
          :slidesPerView="resolution > 768 ? 3 : 1"
          v-bind="swiperOptions"
          :space-between="20"
          :modules="modules"
          class="reviews-swiper"
        >
          <swiper-slide
            v-for="(item, index) in reviews"
            :key="item.id"
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/Review"
          >
            <meta itemprop="position" :content="index + 1" />
            <div class="reviews-section__item">
              <h3 class="reviews-section__author inter-600" itemprop="author">{{ item.name }}</h3>
              <p class="reviews-section__teacher inter-400">{{ item.subject }}</p>
              <p class="reviews-section__text inter-400" itemprop="reviewBody">{{ item.text }}</p>
            </div>
          </swiper-slide>
        </swiper>

        <div class="home-swiper-button-prev left-swiper-button">
          <img class="rotate-180 day-el" src="/src/assets/images/arrow-right-home-day.svg" alt="Назад" />
          <img class="rotate-180 night-el" src="/src/assets/images/arrow-right-home-night.svg" alt="Назад" />
        </div>
        <div class="home-swiper-button-next right-swiper-button">
          <img class="day-el" src="/src/assets/images/arrow-right-home-day.svg" alt="Вперед" />
          <img class="night-el" src="/src/assets/images/arrow-right-home-night.svg" alt="Вперед" />
        </div>
      </div>

      <template v-if="reviews.length < 4">
        <div
          v-for="(item, index) in reviews"
          :key="item.id"
          class="reviews-section__item"
          itemprop="itemListElement"
          itemscope
          itemtype="https://schema.org/Review"
        >
          <meta itemprop="position" :content="index + 1" />
          <h3 class="reviews-section__author inter-600" itemprop="author">{{ item.name }}</h3>
          <p class="reviews-section__teacher inter-400">{{ item.subject }}</p>
          <p class="reviews-section__text inter-400" itemprop="reviewBody">{{ item.text }}</p>
        </div>
      </template>
    </div>

    <Teleport to="body">
      <vReview v-if="showModal" @close="closeModal" />
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import vReview from '@/components/modals/landing/v-review.vue'
import { getReviews } from '@/api/requests'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'

const modules = [Navigation]
const swiperOptions: any = {
  navigation: {
    nextEl: '.home-swiper-button-next',
    prevEl: '.home-swiper-button-prev',
  },
}

const showModal = ref(false)
const reviews = ref([])
const resolution = ref(1920)

function openModal() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function onResize() {
  resolution.value = window.innerWidth
}

onMounted(async () => {
  resolution.value = window.innerWidth
  window.addEventListener('resize', onResize)
  reviews.value = await getReviews()

  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Отзывы преподавателей о Teacher Planner",
    "itemListElement": reviews.value.map((item, index) => ({
      "@type": "Review",
      "author": item.name,
      "reviewBody": item.text,
      "position": index + 1
    }))
  }
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.text = JSON.stringify(ld)
  document.head.appendChild(script)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.reviews-section__swiper-container {
  position: relative;
  width: 100%;
}

.reviews-swiper {
  width: 100%;
}

.right-swiper-button {
  position: absolute;
  right: 0;
  top: -20px;
  z-index: 2;
  cursor: pointer;
}

.left-swiper-button {
  position: absolute;
  left: 0;
  top: -20px;
  z-index: 2;
  cursor: pointer;
}

@media screen and (max-width: 768px) {
  .right-swiper-button {
    top: -40px;
  }

  .left-swiper-button {
    top: -40px;
  }
}
</style>