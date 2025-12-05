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

/**
 * Проверяет статус подключения к WebSocket через API endpoint /ws/status
 * @returns {Promise<{connected: boolean, user_id: string, total_connections: number} | null>}
 * 
 * @example
 * const status = await checkWebSocketStatus()
 * if (status?.connected) {
 *   console.log(`Пользователь ${status.user_id} подключен к WebSocket`)
 * } else {
 *   console.log('WebSocket не подключен')
 * }
 */
export async function checkWebSocketStatus() {
  try {
    // Используем тот же паттерн, что и getWSToken
    // Предполагается, что у вас есть функция для API запросов (адаптируйте под ваш API клиент)
    // Например: import { apiGet } from '@/api/requests'
    
    // Преобразуем WebSocket URL в HTTP URL для API запроса
    const apiBaseUrl = wsDomain
      .replace(/^ws:\/\//, 'http://')
      .replace(/^wss:\/\//, 'https://')
      .replace(/\/$/, '') // Убираем слэш в конце
    
    // Используем fetch с credentials для автоматической отправки кук
    // const response = await fetch(`${apiBaseUrl}/ws/status`, {
    console.log(apiBaseUrl)
    console.log(`apiBaseUrl`)
    const response = await fetch(`${apiBaseUrl}/status`, {
      method: 'GET',
      credentials: 'include', // Важно: отправляем куки (access_token)
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log(response)
    console.log('>>>response')

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Не авторизован для проверки статуса WebSocket')
        return null
      }
      console.warn('Не удалось проверить статус WebSocket:', response.status, response.statusText)
      return null
    }

    const status = await response.json()
    return {
      connected: status.connected || false,
      user_id: status.user_id || null,
      total_connections: status.total_connections || 0
    }
  } catch (error) {
    console.error('Ошибка при проверке статуса WebSocket:', error)
    return null
  }
}

// Подключение к WebSocket
export async function connectWebSocket() {
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

  try {
    const response = await getWSToken()
    if (!response || !response.ws_token) {
      console.error('Не удалось получить токен для WebSocket')
      isConnecting = false
      return
    }

    const token = response.ws_token

    console.log(token)
    console.log(`ws token`)

    // Нормализуем URL (убираем слэш в конце, если есть)
    let wsUrl = wsDomain.endsWith('/') ? wsDomain.slice(0, -1) : wsDomain

    wsUrl = `ws://api.dev-teacherplanner.ru/next/ws`
    
    if (!wsUrl || (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://'))) {
      console.error('Некорректный URL для WebSocket:', wsUrl)
      isConnecting = false
      return
    }
    console.log(wsUrl)
    ws = new WebSocket(wsUrl)
    console.log(ws)
    console.log(`------------------------------- ws`)
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
    
    // Если ошибка 401 (Unauthorized), не пытаемся переподключаться
    if (error.response?.status === 401) {
      console.error('Ошибка авторизации при получении токена WebSocket. Переподключение не будет выполнено.')
      reconnectAttempts = 0
      return null
    }
    
    // Для других ошибок сбрасываем счетчик, но не переподключаемся автоматически
    reconnectAttempts = 0
    return null
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
