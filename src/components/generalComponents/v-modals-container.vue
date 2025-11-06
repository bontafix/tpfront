<template>
  <transition name="fade">
    <v-buttons-modal
      v-if="modals.buttons"
      @toggleLessonModals="toggleLessonModals"
      @close="toggleLessonModals('buttons')"
      :lesson="pickedLesson"
    />
  </transition>
  <transition name="fade">
    <v-transfer-modal
      v-if="modals.transfer_lesson"
      @close="toggleLessonModals('transfer_lesson')"
      :lesson="pickedLesson"
    />
  </transition>
  <transition name="fade">
    <v-change-modal
      v-if="modals.change_lesson"
      @toggleLessonModals="toggleLessonModals"
      @close="toggleLessonModals('change_lesson')"
      :lesson="pickedLesson"
    />
  </transition>
  <transition name="fade">
    <v-delete-lesson-modal
      v-if="modals.cancel_lesson"
      @close="toggleLessonModals('cancel_lesson')"
      :lesson="pickedLesson"
    />
  </transition>
  <transition name="fade">
    <v-delete-schedule-modal
     v-if="modals.delete_schedule"
     @close="toggleLessonModals('delete_schedule')"
    :lesson="pickedLesson" />
  </transition>
  <transition name="fade">
    <v-totally-delete-modal
      v-if="modals.delete_lesson"
      @close="toggleLessonModals('delete_lesson')"
      :lesson="pickedLesson"
    />
  </transition>
</template>
<script setup>
import vChangeModal from '../modals/v-change-modal.vue'
import vTransferModal from '../modals/v-transfer-modal.vue'
import vButtonsModal from '../modals/calendar/v-buttons-modal.vue'
import vDeleteLessonModal from '../modals/calendar/v-delete-lesson-modal.vue'
import vDeleteScheduleModal from '../modals/v-delete-schedule-modal.vue'
import vTotallyDeleteModal from '../modals/calendar/v-totally-delete-modal.vue'


import { ref, defineExpose, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const toggleLessonModals = (modalName, lesson = null) => {
  console.log(modalName, modals.value[modalName])
  if (lesson) {
    pickedLesson.value = lesson
  }
  modals.value[modalName] = !modals.value[modalName]
}

const modals = ref({
  buttons: false,
  delete_lesson: false,
  cancel_lesson: false,
  transfer_lesson: false,
  change_lesson: false,
  delete_schedule: false,
})

const pickedLesson = ref({})
defineExpose({
  toggleLessonModals,
})

onMounted(() => {

})
</script>
