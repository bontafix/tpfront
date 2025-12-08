// store/modalsStore.js
import { getLessonsOnDay, getTodayLessons } from '@/api/lessons'
import { formatDate } from '@/utils'
import { defineStore } from 'pinia'

export const useLessonStore = defineStore('lesonStore', {
  state: () => ({
    todayLessons: null,
    dayLessons: {
      yesterday: null,
      today: null,
      tomorrow: null
    },
    oneTimeLesson: [],
    day : 'today'
  }),
  getters: {
  },
  actions: {
    async fetchTodayLessons(day='today') {
      if(this.$state.dayLessons[day] === null || day !== this.$state.day) {
        console.log('Деалем запрос на ', day)
        let response = null
        try {
          if(day !== 'today') {
            const dateOfDay = new Date()
            const formattedDate = day === 'yesterday'
                                  ? new Date(dateOfDay.setDate(dateOfDay.getDate() - 1))
                                  : new Date(dateOfDay.setDate(dateOfDay.getDate() + 1))

            response = await getLessonsOnDay(formatDate(formattedDate))
          } else {
            response = await getTodayLessons()
          }

          if(response && response.lessons) {
            this.$state.dayLessons[day] = response
          } else if(response) {
            // Если ответ есть, но нет поля lessons, создаем структуру с пустым массивом
            this.$state.dayLessons[day] = { lessons: [] }
          }
        } catch (error) {
          console.error('Ошибка при получении уроков:', error)
          this.$state.dayLessons[day] = { lessons: [] }
        }
      }
    },
    setOneTimeLesson(lesson) {
      this.$state.oneTimeLesson = [lesson]
    }
  },
})
