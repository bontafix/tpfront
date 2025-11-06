<template>
<div class="v-calendar">
    <slot>
    </slot>
    <div class="v-calendar__menu mob-actions" v-click-outside="() => buttonsActive = false">
        <button class="mob-actions__plus custom-btn blue" @click="toggleButtons">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.99984 4.16663V15.8333M4.1665 9.99996H15.8332"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <div class="mob-actions__menu-items" :class="{ active: buttonsActive }">
          <button class="mob-actions__menu-item" @click="() => toggleModal('lesson')">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.99984 4.16663V15.8333M4.1665 9.99996H15.8332"
                stroke="#717680"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Занятие
          </button>
          <button class="mob-actions__menu-item" @click="() => toggleModal('trial')">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.99984 4.16663V15.8333M4.1665 9.99996H15.8332"
                stroke="#717680"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Пробное занятие
          </button>
        </div>
    </div>
</div>
<transition name="fade">
    <v-trial-modal v-if="modals.trial" @close="toggleModal('trial')" :class="{'modal-open' : modals.trial}"/>
  </transition>
  <transition name="fade">
    <v-lesson-modal v-if="modals.lesson" @close="toggleModal('lesson')" :class="{'modal-open' : modals.lesson}"/>
  </transition>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { wsDomain } from '@/utils'
import vTrialModal from '../modals/v-trial-modal.vue'
import vLessonModal from '../modals/v-lesson-modal.vue'


const modals = ref({
  lesson: false,
  trial: false
})

const buttonsActive = ref(false)


const toggleModal = (modalName) => {
  modals.value[modalName] = !modals.value[modalName]
}

const toggleButtons = () => {
  console.log('clicked')
  buttonsActive.value = !buttonsActive.value
}

let ws = null
const connectWebSocket = () => {
  try {
    console.log('Зашли в функцию')
    ws = new WebSocket(`${wsDomain}lesson_notifications/`)

    ws.onmessage = (event) => {
      if (event.data !== 'ping') {
        console.log(event.data)
        // WebSocket message received
      }
    /*   if(event.data.includes('lesson_started') || event.data.includes('lesson_ended')) {
      } */
    }

    ws.onopen = () => {
      console.log('Веб сокет зщапущен')
      // WebSocket connected
    }

    ws.onclose = () => {
      console.log('Веб сокет закрыт')

      setTimeout(connectWebSocket, 1000)
    }

    ws.onerror = (error) => {
      console.error('Ошибка сокета:', error)
      if (ws) {
        ws.close()
      }
    }
  } catch (error) {
    console.error('Ошибка подключения к WebSocket:', error)
  }
}

// Cleanup
const cleanup = () => {
  if (ws) {
    ws.close()
    ws = null
  }
}

onMounted(()=>{
})
</script>
