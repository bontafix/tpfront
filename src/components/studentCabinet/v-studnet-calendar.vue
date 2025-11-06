<template>
  <div class="v-student-calendar v-calendar-month-mob styled-section">
    <!-- Навигация по месяцам -->
      <div class="calendar-navigation">
        <button @click="changeMonth(-1)">
          <img src="/src/assets/images/arrow-left-finance.svg" alt="">
        </button>
        <h2 class="calendar-navigation__title">{{ monthName }} {{ currentYear }}</h2>
        <button @click="changeMonth(1)">
          <img src="/src/assets/images/arrow-right-finance.svg" alt="">
        </button>
         <div class="mobile-buttons">
            <div class="day-el rotate-180" @click="changeMonth(-1)">
               <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="39.5" y="0.5" width="39" height="39" rx="19.5" transform="rotate(90 39.5 0.5)" fill="#F3F4F6"/>
                <rect x="39.5" y="0.5" width="39" height="39" rx="19.5" transform="rotate(90 39.5 0.5)" stroke="#F3F4F6"/>
                <path d="M15.7578 20.0001H24.2427M24.2427 20.0001L20.0003 15.7577M24.2427 20.0001L20.0003 24.2425" stroke="#717680" stroke-width="1.85556" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="day-el" @click="changeMonth(1)">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="39.5" y="0.5" width="39" height="39" rx="19.5" transform="rotate(90 39.5 0.5)" fill="#F3F4F6"/>
                <rect x="39.5" y="0.5" width="39" height="39" rx="19.5" transform="rotate(90 39.5 0.5)" stroke="#F3F4F6"/>
                <path d="M15.7578 20.0001H24.2427M24.2427 20.0001L20.0003 15.7577M24.2427 20.0001L20.0003 24.2425" stroke="#717680" stroke-width="1.85556" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="night-el rotate-180" @click="changeMonth(-1)">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="40" width="40" height="40" rx="20" transform="rotate(90 40 0)" fill="white" fill-opacity="0.08"/>
                <path d="M15.7573 20.0001H24.2422M24.2422 20.0001L19.9998 15.7577M24.2422 20.0001L19.9998 24.2425" stroke="#E9EAEB" stroke-width="1.85556" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="night-el" @click="changeMonth(1)">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="40" width="40" height="40" rx="20" transform="rotate(90 40 0)" fill="white" fill-opacity="0.08"/>
                <path d="M15.7573 20.0001H24.2422M24.2422 20.0001L19.9998 15.7577M24.2422 20.0001L19.9998 24.2425" stroke="#E9EAEB" stroke-width="1.85556" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
        </div>
      </div>


      <div class="v-student-calendar__wrapper">
        <div class="v-student-calendar__content">
          <div class="v-student-calendar__subjects">
            <div class="v-student-calendar__subject" v-for="(subject, index) in subjects" :key="subject.id">
              <div class="circle" :class="colors[index]"></div>
              {{ getSubjectDisplayName(subject) }}
            </div>
          </div>

          <table class="v-student-calendar__table calendar">
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
                    <div class="calendar-row__item-content calendar-card">
                      <div class="calendar-card__num">{{ day.date }}</div>
                      <div class="calendar-card__content">
                        <div
                          class="circle"
                          :class="getSubjectClass(lesson.subject_name, lesson.teacher_name)"
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
        <!-- Детали активного дня -->
        <div class="v-student-calendar__lessons">
          <h3 class="v-student-calendar__lessons-date" v-if="activeDay && activeDayWeek">{{ activeDayWeek }}, {{ activeDay }}</h3>
          <template v-if="activeDayData?.lessons?.length">
            <div v-for="lesson in activeDayData.lessons" :key="lesson.id" class="v-student-calendar__lesson" :class="getSubjectClass(lesson.subject_name, lesson.teacher_name)">
              <div class="v-student-calendar__lesson-info">
                <div class="v-student-calendar__lesson-subject">{{ lesson.subject_name }}</div>
                <div class="v-student-calendar__lesson-time">{{ formatTime(lesson.start_time) }} - {{ formatTime(lesson.end_time) }}</div>
              </div>
              <div class="v-student-calendar__lesson-delete">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity="0.32">
                <path d="M15 5L5 15M5 5L15 15" stroke="#717680" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
                </svg>
              </div>
            </div>
          </template>

        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { getStudentSchedule } from '@/api/requests'

const props = defineProps({
  currentSubject: Object,
  subjects: Array
})

dayjs.locale('ru')

const colors = ['blue', 'green', 'orange']

const daysWeek = [
  { id: 1, days_week: 'Пн' },
  { id: 2, days_week: 'Вт' },
  { id: 3, days_week: 'Ср' },
  { id: 4, days_week: 'Чт' },
  { id: 5, days_week: 'Пт' },
  { id: 6, days_week: 'Сб' },
  { id: 7, days_week: 'Вс' }
]

const lessons = ref([])
const currentMonth = ref(dayjs().month())
const currentYear = ref(dayjs().year())
const activeDay = ref(null)
const loading = ref(false)

const activeDayWeek = computed(() => {
  if (!activeDay.value) return ''
  const dateObj = dayjs(new Date(currentYear.value, currentMonth.value, activeDay.value))
  const weekDaysShort = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']
  return weekDaysShort[dateObj.day()]
})

const monthName = computed(() =>
  dayjs(new Date(currentYear.value, currentMonth.value)).format('MMMM')
)

const monthCalendar = computed(() => {
  const startOfMonth = dayjs(new Date(currentYear.value, currentMonth.value, 1))
  const endOfMonth = startOfMonth.endOf('month')
  const startDay = startOfMonth.day() || 7 // Понедельник = 1
  const daysInMonth = endOfMonth.date()

  const days = []

  // Пустые дни в начале месяца
  for (let i = 1; i < startDay; i++) {
    days.push(null)
  }

  // Дни месяца с уроками
  for (let i = 1; i <= daysInMonth; i++) {
    const dateISO = getDayOfDate(i)
    days.push({
      date: i,
      lessons: lessons.value.filter(l => l.date === dateISO)
    })
  }

  // Разбивка на недели
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return weeks
})

const activeDayData = computed(() => {
  if (!activeDay.value) return null
  const allDays = monthCalendar.value.flat().filter(Boolean)
  return allDays.find(d => d.date === activeDay.value)
})

// Создаем карту соответствия предметов и цветов
const subjectColors = computed(() => {
  const res = {};

  for(let i = 0; i < props.subjects.length; i++) {
    const subject = props.subjects[i]
    const displayName = getSubjectDisplayName(subject)
    res[displayName] = colors[i % colors.length]
  }

  return res
})

// Функция для получения отображаемого имени предмета
function getSubjectDisplayName(subject) {
  // Находим все предметы с таким же названием
  const duplicates = props.subjects.filter(s => s.subject === subject.subject)

  // Если дубликатов нет, возвращаем просто название предмета
  if (duplicates.length <= 1) {
    return subject.subject
  }

  // Если есть дубликаты, добавляем имя учителя в скобках
  return `${subject.subject} (${subject.teacher_name})`
}

function getDayOfDate(dayNum) {
  return dayjs(new Date(currentYear.value, currentMonth.value, dayNum)).format('YYYY-MM-DD')
}

function toggleActiveDay(dayNum) {
  activeDay.value = activeDay.value === dayNum ? null : dayNum
}

function changeMonth(direction) {
  const newDate = dayjs(new Date(currentYear.value, currentMonth.value)).add(direction, 'month')
  currentMonth.value = newDate.month()
  currentYear.value = newDate.year()
  activeDay.value = null
}

function formatTime(timeString) {
  // Преобразует "10:00:00" в "10:00"
  return timeString.substring(0, 5)
}

function getSubjectClass(subjectName, teacherName) {
  // Находим предмет в массиве subjects по названию и имени учителя
  const subject = props.subjects.find(s =>
    s.subject === subjectName && s.teacher_name === teacherName
  )

  if (!subject) {
    // Если не нашли точное совпадение, ищем просто по названию
    const subjectByName = props.subjects.find(s => s.subject === subjectName)
    if (subjectByName) {
      const displayName = getSubjectDisplayName(subjectByName)
      return subjectColors.value[displayName] || 'blue'
    }
    return 'blue'
  }

  const displayName = getSubjectDisplayName(subject)
  return subjectColors.value[displayName] || 'blue'
}

const loadData = async () => {
  if (!props.currentSubject?.id) return

  loading.value = true
  try {
    const month = String(currentMonth.value + 1).padStart(2, '0')
    const year = currentYear.value

    const response = await getStudentSchedule(year, month)

    if (response && response.lessons) {
      lessons.value = response.lessons.filter(lesson => !lesson.is_cancelled)
    } else {
      lessons.value = []
    }
  } catch (error) {
    console.error('Ошибка загрузки расписания:', error)
    lessons.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.currentSubject?.id) {
    loadData()
  }
})

watch([currentMonth, currentYear], () => {
  loadData()
})
</script>
