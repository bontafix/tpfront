<template>
  <div class="v-home__lesson-problems v-home__lesson-sec" v-if="problems.length">
    <h2 class="v-home__subtitle subtitle">Проблемы прошлого занятия</h2>
    <ul>
      <li v-for="problem in problems" :key="problem.id">
        {{ problem.problem_text }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getPreviousProblems } from '@/api/requests'

const props = defineProps({ lessonId: Number })
const problems = ref([])

onMounted(async () => {
  problems.value = await getPreviousProblems(props.lessonId) || []
})
</script>
