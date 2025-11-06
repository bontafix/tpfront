<template>
  <div class="v-home-schedule">
    <v-home-right-sec-base>
      <template #title>Расписание занятий</template>
      <template #container>
         <div class="slide-info" v-if="currentSlide">
          <p class="caption">{{ getDayDisplayName }}</p>
        </div>
        <div class="v-home-schedule__progress progress-bar">
          <div class="progress-bar__completed" :style="{'width': barWidth}"></div>
        </div>
        <!-- Информация о текущем слайде -->
        <p class="caption" v-if="todayLessons && Number.isInteger(todayLessons.completed_lessons) ">
          {{ todayLessons.completed_lessons }}/{{ todayLessons.total_lessons }} занятий проведены
        </p>
        <template v-else-if="todayLessons &&  !todayLessons.completed_lessons">
          <p class="caption" v-if="currentSlide?.day == 'yesterday'">{{ todayLessons.lessons.length }} / {{ todayLessons.lessons.length }} занятий проведены</p>
          <p class="caption" v-if="currentSlide?.day == 'tomorrow'"> 0 / {{ todayLessons.lessons.length }} занятий проведены</p>
        </template>

        <ul class="v-home-schedule__list" v-if="todayLessons">
          <li
            :class="{ completed: lesson.amount_deducated, trial: lesson.trial }"
            class="v-home-schedule-list-item schedule-item"
            @click="selectLesson(lesson)"
            v-for="lesson in todayLessons.lessons"
            :key="lesson.id"
          >
            <div class="flex gap-2">
              <div class="schedule-item__img">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M16.3999 17.2001V15.6C16.3999 14.7514 16.0627 13.9374 15.4626 13.3373C14.8625 12.7372 14.0485 12.4 13.1999 12.4H6.79985C5.95116 12.4 5.13723 12.7372 4.53711 13.3373C3.937 13.9374 3.59985 14.7514 3.59985 15.6V17.2001M13.1999 6.00005C13.1999 7.76736 11.7672 9.20005 9.99985 9.20005C8.23254 9.20005 6.79985 7.76736 6.79985 6.00005C6.79985 4.23274 8.23254 2.80005 9.99985 2.80005C11.7672 2.80005 13.1999 4.23274 13.1999 6.00005Z"
                    stroke="#717680"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <h3 class="schedule-item__description">{{ lesson.student_name }} / {{ lesson.cost_lesson }}р</h3>
            </div>

            <h3 class="schedule-item__description">{{ lesson.start_time.slice(0, 5) }}</h3>
          </li>
        </ul>
      </template>
    </v-home-right-sec-base>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getTodayLessons } from '@/api/requests'
import { useLessonStore } from '@/stores/lessonsStore'

import vHomeRightSecBase from './v-home-right-sec-base.vue'


const props = defineProps({
  currentSlide: {
    type: Object,
    default: null
  },
  isLoadingDay: {
    type: Boolean,
    default: false
  },
  allLessons: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['change-slide', 'switch-day'])

const lessonStore = useLessonStore()


const dayNames = ref({
    yesterday: 'Вчера',
    today: 'Сегодня',
    tomorrow: 'Завтра'
})

const todayLessons = computed(()=>{
  return lessonStore.dayLessons[props.currentSlide?.day]
})

const loadData = async (day) => {
  await lessonStore.fetchTodayLessons(day)
}

const barWidth = computed(()=>{

  if(props.currentSlide?.day === 'yesterday') {
    return '100%'
  }
  let width = 0;
  if(todayLessons.value) {
      width = (todayLessons.value.completed_lessons / todayLessons.value.total_lessons) * 100
  }
  if(!width) {
    return '0%'
  }
  return `${width}%`
})

const selectLesson = (lesson) => {
  emit('change-slide', lesson.id)
}

// Функция для получения отображаемого названия дня
const getDayDisplayName = computed(() => {
  return dayNames.value[props.currentSlide?.day]
})

// Отслеживаем изменения currentSlide для логирования
watch(() => props.currentSlide, (newSlide, oldSlide) => {
  if (newSlide && (!oldSlide || newSlide.day !== oldSlide.day)) {
    loadData(newSlide.day)

  }
}, { deep: true })


onMounted(() => {
  loadData()
})
</script>
