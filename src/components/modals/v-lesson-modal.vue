<template>
  <v-custom-modal @submit="submitForm" @close="emit('close')">
    <template #modal>
      <div class="modal-add">
        <div class="modal-title">Добавление занятия</div>
        <div class="picker modal-add__picker">
          <div
            class="picker__item"
            :class="{ active: activeAdd == 'single' }"
            @click="setActiveAdd('single')"
          >
            Разовое занятие
          </div>
          <div
            class="picker__item"
            :class="{ active: activeAdd == 'stable' }"
            @click="setActiveAdd('stable')"
          >
            Регулярные занятия
          </div>
        </div>
        <div class="modal-field col modal-add__select">
          <p class="modal-subtitle">Выбор ученика / группы</p>
          <v-styled-select
            :items="options.student"
            @update:model-value="setItem"
            :student-icon="true"
          />
        </div>

        <div class="single" v-if="activeAdd == 'single'">
          <v-form-calendar-info ref="singleForm" @form-submited="submitSingleForm" />
        </div>
        <div class="stable" v-if="activeAdd == 'stable'">
          <v-stable-form ref="stableForm" @form-submited="submitStableForm" />
        </div>
      </div>
    </template>

  </v-custom-modal>
</template>

<script setup>
import vModal from '../generalComponents/v-modal.vue'
import vStableForm from '../generalComponents/v-stable-form.vue'
import vCustomModal from '../generalComponents/v-custom-modal.vue'
import vStyledSelect from '../generalComponents/v-styled-select.vue'
import vFormCalendarInfo from '../generalComponents/v-form-calendar-info.vue'

import { onMounted, ref, computed } from 'vue'
import { useLessonStore } from '@/stores/lessonsStore'
import { createGroupLesson, getGroups, getMonthlyEarnings, getMyStudents, setOneTimeLesson, setStableGroupLesson, setStableLesson } from '@/api/requests'

/* ============================================================ Переменные состояния ============================================================*/

const store = useLessonStore()
const activeAdd = ref('single')
const student = ref()
const group = ref()

const options = ref({
  student: {
    default: 'Ученик',
    options: [{ id: 1, text: 'Артур' }],
  },
})

const emit = defineEmits(['close'])

const singleForm = ref(null)
const stableForm = ref(null)

const teacherTimeZone = computed(()=>{
  return  Intl.DateTimeFormat().resolvedOptions().timeZone;
})


/* ============================================================ Методы ============================================================*/

const setActiveAdd = (name) => {
  activeAdd.value = name
}

const submitForm = () => {
  activeAdd.value === 'single' ? singleForm.value.submitForm() : stableForm.value.submitForm()
}

const submitStableForm = async (stableForm) => {
  if (student.value) {
    stableForm['student_id'] = student.value.id
   } else {
    stableForm['group_id'] = group.value.id
  }
    stableForm['goal'] = 'string'
    stableForm['in_rule'] = true
    stableForm['time_zone_teacher']  = teacherTimeZone.value

    const isValid = Object.values(stableForm).every(
      (value) => value !== undefined && value !== null,
    )

    console.log(stableForm)

    if (isValid) {
      if(group.value) {
        await setStableGroupLesson(stableForm, true)
      } else if(student.value) {
        await setStableLesson(stableForm, true)
      }

    } else {
      alert('Заполните все поля формы')
    }
}
const submitSingleForm = async (singleForm) => {
  singleForm['cost_lesson_one_time']  =  0
  singleForm['trial'] = false
  singleForm['time_zone_teacher'] = teacherTimeZone.value

  if (student.value || group.value) {
    if(student.value) {
      singleForm['student_id'] = student.value.id
      singleForm['student_name'] = student.value.student_name
    } else if(group.value) {
      singleForm['group_id'] = group.value.id
    }

    const isValid = Object.values(singleForm).every(
      (value) => value !== undefined && value !== null,
    )

    if (isValid) {
      if(student.value) {
        await setOneTimeLesson(singleForm, true)
      } else {
        await createGroupLesson(singleForm, true)
      }
    } else {
      alert('Заполните все поля формы')
    }
  } else {
    alert('Выберите ученика / Группу !')
  }
}

const setItem = (selecteditem) => {
  if(selecteditem.student_name) {
    student.value = selecteditem
    group.value = null
  } else {
    group.value = selecteditem
    student.value = null
  }
 console.log(selecteditem)
}

const loadData = async () => {
  const students = await getMyStudents()
  const groups = await getGroups() || []
  console.log(groups)
  let res = [];
  if(Array.isArray(groups)) {
    res = [ ...groups, ...students]
  } else {
    res = students || []
  }


  options.value.student = res

}

/* ============================================================ Хуки ============================================================*/

onMounted(() => {
  loadData()
 /*  getMyStudents().then((students) => {
    options.value.student = students
  }) */
})
</script>
