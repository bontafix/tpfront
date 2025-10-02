<!-- CalendarBase.vue - Базовый компонент календаря -->
<template>
  <div class="calendar-base">
    <!-- Desktop версия -->
    <section class="v-calendar-month" v-if="!isMobile">
      <div class="container">
        <div class="v-calendar-month__container layout">
          <!-- Слот для календарного меню -->
          <slot name="calendar-menu">
            <v-calendar-menu
              :type="menuType"
              @setMonth="handleSetMonth"
              @paginateMonth="handlePaginateMonth"
            />
          </slot>

          <div class="scroll-container" v-if="!isLoading && monthCalendar && daysWeek">
            <div class="v-calendar-month__content">
              <!-- Слот для дополнительного контента (например, сообщение о пустом месяце) -->
              <slot name="empty-state" v-if="isMonthEmpty" :is-empty="isMonthEmpty">
                <div class="sec-hidden-content showing">
                  <h1 class="text-title">Еще не запланировано ни одного занятия!</h1>
                </div>
              </slot>

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
                      @dragover.prevent="enableDragDrop && $event.preventDefault()"
                      @drop="enableDragDrop && handleDrop($event, dayIndex, weekIndex)"
                    >
                      <div class="calendar-row__item-container">
                        <div class="calendar-row__item-content calendar-card" v-if="day">
                          <div class="calendar-card__num">{{ day.date }}</div>

                          <!-- Слот для кастомного отображения уроков -->
                          <slot
                            name="lesson-card"
                            :day="day"
                            :lessons="day.lessons"
                            :week-index="weekIndex"
                            :day-index="dayIndex"
                          >
                            <!-- Дефолтное отображение -->
                            <div
                              class="calendar-card__content"
                              v-for="(lesson, lessonIndex) in day.lessons"
                              :key="lesson.id"
                              :class="{ completed: lesson.amount_deducted }"
                              @click="handleLessonClick(lesson)"
                              :draggable="enableDragDrop"
                              @dragstart="enableDragDrop && handleDragStart($event, lesson, weekIndex, dayIndex, lessonIndex)"
                            >
                              <template v-if="!lesson.cancelled_lesson">
                                <div class="calendar-card__lesson" :class="{ trial: lesson.trial }">
                                  <p class="calendar-card__lesson-time">
                                    {{ formatTime(lesson.start_time) }} - {{ formatTime(lesson.end_time) }}
                                  </p>
                                  <p class="calendar-card__lesson-name">
                                    {{ lesson.student_name || 'Студент' }}
                                  </p>
                                </div>
                              </template>
                            </div>
                          </slot>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="loader-container" v-else-if="isLoading">
            <div class="loader"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="v-calendar-month-mob mob-page" v-else>
      <div class="container">
        <div class="v-calendar-month-mob__container layout">
          <slot name="mobile-calendar-menu">
            <v-calendar-menu
              :type="menuType"
              @paginateMonth="handlePaginateMonth"
            />
          </slot>

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
                    <div class="calendar-row__item-content calendar-card">
                      <div class="calendar-card__num">{{ day.date }}</div>

                      <!-- Слот для мобильного отображения уроков -->
                      <slot name="mobile-lesson-indicators" :day="day" :lessons="day.lessons">
                        <!-- Дефолтные индикаторы -->
                        <div class="calendar-card__content">
                          <div
                            class="calendar-card__lesson"
                            :class="{ trial: lesson.trial }"
                            v-for="lesson in day.lessons"
                            :key="lesson.id"
                          ></div>
                        </div>
                      </slot>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Детали дня для мобильной версии -->
        <div class="v-calendar-month-mob__info lesson-info" v-if="activeDayData">
          <slot name="day-details" :day-data="activeDayData">
            <!-- Дефолтные детали дня -->
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
          </slot>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  monthCalendar: {
    type: Array,
    default: () => []
  },
  daysWeek: {
    type: Array,
    default: () => [
      { days_week: 'Пн', id: 1 },
      { days_week: 'Вт', id: 2 },
      { days_week: 'Ср', id: 3 },
      { days_week: 'Чт', id: 4 },
      { days_week: 'Пт', id: 5 },
      { days_week: 'Сб', id: 6 },
      { days_week: 'Вс', id: 7 }
    ]
  },
  activeDay: {
    type: Number,
    default: null
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  enableDragDrop: {
    type: Boolean,
    default: false
  },
  menuType: {
    type: String,
    default: 'home'
  }
})

// Emits
const emit = defineEmits([
  'setMonth',
  'paginateMonth',
  'toggleActiveDay',
  'lessonClick',
  'dragStart',
  'drop'
])

// Computed
const isMonthEmpty = computed(() => {
  if (!props.monthCalendar) return true
  return props.monthCalendar.every(week =>
    week.every(day => !day || day.lessons.length === 0)
  )
})

const activeDayData = computed(() => {
  if (props.activeDay && props.monthCalendar) {
    for (let week of props.monthCalendar) {
      for (let day of week) {
        if (day && day.date === props.activeDay) {
          return day
        }
      }
    }
  }
  return null
})

// Methods
const formatTime = (timeString) => {
  return timeString?.slice(0, 5) || ''
}

const handleSetMonth = (dateData) => {
  emit('setMonth', dateData)
}

const handlePaginateMonth = (dateData) => {
  emit('paginateMonth', dateData)
}

const toggleActiveDay = (day) => {
  emit('toggleActiveDay', day)
}

const handleLessonClick = (lesson) => {
  emit('lessonClick', lesson)
}

const handleDragStart = (event, lesson, weekIndex, dayIndex, lessonIndex) => {
  emit('dragStart', { event, lesson, weekIndex, dayIndex, lessonIndex })
}

const handleDrop = (event, dayIndex, weekIndex) => {
  emit('drop', { event, dayIndex, weekIndex })
}
</script>
