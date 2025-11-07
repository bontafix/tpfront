<template>
  <v-custom-modal @submit="deleteLesson" ref="closeModal">
    <template #modal>
      <div class="v-delete-lesson-modal">
        <div class="modal-title">Отмена занятия</div>
        <div class="v-delete-lesson-modal__container">
          <div class="modal-field col" v-if="!lesson.amount_deducted">
          <label for="deposit" class="modal-field__title">Депозит за омтену</label>
          <input type="number" class="custom-input" placeholder="Введите сумму оплаты" v-model="deposit">
          <p class="caption mt-2">Если занятие было оплачено - оставьте поле пустым</p>
        </div>
        <div class="modal-field col" v-else>
            <div class="caption text-center">
              <span class="red-text">Внимание: </span>
              При отмене проведённого занятия, списанные с баланса ученика средства возвращаются обратно
            </div>
        </div>
        </div>
      </div>
    </template>
    <template #button>
      <button class="custom-btn" :class="{red : lesson.amount_deducted, blue: !lesson.amount_deducted}" @click="deleteLesson">
        Подтвердить
      </button>
    </template>
  </v-custom-modal>
</template>
<script setup>
import { ref } from 'vue'

import { deleteLessonById, cancelLesson } from '@/api/requests'
import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'

import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const deposit = ref(null)

const props = defineProps({
  lesson: {
    type: Object,
    require: true,
  },
})

const customModal = ref(null)

const deleteLesson = async () => {
  try {
    const lessobData = {
      "lesson_id": props.lesson.id,
      "canceled_sum": deposit.value || 0
    }
    await cancelLesson(lessobData)
    customModal.value.close()
  } catch(error) {
    console.log('Ошибка при отмене занятия', error)
  }

}
</script>
