<template>
  <v-modal ref="modalRef" :id="'burgerModal'">
    <div class="modal-burger top">
      <div class="flex justify-between">
        <button type="button" class="modal-burger__close btn mb-7" @click="closeModal">
          <img class="day-el" src="../../assets/images/close-menu.svg" alt="" />
          <img class="night-el" src="../../assets/images/close-menu-night.svg" alt="" />
        </button>
        <v-user-drop />
      </div>
      <ul class="modal-burger__list">
        <li class="modal-burger__list-item">
          <a class="modal-burger__list-item-link" href="/home-teacher">Главная</a>
        </li>
        <li class="modal-burger__list-item">
          <a class="modal-burger__list-item-link" href="/my-students">Ученики</a>
        </li>
        <li class="modal-burger__list-item">
          <a class="modal-burger__list-item-link active" href="/calendar">Календарь</a>
        </li>
        <li class="modal-burger__list-item">
          <a class="modal-burger__list-item-link" href="/finance">Финансы</a>
        </li>
        <li class="modal-burger__list-item">
          <a class="modal-burger__list-item-link" href="/analytics">Аналитика</a>
        </li>
        <li class="modal-burger__list-item">
          <a class="modal-burger__list-item-link" href="/announcements">Анонсы</a>
        </li>
      </ul>
      <div class="modal__burger__login flex-col items-start">
        <div class="flex gap-2 items-center mb-3">
          <div class="switcher">
            <input type="checkbox" @change="switchTheme" :checked="isNightMode" />
          </div>
          <p class="ml-4 text-base">Цвет темы</p>
        </div>
        <div class="notifications mb-2">
          <a class="noBot" href="">
            <svg
              width="31"
              height="31"
              viewBox="0 0 31 31"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M6.45854 11.625C6.45854 9.227 7.41114 6.92721 9.10678 5.23157C10.8024 3.53593 13.1022 2.58333 15.5002 2.58333C17.8982 2.58333 20.198 3.53593 21.8936 5.23157C23.5893 6.92721 24.5419 9.227 24.5419 11.625V16.4868L26.8953 21.1937C27.0036 21.4103 27.0548 21.651 27.0439 21.893C27.033 22.135 26.9605 22.3701 26.8331 22.5762C26.7058 22.7822 26.5278 22.9523 26.3163 23.0702C26.1047 23.1881 25.8665 23.25 25.6243 23.25H20.5041C20.2168 24.3586 19.5695 25.3403 18.6638 26.0412C17.7582 26.7421 16.6454 27.1223 15.5002 27.1223C14.355 27.1223 13.2422 26.7421 12.3366 26.0412C11.4309 25.3403 10.7836 24.3586 10.4963 23.25H5.37612C5.13391 23.25 4.8957 23.1881 4.68413 23.0702C4.47257 22.9523 4.29466 22.7822 4.16731 22.5762C4.03996 22.3701 3.9674 22.135 3.95651 21.893C3.94563 21.651 3.99679 21.4103 4.10512 21.1937L6.45854 16.4868V11.625ZM13.263 23.25C13.4898 23.6427 13.8159 23.9688 14.2086 24.1955C14.6013 24.4222 15.0468 24.5415 15.5002 24.5415C15.9537 24.5415 16.3991 24.4222 16.7918 24.1955C17.1845 23.9688 17.5106 23.6427 17.7374 23.25H13.263ZM15.5002 5.16666C13.7873 5.16666 12.1446 5.84709 10.9335 7.05826C9.7223 8.26944 9.04187 9.91214 9.04187 11.625V16.4868C9.04184 16.8877 8.94854 17.283 8.76933 17.6416L7.25808 20.6667H23.7436L22.2324 17.6416C22.0527 17.2831 21.959 16.8878 21.9585 16.4868V11.625C21.9585 9.91214 21.2781 8.26944 20.0669 7.05826C18.8558 5.84709 17.2131 5.16666 15.5002 5.16666Z"
                fill="#000"
              />
            </svg>
          </a>
          <a class="bot" href="">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.9996 2.66667C13.5242 2.66667 11.1503 3.65 9.39992 5.40034C7.64958 7.15068 6.66625 9.52465 6.66625 12V16.704C6.66644 16.9108 6.61851 17.1149 6.52625 17.3L4.23691 21.8773C4.12508 22.101 4.07228 22.3495 4.08351 22.5992C4.09475 22.849 4.16965 23.0918 4.30111 23.3045C4.43257 23.5171 4.61621 23.6927 4.8346 23.8144C5.053 23.9362 5.29889 24 5.54892 24H26.4502C26.7003 24 26.9462 23.9362 27.1646 23.8144C27.383 23.6927 27.5666 23.5171 27.6981 23.3045C27.8295 23.0918 27.9044 22.849 27.9157 22.5992C27.9269 22.3495 27.8741 22.101 27.7622 21.8773L25.4742 17.3C25.3815 17.115 25.3331 16.9109 25.3329 16.704V12C25.3329 9.52465 24.3496 7.15068 22.5992 5.40034C20.8489 3.65 18.4749 2.66667 15.9996 2.66667ZM15.9996 28C15.172 28.0004 14.3647 27.7442 13.6889 27.2666C13.0131 26.789 12.5021 26.1135 12.2262 25.3333H19.7729C19.4971 26.1135 18.986 26.789 18.3102 27.2666C17.6344 27.7442 16.8271 28.0004 15.9996 28Z"
                fill="#000"
              />
            </svg>
          </a>

          <p class="ml-4 text-base">Уведомления</p>
        </div>
      </div>
    </div>
  </v-modal>
</template>
<script setup>
import { ref } from 'vue'

import vModal from '../generalComponents/v-modal.vue'
import vUserDrop from '../generalComponents/v-user-drop.vue'

const emit = defineEmits(['switchMode'])
const isNightMode = ref(false)
const modalRef = ref(null)

const switchTheme = () => {
  emit('switchMode')
  isNightMode.value = !isNightMode.value
}

const closeModal = () => {
  if (modalRef.value) {
    modalRef.value.close()
  }
}
</script>
