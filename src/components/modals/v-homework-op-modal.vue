<template>
  <v-custom-modal @submit="submitHomework">
    <template #modal>
      <div class="v-homework-op-modal">
        <h2 class="modal-title">
          Если ученик выполнил задание, заданное вне платформы, вы можете добавить оценку
        </h2>

        <div class="v-homework-op-modal__row">
          <div class="v-homework-op-modal__block">
            <p class="modal-subtitle">Оценка</p>
            <v-styled-select :items="[5, 4, 3, 2]" v-model="currentGrade" />
          </div>
        </div>
      </div>
    </template>
  </v-custom-modal>
</template>
<script setup>
import { ref } from 'vue'

import vCustomModal from '../generalComponents/v-custom-modal.vue'
import vStyledSelect from '../generalComponents/v-styled-select.vue'

const emit = defineEmits(['save-manual-grade'])

const currentGrade = ref(null)

const submitHomework = () => {
  emit('save-manual-grade', currentGrade.value)
}
</script>
