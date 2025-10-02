<template>
  <v-modal ref="modalRef">
    <div class="v-free-service-modal">
      <h2 class="section-title">На текущий момент, наш сервис является бесплатным для всех пользователей</h2>
      <p class="desc inter-400">Успейте присоединиться и получить статус первого пользователя сервиса, в дальнейшем это
        гарантирует наличие специальных условий для Вас на пользование сервисом*</p>
      <div class="caption">*Специальные условия остаются на усмотрение лицензиара и действуют ограниченный период
        времени</div>

      <v-files-handler ref="fileHandler" :show-drop-area="true" @file-added="updateFiles" />

      <div class="v-files-modal__buttons">
        <button class="v-files-modal__button custom-btn blue" @click="pushToRegister">
          Начать работу
        </button>
      </div>
    </div>
  </v-modal>
</template>

<script setup>
import vModal from '@/components/generalComponents/v-modal.vue';
import router from '@/router';

function pushToRegister() {
  router.push({
    name: 'register',
    query: {
      from: 'free-service'
    }
  });
}
</script>

<style scoped lang="scss">
.v-free-service-modal {
  width: 661;
  height: 328;
  width: 100%;
  height: 100%;
  padding-top: 32px;
  padding-right: 24px;
  padding-bottom: 28px;
  padding-left: 24px;
  gap: 32px;
  border-radius: 12px;
  border-width: 1px;
}

.caption {
  padding-bottom: 20px;
}

.request-access-modal {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.section-title {
  font-size: 28px;
}

.hidden {
  display: none;
}
</style>
