<template>
  <v-custom-modal :hide-buttons="true">
    <template #modal>
      <div class="v-buttons-modal">
        <h2 class="modal-title">{{ lesson.student_name }}</h2>
        <div class="modal-subtitle">
          {{ formattedDate }}
        </div>
        <div class="v-buttons-modal__container">
          <div
            class="v-buttons-modal__button custom-btn light-blue"
            @click="toggleLessonModals('transfer_lesson')"
          >
            Перенести занятие
          </div>
          <div class="v-buttons-modal__button custom-btn light-red" @click="toggleLessonModals('cancel_lesson')">
            Отменить занятие
          </div>
          <div class="v-buttons-modal__button custom-btn light-red" v-show="!props.lesson.in_rule" @click="toggleLessonModals('delete_lesson')">
            Удалить занятие
          </div>
          <div class="v-buttons-modal__schedule" v-show="props.lesson.in_rule"  @click="toggleLessonModals('change_lesson')">
            Настройка расписания
          </div>
        </div>
      </div>
    </template>

  </v-custom-modal>
</template>
<script setup>
import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'

import { onMounted, computed } from 'vue'

const emit = defineEmits(['toggleLessonModals'])
const props = defineProps({
  lesson: {
    type: Object,
    required: true,
  },
})


const formattedDate = computed(()=>{
  console.log(props.lesson)
  const date = new Date(props.lesson.conducted_date)
  const options = { day: 'numeric', month: 'long',}
  const newDate = date.toLocaleDateString('ru-RU', options)
  const startTime = props.lesson.start_time.slice(0, 5)
  const endTime = props.lesson.end_time.slice(0, 5)

  return `${newDate} ${startTime} - ${endTime}`
})
const toggleLessonModals = (name) => {
  emit('toggleLessonModals', name)
}

onMounted(()=>{
  console.log(props.lesson)
})
</script>
