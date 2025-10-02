<template>
  <div class="v-home__lesson">
    <div class="v-home__lesson-info">
      <h1 class="v-home__lesson-title">
        {{ getLessonTitle(lesson.status) }} ({{ formatDate(lesson.date) }})
        <span>
          {{ lesson.student_name }}
          <span class="v-home__lesson-time">
            {{ lesson.start_time }} - {{ lesson.end_time }}
          </span>
        </span>
      </h1>
    </div>

    <div class="v-home__lesson-container">
      <v-previous-problems :lessonId="lesson.id" />
      <v-lesson-themes :lessonId="lesson.id" :status="lesson.status" />
      <v-lesson-problems :lessonId="lesson.id" :status="lesson.status" />
      <v-lesson-homework :lessonId="lesson.id" />
    </div>
  </div>
</template>

<script setup>
import vPreviousProblems from './v-previous-problems.vue'
import vLessonThemes from './v-lesson-themes.vue'
import vLessonHomework from './v-lesson-homework.vue'
import vLessonProblems from './v-lesson-problems.vue'

const props = defineProps({ lesson: Object })

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU')
}

const getLessonTitle = (status) => {
  return {
    current: 'Текущее занятие',
    past: 'Прошедшее занятие',
    future: 'Будущее занятие'
  }[status] || 'Занятие'
}
</script>
