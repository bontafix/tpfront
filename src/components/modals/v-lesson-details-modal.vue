<template>
  <transition name="fade">
    <div class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">Детали занятия</h2>
          <button class="modal-close" @click="closeModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="modal-body" v-if="!isLoading">
          <div class="lesson-info">
            <div class="info-row">
              <div class="info-label">Ученик:</div>
              <div class="info-value">{{ lesson.student_name }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Дата:</div>
              <div class="info-value">{{ formatDate(lesson.conducted_date) }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Время:</div>
              <div class="info-value">{{ lesson.start_time.slice(0, 5) }} - {{ lesson.end_time.slice(0, 5) }}</div>
            </div>
            <div class="info-row" v-if="lesson.trial || lesson.amount_deducted || lesson.cancelled_lesson">
              <div class="info-label">Статус:</div>
              <div class="info-value">
                <div class="status-badges">
                  <span v-if="lesson.trial" class="badge badge-trial">Пробное</span>
                  <span v-if="lesson.amount_deducted" class="badge badge-completed">Проведено</span>
                  <span v-if="lesson.cancelled_lesson" class="badge badge-cancelled">Отменено</span>
                </div>
              </div>
            </div>
          </div>

          <div class="lesson-section" v-if="previousProblems.length > 0">
            <h3 class="section-title">Проблемы прошлого занятия</h3>
            <ul class="items-list problems-list">
              <li v-for="problem in previousProblems" :key="problem.id" class="item-card problem-card">
                <div class="item-icon problem-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 6.66667V10M10 13.3333H10.0083M18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10Z" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="item-text">{{ problem.problem_text }}</span>
              </li>
            </ul>
          </div>

          <div class="lesson-section" v-if="topics.length > 0">
            <h3 class="section-title">Темы занятия</h3>
            <ul class="items-list topics-list">
              <li v-for="topic in topics" :key="topic.id" class="item-card topic-card">
                <div class="item-icon topic-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.33331 17.5V4.16667C3.33331 3.72464 3.50889 3.30072 3.82145 2.98816C4.13402 2.67559 4.55795 2.5 4.99998 2.5H15C15.442 2.5 15.8659 2.67559 16.1785 2.98816C16.4911 3.30072 16.6666 3.72464 16.6666 4.16667V17.5L9.99998 14.1667L3.33331 17.5Z" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="item-text">{{ topic.name }}</span>
              </li>
            </ul>
          </div>

          <div class="lesson-section" v-if="problems.length > 0">
            <h3 class="section-title">Проблемы текущего занятия</h3>
            <ul class="items-list problems-list">
              <li v-for="problem in problems" :key="problem.id" class="item-card problem-card">
                <div class="item-icon problem-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 6.66667V10M10 13.3333H10.0083M18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10Z" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="item-text">{{ problem.problem_text }}</span>
              </li>
            </ul>
          </div>

          <div class="lesson-section" v-if="hasHomeworkContent">
            <h3 class="section-title">Домашнее задание</h3>
            <div class="homework-content">
              <div class="homework-text" v-if="homework.description && homework.description.trim()">
                {{ homework.description }}
              </div>
              <div class="homework-files" v-if="homework.files && homework.files.length > 0">
                <h4 class="homework-files-title">Файлы:</h4>
                <ul class="files-list">
                  <li v-for="file in homework.files" :key="file.id" class="file-item">
                    <a :href="file.url" target="_blank" class="file-link">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M11.3333 5.33333L8 2M8 2L4.66667 5.33333M8 2V10" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      {{ file.name || 'Файл' }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="empty-state" v-if="!hasAnyData">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 58.6667C46.7276 58.6667 58.6667 46.7276 58.6667 32C58.6667 17.2724 46.7276 5.33334 32 5.33334C17.2724 5.33334 5.33334 17.2724 5.33334 32C5.33334 46.7276 17.2724 58.6667 32 58.6667Z" stroke="#9CA3AF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M32 21.3333V32" stroke="#9CA3AF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M32 42.6667H32.0267" stroke="#9CA3AF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>Данные о занятии отсутствуют</p>
          </div>
        </div>

        <div class="modal-body" v-else>
          <div class="loader-container">
            <div class="loader"></div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { 
  getLessonTopics, 
  getLessonProblems, 
  getLessonHomeWork, 
  getPreviousProblems 
} from '@/api/requests'

const props = defineProps({
  lesson: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const isLoading = ref(true)
const topics = ref([])
const problems = ref([])
const previousProblems = ref([])
const homework = ref(null)

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
  const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  
  const dayName = dayNames[date.getDay()]
  const day = date.getDate()
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  
  return `${dayName}, ${day} ${month} ${year}`
}

const hasHomeworkContent = computed(() => {
  return homework.value && (
    (homework.value.description && homework.value.description.trim() !== '') ||
    (homework.value.files && Array.isArray(homework.value.files) && homework.value.files.length > 0)
  )
})

const hasAnyData = computed(() => {
  return topics.value.length > 0 || 
         problems.value.length > 0 || 
         previousProblems.value.length > 0 || 
         hasHomeworkContent.value
})

const closeModal = () => {
  emit('close')
}

const loadLessonData = async () => {
  isLoading.value = true
  
  try {
    const lessonId = props.lesson.id
    
    // Загружаем все данные параллельно
    const [topicsData, problemsData, previousProblemsData, homeworkData] = await Promise.all([
      getLessonTopics(lessonId),
      getLessonProblems(lessonId),
      getPreviousProblems(lessonId),
      getLessonHomeWork(lessonId)
    ])
    
    topics.value = Array.isArray(topicsData) ? topicsData : []
    problems.value = Array.isArray(problemsData) ? problemsData : []
    previousProblems.value = Array.isArray(previousProblemsData) ? previousProblemsData : []
    homework.value = homeworkData || null
  } catch (error) {
    console.error('Ошибка загрузки данных занятия:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadLessonData()
})
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}

.modal-container {
  background: var(--white);
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid var(--grey-dark);
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--custom-dark-gray);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--custom-dark-gray);
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: var(--blue);
  }
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.lesson-info {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;

  &:not(:last-child) {
    border-bottom: 1px solid #e5e7eb;
  }
}

.info-label {
  font-weight: 600;
  color: var(--custom-dark-gray);
  min-width: 100px;
}

.info-value {
  color: var(--custom-dark-gray);
  flex: 1;
}

.lesson-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--custom-dark-gray);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.item-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: var(--white);
  border: 2px solid var(--grey-dark);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.item-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topic-icon {
  background: #dbeafe;
  color: var(--blue);
}

.problem-icon {
  background: #fee2e2;
  color: #ef4444;
}

.item-text {
  flex: 1;
  color: var(--custom-dark-gray);
  line-height: 1.6;
  padding-top: 4px;
}

.homework-content {
  background: var(--white);
  border: 2px solid var(--grey-dark);
  border-radius: 12px;
  padding: 16px;
}

.homework-text {
  color: var(--custom-dark-gray);
  line-height: 1.6;
  margin-bottom: 16px;
  white-space: pre-wrap;
}

.homework-files-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--custom-dark-gray);
  margin: 0 0 12px 0;
}

.files-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  color: var(--blue);
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover {
    background: #eff6ff;
    transform: translateX(2px);
  }

  svg {
    flex-shrink: 0;
  }
}

.status-badges {
  display: flex;
  gap: 8px;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #9CA3AF;
  text-align: center;

  svg {
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    margin: 0;
  }
}

.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top-color: var(--blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .info-label {
    min-width: auto;
    font-size: 14px;
  }
}
</style>
