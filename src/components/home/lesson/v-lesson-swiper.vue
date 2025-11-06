<template>
  <swiper
    ref="swiperRef"
    :initial-slide="initialSlideIndex"
    :space-between="30"
    :modules="modules"
    :navigation="{
      nextEl: '.home-swiper-button-next',
      prevEl: '.home-swiper-button-prev'
    }"
    @slideChange="onSlideChange"
    class="v-home__left"
  >
    <swiper-slide v-for="(lesson, index) in lessons" :key="lesson.id">
      <LessonSlide :lesson="lesson" />
    </swiper-slide>
  </swiper>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import vLessonSlide from './v-lesson-slide.vue'

defineProps({
  lessons: Array,
  initialSlideIndex: Number,
  onSlideChange: Function,
})

const modules = [Navigation]
</script>
