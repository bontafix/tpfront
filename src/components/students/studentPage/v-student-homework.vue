<template>
  <div class="v-student-homework" v-show="!isLoading">
    <div class="v-student-homework__container">
      <v-homework
        :mode="getHwMode(lastHomework)"
        :title="'Текущее домашнее задание'"
        :hwData="lastHomework"
        @save-submission="saveSubmission"
        :submission-data="lastHomework.submissions"
      />

      <button class="custom-btn white mt-6" @click="() => toggleModal('tasks')">
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

        Дополнительное домашнее задание
      </button>

      <div class="v-student-homework__archive">
        <h2 class="text-section-title">Архив домашнего задания ({{ allHomework.length }})</h2>
        <ul class="v-student-homework__list">
          <li class="v-student-homework__list-item" v-for="homework in allHomework" :key="homework.id">
            <v-homework :mode="getHwMode(homework)" :title="`Домашнее задание`" :hwData="homework" :submission-data="homework.submissions" @save-submission="saveSubmission" @delete-homework="() => deleteHomeworkById(homework.id)"/>
          </li>
        </ul>
      </div>
    </div>
    <v-homework-stat />
  </div>
  <div class="loader-container" v-show="isLoading">
          <div class="loader"></div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'

import vHomework from '@/components/generalComponents/v-homework.vue'
import vHomeworkStat from '@/components/generalComponents/v-homework-stat.vue'

import { useRoute } from 'vue-router'
import { createSubmission, deleteLessonHomework, getAllStudentHomework } from '@/api/requests'

const emit = defineEmits(['toggle-modal'])

const route = useRoute()

const studentId = computed(()=>{
  return route.params.id
})

const studentHomework = ref([])
const lastHomework = computed(() => {
  return studentHomework.value.length > 0 ? studentHomework.value[0] : {}
})
const allHomework = computed(() => {
  return studentHomework.value.length > 0 ? studentHomework.value.slice(1) : []
})

const isLoading = ref(false)


const toggleModal = () => {
  console.log(lastHomework)
 emit('toggle-tasks-modal', lastHomework.value.lesson_id)
}

const loadData = async () => {
  isLoading.value = true
  const resopnse = await getAllStudentHomework(studentId.value)
  studentHomework.value = resopnse.filter((hw)=> hw.lesson_id)
  isLoading.value = false
}

const saveSubmission = async (hw_data) => {
  hw_data['student_id'] = parseInt(studentId.value)
  const formData = new FormData()

  for (const [key, value] of Object.entries(hw_data)) {
    formData.append(key, value)
  }
  await createSubmission(hw_data.homework_id, formData)

}

const getHwMode = (homework)  => {
  if(homework && homework.submissions?.length) {
    return 'completed'
  }
  return 'previous'
}

const deleteHomeworkById = async (homework_id) => {
  await deleteLessonHomework(homework_id)
  studentHomework.value = studentHomework.value.filter((homework) => homework.id !== homework_id)
}

onMounted(()=>{
  loadData()
})
</script>
