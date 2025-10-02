<template>
  <v-base>
    <div class="v-group-details">
      <div class="container">
        <div class="v-group-details__container layout">
          <div class="route">
            <router-link :to="{ name: 'my_students' }"> Группы </router-link>
            <div>/</div>
            <div>Группа "{{ group_data?.name || 'Загрузка...' }}"</div>
          </div>
          <div class="v-group-details__header">
            <h1 class="v-group-details__title text-title">{{ group_data?.name || 'Загрузка...' }}</h1>
            <div class="v-group-details__buttons">
              <button class="custom-btn white" @click="() => toggleModal('editGroup')">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_10529_10718)">
                    <path
                      d="M9.1665 3.3332H3.33317C2.89114 3.3332 2.46722 3.50879 2.15466 3.82135C1.8421 4.13391 1.6665 4.55784 1.6665 4.99986V16.6665C1.6665 17.1086 1.8421 17.5325 2.15466 17.845C2.46722 18.1576 2.89114 18.3332 3.33317 18.3332H14.9998C15.4419 18.3332 15.8658 18.1576 16.1783 17.845C16.4909 17.5325 16.6665 17.1086 16.6665 16.6665V10.8332M15.4165 2.0832C15.748 1.75168 16.1977 1.56543 16.6665 1.56543C17.1353 1.56543 17.585 1.75168 17.9165 2.0832C18.248 2.41472 18.4343 2.86436 18.4343 3.3332C18.4343 3.80204 18.248 4.25168 17.9165 4.5832L9.99984 12.4999L6.6665 13.3332L7.49984 9.99986L15.4165 2.0832Z"
                      stroke="#545F72"
                      stroke-width="1.67"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_10529_10718">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                Редактировать
              </button>
              <button class="custom-btn blue" @click="() => toggleModal('homework')">
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
                Общее домашнее задание
              </button>
            </div>
          </div>
          <div class="scrolltable">
            <v-students-table v-if="group_data" :items="group_data?.students" :type="'students'" @edit-item="editStudent" />
            <div v-else>Загрузка данных...</div>
          </div>
        </div>
      </div>
    </div>
  </v-base>

  <transition name="fade">
    <v-edit-group-modal
      v-if="modals.editGroup"
      @close="() => toggleModal('editGroup')"
      :group-data="group_data"
      :key="group_data?.id || 'no-data'"
    />
  </transition>
  <transition name="fade">
    <v-additionaly-task-modal v-if="modals.homework" @close="() => toggleModal('homework')" :modal-title="'Общее задание'" @save-homework="saveHomework"/>
  </transition>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStudentsStore } from '@/stores/studentsStore'
import vBase from '../v-base.vue'
import vStudentsTable from './v-students-table.vue'
import VEditGroupModal from '../modals/students/v-edit-group-modal.vue'
import vAdditionalyTaskModal from '../modals/students/v-additionaly-task-modal.vue'
import { createHomeworkGroup, getGroupStudents } from '@/api/requests'
import { useRoute, useRouter } from 'vue-router'

import emitter from '@/eventBus'

const route = useRoute()
const router = useRouter()
const store = useStudentsStore()
const group_data = ref(null)

const modals = ref({
  editGroup: false,
  homework: false,
})

const groupId = computed(()=>
   route.params.id
)

const toggleModal = (modal) => {
  console.log('Закрываем окно')
  modals.value[modal] = !modals.value[modal]
}

const editStudent = (student) => {
    router.push({name: 'student4', params: {id: student.id}})
}

const saveHomework = async (data) => {
  const requestBody = {...data, lesson_id: route.params.id}
  const formData = new FormData()

  data.files.forEach(f => {
      formData.append('files', f.file)
  })

  delete requestBody.files

  for(const key in requestBody) {
    formData.append(key, requestBody[key])
  }

  const response = await createHomeworkGroup(groupId.value, formData)
  const requestType = response.status <= 300 ? 'success' : 'error'
  const message = response.data?.message || response.response.data.detail
  emitter.emit('notify', {
          type: requestType,
          message: message
        })
  console.log(response.response.data)
}

const loadData = async () => {
  try {
    const data = await getGroupStudents(groupId.value)
    group_data.value = data
  } catch (error) {
    console.error('Error loading group data:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>
