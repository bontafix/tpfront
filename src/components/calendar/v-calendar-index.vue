<template>
  <div class="v-calendar">
    <component :is="currentPageComponent" ref="currentComponent" />
    <div class="v-calendar__menu mob-actions" v-click-outside="() => (buttonsActive = false)">
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
    <v-trial-modal
      v-if="modals.trial"
      @close="toggleModal('trial')"
      :class="{ 'modal-open': modals.trial }"
    />
  </transition>
  <transition name="fade">
    <v-lesson-modal
      v-if="modals.lesson"
      @close="toggleModal('lesson')"
      :class="{ 'modal-open': modals.lesson }"
    />
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { addMessageListener, removeMessageListener } from '@/ws'
import axios from 'axios'
import { wsDomain } from '@/utils'

import VCalendarWeek from './v-calendar-week.vue'
import VCalendarMonth from './v-calendar-month.vue'

import vTrialModal from '../modals/v-trial-modal.vue'
import vLessonModal from '../modals/v-lesson-modal.vue'
import { getWSToken } from '@/api/requests'

const modals = ref({
  lesson: false,
  trial: false,
})

const buttonsActive = ref(false)
const ws = ref(null)
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 5

const currentComponent = ref(null)

const toggleModal = (modalName) => {
  modals.value[modalName] = !modals.value[modalName]
}

const toggleButtons = () => {
  console.log('clicked')
  buttonsActive.value = !buttonsActive.value
}

const currentPage = ref(localStorage.getItem('activePage') || 'month')

const currentPageComponent = computed(() => {
  if (currentPage.value === 'week') {
    return VCalendarWeek
  }
  return VCalendarMonth
})

const handleMessage = (data) => {
  try {
    if (data.type !== 'ping') {
      // Обработка других сообщений
      console.log('Получено сообщение:', data)

      // Ваша логика обработки сообщений
      if (data.type === 'notifications') {
        if (data.message.includes('закончилось')) {
          console.log('Подгружаем данные')
          currentComponent.value.loadData()
        }
        console.log('Событие урока:', data.type)
      }
    }
  } catch (error) {
    console.log('Произошла ошибка вебсокета', error)
  }
}

// Получение токена для WebSocket
// const getWebSocketToken = async () => {
//   try {
//     const response = await axios.get('http://test-api.teacherplanner.ru//ws/token', {withCredentials: true}) // Замените на ваш URL API
//     return response.data.token
//   } catch (error) {
//     console.error('Ошибка получения токена WebSocket:', error)
//     return null
//   }
// }

const connectWebSocket = async () => {
  try {
    console.log('Подключение к WebSocket...')

    const response = await getWSToken()
    const token = response.ws_token

    if (!token) {
      console.error('Не удалось получить токен для WebSocket')
      return
    }

    ws.value = new WebSocket(wsDomain)
    console.log(JSON.stringify({ token }))
    ws.value.onopen = () => {
      console.log('✅ WebSocket подключен, отправляю токен...')
      ws.value.send(JSON.stringify({ token }))
    }

    ws.value.onmessage = (event) => {
      try {
        // Игнорируем ping сообщения
        if (event.data === 'ping' || event.data === 'pong') {
          return
        }

        // Проверяем, является ли сообщение валидным JSON
        const dataStr = typeof event.data === 'string' ? event.data : String(event.data)
        const trimmed = dataStr.trim()
        
        // Игнорируем сообщения от Яндекс.Метрики и других расширений
        if (trimmed.startsWith('__ym__') || trimmed.startsWith('__')) {
          return
        }
        
        // Проверяем, что строка начинается с { или [
        if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
          return
        }

        const data = JSON.parse(event.data)

        if (data.type === 'auth_required') {
          // Сервер запросил повторную аутентификацию
          console.log('Требуется повторная аутентификация')
          /* ws.value.send(JSON.stringify({ token })) */
        } else if (data.type === 'auth_success') {
          console.log('Аутентификация успешна')
        } else {
          // Обработка других сообщений
          console.log('Получено сообщение:', data)

          // Ваша логика обработки сообщений
          if (data.type === 'notifications' && data.message !== 'ping') {
            if (data.message.includes('закончилось')) {
              console.log('Подгружаем данные')
              currentComponent.value.loadData()
            }
            console.log('Событие урока:', data.type)
          }
        }
      } catch (error) {
        // Логируем только если это не известные не-JSON сообщения
        const dataStr = typeof event.data === 'string' ? event.data : String(event.data)
        if (event.data !== 'ping' && event.data !== 'pong' && !dataStr.startsWith('__')) {
          console.warn('Ошибка парсинга сообщения WebSocket:', error, 'Данные:', event.data)
        }
      }
    }

    ws.value.onclose = (event) => {
      console.log('WebSocket закрыт', event.code, event.reason, event)

      if (event.code === 1008) {
        console.error('Ошибка аутентификации:', event.reason)
        // Не переподключаемся при ошибке аутентификации
        return
      }

      // Переподключение с экспоненциальной задержкой
      if (reconnectAttempts.value != maxReconnectAttempts) {
        const delay = 4 * 1000 // 1s, 2s, 4s, 8s, 16s
        reconnectAttempts.value++

        console.log(`Переподключение через ${delay}ms (попытка ${reconnectAttempts.value})`)
        setTimeout(connectWebSocket, delay)
      } else {
        console.error('Превышено максимальное количество попыток переподключения')
      }
    }

    ws.value.onerror = (error) => {
      console.error('Ошибка WebSocket:', error)
    }
  } catch (error) {
    console.error('Ошибка подключения к WebSocket:', error)
  }
}

// Очистка ресурсов
const cleanup = () => {
  if (ws.value) {
    ws.value.close()
    ws.value = null
  }
}

onMounted(() => {
  console.log('Загрузили')
  addMessageListener(handleMessage)
})

onBeforeUnmount(() => {
  removeMessageListener(handleMessage)
})
</script>
