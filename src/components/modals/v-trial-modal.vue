<template>
  <v-custom-modal ref="customModal" @submit="submitForm">
    <template #modal>
      <div class="v-trial-modal modal-add">
        <div class="modal-title">Добавление пробного занятия</div>
        <div class="modal-field col">
          <label for="student_name" class="modal-field__title">Имя ученика</label>
          <input
            class="custom-input"
            type="text"
            name=""
            id="student_name"
            placeholder="Введите имя ученика"
            v-model="student_name"
          />
        </div>

        <div class="modal-field v-trial-modal__field">

          <div class="flex flex-col gap-4">
            <div class="flex gap-3">

                <div class="styled-checkbox">
                  <input
                    id="pay"
                    type="checkbox"
                    v-model="pay"
                  />
                  <label for="pay"></label>
                </div>

              <label for="pay" class="custom-checkbox-label">
                <div class="v-calendar-menu__checkbox-subtitle">Платное занятие</div>
              </label>
              </div>

              <div class="v-trial-modal__row" v-if="pay">
                <div class="modal-field col">
                  <label for="cost" class="modal-field__title">Стоимость занятий</label>

                  <div class="flex gap-3">
                    <input class="custom-input" placeholder="Сумма" type="number" id="cost" v-model="price">
                    <v-styled-select
                    class="w-full"
                      :items="['₽ (рублей)']"
                      />
                  </div>
                </div>
              </div>
            </div>

          </div>
        <v-form-calendar-info @form-submited="formSubmited" ref="lessonForm"/>
      </div>
    </template>
  </v-custom-modal>
</template>
<script setup>
import vCustomModal from '../generalComponents/v-custom-modal.vue'
import vStyledSelect from '../generalComponents/v-styled-select.vue'
import vFormCalendarInfo from '../generalComponents/v-form-calendar-info.vue'

import { ref } from 'vue'
import { useLessonStore } from '@/stores/lessonsStore'
import { setOneTimeLesson, setTrialLesson } from '@/api/requests'

const store = useLessonStore()
const customModal = ref(null)

const pay = ref(false)
const price = ref()
const student_name = ref()

const lessonForm = ref(null)

const formSubmited = async (data) => {
  data['cost_lesson'] = price.value || 0
  data['paid'] = data['cost_lesson'] > 0
  data['one_time'] = false
  if (student_name.value) {
    const requestBody = {
      lesson_data: data,

      student_data: { student_name: student_name.value },
    }
    const formattedData = {
      ...data,
      student_name: student_name.value
    }
    store.setOneTimeLesson(formattedData)
    await setTrialLesson({requestBody}, true)

    customModal.value.close()
  } else {
    alert('Введите имя ученика!')
  }
}

const submitForm = () => {
  lessonForm.value.submitForm()
}


</script>
