<template>
  <v-custom-modal @submit="cancelFormSubmitted">
    <template #modal>
      <div class="modal-add v-change-modal">
        <div class="modal-title">Редактирование занятия</div>

        <transition name="fade">
          <div v-if="ruleData">
            <v-stable-form :rule-data="ruleData" @form-submited="formSubmitted" ref="currentForm"/>
          </div>
        </transition>
      </div>
    </template>

    <template #cancelButton>
      <button class="custom-btn light-red" @click="() => toggleDeleteScheduleModal()">
        Удалить расписание
      </button>
    </template>

  </v-custom-modal>
</template>

<script setup>
import vStableForm from '../generalComponents/v-stable-form.vue'
import vCustomModal from '../generalComponents/v-custom-modal.vue'

import { defineProps, computed, onMounted, ref } from 'vue'

import { editRule, getRule } from '@/api/requests'
import { sortObject, updatedStableOrder } from '@/utils'

const ruleData = ref()

const props = defineProps({
  lesson: {
    type: Object,
    require: true,
  },
})

const emit = defineEmits(['toggleLessonModals'])

const currentForm = ref(null)

const teacherTimeZone = computed(()=>{
  return  Intl.DateTimeFormat().resolvedOptions().timeZone;
})

const cancelFormSubmitted = () => {
  currentForm.value.submitForm()
}

const toggleDeleteScheduleModal = () => {
  console.log('Зашли в функцию в дочернем')
  emit('toggleLessonModals', 'delete_schedule')
}

const formSubmitted = (requestBody) => {
  console.log(props.lesson)
  requestBody['student_id'] = props.lesson.student_id
  requestBody['group_id'] = props.lesson.group_id
  requestBody['lesson_id'] = props.lesson.id || props.lesson.lesson_id
  requestBody['time_zone_teacher'] = teacherTimeZone.value
  editRule(requestBody, updatedStableOrder).then(() => {
    console.log('Выполнили запрос')
  })
}

onMounted(() => {
  const query = props.lesson?.student_id ? `student_id=${props.lesson?.student_id}` : `group_id=${props.lesson?.group_id}`
  getRule(query).then((data) => {
    ruleData.value = data
  })
  console.log('Выбранный урок - ', props.lesson)
})
</script>
