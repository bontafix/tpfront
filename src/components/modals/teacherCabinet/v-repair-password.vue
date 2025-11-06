<template>
  <v-custom-modal :hide-buttons="true">
    <template #modal>
      <div class="v-repair-password">
        <h2 class="modal-title">
          Восстановление пароля
        </h2>
        <div class="modal-filed col">
          <input placeholder="Введите код" type="number" class="custom-input">
          <p class="modal-subtitle">Мы отправили код на вашу почту Username@mail.ru</p>
        </div>
        <a href="#!" class="contact-link">Выслать код повторно</a>
      </div>
    </template>
  </v-custom-modal>
</template>
<script setup>
import vCustomModal from '@/components/generalComponents/v-custom-modal.vue';
</script>
