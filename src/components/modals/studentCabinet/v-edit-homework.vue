<template>
  <v-custom-modal @submit="submitFiles" ref="customModal">
    <template #modal>
      <div class="v-edit-homework-modal">
        <h2 class="v-edit-modal__title modal-title">Редактирование ответа</h2>
        <v-files-handler
          ref="fileHandler"
          v-model="answerFiles"
          :show-drop-area="true"
          @file-added="updateFiles"
          @file-removed="removeFile"
        />
      </div>
    </template>
  </v-custom-modal>
</template>
<script setup>
import { onMounted, ref, watch } from 'vue'
import { deleteStudentAnswer } from '@/api/requests'
import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'
import vFilesHandler from '@/components/generalComponents/v-files-handler.vue'

const props = defineProps({
  files: {
    type: Array,
    default: () => [],
  },
  currentSubject: {
    type: Object,
    default: {}
  }
})

const emit = defineEmits(['edit-files'])
const customModal = ref(null)

const answerFiles = ref([])

const removeFile = async (data) => {
  await deleteStudentAnswer(data.id, props.currentSubject.id)
}

const submitFiles = () => {
  if (JSON.stringify({ ...props.files }) !== JSON.stringify({ ...answerFiles.value })) {
    emit('edit-files', answerFiles.value)
  }
  customModal.value.close()
}

watch(
  () => props.files,
  (newFiles) => {
    console.log('Files changed:', newFiles)
    answerFiles.value = [...newFiles]
  },
  { immediate: true },
)

onMounted(() => {
  answerFiles.value = [...props.files]
  console.log('Mounted with files:', answerFiles.value)
})
</script>
