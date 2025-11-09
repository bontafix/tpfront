<template>
  <div class="v-student-cabinet-swiper">
    <div class="flex gap-3 items-center v-student-cabinet-swiper__buttons">
      <template v-for="type in ['rotate-180', '']" :key="type">
        <div
          :class="`${type} custom-swiper-button day-el student-swiper-button-${type.length ? 'prev' : 'next'}`"
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="39.5"
              y="0.5"
              width="39"
              height="39"
              rx="19.5"
              transform="rotate(90 39.5 0.5)"
              fill="#F3F4F6"
            />
            <rect
              x="39.5"
              y="0.5"
              width="39"
              height="39"
              rx="19.5"
              transform="rotate(90 39.5 0.5)"
              stroke="#F3F4F6"
            />
            <path
              d="M15.7578 20.0001H24.2427M24.2427 20.0001L20.0003 15.7577M24.2427 20.0001L20.0003 24.2425"
              stroke="#717680"
              stroke-width="1.85556"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div
          :class="`${type} custom-swiper-button night-el student-swiper-button-${type.length ? 'prev' : 'next'}`"
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="40"
              width="40"
              height="40"
              rx="20"
              transform="rotate(90 40 0)"
              fill="white"
              fill-opacity="0.08"
            />
            <path
              d="M15.7573 20.0001H24.2422M24.2422 20.0001L19.9998 15.7577M24.2422 20.0001L19.9998 24.2425"
              stroke="#E9EAEB"
              stroke-width="1.85556"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </template>
    </div>
    <!-- Добавим отладочную информацию -->
    <div v-if="debug" class="debug-info mb-4 p-2 bg-gray-100 rounded">
      <p>Student ID: {{ props.profile?.id }}</p>
      <p>Lessons count: {{ lessons.length }}</p>
      <p>Loading: {{ isLoading }}</p>
      <p>Current lesson index: {{ currentLessonIndex }}</p>
      <p>Current page: {{ currentPage }}</p>
      <p>Current homework ID: {{ currentHomework?.id || 'None' }}</p>
      <p>Answer files count: {{ answer.length }}</p>
      <p>Cache status: {{ cacheStatus }}</p>
      <button
        @click="() => clearCache(props.profile?.id)"
        class="mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded"
      >
        Clear Cache
      </button>
      <button
        @click="refreshData"
        class="mt-2 ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
      >
        Refresh
      </button>
    </div>
    <!-- Показываем лоадер если данные загружаются -->
    <div v-if="isLoading && lessons.length === 0" class="text-center py-8">
      <p>Загрузка уроков...</p>
    </div>
    <!-- Показываем сообщение если нет уроков -->
    <div v-else-if="lessons.length === 0" class="text-center py-8">
      <p>Уроки не найдены</p>
    </div>
    <!-- Swiper только если есть уроки -->
    <template v-else>
      <swiper
        class="v-student-cabinet-swiper__prev-row"
        ref="swiperRef"
        @swiper="onSwiper"
        @slide-change="onSlideChange"
        v-bind="swiperOptions"
        :modules="modules"
      >
        <swiper-slide
          class="v-student-cabinet-swiper__prev-item lesson-swiper"
          v-for="lesson in lessons"
          :key="lesson.id"
        >
          <div class="lesson-swiper__content">
            <h3 class="lesson-swiper__date">Занятие от {{ formatDate(lesson.date) }}</h3>
            <div class="lesson-swiper__info">
              <div class="lesson-swiper__info-row">
                <h4 class="lesson-swiper__title">Темы</h4>
                <div class="lesson-swiper__block">
                  <template v-if="lesson.topics && lesson.topics.length">
                    <div
                      class="lesson-swiper__theme theme"
                      @click="() => openModal('themes', lesson.id)"
                      v-for="theme in lesson.topics"
                      :key="theme.id"
                    >
                      <span class="theme__title">{{ theme.name }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="theme" @click="openModal('themes', lesson.id)">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M0 5H5V0H7V5H12V7H7V12H5V7H0V5Z" fill="#1d4ecc" />
                      </svg>
                      <span class="theme__title"> Добавить тему</span>
                    </div>
                  </template>
                </div>
              </div>
              <div class="lesson-swiper__info-row">
                <h4 class="lesson-swiper__title">Заметки преподавателя</h4>
                <div class="lesson-swiper__block lesson-swiper__col start">
                  <template v-if="lesson.problems && lesson.problems.length">
                    <p
                      v-for="problem in lesson.problems"
                      :key="problem.id || problem"
                      class="lesson-swiper__subtitle"
                    >
                      {{ problem.problem_text }}.
                    </p>
                  </template>
                  <template v-else>
                    <p class="lesson-swiper__subtitle">Проблемы не найдены</p>
                  </template>
                </div>
              </div>
              <div class="lesson-swiper__info-row">
                <h4 class="lesson-swiper__title">Прикреплённое ДЗ</h4>
                <div
                  class="lesson-swiper__block col"
                  v-if="lesson.homeworks && lesson.homeworks.length"
                >
                  <p class="lesson-swiper__subtitle">{{ lesson.homeworks[0].title }}</p>
                  <p
                    class="lesson-swiper__subtitle"
                    :class="getDeadlineClass(lesson.homeworks[0].due_date)"
                  >
                    Дедлайн {{ formatDate(lesson.homeworks[0].due_date) }}
                  </p>
                  <div class="lesson-swiper__homework">
                    <v-files-handler
                      :model-value="transformedFiles(lesson.homeworks[0].files)"
                      :deletable="false"
                    />
                    <button
                      class="lesson-swiper__button custom-btn blue"
                      @click="loadAnswer(lesson.homeworks[0].id)"
                      v-if="!getStudentFilesAnswer(lesson).length"
                      й
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.6667 1.66669H5.00004C4.55801 1.66669 4.13409 1.84228 3.82153 2.15484C3.50897 2.4674 3.33337 2.89133 3.33337 3.33335V16.6667C3.33337 17.1087 3.50897 17.5326 3.82153 17.8452C4.13409 18.1578 4.55801 18.3334 5.00004 18.3334H15C15.4421 18.3334 15.866 18.1578 16.1786 17.8452C16.4911 17.5326 16.6667 17.1087 16.6667 16.6667V6.66669M11.6667 1.66669L16.6667 6.66669M11.6667 1.66669V6.66669H16.6667M10 15V10M7.50004 12.5H12.5"
                          stroke="white"
                          stroke-width="1.67"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      Загрузить ответ
                    </button>
                  </div>
                </div>
              </div>
              <div class="lesson-swiper__info-row" v-if="getStudentFilesAnswer(lesson).length">
                <h4 class="lesson-swiper__title">Ваш ответ</h4>
                <div class="lesson-swiper__block lesson-swiper__answer nowrap">
                  <v-files-handler
                    :model-value="getStudentFilesAnswer(lesson)"
                    :deletable="false"
                  />
                  <img
                    src="/src/assets/images/pen.svg"
                    alt=""
                    @click="editHomework(lesson.homeworks[0].id)"
                  />
                </div>
              </div>
              <div class="lesson-swiper__info-row" v-if="getStudentSubmissions(lesson)">
                <h4 class="lesson-swiper__title">Оценка</h4>
                <div class="lesson-swiper__block lesson-swiper__answer">
                  <div
                    class="status"
                    :class="{
                      green: getStudentSubmissions(lesson).grade >= 4,
                      red: getStudentSubmissions(lesson).grade < 4,
                    }"
                  >
                    {{ getStudentSubmissions(lesson).grade || 'Без оценки' }}
                  </div>
                  {{ getStudentSubmissions(lesson).feedback }}
                </div>
              </div>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </template>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch, computed } from 'vue'
import {
  getStudentFutureLessons,
  getStudentLastLessons,
  getLessonProblems,
  getLessonTopics,
  getStudentLessons,
  getStudnetSource,
} from '@/api/requests'
import { formatDate, domain, domainDownload } from '@/utils'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import VFilesHandler from '../generalComponents/v-files-handler.vue'

// Глобальные кэши для хранения данных и состояний по studentId
const lessonsCache = new Map()
const studentStatesCache = new Map()

// Props
const props = defineProps({
  studentId: {
    type: [String, Number],
    required: true,
  },
  debug: {
    type: Boolean,
    default: false,
  },
  profile: {
    type: Object,
    default: () => ({}),
  },
  answer: {
    type: Array,
    default: () => [],
  },
  currentHomeworkId: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['add-topic', 'toggleModal', 'current-homework-changed'])

const lessons = ref([])
const swiperRef = ref(null)
const isLoading = ref(false)
const currentLessonIndex = ref(4)
const currentPage = ref(1)

// Swiper setup
const modules = [Navigation]
let swiperInstance = null
let previousIndex = 0

const swiperOptions = {
  slidesPerView: 3,
  spaceBetween: 20,
  direction: 'horizontal',
  initialSlide: currentLessonIndex.value,
  navigation: {
    nextEl: '.student-swiper-button-next',
    prevEl: '.student-swiper-button-prev',
  },
  breakpoints: {
    300: { slidesPerView: 1, spaceBetween: 15 },
  },
}

// Вычисляемое свойство для текущего ДЗ
const currentHomework = computed(() => {
  const currentLesson = lessons.value[currentLessonIndex.value]
  return currentLesson?.homeworks?.[0] || null
})

// Статус кэша для отладки
const cacheStatus = computed(() => {
  const studentId = props.profile?.id
  if (!studentId) return 'No student ID'
  const cached = lessonsCache.has(`${studentId}_page_1`)
  const state = studentStatesCache.has(studentId)
  return `Data: ${cached ? 'Cached' : 'Not cached'}, State: ${state ? 'Cached' : 'Not cached'}`
})

// Следим за изменением текущего ДЗ
watch(
  currentHomework,
  (newHomework) => {
    const currentLesson = lessons.value[currentLessonIndex.value]
    emit('current-homework-changed', newHomework?.id || null, currentLesson)
  },
  { immediate: true },
)

// Utils
const log = (...args) => props.debug && console.log('[LessonsSwiper]', ...args)

// Cache utilities
function getCacheKey(studentId, page = 1) {
  return `${studentId}_page_${page}`
}

function getCachedData(studentId, page = 1) {
  const key = getCacheKey(studentId, page)
  const cached = lessonsCache.get(key)
  if (cached) {
    log('Cache hit for:', key, cached)
  }
  return cached
}

function setCachedData(studentId, page, data) {
  const key = getCacheKey(studentId, page)
  lessonsCache.set(key, {
    data: JSON.parse(JSON.stringify(data)), // Deep copy для избежания мутаций
    timestamp: Date.now(),
  })
  log('Cached data for:', key)
}

function isCacheValid(cachedItem, maxAge = 5 * 60 * 1000) {
  // 5 минут по умолчанию
  if (!cachedItem) return false
  return Date.now() - cachedItem.timestamp < maxAge
}

// Функции для работы с состоянием студента
function getStudentState(studentId) {
  return (
    studentStatesCache.get(studentId) || {
      currentPage: 1,
      currentLessonIndex: 4,
      lessons: [],
      initialized: false,
    }
  )
}

function setStudentState(studentId, state) {
  studentStatesCache.set(studentId, {
    ...getStudentState(studentId),
    ...state,
    timestamp: Date.now(),
  })
  log('Cached state for student:', studentId, state)
}

function clearCache(studentId = null) {
  if (studentId) {
    // Очищаем кэш для конкретного студента
    const keysToDelete = []
    for (const key of lessonsCache.keys()) {
      if (key.startsWith(`${studentId}_`)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach((key) => lessonsCache.delete(key))
    studentStatesCache.delete(studentId)
    log('Cleared cache for student:', studentId)
  } else {
    // Очищаем весь кэш
    lessonsCache.clear()
    studentStatesCache.clear()
    log('Cleared all cache')
  }
}

// Methods
function openModal(modal, lessonId) {
  emit('add-topic', modal, lessonId)
}

function loadAnswer(homeworkId) {
  // Устанавливаем текущее ДЗ перед открытием модального окна
  const currentLesson = lessons.value[currentLessonIndex.value]
  emit('current-homework-changed', homeworkId, currentLesson)
  emit('toggleModal', 'answerHomework')
}

function editHomework(homeworkId) {
  // Устанавливаем текущее ДЗ перед открытием модального окна редактирования
  const currentLesson = lessons.value[currentLessonIndex.value]
  emit('current-homework-changed', homeworkId, currentLesson)
  emit('toggleModal', 'editHomework')
}

function transformedFiles(files) {
  if (!files) return []
  return files.map((file) => ({
    id: file.id,
    name: file.file_url.split('/').pop(), // Извлекаем имя файла из URL TODO - имя фала надо хранить при загрузке в БД
    size: 0, // Размер будет получен асинхронно компонентом
    file: `${domain}${file.token_file_url}`, // URL файла
  }))
}

function transformedAnswers(files) {
  if (!files) return []
  return files.map((file) => ({
    id: file.id,
    name: file.file_name, //TODO - имя фала надо хранить при загрузке в БД
    size: file.file_size,
    file: `${domain}${file.token_file_url}`,
  }))
}

// Функция для получения ответов студента для конкретного урока
function getStudentFilesAnswer(lesson) {
  if (lesson.homeworks && lesson.homeworks[0]) {
    const homework = lesson.homeworks[0]
    if (
      props.answer &&
      props.answer.length > 0 &&
      props.currentHomeworkId &&
      homework.id == props.currentHomeworkId
    ) {
      log('Returning props.answer for homework:', homework.id, props.answer)
      return props.answer.map((item) => ({
        id: item.id,
        name: item.name,
        size: item.size,
        file: `${domain}${item.token_file_url}`,
      }))
    }
    if (homework.student_answers && homework.student_answers.length > 0) {
      log('Returning saved answers for homework:', homework.id, homework.student_answers)
      return transformedAnswers(homework.student_answers)
    }
  }
  return []
}

function getStudentSubmissions(lesson) {
  if (lesson.homeworks && lesson.homeworks[0]) {
    const submission = lesson.homeworks[0].submissions[0] || {}
    return submission
  }
}

function onSwiper(swiper) {
  swiperInstance = swiper
  const studentId = props.profile?.id

  if (studentId) {
    const state = getStudentState(studentId)
    // Если это первая инициализация для этого студента, используем сохраненный индекс
    if (state.initialized && state.lessons.length > 0) {
      previousIndex = state.currentLessonIndex
      currentLessonIndex.value = state.currentLessonIndex
      log('Restored swiper position for student:', studentId, 'index:', state.currentLessonIndex)
    } else {
      previousIndex = swiper.activeIndex
      currentLessonIndex.value = swiper.activeIndex
    }
  } else {
    previousIndex = swiper.activeIndex
    currentLessonIndex.value = swiper.activeIndex
  }

  log('Swiper initialized', { activeIndex: swiper.activeIndex, slidesCount: lessons.value.length })
}

function getDeadlineClass(dueDate) {
  if (!dueDate) return ''
  const today = new Date()
  const due = new Date(dueDate)
  if (due < today) return { 'red-text': true }
  return { 'green-text': true }
}

async function onSlideChange(swiper) {
  if (isLoading.value) return
  const currentIndex = swiper.activeIndex
  currentLessonIndex.value = currentIndex

  // Сохраняем текущее состояние
  const studentId = props.profile?.id
  if (studentId) {
    setStudentState(studentId, {
      currentLessonIndex: currentIndex,
      currentPage: currentPage.value,
      lessons: lessons.value,
    })
  }

  log('Slide changed', { currentIndex, previousIndex, lessonsCount: lessons.value.length })

  // если дошли до начала — подгружаем прошлые уроки
  if (currentIndex <= 0 && currentIndex < previousIndex) {
    await loadMorePastLessons()
  }

  previousIndex = currentIndex
}

async function loadMorePastLessons() {
  isLoading.value = true
  try {
    const nextPage = currentPage.value + 1
    const studentId = props.profile.id

    // Проверяем кэш
    const cached = getCachedData(studentId, nextPage)
    let newLessons = []

    if (cached && isCacheValid(cached)) {
      log('Using cached data for past lessons, page:', nextPage)
      newLessons = cached.data.lessons || []
    } else {
      log('Fetching past lessons from API, page:', nextPage)
      const response = await getStudentLessons(studentId, nextPage, 5)
      newLessons = response?.lessons || []

      // Кэшируем результат
      setCachedData(studentId, nextPage, response || { lessons: [] })
    }

    // добавляем в начало
    lessons.value.unshift(...newLessons.reverse().filter((lesson) => !lesson.is_cancelled))
    currentPage.value = nextPage

    if (swiperInstance) {
      await nextTick()
      currentLessonIndex.value += newLessons.length
      swiperInstance.slideTo(currentLessonIndex.value, 0)
    }
  } catch (e) {
    console.error('Ошибка загрузки прошлых уроков:', e)
  } finally {
    isLoading.value = false
  }
}

async function loadInitialData() {
  const studentId = props.profile?.id
  if (!studentId) {
    log('No student ID provided')
    return
  }

  isLoading.value = true
  try {
    // Проверяем кэш
    const cached = getCachedData(studentId, currentPage.value)
    let response = null

    if (cached && isCacheValid(cached)) {
      log('Using cached data for initial load')
      response = cached.data
    } else {
      log('Fetching initial data from API')
      response = await getStudentLessons(studentId, currentPage.value, 5)


      // Кэшируем результат
      console.log(response)
      console.log(`<<<<<<<<<<<<<<<<<<<<<<<<< response`)
      setCachedData(studentId, currentPage.value, response || { lessons: [] })
    }

    const lessonsFromApi = response?.lessons || []
    lessons.value = lessonsFromApi.reverse().filter((lesson) => !lesson.is_cancelled)

    // Устанавливаем начальный индекс после загрузки данных
    currentLessonIndex.value = lessonsFromApi.length - 1
  } catch (e) {
    console.error('Ошибка загрузки данных уроков:', e)
    lessons.value = []
    currentLessonIndex.value = 0
  } finally {
    isLoading.value = false
  }
}

// Функция для принудительного обновления данных (минуя кэш)
async function refreshData() {
  const studentId = props.profile?.id
  if (studentId) {
    clearCache(studentId)
    await loadInitialData()
  }
}

defineExpose({
  loadInitialData,
  refreshData,
  clearCache,
  lessons: lessons.value,
})

watch(
  () => props.profile,
  (newProfile, oldProfile) => {
    // Загружаем данные только если profile действительно изменился
    if (newProfile?.id && newProfile.id !== oldProfile?.id) {
      loadInitialData()
    }
  },
  { immediate: true, deep: true },
)

onMounted(async () => {
  await loadInitialData()
})
</script>
