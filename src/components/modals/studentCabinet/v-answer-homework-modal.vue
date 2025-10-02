<template>
  <v-custom-modal @submit="submitFiles" ref="customModal">
    <template #modal>
      <div class="v-answer-homework-modal">
        <h2 class="v-answer-modal__title modal-title">Ответ на домашнее задание</h2>
          <v-files-handler ref="fileHandler" v-model="files" :show-drop-area="true" @file-added="updateFiles" />
      </div>
    </template>
  </v-custom-modal>
</template>
<script setup>
import { ref } from 'vue';

import vCustomModal from '@/components/generalComponents/v-custom-modal.vue';
import vFilesHandler from '@/components/generalComponents/v-files-handler.vue';


const emit = defineEmits(['submit-files'])

const customModal = ref(null)

const files = ref([])


const submitFiles = () => {
  emit('submit-files', files.value)
  customModal.value.close()
}

</script>
