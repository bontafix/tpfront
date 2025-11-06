<template>
  <div class="v-profile-info-right">
    <div class="v-profile-info-right__section styled-section">
      <h2 class="text-section-title">
        Почта
      </h2>
      <input type="text" class="custom-input readonly" :value="email" readonl  y>
      <button class="custom-btn white mt-5" @click="() => toggleModal('changeEmail')">
        Привязать другую почту
      </button>
    </div>
    <div class="v-profile-info-right__section v-profile-info-right__actions styled-section">
      <button class="v-profile-info-right__button"  @click="toggleModal('changePassword')">
        <svg class="v-profile-info-right__button-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.66667 7.33334V4.66668C4.66667 3.78262 5.01786 2.93478 5.64298 2.30965C6.2681 1.68453 7.11595 1.33334 8 1.33334C8.88406 1.33334 9.7319 1.68453 10.357 2.30965C10.9821 2.93478 11.3333 3.78262 11.3333 4.66668V7.33334M3.33333 7.33334H12.6667C13.403 7.33334 14 7.9303 14 8.66668V13.3333C14 14.0697 13.403 14.6667 12.6667 14.6667H3.33333C2.59695 14.6667 2 14.0697 2 13.3333V8.66668C2 7.9303 2.59695 7.33334 3.33333 7.33334Z" stroke="#344055" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Сменить пароль
      </button>
      <button class="v-profile-info-right__button" @click="logout">
        <svg class="v-profile-info-right__button-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6M10.6667 11.3333L14 8M14 8L10.6667 4.66667M14 8H6" stroke="#344055" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
          Выйти
      </button>
      <button class="v-profile-info-right__button custom-btn light-red" @click="toggleModal('deleteCabinet')">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 4.99984H4.16667M4.16667 4.99984H17.5M4.16667 4.99984V16.6665C4.16667 17.1085 4.34226 17.5325 4.65482 17.845C4.96738 18.1576 5.39131 18.3332 5.83333 18.3332H14.1667C14.6087 18.3332 15.0326 18.1576 15.3452 17.845C15.6577 17.5325 15.8333 17.1085 15.8333 16.6665V4.99984H4.16667ZM6.66667 4.99984V3.33317C6.66667 2.89114 6.84226 2.46722 7.15482 2.15466C7.46738 1.8421 7.89131 1.6665 8.33333 1.6665H11.6667C12.1087 1.6665 12.5326 1.8421 12.8452 2.15466C13.1577 2.46722 13.3333 2.89114 13.3333 3.33317V4.99984M8.33333 9.1665V14.1665M11.6667 9.1665V14.1665" stroke="#717680" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Удалить аккаунт
      </button>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { logoutUser } from '@/api/requests'


const props = defineProps({
  email: {
    type: String,
    required: true,
  }
})

const emit = defineEmits(['toggle-modal'])

const router = useRouter()

const toggleModal = (modalName) => {
  emit('toggle-modal', modalName)
}

const logout = async () => {
  await logoutUser()
 /*  router.push({name: 'login'}) */

}
</script>
