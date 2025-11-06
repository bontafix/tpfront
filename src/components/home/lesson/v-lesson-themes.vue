<template>
  <div class="v-home__lesson-themes v-home__lesson-sec">
    <h2 class="v-home__subtitle subtitle">{{ title }}</h2>
    <ul v-if="!loading">
      <li v-for="theme in themes" :key="theme.id">{{ theme.name }}</li>
    </ul>
    <div v-else class="mini-loader">Загрузка...</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getLessonTopics } from '@/api/requests'

const props = defineProps({ lessonId: Number, status: String })
const themes = ref([])
const loading = ref(true)

const title = {
  current: 'Темы текущего занятия',
  past: 'Темы прошедшего занятия',
  future: 'Планируемые темы занятия'
}[props.status] || 'Темы'

onMounted(async () => {
  themes.value = await getLessonTopics(props.lessonId) || []
  loading.value = false
})
</script>
