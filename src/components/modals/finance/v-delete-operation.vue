<template>
  <v-custom-modal>
    <template #modal>
      <div class="v-delete-operation">
        <h1 class="modal-title">Вы уверены, что хотите удалить операцию?</h1>
      </div>
    </template>
    <template #button>
      <button class="custom-btn red" @click="deleteOperation">Удалить</button>
    </template>
  </v-custom-modal>
</template>
<script setup>
import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'

const emit = defineEmits(['delete-operation'])

const deleteOperation = () => {
  emit('delete-operation')
}
</script>
