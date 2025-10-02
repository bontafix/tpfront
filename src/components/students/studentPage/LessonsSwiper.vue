<template>
  <div class="v-lessons-swiper">
    <div class="flex justify-between">
      <h1 class="custom-title">Занятия</h1>
      <div class="flex gap-3 items-center">
        <template v-for="type in ['rotate-180', '']" :key="type">
          <div :class="`${type} custom-swiper-button day-el analytics-swiper-button-${type.length ? 'prev' : 'next'}`">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="39.5" y="0.5" width="39" height="39" rx="19.5" transform="rotate(90 39.5 0.5)" fill="#F3F4F6"/>
            <rect x="39.5" y="0.5" width="39" height="39" rx="19.5" transform="rotate(90 39.5 0.5)" stroke="#F3F4F6"/>
            <path d="M15.7578 20.0001H24.2427M24.2427 20.0001L20.0003 15.7577M24.2427 20.0001L20.0003 24.2425" stroke="#717680" stroke-width="1.85556" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          </div>
          <div :class="`${type} custom-swiper-button night-el analytics-swiper-button-${type.length ? 'prev' : 'next'}`">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="40" width="40" height="40" rx="20" transform="rotate(90 40 0)" fill="white" fill-opacity="0.08"/>
              <path d="M15.7573 20.0001H24.2422M24.2422 20.0001L19.9998 15.7577M24.2422 20.0001L19.9998 24.2425" stroke="#E9EAEB" stroke-width="1.85556" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </template>
      </div>
    </div>
    <template v-if="lessons.length">
      <swiper
        class="v-student-analytics__prev-row"
        ref="swiperRef"
        @swiper="onSwiper"
        @slide-change="onSlideChange"
        v-bind="swiperOptions"
        :modules="modules"
      >
        <swiper-slide
          class="v-student-analytics__prev-item lesson-swiper"
          v-for="lesson in lessons"
          :key="lesson.id"
        >
          <div class="lesson-swiper__content">
            <h3 class="lesson-swiper__date">{{ formatDate(lesson.conducted_date) }}</h3>
            <div class="lesson-swiper__info">
              <div class="lesson-swiper__info-row">
                <h4 class="lesson-swiper__subtitle">Темы</h4>
                <div class="lesson-swiper__block">
                  <template v-if="topics[lesson.id] && topics[lesson.id].length">
                    <div
                      class="lesson-swiper__theme theme"
                      @click="() => openModal('themes', lesson.id)"
                      v-for="theme in topics[lesson.id]"
                      :key="theme.id"
                    >
                      <span class="theme__title">{{ theme.name }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="theme" @click="openModal('themes', lesson.id)">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0 5H5V0H7V5H12V7H7V12H5V7H0V5Z" fill="#1d4ecc"/>
                        </svg>

                      <span class="theme__title">

                        Добавить тему</span>
                    </div>
                  </template>
                </div>
              </div>
              <div class="lesson-swiper__info-row">
                <h4 class="lesson-swiper__subtitle  red-text">Проблемы</h4>
                <div class="lesson-swiper__block lesson-swiper__row">
                  <template v-if="problems[lesson.id] && problems[lesson.id].length">
                    <p
                      v-for="problem in problems[lesson.id]"
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
                <h4 class="lesson-swiper__subtitle">ДЗ</h4>
                <div class="lesson-swiper__block" >
                  <div
                   v-if="lesson.homeworks && lesson.homeworks.length"
                    class="status"
                    :class="getHomeworkClass(lesson.homeworks[0].status)"
                  >
                    <span></span>{{ lesson.homeworks[0].status }}
                  </div>
                  <div class="contact-link" @click="() => openModal('homeWorkOpModal')">
                    ДЗ задано вне платформы?
                  </div>
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
import { ref, nextTick, onMounted, watch } from 'vue'
import { getStudentFutureLessons, getStudentLastLessons, getLessonProblems, getLessonTopics } from '@/api/requests'
import { formatDate, getHomeworkClass } from '@/utils'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

// Props
const props = defineProps({
  studentId: {
    type: [String, Number],
    required: true
  },
  debug: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['add-topic'])

// Refs
const lessons = ref([])
const swiperRef = ref(null)
const problems = ref({})
const topics = ref({})
const pastLessonsPage = ref(1)
const futureLessonsPage = ref(1)
const pageSize = ref(3)
const separatorIndex = ref(0)
const isLoading = ref(false)

// Swiper setup
const modules = [Navigation]
let swiperInstance = null
let previousIndex = 0

const swiperOptions = {
  slidesPerView: 3,
  spaceBetween: 20,
  navigation: {
    nextEl: '.analytics-swiper-button-next',
    prevEl: '.analytics-swiper-button-prev'
  },
  breakpoints: {
    300: { slidesPerView: 1, spaceBetween: 15 },
    768: { slidesPerView: 2, spaceBetween: 20 }
  }
}

// Utils
const log = (...args) => props.debug && console.log('[LessonsSwiper]', ...args)

// Methods
const openModal = (modal, lessonId) => {
  emit('add-topic', modal, lessonId)
}

function onSwiper(swiper) {
  swiperInstance = swiper
  previousIndex = swiper.activeIndex
}

async function onSlideChange(swiper) {
  if (isLoading.value) return
  const currentIndex = swiper.activeIndex

  // вправо (будущее)
  if (currentIndex > previousIndex && currentIndex >= lessons.value.length - 1) {
    await loadMoreFutureLessons()
  }

  // влево (прошлое)
  if (currentIndex < previousIndex && currentIndex === 0) {
    await loadMorePastLessons()
  }

  previousIndex = swiper.activeIndex
}

// Функция для загрузки проблем
async function fetchProblemsForLessons(newLessons) {
  if (!Array.isArray(newLessons) || !newLessons.length) return

  const promises = newLessons.map(lesson =>
    getLessonProblems(lesson.id)
      .then(data => {
        problems.value[lesson.id] = Array.isArray(data) ? data : []
      })
      .catch((error) => {
        console.error(`Ошибка загрузки проблем для урока ${lesson.id}:`, error)
        problems.value[lesson.id] = []
      })
  )

  await Promise.all(promises)
}

// Функция для загрузки тем
async function fetchTopicsForLessons(newLessons) {
  if (!Array.isArray(newLessons) || !newLessons.length) return

  const promises = newLessons.map(lesson =>
    getLessonTopics(lesson.id)
      .then(data => {
        topics.value[lesson.id] = Array.isArray(data) ? data : []
      })
      .catch((error) => {
        console.error(`Ошибка загрузки тем для урока ${lesson.id}:`, error)
        topics.value[lesson.id] = []
      })
  )

  await Promise.all(promises)
}

// Функция для загрузки всех данных урока (проблемы + темы)
async function fetchLessonData(newLessons) {
  await Promise.all([
    fetchProblemsForLessons(newLessons),
    fetchTopicsForLessons(newLessons)
  ])
}

async function loadMoreFutureLessons() {
  if (isLoading.value) return
  isLoading.value = true

  try {
    futureLessonsPage.value++
    const more = await getStudentFutureLessons(props.studentId, futureLessonsPage.value, pageSize.value)
    const moreLessons = Array.isArray(more) ? more : []

    if (moreLessons.length) {
      lessons.value.push(...moreLessons)
      await fetchLessonData(moreLessons)
    }
  } catch (e) {
    console.error('Ошибка загрузки будущих уроков:', e)
  } finally {
    isLoading.value = false
  }
}

async function loadMorePastLessons() {
  if (isLoading.value) return
  isLoading.value = true

  try {
    pastLessonsPage.value++
    const more = await getStudentLastLessons(props.studentId, pastLessonsPage.value, pageSize.value)
    const moreLessons = Array.isArray(more) ? more : []

    if (moreLessons.length) {
      // Запоминаем текущий активный слайд и его позицию
      const currentActiveIndex = swiperInstance?.activeIndex || 0
      const currentActiveSlide = lessons.value[currentActiveIndex]

      // Отключаем анимации и переходы временно
      if (swiperInstance) {
        swiperInstance.allowTouchMove = false
        swiperInstance.allowSlideNext = false
        swiperInstance.allowSlidePrev = false
      }

      // Добавляем новые уроки в начало
      lessons.value.unshift(...moreLessons)
      separatorIndex.value += moreLessons.length

      // Загружаем данные для новых уроков
      await fetchLessonData(moreLessons)

      // Ждем обновления DOM
      await nextTick()

      // Находим новый индекс для того же урока, что был активен
      const newActiveIndex = lessons.value.findIndex(lesson =>
        lesson.id === currentActiveSlide?.id
      )

      // Мгновенно переходим к нужному слайду без анимации
      if (swiperInstance && newActiveIndex !== -1) {
        swiperInstance.slideTo(newActiveIndex, 0, false)
        previousIndex = newActiveIndex
      }

      // Включаем обратно управление после небольшой задержки
      setTimeout(() => {
        if (swiperInstance) {
          swiperInstance.allowTouchMove = true
          swiperInstance.allowSlideNext = true
          swiperInstance.allowSlidePrev = true
        }
      }, 100)
    }
  } catch (e) {
    console.error('Ошибка загрузки прошлых уроков:', e)
  } finally {
    isLoading.value = false
  }
}

async function loadInitialData() {
   if (!props.studentId) return
  try {
    const past = await getStudentLastLessons(props.studentId, 1, pageSize.value)
    const future = await getStudentFutureLessons(props.studentId, 1, pageSize.value)

    const pastLessons = Array.isArray(past) ? past : []
    const futureLessons = Array.isArray(future) ? future : []

    pastLessons.reverse()

    lessons.value = [...pastLessons, ...futureLessons]
    separatorIndex.value = pastLessons.length

    await nextTick()
    // стартуем с последнего "прошлого" урока
    const initialIndex = pastLessons.length > 0 ? pastLessons.length - 1 : 0
    swiperInstance?.slideTo(initialIndex, 0, false)
    previousIndex = initialIndex

    await fetchLessonData(lessons.value)
  } catch (e) {
    console.error('Ошибка загрузки данных уроков:', e)
    lessons.value = []
    separatorIndex.value = 0
  }
}

watch(
  () => props.studentId,
  async (newVal) => {
    if (newVal) {
      await loadInitialData()
    }
  },
  { immediate: true }
)

// Public methods for parent component
defineExpose({
  loadInitialData,
  lessons: lessons.value,
  problems: problems.value,
  topics: topics.value
})

onMounted(async () => {
  await loadInitialData()
})
</script>
