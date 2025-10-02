<template>
  <v-custom-modal>
    <template #modal>
      <div class="v-delete-cabinet">
        <h2 class="modal-title">
          Вы уверены, что хотите удалить аккаунт?
        </h2>
        <p class="modal-subtitle text-center">
          Информация будет удалена безвозратно.
        </p>
      </div>
    </template>
    <template #button>
      <button class="custom-btn red" @click="submitForm">
        Удалить
      </button>
    </template>
  </v-custom-modal>
</template>
<script setup>
import { deleteAccount } from '@/api/requests';
import vCustomModal from '@/components/generalComponents/v-custom-modal.vue';

const submitForm = async () => {
  await deleteAccount()
}
</script>
