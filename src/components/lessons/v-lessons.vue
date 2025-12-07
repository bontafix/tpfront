<template>
  <v-base>
    <section class="v-lessons">
      <div class="container">
        <div class="v-lessons__container layout">
          <div class="v-lessons__header">
            <h1 class="v-lessons__title">Занятия</h1>
            <div class="v-lessons__filters">
              <button 
                class="v-lessons__filter-btn"
                :class="{ active: activeFilter === 'today' }"
                @click="setFilter('today')"
              >
                Сегодня
              </button>
              <button 
                class="v-lessons__filter-btn"
                :class="{ active: activeFilter === 'prev-week' }"
                @click="setFilter('prev-week')"
              >
                Предыдущая неделя
              </button>
              <button 
                class="v-lessons__filter-btn"
                :class="{ active: activeFilter === 'week' }"
                @click="setFilter('week')"
              >
                Текущая неделя
              </button>
              <button 
                class="v-lessons__filter-btn"
                :class="{ active: activeFilter === 'next-week' }"
                @click="setFilter('next-week')"
              >
                Следующая неделя
              </button>
              <button 
                class="v-lessons__filter-btn"
                :class="{ active: activeFilter === 'month' }"
                @click="setFilter('month')"
              >
                Текущий месяц
              </button>
            </div>
          </div>

          <div class="loader-container" v-if="isLoading">
            <div class="loader"></div>
          </div>

          <div class="v-lessons__empty" v-if="!isLoading && lessons.length === 0">
            <h2 class="text-title text-blue">Занятий не найдено</h2>
            <p class="text-subtitle">На выбранный период занятия не запланированы</p>
          </div>

          <div class="v-lessons__table-wrapper" v-if="!isLoading && lessons.length > 0">
            <table class="v-lessons__table">
              <thead>
                <tr>
                  <th class="col-date">Дата</th>
                  <th class="col-time">Время</th>
                  <th class="col-student">Ученик</th>
                  <th class="col-status">Статус</th>
                  <th class="col-action"></th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="lesson in lessons"
                  :key="lesson.id"
                  @click="openLessonModal(lesson)"
                  :class="{ 
                    completed: lesson.amount_deducted,
                    trial: lesson.trial,
                    cancelled: lesson.cancelled_lesson
                  }"
                >
                  <td class="col-date">{{ formatDateShort(lesson.conducted_date) }}</td>
                  <td class="col-time">{{ lesson.start_time.slice(0, 5) }} - {{ lesson.end_time.slice(0, 5) }}</td>
                  <td class="col-student">{{ lesson.student_name }}</td>
                  <td class="col-status">
                    <div class="status-badges">
                      <span v-if="lesson.trial" class="badge badge-trial">Пробное</span>
                      <span v-if="lesson.amount_deducted" class="badge badge-completed">Проведено</span>
                      <span v-if="lesson.cancelled_lesson" class="badge badge-cancelled">Отменено</span>
                    </div>
                  </td>
                  <td class="col-action">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </v-base>
  <v-modals-container ref="modalsContainer" />
</template>

<script setup>
import { ref, onMounted, useTemplateRef } from 'vue'
import vBase from '../v-base.vue'
import vModalsContainer from '../generalComponents/v-modals-container.vue'
import { getTodayLessons, getLessonsOnWeek, getLessonsOnMonth } from '@/api/requests'

const activeFilter = ref('today')
const lessons = ref([])
const isLoading = ref(false)
const modalsContainer = useTemplateRef('modalsContainer')

const formatDateShort = (dateStr) => {
  const date = new Date(dateStr)
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  
  const dayName = dayNames[date.getDay()]
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  
  return `${dayName}, ${day}.${month}`
}

const getWeekStart = (weekOffset = 0) => {
  const today = new Date()
  const day = today.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff + (weekOffset * 7))
  
  const dd = String(monday.getDate()).padStart(2, '0')
  const mm = String(monday.getMonth() + 1).padStart(2, '0')
  const yyyy = monday.getFullYear()
  
  return `${dd}.${mm}.${yyyy}`
}

const sortLessonsByDateTime = (lessonsArray) => {
  return lessonsArray.sort((a, b) => {
    const dateCompare = new Date(a.conducted_date) - new Date(b.conducted_date)
    if (dateCompare !== 0) return dateCompare
    
    const timeA = a.start_time.split(':').map(Number)
    const timeB = b.start_time.split(':').map(Number)
    const minutesA = timeA[0] * 60 + timeA[1]
    const minutesB = timeB[0] * 60 + timeB[1]
    return minutesA - minutesB
  })
}

const loadLessons = async (filter) => {
  isLoading.value = true
  try {
    let data = []
    
    if (filter === 'today') {
      data = await getTodayLessons()
    } else if (filter === 'week') {
      const startDate = getWeekStart(0)
      data = await getLessonsOnWeek(startDate)
    } else if (filter === 'prev-week') {
      const startDate = getWeekStart(-1)
      data = await getLessonsOnWeek(startDate)
    } else if (filter === 'next-week') {
      const startDate = getWeekStart(1)
      data = await getLessonsOnWeek(startDate)
    } else if (filter === 'month') {
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth() + 1
      data = await getLessonsOnMonth(year, month)
    }
    
    lessons.value = data || []
    
    // Сортируем занятия по дате и времени
    if (lessons.value.length > 0) {
      lessons.value = sortLessonsByDateTime(lessons.value)
    }
  } catch (error) {
    console.error('Ошибка загрузки занятий:', error)
    lessons.value = []
  } finally {
    isLoading.value = false
  }
}

const setFilter = (filter) => {
  activeFilter.value = filter
  loadLessons(filter)
}

const openLessonModal = (lesson) => {
  const date = lesson.conducted_date
  const formattedDate = typeof date === 'string' && date.includes('-')
    ? date.split('-').reverse().join('.')
    : date
  modalsContainer.value.toggleLessonModals('buttons', {...lesson, conducted_date: formattedDate})
}

onMounted(() => {
  loadLessons('today')
  localStorage.setItem('activePage', 'lessons')
})
</script>

<style lang="scss" scoped>
.v-lessons {
  padding: 40px 0;
  min-height: calc(100vh - 80px);

  &__container {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  &__title {
    font-size: 32px;
    font-weight: 600;
    color: var(--custom-dark-gray);
    margin: 0;
  }

  &__filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__filter-btn {
    padding: 10px 16px;
    border: 2px solid var(--grey-dark);
    border-radius: 8px;
    background: var(--white);
    color: var(--custom-dark-gray);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;

    &:hover {
      border-color: var(--blue);
      color: var(--blue);
    }

    &.active {
      background: var(--blue);
      border-color: var(--blue);
      color: var(--white);
    }
  }

  &__empty {
    text-align: center;
    padding: 60px 20px;

    .text-title {
      margin-bottom: 12px;
    }

    .text-subtitle {
      color: var(--custom-dark-gray);
      opacity: 0.7;
    }
  }

  &__table-wrapper {
    overflow-x: auto;
    border-radius: 12px;
    border: 2px solid var(--grey-dark);
    background: var(--white);
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    thead {
      background: #f9fafb;
      border-bottom: 2px solid var(--grey-dark);
      
      th {
        padding: 12px 16px;
        text-align: left;
        font-weight: 600;
        color: var(--custom-dark-gray);
        text-transform: uppercase;
        font-size: 12px;
        letter-spacing: 0.5px;
        white-space: nowrap;
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid #e5e7eb;
        cursor: pointer;
        transition: all 0.2s ease;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: #f9fafb;
        }

        &.completed {
          background: #f0fdf4;
          
          &:hover {
            background: #dcfce7;
          }
        }

        &.trial {
          background: #fef3c7;
          
          &:hover {
            background: #fef08a;
          }
        }

        &.cancelled {
          opacity: 0.6;
          background: #f3f4f6;
          
          &:hover {
            background: #e5e7eb;
          }
        }
      }

      td {
        padding: 14px 16px;
        color: var(--custom-dark-gray);
        vertical-align: middle;
      }
    }

    .col-date {
      width: 120px;
      font-weight: 500;
    }

    .col-time {
      width: 140px;
      font-weight: 500;
    }

    .col-student {
      min-width: 200px;
      font-weight: 600;
    }

    .col-status {
      width: 200px;
    }

    .col-action {
      width: 50px;
      text-align: center;
      color: var(--custom-dark-gray);
      opacity: 0.4;

      svg {
        transition: all 0.2s ease;
      }

      tr:hover & {
        opacity: 1;
        
        svg {
          transform: translateX(3px);
        }
      }
    }
  }
}

.status-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;

  &-trial {
    background: #fbbf24;
    color: #78350f;
  }

  &-completed {
    background: #86efac;
    color: #14532d;
  }

  &-cancelled {
    background: #e5e7eb;
    color: #374151;
  }
}

.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

@media (max-width: 1024px) {
  .v-lessons {
    &__table {
      .col-date {
        width: 100px;
      }

      .col-time {
        width: 120px;
      }

      .col-student {
        min-width: 150px;
      }

      .col-status {
        width: 150px;
      }
    }
  }
}

@media (max-width: 768px) {
  .v-lessons {
    padding: 20px 0;

    &__header {
      flex-direction: column;
      align-items: flex-start;
    }

    &__title {
      font-size: 24px;
    }

    &__filters {
      width: 100%;
      gap: 6px;

      button {
        flex: 1;
        min-width: 0;
        padding: 8px 10px;
        font-size: 11px;
      }
    }

    &__table-wrapper {
      border-radius: 8px;
    }

    &__table {
      font-size: 12px;

      thead th {
        padding: 10px 12px;
        font-size: 11px;
      }

      tbody td {
        padding: 12px;
      }

      .col-date {
        width: 80px;
      }

      .col-time {
        width: 100px;
      }

      .col-student {
        min-width: 120px;
      }

      .col-status {
        width: auto;
      }

      .col-action {
        width: 40px;
      }
    }
  }

  .badge {
    padding: 3px 8px;
    font-size: 10px;
  }
}
</style>
