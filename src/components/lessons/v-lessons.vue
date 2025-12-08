<template>
  <v-base>
    <section class="v-lessons">
      <div class="container">
        <div class="v-lessons__container layout">
          <div class="v-lessons__header">
            <h1 class="v-lessons__title">Занятия</h1>
            <div class="v-lessons__header-controls">
              <label class="indicators-toggle">
                <input 
                  type="checkbox" 
                  v-model="loadIndicatorsEnabled"
                  @change="onIndicatorsToggle"
                  :disabled="isLoading"
                />
                <span class="indicators-toggle-text">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333C4.3181 1.33333 1.33333 4.3181 1.33333 8C1.33333 11.6819 4.3181 14.6667 8 14.6667Z" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 10.6667V8" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 5.33333H8.00667" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Показывать индикаторы
                </span>
              </label>
            </div>
            <div class="v-lessons__filters">
              <button 
                class="v-lessons__filter-btn"
                :class="{ active: activeFilter === 'prev-month' }"
                :disabled="isLoading"
                @click="setFilter('prev-month')"
              >
                Предыдущий месяц
              </button>
              <button 
                class="v-lessons__filter-btn"
                :class="{ active: activeFilter === 'prev-week' }"
                :disabled="isLoading"
                @click="setFilter('prev-week')"
              >
                Предыдущая неделя
              </button>
              <button 
                class="v-lessons__filter-btn"
                :class="{ active: activeFilter === 'today' }"
                :disabled="isLoading"
                @click="setFilter('today')"
              >
                Сегодня
              </button>
              
              <button 
                class="v-lessons__filter-btn"
                :class="{ active: activeFilter === 'week' }"
                :disabled="isLoading"
                @click="setFilter('week')"
              >
                Текущая неделя
              </button>
              <button 
                class="v-lessons__filter-btn"
                :class="{ active: activeFilter === 'next-week' }"
                :disabled="isLoading"
                @click="setFilter('next-week')"
              >
                Следующая неделя
              </button>
          
              <button 
                class="v-lessons__filter-btn"
                :class="{ active: activeFilter === 'month' }"
                :disabled="isLoading"
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
                  <th class="col-indicators" title="Темы / Проблемы / ДЗ">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333C4.3181 1.33333 1.33333 4.3181 1.33333 8C1.33333 11.6819 4.3181 14.6667 8 14.6667Z" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8 10.6667V8" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8 5.33333H8.00667" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </th>
                  <th class="col-status">Статус</th>
                  <th class="col-actions">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="lesson in lessonsWithIndicators.length > 0 ? lessonsWithIndicators : lessons"
                  :key="lesson.id"
                  :class="{ 
                    completed: lesson.amount_deducted,
                    trial: lesson.trial,
                    cancelled: lesson.cancelled_lesson
                  }"
                >
                  <td class="col-date">{{ formatDateShort(lesson.conducted_date) }}</td>
                  <td class="col-time">{{ lesson.start_time.slice(0, 5) }} - {{ lesson.end_time.slice(0, 5) }}</td>
                  <td class="col-student">{{ lesson.student_name }}</td>
                  <td class="col-indicators">
                    <div class="indicators">
                      <div 
                        v-if="lesson.hasTopics" 
                        class="indicator indicator-topics"
                        :title="`Темы: ${lesson.topicsCount}`"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.66669 14V3.33333C2.66669 2.97971 2.80716 2.64057 3.05721 2.39052C3.30726 2.14048 3.6464 2 4.00002 2H12C12.3536 2 12.6928 2.14048 12.9428 2.39052C13.1929 2.64057 13.3334 2.97971 13.3334 3.33333V14L8.00002 11.3333L2.66669 14Z" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span class="indicator-count">{{ lesson.topicsCount }}</span>
                      </div>
                      <div 
                        v-if="lesson.hasProblems" 
                        class="indicator indicator-problems"
                        :title="`Проблемы: ${lesson.problemsCount}`"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5.33333V8M8 10.6667H8.00667M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.3181 4.3181 1.33333 8 1.33333C11.6819 1.33333 14.6667 4.3181 14.6667 8Z" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span class="indicator-count">{{ lesson.problemsCount }}</span>
                      </div>
                      <div 
                        v-if="lesson.hasHomework" 
                        class="indicator indicator-homework"
                        title="Есть домашнее задание"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 10V13.3333C14 13.687 13.8595 14.0261 13.6095 14.2761C13.3594 14.5262 13.0203 14.6667 12.6667 14.6667H3.33333C2.97971 14.6667 2.64057 14.5262 2.39052 14.2761C2.14048 14.0261 2 13.687 2 13.3333V4C2 3.64638 2.14048 3.30724 2.39052 3.05719C2.64057 2.80714 2.97971 2.66667 3.33333 2.66667H10" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M11.3333 2V5.33333" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M9.66669 3.66667H13" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td class="col-status">
                    <div class="status-badges">
                      <span v-if="lesson.trial" class="badge badge-trial">Пробное</span>
                      <span v-if="lesson.amount_deducted" class="badge badge-completed">Проведено</span>
                      <span v-if="lesson.cancelled_lesson" class="badge badge-cancelled">Отменено</span>
                    </div>
                  </td>
                  <td class="col-actions">
                    <button class="btn-action" @click="openDetailsModal(lesson)" title="Подробнее">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 11.6667C10.9205 11.6667 11.6667 10.9205 11.6667 10C11.6667 9.07953 10.9205 8.33334 10 8.33334C9.07953 8.33334 8.33334 9.07953 8.33334 10C8.33334 10.9205 9.07953 11.6667 10 11.6667Z" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17.5 10C15.4167 13.75 13.0833 15.8333 10 15.8333C6.91667 15.8333 4.58333 13.75 2.5 10C4.58333 6.25 6.91667 4.16667 10 4.16667C13.0833 4.16667 15.4167 6.25 17.5 10Z" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <button class="btn-action" @click="openLessonModal(lesson)" title="Редактировать">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.16666 3.33334H3.33332C2.89129 3.33334 2.46737 3.50894 2.15481 3.8215C1.84225 4.13406 1.66666 4.55798 1.66666 5.00001V16.6667C1.66666 17.1087 1.84225 17.5326 2.15481 17.8452C2.46737 18.1577 2.89129 18.3333 3.33332 18.3333H15C15.442 18.3333 15.8659 18.1577 16.1785 17.8452C16.4911 17.5326 16.6667 17.1087 16.6667 16.6667V10.8333" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M15.4167 2.08332C15.7482 1.75179 16.1978 1.56555 16.6667 1.56555C17.1355 1.56555 17.5852 1.75179 17.9167 2.08332C18.2482 2.41485 18.4344 2.86448 18.4344 3.33332C18.4344 3.80216 18.2482 4.25179 17.9167 4.58332L10 12.5L6.66666 13.3333L7.49999 9.99999L15.4167 2.08332Z" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
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
  <v-lesson-details-modal 
    v-if="showDetailsModal" 
    :lesson="selectedLesson" 
    @close="closeDetailsModal" 
  />
</template>

<script setup>
import { ref, onMounted, useTemplateRef } from 'vue'
import vBase from '../v-base.vue'
import vModalsContainer from '../generalComponents/v-modals-container.vue'
import vLessonDetailsModal from '../modals/v-lesson-details-modal.vue'
import { getTodayLessons, getLessonsOnWeek, getLessonsOnMonth, getLessonsOnDay } from '@/api/lessons'

const activeFilter = ref('today')
const lessons = ref([])
const isLoading = ref(false)
const modalsContainer = useTemplateRef('modalsContainer')
const showDetailsModal = ref(false)
const selectedLesson = ref(null)
const lessonsWithIndicators = ref([])

// Флаг включения/выключения загрузки индикаторов
const loadIndicatorsEnabled = ref(true)

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
  const startTime = performance.now()
  
  try {
    let data = []
    
    console.log('🔄 Начало загрузки занятий для фильтра:', filter)
    const apiStartTime = performance.now()
    
    if (filter === 'today') {
      // Используем тот же API что и для недели, но фильтруем только сегодняшние занятия
      const startDate = getWeekStart(0)
      const allWeekLessons = await getLessonsOnWeek(startDate)
      
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      
      console.log('📅 Фильтруем занятия на сегодня:', todayStr)
      // Фильтруем только занятия на сегодня
      data = allWeekLessons?.filter(lesson => lesson.conducted_date === todayStr) || []
      console.log('📊 Количество занятий на сегодня:', data.length)
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
    } else if (filter === 'prev-month') {
      const today = new Date()
      const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const year = prevMonth.getFullYear()
      const month = prevMonth.getMonth() + 1
      data = await getLessonsOnMonth(year, month)
    }
    
    const apiEndTime = performance.now()
    console.log(`📡 API запрос занял: ${(apiEndTime - apiStartTime).toFixed(0)}ms, получено занятий: ${data?.length || 0}`)
    
    lessons.value = data || []
    
    // Сортируем занятия по дате и времени
    if (lessons.value.length > 0) {
      lessons.value = sortLessonsByDateTime(lessons.value)
    }
    
    // Загружаем индикаторы для каждого занятия (если включено)
    if (loadIndicatorsEnabled.value) {
      const indicatorsStartTime = performance.now()
      await loadIndicators()
      const indicatorsEndTime = performance.now()
      console.log(`🔍 Загрузка индикаторов заняла: ${(indicatorsEndTime - indicatorsStartTime).toFixed(0)}ms`)
    } else {
      console.log('⚠️ Загрузка индикаторов отключена')
      // Создаем массив без индикаторов
      lessonsWithIndicators.value = lessons.value.map(lesson => ({
        ...lesson,
        hasProblems: false,
        problemsCount: 0,
        hasTopics: false,
        topicsCount: 0,
        hasHomework: false
      }))
    }
    
  } catch (error) {
    console.error('Ошибка загрузки занятий:', error)
    lessons.value = []
  } finally {
    isLoading.value = false
    const endTime = performance.now()
    console.log(`✅ Общее время загрузки: ${(endTime - startTime).toFixed(0)}ms`)
  }
}

const loadIndicators = async () => {
  const { getLessonProblems, getLessonTopics, getLessonHomeWork } = await import('@/api/requests')
  
  console.log(`🔄 Загрузка индикаторов для ${lessons.value.length} занятий...`)
  const indicatorsStartTime = performance.now()
  
  lessonsWithIndicators.value = await Promise.all(
    lessons.value.map(async (lesson, index) => {
      const lessonStartTime = performance.now()
      try {
        const [problems, topics, homework] = await Promise.all([
          getLessonProblems(lesson.id).catch(() => []),
          getLessonTopics(lesson.id).catch(() => []),
          getLessonHomeWork(lesson.id).catch(() => null)
        ])
        
        const lessonEndTime = performance.now()
        if (index < 3) { // Логируем только первые 3 для примера
          console.log(`  - Занятие ${lesson.id}: ${(lessonEndTime - lessonStartTime).toFixed(0)}ms`)
        }
        
        // Проверяем, есть ли реально домашнее задание (description или files)
        const hasRealHomework = homework && (
          (homework.description && homework.description.trim() !== '') ||
          (homework.files && Array.isArray(homework.files) && homework.files.length > 0)
        )
        
        return {
          ...lesson,
          hasProblems: Array.isArray(problems) && problems.length > 0,
          problemsCount: Array.isArray(problems) ? problems.length : 0,
          hasTopics: Array.isArray(topics) && topics.length > 0,
          topicsCount: Array.isArray(topics) ? topics.length : 0,
          hasHomework: hasRealHomework
        }
      } catch (error) {
        return {
          ...lesson,
          hasProblems: false,
          problemsCount: 0,
          hasTopics: false,
          topicsCount: 0,
          hasHomework: false
        }
      }
    })
  )
  
  const indicatorsEndTime = performance.now()
  console.log(`✅ Все индикаторы загружены за: ${(indicatorsEndTime - indicatorsStartTime).toFixed(0)}ms`)
}

const setFilter = (filter) => {
  // Не позволяем переключать фильтр пока идет загрузка
  if (isLoading.value) {
    console.warn('⚠️ Загрузка данных еще не завершена, подождите...')
    return
  }
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

const openDetailsModal = (lesson) => {
  selectedLesson.value = lesson
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedLesson.value = null
}

const onIndicatorsToggle = () => {
  console.log('🔄 Индикаторы', loadIndicatorsEnabled.value ? 'включены' : 'отключены')
  // Перезагружаем текущий фильтр
  if (lessons.value.length > 0 && !isLoading.value) {
    loadLessons(activeFilter.value)
  }
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

  &__header-controls {
    display: flex;
    align-items: center;
    gap: 16px;
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
    width: 100%;
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

    &:hover:not(:disabled) {
      border-color: var(--blue);
      color: var(--blue);
    }

    &.active {
      background: var(--blue);
      border-color: var(--blue);
      color: var(--white);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
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

    .col-indicators {
      width: 120px;
      text-align: center;

      svg {
        vertical-align: middle;
      }
    }

    .col-actions {
      width: 100px;
      text-align: right;
      white-space: nowrap;
    }
  }
}

.indicators {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;

  &-topics {
    background: #dbeafe;
    color: var(--blue);

    &:hover {
      background: #bfdbfe;
    }
  }

  &-problems {
    background: #fee2e2;
    color: #ef4444;

    &:hover {
      background: #fecaca;
    }
  }

  &-homework {
    background: #e0e7ff;
    color: #6366f1;

    &:hover {
      background: #c7d2fe;
    }
  }

  svg {
    flex-shrink: 0;
  }
}

.indicator-count {
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: var(--custom-dark-gray);
  cursor: pointer;
  transition: all 0.2s ease;
  vertical-align: middle;

  &:not(:last-child) {
    margin-right: 8px;
  }

  svg {
    flex-shrink: 0;
  }

  &:hover {
    background: #e5e7eb;
    color: var(--blue);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
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

.indicators-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f9fafb;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--blue);
  }

  &-text {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
    color: var(--custom-dark-gray);

    svg {
      color: var(--blue);
    }
  }

  input:disabled {
    cursor: not-allowed;
    opacity: 0.5;
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
      gap: 12px;
    }

    &__header-controls {
      width: 100%;
      justify-content: flex-start;
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

      .col-indicators {
        width: 100px;
      }

      .col-actions {
        width: 90px;
      }
    }
  }

  .indicators {
    gap: 4px;
    flex-wrap: wrap;
  }

  .indicator {
    padding: 3px 6px;
    font-size: 11px;

    svg {
      width: 14px;
      height: 14px;
    }
  }

  .indicator-count {
    min-width: 14px;
  }

  .badge {
    padding: 3px 8px;
    font-size: 10px;
  }

  .btn-action {
    width: 32px;
    height: 32px;

    &:not(:last-child) {
      margin-right: 6px;
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }
}
</style>
