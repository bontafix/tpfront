<template>
  <v-custom-modal @submit="submitForm" ref="customModal">
    <template #modal>
      <div class="v-add-result-modal">
        <h2 class="modal-title">{{ currentTitle }}</h2>
         <form action="" class="modal-form">
          <div class="modal-field col">
            <p class="modal-field__title">Ученик</p>
            <input type="text" class="custom-input student-input" :value="studentName" readonly />
            {{ props.data?.student_name }}
          </div>

          <div class="modal-field col">
            <p class="modal-field__title">Тип работы</p>
            <input
              type="text"
              class="custom-input"
              placeholder="Тип работы"
              v-model="formData.work_type"
            />
          </div>

          <div class="modal-field flex gap-5 items-center">
            <p class="modal-field__title">Дата</p>
            <VueDatePicker
              class="custom-datepicker"
              v-model="getDate"
              :locale="'ru-ru'"
              :auto-apply="true"
              :format="formatDate"
            >
              <template #clear-icon="{ clear }"> </template>
            </VueDatePicker>
          </div>

          <div class="modal-field col">
            <p class="modal-field__title">Комментарий</p>
            <v-custom-textarea
              v-model="formData.comment"
              placeholder="Ваш комментарий к работе"
            />
          </div>

          <div class="modal-field flex justify-between">
            <div class="flex gap-3 items-center">
              <div class="styled-checkbox">
                <input
                  type="checkbox"
                  v-model="exams"
                  id="exams"
                  :checked="exams"
                  @input="selectExam"
                />
                <label for="exams"></label>
              </div>
              <label for="exams" class="modal-field__title">ОГЭ/ЕГЭ</label>
            </div>
            <div class="flex gap-3 items-center " v-show="!exams">
              <p class="modal-field__title">
                Оценка
              </p>
              <v-styled-select :items="[2, 3, 4, 5]" class="select-mark" :default-value="getResult" v-model="formData.result"/>
            </div>
          </div>

          <div class="modal-field row" v-show="exams">
            <div class="v-add-result-modal__col">
              <p class="modal-field__title">Часть 1</p>
              <input type="number" v-model="formData.part1_result" class="custom-input" placeholder="100" />
            </div>
            <div class="v-add-result-modal__col">
              <p class="modal-field__title">Часть 2</p>
              <input type="number" v-model="formData.part2_result" class="custom-input" placeholder="100" />
            </div>
          </div>
        </form>
      </div>
    </template>
    <template #cancelButton v-if="readonly && !data.grade">
      <button class="custom-btn white" @click="deleteResult">Удалить</button>
    </template>
    <template #button v-if="isUpdateble">
      <button class="custom-btn" :class="{gray: !hasChanges, blue: hasChanges}" @click="updateResult">
        Сохранить
      </button>
    </template>
  </v-custom-modal>
</template>
<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

import { formatDate } from '@/utils'
import { useCurrentStudentStore } from '@/stores/currentStudentStore'

import vStyledSelect from '@/components/generalComponents/v-styled-select.vue'

import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'
import vCustomTextarea from '@/components/generalComponents/v-custom-textarea.vue'

import '@vuepic/vue-datepicker/dist/main.css'
import VueDatePicker from '@vuepic/vue-datepicker'
import { routeLocationKey } from 'vue-router'
import { deleteResultById, setResult, updateResultById } from '@/api/requests'

const currentStudentStore = useCurrentStudentStore()
const customModal = ref(null)

// Проп для включения режима readonly
const props = defineProps({
  readonly: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => ({}),
  }
})

const studentName = computed(()=>{
  return currentStudentStore.student?.student_name || props.data?.student_name
})

const route = useRoute()

const isUpdateble = computed(()=>{
  if(!props.data) {
    return false
  }
    return Object.keys(props.data).length
})

const oldData = ref(null)

const hasChanges = computed(()=>{
  if(oldData.value) {
    for (const key in oldData.value) {
      if(oldData.value[key] !== formData.value[key]) {
        return true
      }
    }
  }

  return false
})

const currentTitle = computed(()=>{
  return isUpdateble.value ?  'Просмотр результата' : 'Добавление результата'
})


const exams = ref(true)
const formData = ref({
  work_type: '',
  date: '',
  comment: '',
  part1_result: 0,
  part2_result: 0,
  result: 0
})


const selectExam = () => {
  if(exams.value) {
    formData.value.part1_result = formData.value.part2_result = 0
  } else {
    formData.value.result = 0
  }
}

const submitForm = async () => {
  const studentId = route.params.id;

  const formDataObj = new FormData();

  formDataObj.append("student_id", studentId || "");

  for (const [key, value] of Object.entries(formData.value)) {
    // Если поле null или undefined — пропускаем
    if (value === null || value === undefined) continue;

    if (typeof value === "number") {
      formDataObj.append(key, value.toString());
    }

    else if (value instanceof File || value instanceof Blob) {
      formDataObj.append(key, value);
    }

    else {
      formDataObj.append(key, value);
    }
  }

  await setResult(formDataObj);

}

const updateResult = async () => {
  if(!hasChanges.value) {
    return
  }
  const requestBody = formData.value
  const requestFormData = new FormData()
  for (const key in requestBody) [
      requestFormData.append(key, requestBody[key])
    ]

  const studentId = route.params.id

  requestFormData.append('student_id', studentId)


  await updateResultById(props.data.id, requestFormData)

  for (const key in requestBody) {
    if(oldData.value[key]) {
      oldData.value[key] = requestBody[key]
    }
  }

}

const deleteResult = async () => {
  const resultId = props.data.id
  if(resultId) {
    await deleteResultById(resultId)
  }
}

const getDate = computed(() => {
  return formData.value.date || formData.value.submission_date
})

const getResult = computed(() => {
  if(!isUpdateble.value && exams.value) {
    return 0
  }
  return formData.value.result || formData.value.grade
})

onMounted(() => {
  currentStudentStore.setStudentDetails()
})

watch(() => props.data, (newData) => {
  if (newData) {
    formData.value = {
      ...newData,
    }
      exams.value = true
      if(newData.result || newData.grade) {
        exams.value = false
      }
  } else {
    formData.value.date = new Date().toISOString().split('T')[0]
  }

  oldData.value = {...newData}

}, { immediate: true })

</script>
