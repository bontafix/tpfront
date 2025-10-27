<template>
  <v-base>
    <section class="v-home">
      <div class="container">
        <div class="loader-container" v-show="isLoading">
          <div class="loader"></div>
        </div>
        <div class="v-home__container layout" v-if="!isLoading && allDisplayLessons.length">
           <swiper
           v-if="allDisplayLessons.length > 0"
            class="v-home__left"
            ref="swiperRef"
            v-bind="swiperOptions"
            :modules="modules"
            :initial-slide="initialSlideIndex"
            @slideChange="onSlideChange"
            :space-between="30"
          >
            <swiper-slide
              class="v-student-analytics__prev-item prev-lesson"
              v-for="(lessonData, index) in allDisplayLessons"
              :key="`${getLessonIdentifier(lessonData)}-${index}-${lessonData.dateKey}`"
            >
            <div class="v-home__lesson">
              <div class="v-home__lesson-info">
                <h1 class="v-home__lesson-title">
                  {{ getLessonTitle(lessonData) }} ({{ formatDisplayDate(lessonData.date) }}):
                  <span>
                    {{ lessonData.student_name }}
                    <span class="v-home__lesson-time">
                      {{ formatTime(lessonData.start_time) }} -
                      {{ formatTime(lessonData.end_time) }}
                    </span>
                  </span>
                </h1>
                <div class="flex gap-3">
                  <div class="home-swiper-button-prev">
                    <img
                    class="rotate-180 day-el"
                    src="/src/assets/images/arrow-right-home-day.svg"
                    alt=""
                    />
                  <img
                    class="rotate-180 night-el"
                    src="/src/assets/images/arrow-right-home-night.svg"
                    alt=""
                  />
                  </div>
                  <div class="home-swiper-button-next">
                    <img class="day-el" src="/src/assets/images/arrow-right-home-day.svg" alt="" />
                    <img
                      class="night-el"
                      src="/src/assets/images/arrow-right-home-night.svg"
                      alt=""
                    />
                  </div>
                </div>
              </div>
              <div class="v-home__lesson-container">
                <div class="v-home__lesson-block">
                  <div
                    class="v-home__lesson-problems v-home__lesson-sec"
                    v-if="getPreviousProblemsForLesson(getLessonIdentifier(lessonData)).length"
                  >
                    <h2 class="v-home__subtitle subtitle">Проблемы прошлого занятия</h2>
                    <ul class="v-home__lesson-problems-list">
                      <li
                        class="v-home__lesson-problems-list-item problem"
                        v-for="problem in getPreviousProblemsForLesson(getLessonIdentifier(lessonData))"
                        :key="problem.id"
                      >
                        <div class="problem__close">
                          <img src="/src/assets/images/flash.svg" alt="" />
                        </div>
                        <span class="problem__title">
                          {{ problem.problem_text }}
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div class="v-home__lesson-themes v-home__lesson-sec" :class="{'mb-3': lessonData.status === 'future'}">
                    <h2 class="v-home__subtitle subtitle">
                      {{ getThemesTitle(lessonData.status) }}
                    </h2>
                    <div v-if="isLessonDataLoading(getLessonIdentifier(lessonData))" class="lesson-data-loader">
                      <div class="mini-loader"></div>
                    </div>
                    <ul class="v-home__lesson-themes-list" v-else>
                      <li
                        class="v-home__lesson-themes-list-item theme"
                        :data-theme-id="theme.id"
                        v-for="theme in getThemesForLesson(getLessonIdentifier(lessonData))"
                        :key="theme.id"
                      >
                        <span class="theme__title"> {{ theme.name }} </span>
                        <div class="theme__close" @click="() => deleteTheme(theme.id, getLessonIdentifier(lessonData))">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M9 3L3 9M3 3L9 9"
                              stroke="#1D4ECC"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                      </li>
                    </ul>
                    <v-add-field
                      v-if="!isLessonDataLoading(getLessonIdentifier(lessonData))"
                      :placeholder="'Тема занятия'"
                      @submit="(value) => submitTheme(value, getLessonIdentifier(lessonData))"
                    />
                  </div>
                </div>
                <div class="v-home__lesson-current-problems v-home__lesson-sec" v-if="lessonData.status !== 'future'">
                  <h2 class="v-home__subtitle subtitle">
                    {{ getProblemsTitle(lessonData.status) }}
                  </h2>
                  <div v-if="isLessonDataLoading(getLessonIdentifier(lessonData))" class="lesson-data-loader">
                    <div class="mini-loader"></div>
                  </div>
                  <ul class="v-home__lesson-themes-list" v-else>
                    <li
                      class="v-home__lesson-themes-list-item theme"
                      v-for="problem in getProblemsForLesson(getLessonIdentifier(lessonData))"
                      :key="problem.id"
                    >
                      <span class="theme__title"> {{ problem.problem_text }} </span>
                      <div class="theme__close" @click="() => deleteProblem(problem.id, getLessonIdentifier(lessonData))">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M9 3L3 9M3 3L9 9"
                            stroke="#FF3A3A"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </div>
                    </li>
                  </ul>
                  <v-add-field
                    v-if="!isLessonDataLoading(getLessonIdentifier(lessonData))"
                    @submit="(value) => submitProblem(value, getLessonIdentifier(lessonData))"
                    :placeholder="'Проблема'"
                  />
                </div>
                <v-homework
                  ref="homeworkRef"
                  @toggle-modal="toggleModal"
                  @save-homework="saveHomework"
                  @save-submission="saveSubmission"
                  :lesson_id="getLessonIdentifier(lessonData)"
                  :last-homework="getLastHomeworkForLesson(getLessonIdentifier(lessonData))"
                  :no-prev-hw="!hasLastHomeworkForLesson(getLessonIdentifier(lessonData))"
                  :mark_postition="'top'"
                  :deletable="false"
                />
              </div>
            </div>
          </swiper-slide>
          </swiper>
          <v-home-right
            @change-slide="changeSlide"
            :current-slide="currentSlide"
          />
        </div>
        <div class="layout" v-show="allDisplayLessons.length === 0 && !isLoading">
          <div class="null-screen">
            <h1>Ещё не добавлено ни одного занятия</h1>
          </div>
        </div>
      </div>
    </section>
  </v-base>
  <transition name="fade">
    <v-files-modal v-if="modals.files" @close="() => toggleModal('files')" @saveFiles="handleSaveFiles" />
  </transition>
</template>

<script setup>
import { useLessonStore } from '@/stores/lessonsStore'
import {
  createHomeworkGroup,
  createSubmission,
  deleteLessonProblem,
  deleteLessonTopic,
  getCurrentLessons,
  getlastHomework,
  getLessonHomeWork,
  getLessonProblems,
  getLessonTopics,
  getPreviousProblems,
  setLessonHomeWork,
  setLessonProblems,
  setLessonTopics,
  uploadFIleHomework,
} from '@/api/requests'
import { nextTick, onBeforeUnmount, onMounted, computed, onUnmounted, ref } from 'vue'
import vBase from '../v-base.vue'
import vHomeRight from './v-home-right.vue'
import '@vuepic/vue-datepicker/dist/main.css'
import vFilesModal from '../modals/v-files-modal.vue'
import vAddField from '../generalComponents/v-add-field.vue'
import vHomework from '../generalComponents/v-homework.vue'
import 'swiper/css'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'

import emitter from '@/eventBus'
import { getWeek } from 'date-fns'
import { formatDateToBase, wsDomain } from '@/utils'

const lessonStore = useLessonStore()
const modules = [Navigation]
const swiperOptions = {
  slidesPerView: 1,
  navigation: {
    nextEl: '.home-swiper-button-next',
    prevEl: '.home-swiper-button-prev',
  },
}

// Refs
const homeworkRef = ref(null)
const swiperRef = ref(null)
const currentSlide = ref({
  index: 0,
  day: 'today',
  date: new Date(),
  lessonId: null,
  student_id: null
})

// State
const isLoading = ref(false)
const loadingLessonsData = ref(new Set())
const loadedLessonsData = ref(new Set())

// Lesson data - каждый урок имеет свои данные по идентификатору урока
const lessonThemes = ref({})
const lessonProblems = ref({})
const previousProblems = ref({})
const lastHomeworkByLesson = ref({}) // Домашние задания для каждого урока отдельно
const currentLesson = ref(null)
const lessonId = ref(null)
const homework = ref(null)

// Modals
const modals = ref({
  files: false,
})

// Utilities
const getLessonIdentifier = (lesson) => {
  return lesson.id || lesson.lesson_id
}

const formatTime = (timeString) => {
  if (!timeString) return '--:--'
  return timeString.slice(0, 5)
}

const formatDisplayDate = (date) => {
  if (!date) return 'Неизвестная дата'

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Завтра'
  } else if (date.toDateString() === today.toDateString()) {
    return 'Сегодня'
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit'
    })
  }
}

const parseTime = (timeString) => {
  if (!timeString) return 0
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

const isToday = (date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

// Status determination
const processLessonsWithStatus = (lessons, day) => {
  const date = getDateForDay(day)
  if (!isToday(date)) {
    return lessons.map(lesson => ({
      ...lesson,
      status: date < new Date() ? 'past' : 'future',
      date,
      dateKey: day
    }))
  }

  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()

  return lessons.map(lesson => {
    const lessonStartTime = parseTime(lesson.start_time)
    const lessonEndTime = parseTime(lesson.end_time)

    let status = 'future'
    if (currentTime > lessonEndTime) {
      status = 'past'
    } else if (currentTime >= lessonStartTime && currentTime <= lessonEndTime) {
      status = 'current'
    }

    return {
      ...lesson,
      status,
      date,
      dateKey: day
    }
  })
}

const getDateForDay = (day) => {
  const today = new Date()
  switch (day) {
    case 'yesterday':
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday
    case 'tomorrow':
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow
    default:
      return new Date(today)
  }
}

// Computed
const allDisplayLessons = computed(() => {
  const allLessons = []
  const days = ['yesterday', 'today', 'tomorrow']

  days.forEach(day => {
    const dayLessons = lessonStore.dayLessons[day]
    if (dayLessons?.lessons) {
      let lessons = [...dayLessons.lessons]

      if (day === 'today' && currentLesson.value && lessonId.value) {
        const hasCurrentLesson = lessons.some(lesson =>
          getLessonIdentifier(lesson) === lessonId.value
        )
        if (!hasCurrentLesson) {
          lessons.push({
            ...currentLesson.value,
            id: lessonId.value
          })
        }
      }

      const processedLessons = processLessonsWithStatus(lessons, day)
      allLessons.push(...processedLessons)
    }
  })

  allLessons.sort((a, b) => {
    if (a.date.getTime() !== b.date.getTime()) {
      return a.date.getTime() - b.date.getTime()
    }
    const timeA = parseTime(a.start_time)
    const timeB = parseTime(b.start_time)
    return timeA - timeB
  })

  return allLessons
})

const initialSlideIndex = computed(() => {
  const currentIndex = allDisplayLessons.value.findIndex(lesson => lesson.status === 'current')
  if (currentIndex >= 0) {
    return currentIndex
  }
  const todayIndex = allDisplayLessons.value.findIndex(lesson => lesson.dateKey === 'today')
  return todayIndex >= 0 ? todayIndex : 0
})

// Lesson data getters - возвращают данные для конкретного урока
const isLessonDataLoading = (lessonId) => {
  return loadingLessonsData.value.has(lessonId)
}

const getThemesForLesson = (lessonId) => {
  return lessonThemes.value[lessonId] || []
}

const getProblemsForLesson = (lessonId) => {
  return lessonProblems.value[lessonId] || []
}

const getPreviousProblemsForLesson = (lessonId) => {
  return previousProblems.value[lessonId] || []
}

const getLastHomeworkForLesson = (lessonId) => {
  return lastHomeworkByLesson.value[lessonId] || null
}

const hasLastHomeworkForLesson = (lessonId) => {
  return !!lastHomeworkByLesson.value[lessonId]?.length
}

// Data loading functions
const loadCurrentLessons = async () => {
  try {
    const lessons = await getCurrentLessons()
    if (lessons.permanent_lessons && lessons.permanent_lessons.length) {
      const [lesson_id, lesson] = Object.entries(lessons.permanent_lessons[0])[0]
      currentLesson.value = lesson
      lessonId.value = lesson_id

    } else {
      currentLesson.value = null
      lessonId.value = null
    }
  } catch (error) {
    console.error('Ошибка загрузки текущих занятий:', error)
    currentLesson.value = null
    lessonId.value = null
  }
}

const loadLessonData = async (targetLessonId) => {
  if (!targetLessonId || loadedLessonsData.value.has(targetLessonId)) {
    return
  }

  loadingLessonsData.value.add(targetLessonId)

  try {
    const promises = [
      fetchLessonProblems(targetLessonId),
      fetchLessonTopics(targetLessonId),
      fetchLessonHomeWork(targetLessonId),
      fetchPreviousProblems(targetLessonId),
      fetchLastHomeworkForLesson(targetLessonId)
    ]

    await Promise.allSettled(promises)
    loadedLessonsData.value.add(targetLessonId)

  } catch (error) {
    console.error(`Ошибка загрузки данных урока ${targetLessonId}:`, error)
  } finally {
    loadingLessonsData.value.delete(targetLessonId)
  }
}

const fetchLessonProblems = async (targetLessonId) => {
  try {
    const response = await getLessonProblems(targetLessonId)
    lessonProblems.value[targetLessonId] = Array.isArray(response) ? response : []
  } catch (error) {
    console.error(`Ошибка загрузки проблем урока ${targetLessonId}:`, error)
    lessonProblems.value[targetLessonId] = []
  }
}

const fetchLessonTopics = async (targetLessonId) => {
  try {
    const response = await getLessonTopics(targetLessonId)
    lessonThemes.value[targetLessonId] = Array.isArray(response) ? response : []
  } catch (error) {
    console.error(`Ошибка загрузки тем урока ${targetLessonId}:`, error)
    lessonThemes.value[targetLessonId] = []
  }
}

const fetchLessonHomeWork = async (targetLessonId) => {
  try {
    const response = await getLessonHomeWork(targetLessonId)
    homework.value = response || null
  } catch (error) {
    console.error(`Ошибка загрузки домашнего задания урока ${targetLessonId}:`, error)
    homework.value = null
  }
}

const fetchPreviousProblems = async (targetLessonId) => {
  try {
    const response = await getPreviousProblems(targetLessonId)
    previousProblems.value[targetLessonId] = Array.isArray(response) ? response : []
  } catch (error) {
    console.error(`Ошибка загрузки предыдущих проблем для урока ${targetLessonId}:`, error)
    previousProblems.value[targetLessonId] = []
  }
}

// Исправлено: теперь загружаем и сохраняем домашнее задание для конкретного урока
const fetchLastHomeworkForLesson = async (targetLessonId) => {
  try {
    const response = await getlastHomework(targetLessonId)
    lastHomeworkByLesson.value[targetLessonId] = response || null
  } catch (error) {
    console.error(`Ошибка загрузки последнего домашнего задания для урока ${targetLessonId}:`, error)
    lastHomeworkByLesson.value[targetLessonId] = null
  }
}

const loadCurrentSlideData = async (lessonIdentifier) => {
  if (!lessonIdentifier || loadedLessonsData.value.has(lessonIdentifier)) {
    return
  }

  await loadLessonData(lessonIdentifier)
}

// Event handlers
const onSlideChange = async (swiper) => {
  const activeIndex = swiper.activeIndex
  const activeLesson = allDisplayLessons.value[activeIndex]

  if (!activeLesson) return

  const lessonIdentifier = getLessonIdentifier(activeLesson)

  currentSlide.value = {
    index: activeIndex,
    day: activeLesson?.dateKey || 'today',
    date: activeLesson?.date || new Date(),
    lessonId: lessonIdentifier,
    student_id: activeLesson?.student_id,
    group_id: activeLesson?.group_id
  }

  if (lessonIdentifier) {
    await loadCurrentSlideData(lessonIdentifier)
  }
}

const changeSlide = async (lessonId, targetDay = null) => {
  if (targetDay) {
    await switchToDay(targetDay)
    return
  }

  const index = allDisplayLessons.value.findIndex(lesson =>
    getLessonIdentifier(lesson) === lessonId
  )

  if (index >= 0) {
    const foundLesson = allDisplayLessons.value[index]
    const lessonIdentifier = getLessonIdentifier(foundLesson)

    currentSlide.value = {
      index,
      day: foundLesson?.dateKey || 'today',
      date: foundLesson?.date || new Date(),
      lessonId: lessonIdentifier,
      student_id: foundLesson?.student_id,
      group_id: foundLesson?.group_id
    }

    if (swiperRef.value) {
      swiperRef.value.slideTo(index)
    }

    if (lessonIdentifier) {
      await loadCurrentSlideData(lessonIdentifier)
    }
  }
}

const switchToDay = async (targetDay) => {
  if (!lessonStore.dayLessons[targetDay]) {
    await lessonStore.fetchTodayLessons(targetDay)
  }
  await nextTick()

  const targetIndex = allDisplayLessons.value.findIndex(lesson => lesson.dateKey === targetDay)
  if (targetIndex >= 0 && swiperRef.value) {
    const targetLesson = allDisplayLessons.value[targetIndex]
    const lessonIdentifier = getLessonIdentifier(targetLesson)

    swiperRef.value.slideTo(targetIndex)

    if (lessonIdentifier) {
      await loadCurrentSlideData(lessonIdentifier)
    }
  }
}

// CRUD operations
const submitTheme = async (value, targetLessonId) => {
  if (!value || !targetLessonId) return

  try {
    if (!lessonThemes.value[targetLessonId]) {
      lessonThemes.value[targetLessonId] = []
    }

    const maxId = lessonThemes.value[targetLessonId].length > 0
      ? Math.max(...lessonThemes.value[targetLessonId].map((t) => t.id))
      : 0

    lessonThemes.value[targetLessonId].push({ id: maxId + 1, name: value })

    const data = {
      lesson_id: targetLessonId,
      name: value,
    }

    await setLessonTopics(data)
  } catch (error) {
    console.error('Ошибка добавления темы:', error)
    if (lessonThemes.value[targetLessonId]) {
      lessonThemes.value[targetLessonId] = lessonThemes.value[targetLessonId].filter(theme => theme.name !== value)
    }
  }
}

const submitProblem = async (value, targetLessonId) => {
  if (!value || !targetLessonId) return

  try {
    if (!lessonProblems.value[targetLessonId]) {
      lessonProblems.value[targetLessonId] = []
    }

    const maxId = lessonProblems.value[targetLessonId].length > 0
      ? Math.max(...lessonProblems.value[targetLessonId].map((p) => p.id))
      : 0

    lessonProblems.value[targetLessonId].push({ id: maxId + 1, problem_text: value })

    const data = {
      lesson_id: targetLessonId,
      problems: [value],
    }

    await setLessonProblems(data)
  } catch (error) {
    console.error('Ошибка добавления проблемы:', error)
    if (lessonProblems.value[targetLessonId]) {
      lessonProblems.value[targetLessonId] = lessonProblems.value[targetLessonId].filter(problem => problem.problem_text !== value)
    }
  }
}

const deleteProblem = async (problemId, targetLessonId) => {
  try {
    const originalProblems = [...(lessonProblems.value[targetLessonId] || [])]
    if (lessonProblems.value[targetLessonId]) {
      lessonProblems.value[targetLessonId] = lessonProblems.value[targetLessonId].filter((problem) => {
        return problem.id !== problemId
      })
    }

    await deleteLessonProblem(problemId)
  } catch (error) {
    console.error('Ошибка удаления проблемы:', error)
    lessonProblems.value[targetLessonId] = originalProblems
  }
}

const deleteTheme = async (themeId, targetLessonId) => {
  try {
    const originalThemes = [...(lessonThemes.value[targetLessonId] || [])]
    if (lessonThemes.value[targetLessonId]) {
      lessonThemes.value[targetLessonId] = lessonThemes.value[targetLessonId].filter((theme) => {
        return theme.id !== themeId
      })
    }

    await deleteLessonTopic(themeId)
  } catch (error) {
    console.error('Ошибка удаления темы:', error)
    lessonThemes.value[targetLessonId] = originalThemes
  }
}

// UI utilities
const getLessonTitle = (lesson) => {
  switch (lesson.status) {
    case 'current':
      return 'Текущее занятие'
    case 'past':
      return 'Прошедшее занятие'
    case 'future':
      return 'Будущее занятие'
    default:
      return 'Занятие'
  }
}

const getThemesTitle = (status) => {
  switch (status) {
    case 'current':
      return 'Темы текущего занятия'
    case 'past':
      return 'Темы прошедшего занятия'
    case 'future':
      return 'Планируемые темы занятия'
    default:
      return 'Темы занятия'
  }
}

const getProblemsTitle = (status) => {
  switch (status) {
    case 'current':
      return 'Проблемы текущего занятия'
    case 'past':
      return 'Проблемы на занятии'
    default:
      return 'Проблемы занятия'
  }
}

const toggleModal = (modalName) => {
  modals.value[modalName] = !modals.value[modalName]
}

const handleSaveFiles = (files) => {
  if (currentSlide.value && currentSlide.value.index !== null && typeof currentSlide.value.index === 'number') {
    const homeworkComponent = homeworkRef.value?.[currentSlide.value.index];
    if (homeworkComponent && typeof homeworkComponent.handleSaveFiles === 'function') {
      homeworkComponent.handleSaveFiles(files);
    }
  }
}

const   saveHomework = async (homework_data) => {
  try {
    const hwFormData = new FormData()

    homework_data.files.forEach(f => {
      hwFormData.append('files', f.file)
    })

    delete homework_data.files

    for (const [key, value] of Object.entries(homework_data)) {
      hwFormData.append(key, value)
    }

    hwFormData.append('due_time', '10:26:39.981Z')
    hwFormData.append('conducted_date', formatDateToBase(new Date()))

    const lessonId = currentSlide.value.lessonId
    const groupId = currentSlide.value.group_id
    const studentId = currentSlide.value.student_id

    if (!lessonId) {
      throw new Error('Не выбран урок для сохранения домашнего задания')
    }
    let response;
    if(studentId && !groupId) {
        response = await setLessonHomeWork(lessonId, hwFormData)
        let message = response?.data?.message
        let requestType = 'success'
        if(!message) {
          requestType = 'error'
          message = 'Произошла ошибка при добавлении дз'
        }
        emitter.emit('notify', {
          type: requestType,
          message: message
        })
    } else {
      hwFormData.append('lesson_id', lessonId)
      response = await createHomeworkGroup(groupId, hwFormData)
      let message = response?.data?.message
      let requestType = 'success'
      if(!message) {
        requestType = 'error'
        message = 'Произошла ошибка при установки оценки за дз'
      }
      emitter.emit('notify', {
        type: requestType,
        message: message
      })
    }


    return response
  } catch (error) {
    console.error('Ошибка сохранения домашнего задания:', error)
    throw error
  }
}

const saveSubmission = async (submission_data) => {
  try {
    submission_data['student_id'] = currentSlide.value.student_id;
    const formData = new FormData()
    Object.keys(submission_data).forEach(key => {
      formData.append(key, submission_data[key])
    })
    await createSubmission(submission_data.homework_id, formData)
  } catch (error) {
    console.error('Ошибка сохранения решения:', error)
    throw error
  }
}

// Main data loading function
const loadData = async () => {
  isLoading.value = true
  try {
    await loadCurrentLessons()

    await Promise.all([
      lessonStore.fetchTodayLessons('yesterday'),
      lessonStore.fetchTodayLessons('today'),
      lessonStore.fetchTodayLessons('tomorrow')
    ])

    await nextTick()

    const initialSlide = initialSlideIndex.value
    const initialLesson = allDisplayLessons.value[initialSlide]

    if (initialLesson) {
      const lessonIdentifier = getLessonIdentifier(initialLesson)
      console.log('начальный урок -', initialLesson)
      if (lessonIdentifier) {
        currentSlide.value = {
          index: initialSlide,
          day: initialLesson.dateKey,
          date: initialLesson.date,
          lessonId: lessonIdentifier,
          student_id: initialLesson.student_id,
          group_id: initialLesson.group_id
        }

        await loadCurrentSlideData(lessonIdentifier)
      }
    }

  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
  } finally {
    isLoading.value = false
  }
}

// WebSocket connection
let ws = null
const connectWebSocket = () => {
  try {
    ws = new WebSocket(`${wsDomain}lesson_notifications/`)

    ws.onmessage = (event) => {
      if (event.data !== 'ping') {
        // WebSocket message received
      }
      if(event.data.includes('lesson_started') || event.data.includes('lesson_ended')) {
        console.log('Урока закуончился')
        loadData()
      }
    }

    ws.onopen = () => {
      console.log('Веб сокет зщапущен')
      // WebSocket connected
    }

    ws.onclose = () => {
      console.log('Веб сокет закрыт')

      setTimeout(connectWebSocket, 1000)
    }

    ws.onerror = (error) => {
      console.error('Ошибка сокета:', error)
      if (ws) {
        ws.close()
      }
    }
  } catch (error) {
    console.error('Ошибка подключения к WebSocket:', error)
  }
}

// Cleanup
const cleanup = () => {
  if (ws) {
    ws.close()
    ws = null
  }
}

// Lifecycle hooks
onMounted(async () => {
  await loadData()
 /*  connectWebSocket() */
})

onBeforeUnmount(() => {
  cleanup()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.lesson-data-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.mini-loader {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.v-home__lesson-date {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.null-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  text-align: center;
}

.null-screen h1 {
  color: #666;
  font-size: 18px;
  font-weight: 500;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.v-home__lesson-container {
  contain: layout style;
}

.swiper-slide {
  will-change: transform;
}

@media (max-width: 768px) {
  .v-home__lesson-title {
    font-size: 16px;
  }

  .v-home__lesson-time {
    display: block;
    margin-top: 4px;
  }
}
</style>
