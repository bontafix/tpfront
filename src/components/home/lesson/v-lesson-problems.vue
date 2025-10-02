<template>
  <div class="v-home__lesson-current-problems v-home__lesson-sec" v-if="status !== 'future'">
    <h2 class="v-home__subtitle subtitle">{{ title }}</h2>
    <ul v-if="!loading">
      <li v-for="problem in problems" :key="problem.id">{{ problem.problem_text }}</li>
    </ul>
    <div v-else class="mini-loader">Загрузка...</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getLessonProblems } from '@/api/requests'

const props = defineProps({ lessonId: Number, status: String })
const problems = ref([])
const loading = ref(true)

const title = {
  current: 'Проблемы текущего занятия',
  past: 'Проблемы на занятии'
}[props.status] || 'Проблемы занятия'

onMounted(async () => {
  problems.value = await getLessonProblems(props.lessonId) || []
  loading.value = false
})
</script>
