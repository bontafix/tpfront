<template>
  <v-custom-modal ref="customModal" @close="closeModal">
    <template #modal>
      <div class="v-delete-modal">
        <h1 class="modal-title">Вы уверены, что хотите удалить занятие с этим учеником?</h1>
        <div class="caption">Информация об этом занятии будет удалена безвозратно.</div>
      </div>
    </template>
    <template #button>
      <button class="custom-btn red" @click="submitForm">Удалить</button>
    </template>
  </v-custom-modal>
</template>
<script setup>
import { ref } from 'vue'

import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'
import { deleteLessonById } from '@/api/requests'

const props = defineProps({
  lesson: {
    type: Object,
    require: true,
  }
})

const customModal = ref(null)

const closeModal = () => {
  console.log('Закрыли модальное окно')
}

const submitForm = async () => {
  await deleteLessonById(props.lesson.id)
}

</script>
