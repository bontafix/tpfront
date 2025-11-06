// ws.js
import { getWSToken } from '@/api/requests'
import { wsDomain } from '@/utils'

let ws = null
let reconnectAttempts = 0
const maxReconnectAttempts = 5
const listeners = []
let reconnectTimeout = null
let isConnecting = false

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

// Проверка, является ли строка валидным JSON
function isValidJSON(str) {
  if (typeof str !== 'string') return false
  // Игнорируем сообщения от Яндекс.Метрики и других расширений
  if (str.trim().startsWith('__ym__') || str.trim().startsWith('__')) {
    return false
  }
  // Проверяем, что строка начинается с { или [
  const trimmed = str.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return false
  }
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

// Подключение к WebSocket
export async function connectWebSocket() {
  try {
    // Если уже подключаемся, не создаем новое соединение
    if (isConnecting) {
      return ws
    }

    // Если соединение уже открыто, возвращаем его
    if (ws && ws.readyState === WebSocket.OPEN) {
      return ws
    }

    // Закрываем старое соединение, если оно существует
    if (ws) {
      ws.onclose = null // Убираем обработчик, чтобы не вызвать переподключение
      ws.onerror = null
      ws.onmessage = null
      ws.onopen = null
      if (ws.readyState !== WebSocket.CLOSED) {
        ws.close()
      }
      ws = null
    }

    isConnecting = true

    const response = await getWSToken()
    if (!response || !response.ws_token) {
      console.error('Не удалось получить токен для WebSocket')
      isConnecting = false
      return
    }

    const token = response.ws_token

    // Нормализуем URL (убираем слэш в конце, если есть)
    const wsUrl = wsDomain.endsWith('/') ? wsDomain.slice(0, -1) : wsDomain
    
    if (!wsUrl || (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://'))) {
      console.error('Некорректный URL для WebSocket:', wsUrl)
      isConnecting = false
      return
    }

    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('✅ WebSocket подключен, отправляю токен...')
      reconnectAttempts = 0 // Сбрасываем счетчик при успешном подключении
      isConnecting = false
      ws.send(JSON.stringify({ token }))
    }

    ws.onmessage = (event) => {
      try {
        // Игнорируем ping сообщения
        if (event.data === 'ping' || event.data === 'pong') {
          return
        }

        // Проверяем, является ли сообщение валидным JSON
        if (!isValidJSON(event.data)) {
          // Игнорируем сообщения, которые не являются JSON (например, от расширений браузера)
          return
        }

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
        // Логируем только если это не известные не-JSON сообщения
        if (event.data !== 'ping' && event.data !== 'pong' && !event.data.startsWith('__')) {
          console.warn('Ошибка парсинга сообщения WebSocket:', error, 'Данные:', event.data)
        }
      }
    }

    ws.onclose = (event) => {
      console.log('WebSocket закрыт', event.code, event.reason || '')
      isConnecting = false
      ws = null

      // Очищаем предыдущий таймаут переподключения
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
        reconnectTimeout = null
      }

      // Не переподключаемся при ошибке аутентификации
      if (event.code === 1008) {
        console.error('Ошибка аутентификации WebSocket, переподключение не будет выполнено')
        return
      }

      // Не переподключаемся при нормальном закрытии
      if (event.code === 1000) {
        return
      }

      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(4000 * Math.pow(2, reconnectAttempts), 30000) // Экспоненциальная задержка с максимумом 30 секунд
        reconnectAttempts++
        console.log(`Переподключение через ${delay}ms (попытка ${reconnectAttempts}/${maxReconnectAttempts})`)
        reconnectTimeout = setTimeout(() => {
          connectWebSocket()
        }, delay)
      } else {
        console.error('Превышено максимальное количество попыток переподключения')
        reconnectAttempts = 0 // Сбрасываем для следующей попытки
      }
    }

    ws.onerror = (error) => {
      console.error('Ошибка WebSocket:', error)
      isConnecting = false
      // onclose будет вызван автоматически, там обработаем переподключение
    }

    return ws
  } catch (error) {
    console.error('Ошибка подключения к WebSocket:', error)
    isConnecting = false
    reconnectAttempts = 0
  }
}

// Очистка ресурсов
export function disconnectWebSocket() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }
  
  if (ws) {
    ws.onclose = null
    ws.onerror = null
    ws.onmessage = null
    ws.onopen = null
    if (ws.readyState !== WebSocket.CLOSED) {
      ws.close(1000, 'Закрыто пользователем')
    }
    ws = null
  }
  
  reconnectAttempts = 0
  isConnecting = false
}
