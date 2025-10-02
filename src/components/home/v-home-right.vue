<template>
  <div class="v-home-right">
    <div class="v-home-right__container">
      <div class="v-home-right__block">
        <v-home-schedule @change-slide="(lesson)=> emit('change-slide', lesson)" :current-slide="currentSlide"/>
        <v-home-earnings />
      </div>

      <v-home-tasks />
    </div>
  </div>
</template>
<script setup>
import vHomeTasks from './v-home-tasks.vue'
import vHomeSchedule from './v-home-schedule.vue'
import vHomeEarnings from './v-home-earnings.vue'

const emit = defineEmits(['change-slide'])

const props = defineProps({
  currentSlide: {
    type: Object
  }
})
</script>
