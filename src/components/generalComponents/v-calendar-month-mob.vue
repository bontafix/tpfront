<template>
  <section class="v-calendar-month-mob mob-page">
    <div class="container">
      <div class="v-calendar-month-mob__container layout">
        <v-calendar-menu :type="'home'" @paginateMonth="$emit('paginateMonth', $event)" />

        <table class="v-calendar-month-mob__table calendar">
          <thead>
            <tr class="calendar-header">
              <th v-for="day in daysWeek" :key="day.id">
                <div class="calendar-header__item">{{ day.days_week }}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="calendar-row" v-for="(week, weekIndex) of monthCalendar" :key="weekIndex">
              <td
                @click="$emit('toggleActiveDay', day?.date)"
                v-for="(day, dayIndex) in week"
                :key="dayIndex"
              >
                <div
                  class="calendar-row__item"
                  :class="{ active: day?.date === activeDay }"
                  v-if="day"
                >
                  <div class="calendar-row__item-content calendar-card">
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
              <svg
                class="opacity-50"
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.66663 11.3333L11.3333 4.66663M11.3333 4.66663H4.66663M11.3333 4.66663V11.3333"
                  stroke="#717680"
                  stroke-width="1.67"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <div class="day__content" v-for="lesson in activeDayData.lessons" :key="lesson.id">
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
</template>

<script setup>
import vCalendarMenu from '../calendar/v-calendar-menu.vue';

defineProps({
  daysWeek: Array,
  monthCalendar: Array,
  activeDay: Number,
  activeDayData: Object,
  formatTime: Function,
  getDayOfDate: Function,
  getDateOfDay: Function
})

defineEmits(['paginateMonth', 'toggleActiveDay'])
</script>
