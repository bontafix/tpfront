<template>
  <v-custom-modal ref="customModal" :hide-buttons="true">
    <template #modal>
      <div class="v-password-saved">
        <div class="v-password-saved__image">
          <img src="/src/assets/images/saved.svg" alt="saved">
        </div>
        <h2 class="modal-title">Новый пароль сохранен</h2>
        <button class="custom-btn white" @click="closeModal">
          ОК
        </button>
      </div>
    </template>

  </v-custom-modal>
</template>
<script setup>
import { ref } from 'vue';

import vCustomModal from '@/components/generalComponents/v-custom-modal.vue';

const customModal = ref(null)

const closeModal = () => {
  customModal.value.close()
}
</script>
