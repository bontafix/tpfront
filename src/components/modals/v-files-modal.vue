<template>
  <v-modal ref="modalRef">
    <div class="v-files-modal">
      <div class="v-files-modal__container">
        <h2 class="v-files-modal__title modal-title">Загрузка файла</h2>

        <v-files-handler ref="fileHandler" :show-drop-area="true" @file-added="updateFiles" />

        <div class="v-files-modal__buttons">
          <button class="v-files-modal__button custom-btn white" @click="closeModal">
            Отменить
          </button>
          <button class="v-files-modal__button custom-btn blue" @click="saveFiles">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  </v-modal>
</template>

<script setup>
import { ref } from 'vue'
import vModal from '../generalComponents/v-modal.vue'
import vFilesHandler from '../generalComponents/v-files-handler.vue'
const props = defineProps({
  initialFiles: {
    type: Array,
    default: () => [],
  },
})

const modalRef = ref(null)

const emit = defineEmits(['save-files'])

const files = ref([...props.initialFiles])
const fileHandler = ref(null)

const closeModal = () => {
  if (modalRef.value) {
    modalRef.value.close()
  }
}

const saveFiles = () => {
  console.log('Отправляем файлы', files.value)
  emit('save-files', files.value)
  closeModal()
}

const updateFiles = (updatedFiles) => {
  files.value = updatedFiles
}
</script>
