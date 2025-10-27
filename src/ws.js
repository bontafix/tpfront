// ws.js
import { ref } from 'vue'
import { getWSToken } from '@/api/requests'
import { wsDomain } from '@/utils'

let ws = null
let reconnectAttempts = 0
const maxReconnectAttempts = 5
const listeners = []

// Подписка на сообщения
export function addMessageListener(fn) {
  if (!listeners.includes(fn)) listeners.push(fn)
}

export function removeMessageListener(fn) {
  const index = listeners.indexOf(fn)
  if (index !== -1) listeners.splice(index, 1)
}

// Отправка сообщений
export function sendMessage(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message))
  }
}

// Подключение к WebSocket
export async function connectWebSocket() {
  try {
    if (ws) return ws

    const response = await getWSToken()
    const token = response.ws_token

    if (!token) {
      console.error('Не удалось получить токен для WebSocket')
      return
    }

    ws = new WebSocket(wsDomain)

    ws.onopen = () => {
      console.log('✅ WebSocket подключен, отправляю токен...')
      ws.send(JSON.stringify({ token }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'auth_required') {
          console.log('Требуется повторная аутентификация')
        } else if (data.type === 'auth_success') {
          console.log('Аутентификация успешна')
        } else {
          // Рассылаем сообщение всем подписчикам
          listeners.forEach((fn) => fn(data))
        }
      } catch (error) {
        if (event.data !== 'ping') {
          console.log('Получено текстовое сообщение:', event.data)
        }
      }
    }

    ws.onclose = (event) => {
      console.log('WebSocket закрыт', event.code, event.reason)

      if (event.code === 1008) return // ошибка аутентификации, не переподключаемся

      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = 4000 // можно сделать экспоненциальную задержку
        reconnectAttempts++
        console.log(`Переподключение через ${delay}ms (попытка ${reconnectAttempts})`)
        setTimeout(connectWebSocket, delay)
      } else {
        console.error('Превышено максимальное количество попыток переподключения')
      }
    }

    ws.onerror = (error) => {
      console.error('Ошибка WebSocket:', error)
    }

    return ws
  } catch (error) {
    console.error('Ошибка подключения к WebSocket:', error)
  }
}

// Очистка ресурсов
export function disconnectWebSocket() {
  if (ws) {
    ws.close()
    ws = null
  }
}
