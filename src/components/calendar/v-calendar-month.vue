<template>
  <div class="wrapper">
    <v-base>
      <section class="v-calendar-month" v-if="!isMobile">
        <div class="container">
          <div class="v-calendar-month__container layout">
            <v-calendar-menu :type="'home'" @setMonth="setMonth" @paginateMonth="paginateMonth" />
            <div class="scroll-container" v-if="!isLoading && monthCalendar && daysWeek">
              <div class="v-calendar-month__content">
                <div class="sec-hidden-content showing" v-if="isMonthEmpty">
                  <h1 class="text-title">Еще не запланировано ни одного занятия!</h1>
                </div>
                <table class="v-calendar-month__table calendar" :class="{ blur: isMonthEmpty }">
                  <thead>
                    <tr class="calendar-header">
                      <th v-for="day in daysWeek" :key="day.id">
                        <div class="calendar-header__item">
                          {{ day.days_week }}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="calendar-row"
                      v-for="(week, weekIndex) of monthCalendar"
                      :key="weekIndex"
                    >
                      <td
                        class="calendar-row__item"
                        v-for="(day, dayIndex) in week"
                        :key="dayIndex"
                        @dragover.prevent
                        @drop="(event) => handleDrop(event, dayIndex, weekIndex)"
                      >
                        <div class="calendar-row__item-container">
                          <div class="calendar-row__item-content calendar-card" v-if="day">
                            <div class="calendar-card__num">{{ day.date }}</div>
                            <div
                              class="calendar-card__content"
                              v-for="(lesson, lessonIndex) in day.lessons"
                              :key="lesson.id"
                              :class="{ completed: lesson.amount_deducted }"
                              @click="() => toggleButtonsModal(lesson)"
                              draggable="true"
                              @dragstart="
                                (event) => handleDragStart(event, lesson, weekIndex, dayIndex, lessonIndex)
                              "
                            >
                              <template v-if="!lesson.cancelled_lesson">
                                <div class="calendar-card__lesson" :class="{ trial: lesson.trial }">
                                  <p class="calendar-card__lesson-time" v-if="!lesson.lesson_data">

                                    {{ formatTime(lesson.start_time) }} - {{ formatTime(lesson.end_time) }}
                                  </p>
                                  <p class="calendar-card__lesson-time" v-else>
                                    {{ formatTime(lesson.lesson_data.start_time) }} - {{ formatTime(lesson.lesson_data.end_time) }}
                                  </p>
                                  <p class="calendar-card__lesson-name">
                                    {{ lesson.student_name || 'Студент' }}
                                  </p>
                                </div>
                              </template>

                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="loader-container" v-else>
              <div class="loader"></div>
            </div>
          </div>
        </div>
      </section>

      <section class="v-calendar-month-mob mob-page" v-else>
        <div class="container">
          <div class="v-calendar-month-mob__container layout">
            <v-calendar-menu :type="'home'" @paginateMonth="paginateMonth" />
            <table class="v-calendar-month-mob__table calendar">
              <thead>
                <tr class="calendar-header">
                  <th v-for="day in daysWeek" :key="day.id">
                    <div class="calendar-header__item">
                      {{ day.days_week }}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="calendar-row"
                  v-for="(week, weekIndex) of monthCalendar"
                  :key="weekIndex"
                >
                  <td
                    @click="toggleActiveDay(day?.date)"
                    v-for="(day, dayIndex) in week"
                    :key="dayIndex"
                  >
                    <div class="calendar-row__item" :class="{ active: day?.date === activeDay }" v-if="day">
                      <div class="calendar-row__item-content calendar-card" >
                        <div class="calendar-card__num">{{ day.date }}</div>
                        <div class="calendar-card__content">
                          <div
                            class="calendar-card__lesson"
                            :class="{ trial: lesson.trial }"
                            v-for="lesson in day.lessons"
                            :key="lesson.id"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="v-calendar-month-mob__info lesson-info" v-if="activeDayData">
            <router-link
              :to="{ name: 'calendar-day', query: { date: getDayOfDate(activeDayData.date) } }"
            >
              <div class="v-calendar-month-mob__day day">
                <div class="day__header">
                  <p class="day__date">{{ getDateOfDay(activeDayData.date) }}</p>
                  <svg class="opacity-50" width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.66663 11.3333L11.3333 4.66663M11.3333 4.66663H4.66663M11.3333 4.66663V11.3333" stroke="#717680" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>

                <div
                  class="day__content"
                  v-for="lesson in activeDayData.lessons"
                  :key="lesson.id"
                >
                  <div class="day__lesson" :class="{ trial: lesson.trial }">
                    <h4 class="day__lesson-name">{{ lesson.student_name }}</h4>
                    <div class="day__lesson-time">
                      <p>{{ formatTime(lesson.start_time) }}</p>
                      <p>-</p>
                      <p>{{ formatTime(lesson.end_time) }}</p>
                    </div>
                  </div>
                </div>

                <div v-if="!activeDayData.lessons.length">
                  <h2 class="title pb-7">В этот день у вас нет уроков</h2>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </section>

      <v-modals-container ref="modalsContainer" />
    </v-base>
  </div>
</template>

<script setup>
import vBase from '../v-base.vue'
import vCalendarMenu from './v-calendar-menu.vue'
import vModalsContainer from '../generalComponents/v-modals-container.vue'

import { useLessonStore } from '@/stores/lessonsStore'
import { getDayOfWeek, daysWeek } from '@/utils'
import { useRoute, useRouter } from 'vue-router'
import { useIsMobile } from '@/composables/useIsMobile'
import { ref, onMounted, computed, useTemplateRef, watch } from 'vue'
import { getLessonsOnMonth, transferLesson } from '@/api/requests'

/* Переменные */

const today = ref(new Date())
const currentMonth = ref(today.value.getMonth() + 1)
const currentYear = ref(today.value.getFullYear())

const router = useRouter()
const route = useRoute()

const lessonsData = ref([]) // Данные уроков с API
const monthCalendar = ref(null) // Сгенерированный календарь
const activeDay = ref()
const draggedItem = ref()

const { isMobile } = useIsMobile()
const modalsContainer = useTemplateRef('modalsContainer')

const store = useLessonStore()

const isLoading = ref(false)

const allLessons = computed(() => {
  return [...lessonsData.value]
})


/* Утилиты */
const formatTime = (timeString) => {
  // Преобразует "17:00:00" в "17:00"
  return timeString.slice(0, 5)
}

const getDayOfWeekFromDate = (date) => {
  // Возвращает день недели (1-7, где 1 = понедельник)
  const jsDay = date.getDay()
  return jsDay === 0 ? 7 : jsDay
}

const generateCalendarGrid = (year, month) => {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()

  // Определяем, с какого дня недели начинается месяц (1 = пн, 7 = вс)
  const startDayOfWeek = getDayOfWeekFromDate(firstDay)

  // Создаем массив недель
  const weeks = []
  let currentWeek = new Array(7).fill(null)

  // Заполняем дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = getDayOfWeekFromDate(new Date(year, month - 1, day))
    const weekIndex = dayOfWeek - 1 // Индекс в массиве (0-6)

    currentWeek[weekIndex] = {
      date: day,
      lessons: [],
      dayOfWeek: dayOfWeek
    }

    // Если воскресенье (индекс 6) или последний день месяца
    if (dayOfWeek === 7 || day === daysInMonth) {
      weeks.push([...currentWeek])
      currentWeek = new Array(7).fill(null)
    }
  }

  return weeks
}

const distributeScheduledLessons = (calendarGrid, lessons) => {
  // Создаем копию календарной сетки
  const updatedGrid = calendarGrid.map(week =>
    week.map(day => day ? { ...day, lessons: [] } : null)
  )

  // Распределяем уроки по фактическим датам
  lessons.forEach(lesson => {
    // Проверяем, есть ли у урока конкретная дата проведения
    if (lesson.conducted_date) {
      const lessonDate = new Date(lesson.conducted_date)
      const lessonDay = lessonDate.getDate()
      const lessonMonth = lessonDate.getMonth() + 1
      const lessonYear = lessonDate.getFullYear()

      // Проверяем, что урок относится к текущему месяцу
      if (lessonMonth === currentMonth.value && lessonYear === currentYear.value) {
        // Находим день в календаре с этой датой
        for (const week of updatedGrid) {
          for (const day of week) {
            if (day && day.date === lessonDay) {
              day.lessons.push({
                ...lesson,
                lesson_id: lesson.id,
                start_time: lesson.start_time,
                end_time: lesson.end_time,
                student_name: lesson.student_name,
                trial: lesson.trial,
              })
              break
            }
          }
        }
      }
    } else {
      // Для уроков без конкретной даты используем старую логику (по дням недели)
      const dayOfWeekId = parseInt(lesson.day_of_week_id)
      updatedGrid.forEach(week => {
        week.forEach(day => {
          if (day && day.dayOfWeek === dayOfWeekId) {
            day.lessons.push({
              ...lesson,
              lesson_id: lesson.id,
              start_time: lesson.start_time,
              end_time: lesson.end_time,
              student_name: `${lesson.student_name}`,
              trial: false,
              completed: false
            })
          }
        })
      })
    }
  })

  // Сортируем уроки по времени в каждом дне
  updatedGrid.forEach(week => {
    week.forEach(day => {
      if (day && day.lessons.length > 0) {
        day.lessons.sort((a, b) => {
          const timeA = a.start_time.replace(/:/g, '')
          const timeB = b.start_time.replace(/:/g, '')
          return timeA.localeCompare(timeB)
        })
      }
    })
  })

  return updatedGrid
}

/* Методы */
const getDayOfDate = (day) => {
  const date = route.query['selected_date']
  return `${day.toString().padStart(2, '0')}.${date}`
}

const getDateOfDay = (day) => {
  const date = route.query['selected_date']
  if (date) {
    return getDayOfWeek(date, day)
  }
  return date
}

const toggleActiveDay = (day) => {
  activeDay.value = day
}

const handleDragStart = (event, lesson, rowIndex, columnIndex, lessonIndex) => {
  draggedItem.value = {
    lesson,
    fromColumnIndex: columnIndex,
    fromRowIndex: rowIndex,
    fromLessonIndex: lessonIndex,
  }
}

const handleDrop = (event, targetColumnIndex, targetRowIndex) => {
  if (!draggedItem.value) return

  const { lesson, fromColumnIndex, fromRowIndex, fromLessonIndex } = draggedItem.value

  if (fromColumnIndex !== targetColumnIndex || fromRowIndex !== targetRowIndex) {
    const targetDay = monthCalendar.value[targetRowIndex][targetColumnIndex]

    if (!targetDay) {
      alert('Интерактивным способом вы можете переносить урок только в пределах месяца')
      return
    }

    const sourceLessons = monthCalendar.value[fromRowIndex][fromColumnIndex].lessons
    const targetLessons = targetDay.lessons

    // Преобразуем время в минуты для проверки пересечений
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }

    const pickedStart = timeToMinutes(lesson.start_time)
    const pickedEnd = timeToMinutes(lesson.end_time)

    // Проверка на пересечение времени
    for (let targetLesson of targetLessons) {
      const targetStart = timeToMinutes(targetLesson.start_time)
      const targetEnd = timeToMinutes(targetLesson.end_time)

      if (!(targetEnd <= pickedStart || targetStart >= pickedEnd)) {
        alert('В этот день уже есть занятие на данное время')
        return
      }
    }

    // Удаляем урок из исходной ячейки
    sourceLessons.splice(fromLessonIndex, 1)

    // Обновляем день недели у урока
    const newDayOfWeek = targetDay.dayOfWeek
    const updatedLesson = { ...lesson, day_of_week_id: newDayOfWeek.toString() }

    // Вставляем урок в целевую ячейку
    targetLessons.push(updatedLesson)

    // Сортируем уроки по времени
    targetLessons.sort((a, b) => {
      const timeA = timeToMinutes(a.start_time)
      const timeB = timeToMinutes(b.start_time)
      return timeA - timeB
    })

    // Отправляем запрос на сервер
    const requestBody = {
      day_of_week_id: newDayOfWeek,
      start_time: lesson.start_time + '.001Z',
      end_time: lesson.end_time + '.001Z',
      conducted_date: `${currentYear.value}-${currentMonth.value.toString().padStart(2, '0')}-${targetDay.date.toString().padStart(2, '0')}`,
      in_rule: false,
    }

    transferLesson(lesson.lesson_id || lesson.id, requestBody).then(() => {
      console.log('Урок успешно перенесен')
    }).catch(error => {
      console.error('Ошибка при переносе урока:', error)
      // В случае ошибки возвращаем урок обратно
      targetLessons.splice(targetLessons.indexOf(updatedLesson), 1)
      sourceLessons.splice(fromLessonIndex, 0, lesson)
    })

    draggedItem.value = null
  }
}

const toggleButtonsModal = (lesson) => {
  modalsContainer.value.toggleLessonModals('buttons', lesson)
}

const setMonth = (dateData) => {
  router.push({
    query: { selected_date: `${String(dateData.month + 1).padStart(2, '0')}.${dateData.year}` },
  })
  currentMonth.value = dateData.month + 1
  currentYear.value = dateData.year
  loadLessonsData()
}

const paginateMonth = (dateData) => {
  currentMonth.value = dateData.month
  currentYear.value = dateData.year
  loadLessonsData()
  activeDay.value = null
}

const loadLessonsData = async () => {
  try {
    isLoading.value = true
    // Предполагаем, что API возвращает уроки в новом формате
    const lessons = await getLessonsOnMonth(currentYear.value, currentMonth.value)
    lessonsData.value = lessons

    // Распределяем уроки по дням
  } catch (error) {
    console.error('Ошибка загрузки уроков:', error)
    monthCalendar.value = generateCalendarGrid(currentYear.value, currentMonth.value)
  } finally {
    isLoading.value = false
  }
}

const setLessonsOnDate = () => {
  const params = new URLSearchParams(window.location.search)
  const queryParams = Object.fromEntries(params.entries())

  if ('selected_date' in queryParams) {
    const [month, year] = queryParams['selected_date'].split('.')
    currentMonth.value = parseInt(month)
    currentYear.value = parseInt(year)
  } else {
    router.push({
      query: {
        selected_date: `${String(currentMonth.value).padStart(2, '0')}.${currentYear.value}`,
      },
    })
  }

  loadLessonsData()
}

/* Computed */
const activeDayData = computed(() => {
  if (activeDay.value && monthCalendar.value) {
    for (let week of monthCalendar.value) {
      for (let day of week) {
        if (day && day.date === activeDay.value) {
          return day
        }
      }
    }
  }
  return null
})

const isMonthEmpty = computed(() => {
  if (!monthCalendar.value) return true

  return monthCalendar.value.every(week =>
    week.every(day => !day || day.lessons.length === 0)
  )
})

watch(
  allLessons,
  (newLessons) => {
    const calendarGrid = generateCalendarGrid(currentYear.value, currentMonth.value)
    monthCalendar.value = distributeScheduledLessons(calendarGrid, newLessons)
    console.log(monthCalendar.value)
  },
  { deep: true, immediate: true }
)

watch(
  () => store.oneTimeLesson,
  (newLessons) => {
    if (Array.isArray(newLessons) && newLessons.length > 0) {
      lessonsData.value.push(...newLessons)
      const calendarGrid = generateCalendarGrid(currentYear.value, currentMonth.value)
      monthCalendar.value = distributeScheduledLessons(calendarGrid, lessonsData.value)
    }
  },
  { deep: true, immediate: true }
)

const loadData = () => {
  setLessonsOnDate()
}

defineExpose({
 loadData
})

/* Хуки */
onMounted(() => {
  loadData()
  localStorage.setItem('activePage', 'home')
  const today = new Date()
  activeDay.value = today.getDate()
})
</script>
