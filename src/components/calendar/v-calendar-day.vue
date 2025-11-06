<template>
  <v-base>
    <v-calendar-main >
      <div class="v-calendar-day layout">
        <div class="wrapper">
          <main>
            <section class="v-calendar-day__sec mob-page">
              <div class="v-calendar-day__sec-container container">
                <div class="v-calendar-day__back" @click="$router.go(-1)">
                  <img
                    src="../../assets/images/arrow-left-finance.svg"
                    class="day-el"
                    alt=""
                  />
                <h1 class="v-calendar-day__date">{{ formatedCurrentDate }}</h1>
                </div>

                <!-- Добавляем шапку календаря -->
                <div class="calendar-header">
                  <div class="calendar-header__week">
                    <div
                      v-for="(day, index) in weekDays"
                      :key="index"
                      class="calendar-header__day"
                      :class="{
                        'calendar-header__day--active': isCurrentDay(day.date),
                        'calendar-header__day--today': isTodayDay(day.date),
                        'calendar-header__day--weekend': index >= 5
                      }"
                      @click="goToDay(day.date)"
                    >
                      <div class="calendar-header__date">{{ day.dayNumber }}</div>
                      <div class="calendar-header__weekday">{{ day.weekDay }}</div>
                    </div>
                  </div>
                </div>

                <!-- Отладочная информация -->
                <div v-if="debugMode" style="margin: 10px 0; padding: 10px; background: #f0f0f0; border-radius: 4px;">
                  <p><strong>Debug info:</strong></p>
                  <p>Current Date: {{ currentDate }}</p>
                  <p>Start Date: {{ startDate }}</p>
                  <p>Events count: {{ events.length }}</p>
                  <p>Config exists: {{ !!config }}</p>
                  <details>
                    <summary>Events data:</summary>
                    <pre>{{ JSON.stringify(events, null, 2) }}</pre>
                  </details>
                </div>

                <DayPilotCalendar
                  v-if="config && startDate"
                  :key="calendarKey"
                  :startDate="startDate"
                  viewType="day"
                  locale="ru-RU"
                  :events="events"
                  :eventBorderRadius="5"
                  :timeRangeSelectedHandling="'Disabled'"
                  :cellDuration="60"
                  :height="400"
                  :showCurrentTime="true"
                  :currentTimeColor="'#000'"
                  :currentTimeWidth="2"
                  ref="calendarRef"
                  @eventClick="handleEventClick"
                >
                  <template #event="{ event }">
                    <div class="event" @click="toggleButtonsModal(event.data)">
                      <div class="event-header" :class="{ trial: event.data.trial }">
                        <span class="event-text">{{ event.data.student_name }}</span>
                        <p class="event-time">{{ event.data.start_time }} - {{ event.data.end_time }} </p>
                      </div>

                      <div
                        class="event-header"
                        :class="{ break: event.data.break && event.data.break.duration }"
                        v-if="event.data.break && event.data.break.duration"
                      >
                        <span class="event-text">Перерыв</span>
                      </div>
                    </div>
                  </template>
                </DayPilotCalendar>
              </div>
            </section>
          </main>
        </div>
      </div>
  </v-calendar-main>
  </v-base>
  <transition name="fade">
    <v-lesson-modal v-if="modals.lessons" @close="toggleModals('lessons')" />
  </transition>
  <transition name="fade">
    <v-trial-modal v-if="modals.trial_lesson" @close="toggleModals('trial_lesson')" />
  </transition>
  <v-modals-container ref="modalsContainer" />
</template>

<script setup>
import vBase from '../v-base.vue'
import vCalendarMain from './v-calendar-main.vue'
import vTrialModal from '../modals/v-trial-modal.vue'
import vLessonModal from '../modals/v-lesson-modal.vue'
import { DayPilot, DayPilotCalendar } from '@daypilot/daypilot-lite-vue'
import vModalsContainer from '../generalComponents/v-modals-container.vue'

import { ref, onMounted, computed, useTemplateRef, onUnmounted, watch, nextTick } from 'vue'
import { getLessonsOnDay } from '@/api/requests'
import { useRoute, useRouter } from 'vue-router'
import { formatDate, transformDate } from '@/utils'

const events = ref([])
const currentDate = ref()
const formatedCurrentDate = ref()
const weekDays = ref([])
const calendarKey = ref(0) // Для принудительного обновления календаря
const debugMode = ref(false) // Включите для отладки

const modalsContainer = useTemplateRef('modalsContainer')
const calendarRef = ref(null)
const route = useRoute()
const router = useRouter()

const config = ref({
  cellDuration: 60,
  separators: [{ color: 'Red', location: new DayPilot.Date() }],
})

const modals = ref({
  lessons: false,
  trial_lesson: false,
})

const startDate = ref()

const isTodayDay = (dayDate) => {
  const today = new Date();
  const todayString = today.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\./g, '.');
  return dayDate === todayString;
};

// Функция для получения дней недели
const getWeekDays = (dateString) => {
  const [day, month, year] = dateString.split('.')
  const date = new Date(year, month - 1, day)

  // Находим понедельник текущей недели
  const dayOfWeek = date.getDay()
  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  const monday = new Date(date.setDate(diff))

  const days = []
  const weekDaysNames = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(monday)
    currentDay.setDate(monday.getDate() + i)

    days.push({
      date: `${currentDay.getDate().toString().padStart(2, '0')}.${(currentDay.getMonth() + 1).toString().padStart(2, '0')}.${currentDay.getFullYear()}`,
      dayNumber: currentDay.getDate(),
      weekDay: weekDaysNames[i]
    })
  }

  return days
}

const isCurrentDay = (dayDate) => {
  return dayDate === currentDate.value
}

const goToDay = (dayDate) => {
  if (dayDate !== currentDate.value) {
    currentDate.value = dayDate
    formatedCurrentDate.value = formatCurrentDate(currentDate.value)
    router.replace({ query: { date: dayDate } })
  }
}

const toggleButtonsModal = (lesson) => {
  console.log('Clicked lesson:', lesson)
  modalsContainer.value.toggleLessonModals('buttons', lesson)
}

const handleEventClick = (args) => {
  console.log('Event clicked:', args.e.data)
  toggleButtonsModal(args.e.data)
}

const toggleModals = (modalName) => {
  modals.value[modalName] = !modals.value[modalName]
}

const updateCurrentTimeLine = () => {
  if (calendarRef.value && calendarRef.value.control) {
    calendarRef.value.control.update()
  }
}

const isToday = computed(() => {
  const today = new Date()
  const todayString = today.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  return currentDate.value === todayString
})

// Функция преобразования даты в формат ISO
const convertToISODate = (dateStr) => {
  const [day, month, year] = dateStr.split('.')
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

// Функция преобразования времени в ISO формат
const convertToISODateTime = (dateStr, timeStr) => {
  const [day, month, year] = dateStr.split('.')
  const [hours, minutes, seconds = '00'] = timeStr.split(':')

  // Создаем DayPilot.Date (он сам гарантирует корректность)
  return new DayPilot.Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds}`)
}


const loadEvents = async () => {
  try {
    console.log('Loading events for date:', currentDate.value)

    const lessons = await getLessonsOnDay(currentDate.value)
    console.log('API response:', lessons)

    if (!lessons || !lessons.lessons || !Array.isArray(lessons.lessons)) {
      console.warn('Invalid lessons data:', lessons)
      events.value = []
      return
    }

    const lessonsToEvent = []

    lessons.lessons.forEach((lesson, index) => {
      try {
        const { start_time, end_time, ...rest } = lesson

        // Более надежное преобразование времени
        const formattedStartTime = convertToISODateTime(currentDate.value, start_time)
        const formattedEndTime = convertToISODateTime(currentDate.value, end_time)

        console.log(`Lesson ${index + 1}:`, {
          original: { start_time, end_time },
          formatted: { start: formattedStartTime, end: formattedEndTime }
        })

        const eventData = {
          id: `lesson-${index}`, // Добавляем уникальный ID
          start: formattedStartTime,
          end: formattedEndTime,
          start_time: start_time.slice(0, 5),
          end_time: end_time.slice(0, 5),
          text: rest.student_name || 'Урок', // Добавляем текст для события
          ...rest,
        }

        lessonsToEvent.push(eventData)
      } catch (error) {
        console.error('Error processing lesson:', lesson, error)
      }
    })

    console.log('Processed events:', lessonsToEvent)
    events.value = lessonsToEvent

    // Принудительно обновляем календарь
    calendarKey.value++

    // Ждем следующий тик и обновляем календарь
    await nextTick()
    if (calendarRef.value && calendarRef.value.control) {
      calendarRef.value.control.update({ events: lessonsToEvent })

    }

  } catch (error) {
    console.error('Error loading events:', error)
    events.value = []
  }
}

const formatCurrentDate = (dateToFormat) => {
  const [day, month, year] = dateToFormat.split('.')
  const date = new Date(year, month - 1, day)
  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(date)
  return formattedDate
}

// Наблюдатель за изменением текущей даты
watch(currentDate, (newDate) => {
  if (newDate) {
    startDate.value = convertToISODate(newDate)
    weekDays.value = getWeekDays(newDate)
    loadEvents()
  }
})

let timeUpdateInterval = null

onMounted(async () => {
  // Инициализация даты
  if (route.query.date) {
    currentDate.value = route.query.date
  } else {
    // Если даты нет в query, устанавливаем сегодняшнюю дату
    const today = new Date()
    currentDate.value = today.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  startDate.value = convertToISODate(currentDate.value)
  formatedCurrentDate.value = formatCurrentDate(currentDate.value)
  weekDays.value = getWeekDays(currentDate.value)

  console.log('Mounted with date:', currentDate.value, 'Start date:', startDate.value)

  // Загружаем события
  await loadEvents()

  // Настраиваем обновление времени для сегодняшнего дня
  if (isToday.value) {
    timeUpdateInterval = setInterval(updateCurrentTimeLine, 60000)
  }
})

onUnmounted(() => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
  }
})
</script>

<style>
.calendar_default_corner,
.calendar_default_colheader {
  display: none !important;
}

.calendar_default_time_line {
  z-index: 10;
}

/* Стили для шапки календаря */
.calendar-header {
  margin-bottom: 20px;
}

.calendar-header__week {
  display: flex;
  justify-content: space-between;
  border-radius: 12px;
  padding: 8px;
}

.calendar-header__day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 64px;
  height: 62px;
  border: 1px solid transparent;
}

.night__mode .calendar-header__day {
  color: #fff !important;
}

.calendar-header__day:hover {
  background: #f5f5f5;
}

.calendar-header__day--active {
  background: #F6F7F9;
  border-radius: 14px;
  border: 1px solid #E9EAEB;
  color: var(--custom-black-text);
}

.calendar-header__day--today *{
  color: var(--custom-blue) !important;
}

.night__mode .calendar-header__day--active  {
  background-color: #FFFFFF14;
  border-color: #FFFFFF14;
}

.calendar-header__day--weekend {
  color: #ff5252 !important;
}

.calendar-header__day--active.calendar-header__day--weekend {
  color: white;
}

.calendar-header__date {
  font-weight: 700;
  font-size: 14px;
}

.calendar-header__weekday {
  font-size: 11px;
  font-weight: 600;
  color: #717680;
}
</style>
