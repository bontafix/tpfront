import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

dayjs.locale('ru')

export function useCalendar(lessons = []) {
  const currentMonth = ref(dayjs().month())
  const currentYear = ref(dayjs().year())

  const daysWeek = ref([
    { id: 1, days_week: 'Пн' },
    { id: 2, days_week: 'Вт' },
    { id: 3, days_week: 'Ср' },
    { id: 4, days_week: 'Чт' },
    { id: 5, days_week: 'Пт' },
    { id: 6, days_week: 'Сб' },
    { id: 7, days_week: 'Вс' }
  ])

  const monthCalendar = ref([])
  const activeDay = ref(null)
  const activeDayData = ref(null)

  // Генерация календаря
  function generateCalendar() {
    const startOfMonth = dayjs(new Date(currentYear.value, currentMonth.value, 1))
    const endOfMonth = startOfMonth.endOf('month')

    const startDay = startOfMonth.day() || 7 // понедельник — первый
    const daysInMonth = endOfMonth.date()

    const weeks = []
    let week = new Array(7).fill(null)
    let dayCounter = 1

    // Первая неделя
    for (let i = startDay - 1; i < 7; i++) {
      week[i] = createDay(dayCounter)
      dayCounter++
    }
    weeks.push(week)

    // Остальные недели
    while (dayCounter <= daysInMonth) {
      week = new Array(7).fill(null)
      for (let i = 0; i < 7 && dayCounter <= daysInMonth; i++) {
        week[i] = createDay(dayCounter)
        dayCounter++
      }
      weeks.push(week)
    }

    monthCalendar.value = weeks
  }

  function createDay(dateNum) {
    const dateISO = getDayOfDate(dateNum)
    return {
      date: dateNum,
      dateISO,
      lessons: lessons.filter(l => dayjs(l.date).format('YYYY-MM-DD') === dateISO)
    }
  }

  // Переключение месяца
  function paginateMonth(direction) {
    if (direction === 'next') {
      if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value++
      } else {
        currentMonth.value++
      }
    } else if (direction === 'prev') {
      if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value--
      } else {
        currentMonth.value--
      }
    }
  }

  // Выбор активного дня
  function toggleActiveDay(dayNum) {
    activeDay.value = dayNum
    activeDayData.value = findDayData(dayNum)
  }

  function findDayData(dayNum) {
    for (const week of monthCalendar.value) {
      for (const day of week) {
        if (day && day.date === dayNum) return day
      }
    }
    return null
  }

  // Форматирование
  function formatTime(time) {
    return dayjs(time, 'HH:mm').format('HH:mm')
  }

  function getDayOfDate(dayNum) {
    return dayjs(new Date(currentYear.value, currentMonth.value, dayNum)).format('YYYY-MM-DD')
  }

  function getDateOfDay(dayNum) {
    return dayjs(new Date(currentYear.value, currentMonth.value, dayNum)).format('DD MMMM')
  }

  // Следим за месяцем/годом и пересоздаём календарь
  watch([currentMonth, currentYear], generateCalendar, { immediate: true })

  return {
    daysWeek,
    monthCalendar,
    activeDay,
    activeDayData,
    currentMonth,
    currentYear,
    generateCalendar,
    paginateMonth,
    toggleActiveDay,
    formatTime,
    getDayOfDate,
    getDateOfDay
  }
}
