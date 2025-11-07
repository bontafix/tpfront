<template>
  <v-custom-modal @submit="submitForm" ref="customModal">
    <template #modal>
      <div class="modal-transfer">
        <h2 class="modal-title mb-4">Перенос занятия</h2>
        <div class="flex gap-4 modal-transfer__container">

          <div class="modal-transfer__block ">
            <div class="modal-field col">
              <h3 class="modal-field__title">Дата</h3>
              <VueDatePicker
                class="custom-datepicker"
                :format="formatDay"
                :locale="'ru-ru'"
                v-model="changedData.date"
                :auto-apply="true"
                :position="'left'"
              >
                <template #clear-icon="{ clear }"> </template>
              </VueDatePicker>
            </div>

            <div class="modal-field col">
              <h3 class="modal-field__title">
                Время
              </h3>
              <div class="flex gap-2">
                <VueTimepicker
                  @update:modelValue="handleTimeUpdate"
                  v-model="changedData.time[1].start"
                  :position="'top'"
                  placeholder="--:--"
                  :clearable="false"
                />
                <VueTimepicker
                  v-model="changedData.time[1].end"
                  placeholder="--:--"
                  :clearable="false"
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </template>

  </v-custom-modal>
</template>

<script setup>
import vCustomModal from '../generalComponents/v-custom-modal.vue'

/* datepicker */
import '@vuepic/vue-datepicker/dist/main.css'
import VueDatePicker from '@vuepic/vue-datepicker'

/* timepicker */
import VueTimepicker from 'vue3-timepicker'
import 'vue3-timepicker/dist/VueTimepicker.css'

import { formatDay, changeTime } from '@/utils'
import { ref, onMounted } from 'vue'
import { transferLesson } from '@/api/requests'

/* ============================================================ Переменные состояния ============================================================ */

const props = defineProps({
  lesson: {
    type: Object,
    require: true,
  },
})

const changedData = ref({
  date: new Date(),
  time: {
    1: { start: props.lesson.start_time, end: props.lesson.end_time},
  },
})

const customModal = ref(null)

/* =================================================================== Методы ===================================================================== */

const submitForm = () => {
  if (changedData.value) {
    const time = changedData.value.time[1]
    const dayOfWeekId = changedData.value.date.getDay()

    const requestBody = {
      day_of_week_id: dayOfWeekId || 7,
      start_time: time.start + ':00.000Z',
      end_time: time.end + ':00.000Z',
      conducted_date: changedData.value.date.toISOString().split('T')[0],
      in_rule: false,
    }
    transferLesson(props.lesson.id, requestBody, true)
    customModal.value.close()
  }
}

const handleTimeUpdate = (newValue) => {
  changedData.value.time[1].start = newValue
  changedData.value.time[1].end = newValue
  changeTime(1, changedData.value.time)
}

onMounted(() => {
  console.log(props.lesson)
})
</script>
