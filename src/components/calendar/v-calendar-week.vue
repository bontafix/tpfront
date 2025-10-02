<template>
  <v-base>
    <v-calendar-main>
      <section class="v-calendar-week" v-show="!isMobile">
        <div class="container">
          <div class="v-calendar-week__container layout">
            <v-calendar-menu
              :is-showed-break="true"
              :type="'calendar-week'"
              @setWeek="setLessonsOnWeek"
              @paginateWeek="paginateWeek"
              @toggleBreakMode="toggleBreakMode"
            />
            <div class="sec-hidden-content showing" v-if="isWeekEmpty && !isLoading">
              <h1 class="text-title text-blue">Еще не запланировано ни одного занятия!</h1>
            </div>
            <div class="loader-container" v-if="isLoading">
              <div class="loader"></div>
            </div>
            <div
              class="v-calendar-week__content scroll-container"
              :class="{ blur: isWeekEmpty }"
              v-show="!breakMode || isWeekEmpty"
            >
              <transition name="fade">
                <table class="v-calendar-week__table calendar" v-if="weekDays">
                  <thead>
                    <tr class="calendar-header">
                      <th v-for="(day, index) in weekDays" :key="index">
                        <div class="calendar-header__item">
                          {{ formatDay(day.date) }}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="calendar-row">
                      <td
                        v-for="(day, columnIndex) in weekDays"
                        :key="columnIndex"
                        class="calendar-row__item"
                        @dragover.prevent
                        @drop="(event) => handleDrop(event, columnIndex)"
                      >
                        <div class="calendar-row__item-content calendar-card">
                          <div
                            class="calendar-card__content"
                            :class="{ completed: lesson.amount_deducted }"
                            v-for="(lesson, lessonIndex) in day.lessons"
                            :key="lesson.id"
                            @click="toggleButtonsModal(lesson)"
                            draggable="true"
                            @dragstart="
                              (event) => handleDragStart(event, lesson, columnIndex, lessonIndex)
                            "
                          >
                            <transition name="flip">
                              <div
                                v-if="lesson && !lesson.cancelled_lesson"
                                class="calendar-card__lesson"
                                :class="{ trial: lesson.trial }"
                                :style="{
                                  height: getHeight(1),
                                  gap: `${baseGap}px`,
                                }"
                              >
                                <p class="calendar-card__lesson-time">
                                  {{ lesson.start_time.slice(0, 5) }} -
                                  {{ lesson.end_time.slice(0, 5) }}
                                </p>
                                <p class="calendar-card__lesson-name">{{ lesson.student_name }}</p>
                              </div>
                            </transition>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </transition>
            </div>
            <div
              class="v-calendar-week__break scroll-container"
              v-if="breakMode && !isWeekEmpty"
            >
           <!--  { "id": "30432", "start": "2025-09-22T16:59:00", "end": "2025-09-22T17:00:00", "text": "Артур Тестовый"} -->
              <!--  { "id": "30432", "start": "2025-09-22T16:59:00", "end": "2025-09-22T17:00:00", "text": "Артур Тестовый" } -->
              <DayPilotCalendar :config="config" :events="events" ref="calendarRef" v-if="events">
                <template #event="{ event }">
                  <div class="event" @click="toggleButtonsModal(event.data)">
                    <div class="event-header">
                      <div
                        class="calendar-card__content"
                        :class="{ completed: event.data.amount_deducted }"
                      >
                        <div class="calendar-card__lesson" :class="{ trial: event.data.trial }">
                          <p class="calendar-card__lesson-time">
                            {{ event.data.start_time.slice(0, 5) }} - {{ event.data.end_time.slice(0, 5) }}
                          </p>
                          <p class="calendar-card__lesson-name">{{ event.data.student_name }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </DayPilotCalendar>
            </div>
            <div class="loader-container" v-if="!weekDays">
              <div class="loader"></div>
            </div>
          </div>
        </div>
      </section>
      <section class="v-calendar-week-mob mob-page" v-if="isMobile && !isLoading">
        <div class="container">
          <div class="v-calendar-week-mob__container layout">
            <v-calendar-menu
              :is-showed-break="true"
              :type="'calendar-week'"
              @setWeek="setLessonsOnWeek"
              @paginateWeek="paginateWeek"
              @toggleBreakMode="toggleBreakMode"
            />
            <div class="loader-container" v-if="isLoading">
              <div class="loader"></div>
            </div>
            <ul class="v-calendar-week-mob__list" v-if="weekDays && !isLoading">
              <li
                v-for="(day, id) in weekDays"
                :key="id"
                class="v-calendar-week-mob__list-item"
              >
                <div class="day" v-if="day">
                  <router-link :to="{ name: 'calendar-day', query: { date: getDayOfDate(day.date) } }">
                  <div class="day__header">
                    <p class="day__date">{{ getDayLetters(day.date) }}</p>
                    <svg class="opacity-50" width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.66663 11.3333L11.3333 4.66663M11.3333 4.66663H4.66663M11.3333 4.66663V11.3333" stroke="#717680" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div
                    class="day__content"
                    v-for="lesson in day.lessons"
                    :key="lesson.id"
                  >
                    <div class="day__lesson" :class="{ trial: lesson.trial }">
                      <h4 class="day__lesson-name">
                        {{ lesson.student_name }}
                      </h4>
                      <div class="day__lesson-time">
                        <p>{{ lesson.start_time.slice(0, 5) }}</p>
                        <p>-</p>
                        <p>{{ lesson.end_time.slice(0, 5) }}</p>
                      </div>
                    </div>
                  </div>
                  </router-link>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </v-calendar-main>
  </v-base>
  <v-modals-container ref="modalsContainer" />
</template>

<script setup>
import vBase from '../v-base.vue'
import vCalendarMain from './v-calendar-main.vue'
import vCalendarMenu from './v-calendar-menu.vue'
import vModalsContainer from '../generalComponents/v-modals-container.vue'

import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, useTemplateRef, computed, watch } from 'vue'

import { useLessonStore } from '@/stores/lessonsStore'
import { useIsMobile } from '@/composables/useIsMobile'
import { getLessonsOnWeek, transferLesson } from '@/api/requests'
import { DayPilot, DayPilotCalendar } from '@daypilot/daypilot-lite-vue'
import {
  formatDate,
  formatDateToStandart,
  transformDate,
} from '@/utils'

/* ============================================================ Переменные состояния ============================================================ */

const { isMobile } = useIsMobile()
const baseGap = 10
const baseHeight = 90

const store = useLessonStore()
const router = useRouter()
const route = useRoute()

const breakMode = ref(localStorage.getItem('breakMode') === 'true')
const events = ref([])
const today = ref(formatDateToStandart(new Date()))
const startDate = ref(route.query['start_date'] || '01.12.2025')

const isLoading = ref(false)

const modalsContainer = useTemplateRef('modalsContainer')
const calendarRef = useTemplateRef('calendarRef')
const weekDays = ref([])
const rawLessons = ref([])
const draggedItem = ref({
  lesson: null,
  fromColumnIndex: null,
  fromLessonIndex: null,
})

const config = ref({
  viewType: 'Week',
  cellDuration: 15,
  startDate: transformDate(startDate.value),
  allowEventOverlap: false,
  eventResizeHandling: 'Disabled',
  timeRangeSelectedHandling: 'Disabled',
  locale: 'ru-RU',
  headerDateFormat: 'ddd, d',
  showNowLine: true,
  nowLineColor: '#FF0000',
  nowLineWidth: 2,
  touch: true,
  weekStarts: 1,
  businessBeginsHour: 6,
  businessEndsHour: 22,

  onEventMoved: (args) => {
    const startTime = args.newStart.value.split('T')[1]
    const endTime = args.newEnd.value.split('T')[1]
    const startDate = args.e.data.start.value.split('T')[0]
    const dayOfWeek = new Date(args.newStart.value).getDay()

    args.e.data.start_time = startTime.slice(0, 5)
    args.e.data.end_time = endTime.slice(0, 5)

    const eventData = {
      day_of_week_id: dayOfWeek || 7,
      start_time: startTime,
      end_time: endTime,
      conducted_date: startDate,
      in_rule: false,
    }
    const lessonId = args.e.data.id
    transferLesson(lessonId, eventData).then(() => {
      console.log('Выполнили запрос')
    })
  },
})



/* ============================================================ Методы ============================================================ */

const getCurrentWeekStart = (date) => {
  const day = date.getDay(); // 0 = воскресенье
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  console.log(monday)
  return monday;
};



const getDayOfDate = (day) => {
  const date = route.query['start_date']
  return date
}

// Функция для получения недели на основе стартовой даты
const getWeekDates = (startDateStr) => {
  const [day, month, year] = startDateStr.split('.').map(Number)
  const startDate = new Date(year, month - 1, day)

  const weekDates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    weekDates.push(date)
  }

  return weekDates
}

// Функция для форматирования даты в строку YYYY-MM-DD
const formatDateToISO = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Функция для преобразования плоского массива уроков в структуру по дням
const organizeLessonsByDays = (lessons, weekDates) => {
  const weekData = weekDates.map(date => ({
    date: formatDateToISO(date),
    lessons: []
  }))

  lessons.forEach(lesson => {
    const lessonDate = lesson.conducted_date
    const dayIndex = weekData.findIndex(day => day.date === lessonDate)

    if (dayIndex !== -1) {
      weekData[dayIndex].lessons.push(lesson)
    }
  })

  // Сортируем уроки в каждом дне по времени
  weekData.forEach(day => {
    day.lessons.sort((a, b) => {
      const timeA = a.start_time.split(':').map(Number)
      const timeB = b.start_time.split(':').map(Number)
      const minutesA = timeA[0] * 60 + timeA[1]
      const minutesB = timeB[0] * 60 + timeB[1]
      return minutesA - minutesB
    })
  })

  return weekData
}

const toISOwithSeconds = (dateStr, timeStr) => {
  // dateStr: 'YYYY-MM-DD', timeStr: 'HH:MM' или 'HH:MM:SS'
  const t = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  return `${dateStr}T${t}`;
}

const loadEvents = async (lessons) => {
  const lessonsToEvent = lessons.map(lesson => {
    const startISO = toISOwithSeconds(lesson.conducted_date, lesson.start_time);
    const endISO = toISOwithSeconds(lesson.conducted_date, lesson.end_time);

    return {
      id: String(lesson.id),
      start: startISO,
      end: endISO,
      text: lesson.student_name || 'Урок',
      data: { ...lesson }, // храните оригинальные данные в data
      start_time: lesson.start_time.slice(0,5),
      end_time: lesson.end_time.slice(0,5),
    }
  });

  // форсированно заменяем ссылку (чтобы Vue/DayPilot отреагировал)
  events.value = [...lessonsToEvent.slice()]

  console.log('Загруженные события (ISO):', events.value);

  // если control уже доступен — загрузим прямо в DayPilot events API
  if (calendarRef.value && calendarRef.value.control) {
    try {
      // безопасная загрузка: используем events.load если есть, иначе присвоим и update
      if (calendarRef.value.control.events && typeof calendarRef.value.control.events.load === 'function') {
        calendarRef.value.control.events.load(events.value);
      } else {
        calendarRef.value.control.events.list = events.value;
        calendarRef.value.control.update();
      }
    } catch (err) {
      console.warn('Ошибка при обновлении control.events:', err);
    }
  }
}



const getDayLetters = (dateStr) => {
  const date = new Date(dateStr)
  const dayNames = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']
  const dateDay = date.getDate()
  return dayNames[date.getDay()] + ', ' + dateDay
}

const handleDragStart = (event, lesson, columnIndex, lessonIndex) => {
  draggedItem.value = { lesson, fromColumnIndex: columnIndex, fromLessonIndex: lessonIndex }
}

const handleDrop = (event, targetColumnIndex) => {
  const { lesson, fromColumnIndex, fromLessonIndex } = draggedItem.value

  if (fromColumnIndex !== targetColumnIndex) {
    const sourceLessons = weekDays.value[fromColumnIndex].lessons
    const targetLessons = weekDays.value[targetColumnIndex].lessons
    const targetDate = weekDays.value[targetColumnIndex].date

    const requestBody = {
      day_of_week_id: new Date(targetDate).getDay() || 7,
      start_time: lesson.start_time,
      end_time: lesson.end_time,
      conducted_date: targetDate,
      in_rule: false,
    }

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

    // Найдём индекс для вставки
    let insertIndex = targetLessons.length
    for (let i = 0; i < targetLessons.length; i++) {
      const targetStart = timeToMinutes(targetLessons[i].start_time)
      if (targetStart > pickedStart) {
        insertIndex = i
        break
      }
    }

    // Удаляем и вставляем урок
    sourceLessons.splice(fromLessonIndex, 1)
    targetLessons.splice(insertIndex, 0, lesson)

    transferLesson(lesson.id, requestBody).then(() => {
      console.log('Перенос осуществлен')
    })
  }

  draggedItem.value = { lesson: null, fromColumnIndex: null, fromLessonIndex: null }
}

const updateCalendar = () => {
  if (calendarRef.value && calendarRef.value.control) {
    calendarRef.value.control.events.list = events.value
    calendarRef.value.control.update()
  }
}

const toggleBreakMode = async () => {
  breakMode.value = !breakMode.value
  localStorage.setItem('breakMode', breakMode.value)

  if (breakMode.value && rawLessons.value.length > 0) {
    await loadEvents(rawLessons.value)
    setTimeout(() => {
      updateCalendar()
    }, 100)
  }
}

const paginateWeek = () => {
  setLessonsFromUrl()
}

const toggleButtonsModal = (lesson) => {
  const date = lesson?.date || lesson?.conducted_date
  const formattedDate = typeof date === 'string' && date.includes('-')
    ? date.split('-').join('.')
    : date
  modalsContainer.value.toggleLessonModals('buttons', {...lesson, conducted_date: formattedDate})
}

const getHeight = (duration) => {
  return Math.max(baseHeight, baseHeight * duration)
}

const setLessonsOnWeek = (startDate) => {
  router.push({ query: { start_date: startDate } }).then(() => {
    setLessonsFromUrl()
  })
}

const formatDay = (dateStr) => {
  const date = new Date(dateStr)
  const dayNames = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
  const dayName = dayNames[date.getDay()]
  const day = date.getDate()

  return `${dayName}, ${day}`
}

const setLessons = async (lessons) => {
  rawLessons.value = lessons;
  const weekDates = getWeekDates(lessons);
  weekDays.value = organizeLessonsByDays(lessons, weekDates);

  await loadEvents(lessons);
}

// Обновленная логика в setLessonsFromUrl:
const setLessonsFromUrl = async () => {
  try {
    isLoading.value = true;
    const queryParams = route.query;

    if ('start_date' in queryParams) {
      startDate.value = queryParams['start_date'];
      config.value.startDate = transformDate(queryParams['start_date']);

      const lessons = await getLessonsOnWeek(queryParams['start_date']);
      rawLessons.value = lessons;
      const weekDates = getWeekDates(queryParams['start_date']);
      weekDays.value = organizeLessonsByDays(lessons, weekDates);

      await loadEvents(lessons);
      setTimeout(() => updateCalendar(), 50);

    } else {
      const today = new Date();
      const mondayOfCurrentWeek = getCurrentWeekStart(today);
      const startDateParam = formatDate(mondayOfCurrentWeek);

      router.replace({ query: { start_date: startDateParam } });
    }
  } catch (error) {
    console.error('Ошибка загрузки уроков:', error);
  } finally {
    isLoading.value = false;
  }
};


const isWeekEmpty = computed(() => {
  return !weekDays.value || weekDays.value.every(day => !day.lessons || day.lessons.length === 0)
})

/* ============================================================ Наблюдатели ============================================================ */

watch(() => route.query.start_date, () => {
  setLessonsFromUrl();
});

watch(breakMode, (newMode) => {
  if (newMode) {
    console.log('=========== Загружаем')
    loadEvents(rawLessons.value)
  }
})


watch(store.oneTimeLesson, (lesson) => {
  if (!lesson || !weekDays.value) return

  const targetDay = weekDays.value.find(day => day.date === lesson.conducted_date)

  if (targetDay) {
    const timeToMinutes = (time) => {
      const [h, m] = time.split(':').map(Number)
      return h * 60 + m
    }
    const lessonStart = timeToMinutes(lesson.start_time)
    const lessonEnd = timeToMinutes(lesson.end_time)

    const conflict = targetDay.lessons.some((existing) => {
      const existingStart = timeToMinutes(existing.start_time)
      const existingEnd = timeToMinutes(existing.end_time)
      return !(lessonEnd <= existingStart || lessonStart >= existingEnd)
    })

    if (conflict) {
      alert('Урок пересекается с другим уроком в этот день')
      return
    }

    let insertIndex = targetDay.lessons.length
    for (let i = 0; i < targetDay.lessons.length; i++) {
      const existingStart = timeToMinutes(targetDay.lessons[i].start_time)
      if (lessonStart < existingStart) {
        insertIndex = i
        break
      }
    }

    targetDay.lessons.splice(insertIndex, 0, lesson)
    rawLessons.value.push(lesson)

    if (breakMode.value) {
      loadEvents(rawLessons.value).then(() => updateCalendar())
    }
  }
})

const loadData = async () => {
  await setLessonsFromUrl()
}

defineExpose({
  loadData
})

/* ============================================================ Хуки ============================================================ */

onMounted(() => {
  loadData()
  localStorage.setItem('activePage', 'calendar-week')

})
</script>

<style lang="scss">
.calendar_default_cell_inner {
  border-bottom: none !important;
  background-color: var(--white) !important;
  border-right: 3px solid var(--grey-dark) !important;
}

.calendar_default_cornerright_inner,
.calendar_default_corner_inner {
  border-color: transparent !important;
}

.calendar_default_colheader {
  padding: 5px 0;
}

.calendar_default_colheader_inner {
  border: 0 !important;
  background-color: #f3f4f6 !important;
  color: var(--custom-dark-gray) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  text-transform: uppercase;
  width: 100%;
}

.calendar_default_event {
  left: 1px !important;
}

.event {
  height: 100%;
}

.calendar_default_main {
  min-width: 980px !important;

  > div:nth-child(2) {
    height: 700px !important;
    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #b9b9b9;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }
  }
}

.calendar_default_event_inner {
  background-color: transparent !important;
  padding: 4px !important;

  > div,
  .event-header,
  .calendar-card__content,
  .calendar-card__lesson {
    height: 100% !important;
  }
}
</style>
