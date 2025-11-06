<template>
  <div class="v-homework-stat">
    <h2 class="v-homework-stat__title text-section-title">Статистика домашнего задания</h2>
    <div class="v-homework-stat__block">
      <p class="v-homework-stat__text">
        Задано {{ homeWorkStat.total_homework_given || 0 }}/
        {{ homeWorkStat.total_lessons || 0 }} или {{ homeWorkStat.homework_given_percentage || 0 }}%
        <span>(+ 0 доп. ДЗ)</span>
      </p>
      <p class="v-homework-stat__text">
        Выполнено {{ homeWorkStat.total_homework_submitted || 0 }}/
        {{ homeWorkStat.total_homework_assigned || 0 }} или
        {{ homeWorkStat.homework_submitted_percentage || 0 }}%
      </p>
    </div>
  </div>
</template>
<script setup>
import { onMounted, computed } from 'vue'
import { useCurrentStudentStore } from '@/stores/currentStudentStore'

import { useRoute } from 'vue-router'

const route = useRoute()

const store = useCurrentStudentStore()

const homeWorkStat = computed(() => store.studentAnalytics || {})

const loadData = async () => {
  const studentId = route.params.id
  store.setStudentAnalytics(studentId)

}

onMounted(() => {
  loadData()
  console.log('Загрузился комопнент')
})
</script>
