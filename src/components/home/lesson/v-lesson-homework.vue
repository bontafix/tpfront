<template>
  <div class="v-home__lesson-homework">
    <h2 class="v-home__subtitle subtitle">Домашнее задание</h2>
    <p v-if="!homework && !loading">Нет ДЗ</p>
    <p v-else-if="loading">Загрузка...</p>
    <p v-else>{{ homework.description }}</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getLessonHomeWork } from '@/api/requests'

const props = defineProps({ lessonId: Number })
const homework = ref(null)
const loading = ref(true)

onMounted(async () => {
  homework.value = await getLessonHomeWork(props.lessonId)
  loading.value = false
})
</script>
