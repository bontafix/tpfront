<template>
  <v-base>
    <div class="v-student-page">
      <div class="container">
        <div class="v-student-page__container layout">
          <div class="route">
            <router-link :to="{ name: 'my_students' }"> Ученики</router-link>
            <div>/</div>
            <div>{{ student?.student_name }}</div>
          </div>

          <div class="v-student-page__menu">
            <div class="v-student-page__menu-top">
              <h1 class="text-title">{{ student?.student_name }}</h1>
              <div class="v-student-page__menu-buttons">
                <button class="custom-btn white" @click="() => toggleModal('pay')">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.99984 4.16663V15.8333M4.1665 9.99996H15.8332"
                      stroke="white"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  Оплата
                </button>
                <button class="custom-btn blue" @click="() => toggleResultModal(false)">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.99984 4.16663V15.8333M4.1665 9.99996H15.8332"
                      stroke="white"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  Результат
                </button>
              </div>
            </div>
            <div class="v-student-page__menu-bottom">
              <div
                class="v-student-page__menu-bottom-item styled-nav"
                :class="{ active: title === activeSec }"
                @click="() => setActiveSection(title)"
                v-for="(title, index) in sectionsTitles"
                :key="index"
              >
                {{ title }}
              </div>
            </div>
          </div>

          <component :is="currentComponent" @toggle-modal="toggleModal" @toggle-tasks-modal="toggleTasksModal" :student="student" @add-topic="addTopic" @show-result="showResult"/>
        </div>
      </div>
    </div>
  </v-base>
  <transition name="fade">
    <v-additionaly-task-modal
    v-if="modals.tasks"
    @close="() => toggleModal('tasks')"
    @save-homework="saveHomework" />
  </transition>
  <transition name="fade">
    <v-pay-modal
      v-if="modals.pay"
      :class="{ 'modal-open': modals.pay }"
      @close="() => toggleModal('pay')"
      @set-payment="setStudentPayment"
    />
  </transition>
  <transition name="fade">
    <v-add-result-modal
      v-if="modals.result"
      :class="{ 'modal-open': modals.result }"
      @close="() => toggleModal('result')"
      :readonly="isReadonlyResultModal"
      :data="resultData"
    />
  </transition>
  <transition name="fade">
    <v-delete-modal
      v-if="modals.deleteModal"
      :class="{ 'modal-open': modals.deleteModal }"
      @close="() => toggleModal('deleteModal')"
    />
  </transition>
  <transition name="fade">
    <v-homework-op-modal
      v-if="modals.homeWorkOpModal"
      :class="{ 'modal-open': modals.homeWorkOpModal }"
      @close="() => toggleModal('homeWorkOpModal')"
      @save-manual-grade="saveManualGrade"
    />
  </transition>
  <transition name="fade">
    <v-themes-modal
      v-if="modals.themes"
      :class="{ 'modal-open': modals.themes }"
      @close="() => toggleModal('themes')"
      :lesson-id="currentLessonId"
      :cached-themes="getCachedThemes(currentLessonId)"
      @update-themes="updateThemesCache"
    />
  </transition>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, computed, onMounted, readonly } from 'vue'
import { getStudentById, setPayment, getLessonTopics, manualGrade, setLessonHomeWork } from '@/api/requests'
import { useCurrentStudentStore } from '@/stores/currentStudentStore'

import vBase from '@/components/v-base.vue'
import vStudentDetails from './v-student-details.vue'
import vStudentHomework from './v-student-homework.vue'
import vStudentAnalytics from './v-student-analytics.vue'

import vPayModal from '@/components/modals/v-pay-modal.vue'
import vThemesModal from '@/components/modals/v-themes-modal.vue'
import vHomeworkOpModal from '@/components/modals/v-homework-op-modal.vue'
import vAddResultModal from '@/components/modals/students/v-add-result-modal.vue'
import vAdditionalyTaskModal from '@/components/modals/students/v-additionaly-task-modal.vue'
import { formatDate, transformDate } from '@/utils'

const currentStudentStore = useCurrentStudentStore()
const route = useRoute()

const activeSec = ref(localStorage.getItem('activeSec') || 'Детали')
const sectionsTitles = ref(['Детали', 'Домашнее задание', 'Аналитика'])

const currentComponent = computed(() => {
  switch (activeSec.value) {
    case 'Детали':
      return vStudentDetails
    case 'Домашнее задание':
      return vStudentHomework
    case 'Аналитика':
      return vStudentAnalytics
    default:
      return vStudentDetails
  }
})

const currentLessonId = ref(null)
const student = ref()

const themesCache = ref({})

const modals = ref({
  pay: false,
  result: false,
  themes: false,
  deleteModal: false,
  homeWorkOpModal: false,
})

const lastLessonId = ref(null)

const resultData = ref(null)

const isReadonlyResultModal = ref(false)


const setActiveSection = (section) => {
  activeSec.value = section
  localStorage.setItem('activeSec', section)
}

const toggleModal = (modal) => {
  modals.value[modal] = !modals.value[modal]
}

const toggleResultModal = (readonly) => {
  isReadonlyResultModal.value = readonly
  resultData.value = null
  toggleModal('result')
}

const loadData = async () => {
  const userId = route.params.id
  student.value = await getStudentById(userId)
}

const setStudentPayment = async (requestBody) => {
  const form = {
    ...requestBody,
    student_id: student.value.id,
  }
  await setPayment(form)
}

const addTopic = async (modalName, lessonId) => {
  console.log('Урок ', lessonId)
  currentLessonId.value = lessonId

  // Предзагружаем данные, если их нет в кеше
  if (!themesCache.value[lessonId]) {
    console.log('Предзагружаем темы для урока:', lessonId)
    try {
      const themes = await getLessonTopics(lessonId)
      themesCache.value[lessonId] = themes || []
      console.log('Темы загружены и сохранены в кеш:', themes)
    } catch (error) {
      console.error('Ошибка предзагрузки тем:', error)
      themesCache.value[lessonId] = []
    }
  } else {
    console.log('Темы уже есть в кеше для урока:', lessonId)
  }

  toggleModal(modalName)
}

const saveManualGrade = async (grade) => {
  const formData = new FormData()
  const today = new Date().toISOString().split('T')[0]

  formData.append('student_id', student.value.id)
  formData.append('title', 'Дз вне платформы')
  formData.append('due_date', today)
  formData.append('submission_date', today)
  formData.append('grade', grade)

  await manualGrade(formData)
}

const saveHomework = async (data) => {
  const formData = new FormData()

  data.files.forEach(file => {
    formData.append('files', file.file)
  })

  delete data.files

  for (const key in data) {
    formData.append(key, data[key])
  }

  console.log(lastLessonId)

  await setLessonHomeWork(lastLessonId.value, formData)
}

const toggleTasksModal = (last_lesson_id) => {
  lastLessonId.value = last_lesson_id
  toggleModal('tasks')
}

// Обновляем кеш тем для урока
const updateThemesCache = (lessonId, themes) => {
  console.log('Обновляем кеш для урока:', lessonId, 'темы:', themes)
  themesCache.value[lessonId] = themes
}

// Получаем кешированные темы для урока
const getCachedThemes = (lessonId) => {
  const cached = themesCache.value[lessonId] || []
  console.log('Получаем кеш для урока:', lessonId, 'найдено тем:', cached.length)
  return cached
}

const showResult = (result)  => {
  console.log(result)
  toggleModal('result')
  isReadonlyResultModal.value = true
  resultData.value = result
}

onMounted(() => {
  loadData()
  currentStudentStore.setStudentId(route.params.id)
})
</script>
