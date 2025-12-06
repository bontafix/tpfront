// ws.js - ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ
import { getWSToken } from '@/api/requests'
import { wsDomain } from '@/utils'

// Глобальные переменные
let ws = null
let currentToken = null
let reconnectAttempts = 0
const maxReconnectAttempts = 5
const listeners = []
let reconnectTimeout = null
let isConnecting = false
let messageQueue = []
let isProcessingQueue = false
let heartbeatInterval = null

// ==================== УТИЛИТНЫЕ ФУНКЦИИ ====================

/**
 * Проверяет, является ли строка валидным JSON
 */
function isValidJSON(str) {
  if (typeof str !== 'string') return false
  
  // Игнорируем сообщения от Яндекс.Метрики и других расширений
  const trimmed = str.trim()
  if (trimmed.startsWith('__ym__') || trimmed.startsWith('__')) {
    return false
  }
  
  // Проверяем, что строка начинается с { или [
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
 * Валидация токена WebSocket
 */
function validateToken(token) {
  if (!token || typeof token !== 'string') {
    console.error('Некорректный токен:', token)
    return false
  }
  
  if (token.length < 10) {
    console.error('Слишком короткий токен')
    return false
  }
  
  return true
}

/**
 * Построение URL для WebSocket соединения
 */
function buildWebSocketUrl() {
  let url = wsDomain || ''
  
  // Если URL пустой, используем текущий хост
  if (!url) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    url = `${protocol}//${window.location.host}/ws`
    return url
  }
  
  // Если домен не содержит протокол, добавляем его
  if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    url = `${protocol}//${url}`
  }
  
  // Убедимся, что есть путь /ws
  if (!url.includes('/ws')) {
    url = url.endsWith('/') ? `${url}ws` : `${url}/ws`
  }
  
  console.log('WebSocket URL:', url)
  return url
}

/**
 * Проверка доступности сети
 */
async function checkNetworkConnection() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    const response = await fetch('/favicon.ico', {
      method: 'HEAD',
      cache: 'no-cache',
      mode: 'no-cors',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return true
  } catch (error) {
    console.warn('Проверка сети: нет подключения к интернету')
    return false
  }
}

/**
 * Обработка очереди сообщений
 */
function processMessageQueue() {
  if (isProcessingQueue || messageQueue.length === 0) return
  
  isProcessingQueue = true
  
  const processNext = () => {
    if (messageQueue.length === 0) {
      isProcessingQueue = false
      return
    }
    
    const message = messageQueue.shift()
    notifyListeners(message)
    
    // Используем requestAnimationFrame для избежания блокировки UI
    requestAnimationFrame(() => {
      processNext()
    })
  }
  
  processNext()
}

/**
 * Уведомление всех слушателей о новом сообщении
 */
function notifyListeners(data) {
  listeners.forEach((fn) => {
    try {
      fn(data)
    } catch (error) {
      console.error('Ошибка в обработчике WebSocket сообщения:', error)
    }
  })
}

/**
 * Запуск heartbeat для поддержания соединения
 */
function startHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
  }
  
  heartbeatInterval = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'ping',
        timestamp: Date.now()
      }))
    }
  }, 25000) // Пинг каждые 25 секунд
}

/**
 * Остановка heartbeat
 */
function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
}

// ==================== ПУБЛИЧНЫЕ ФУНКЦИИ ====================

/**
 * Добавление слушателя сообщений WebSocket
 */
export function addMessageListener(fn) {
  if (!listeners.includes(fn)) {
    listeners.push(fn)
  }
}

/**
 * Удаление слушателя сообщений WebSocket
 */
export function removeMessageListener(fn) {
  const index = listeners.indexOf(fn)
  if (index !== -1) {
    listeners.splice(index, 1)
  }
}

/**
 * Отправка сообщения через WebSocket
 */
export function sendMessage(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
      return false
    }
  } else {
    console.warn('WebSocket не подключен, сообщение не отправлено:', message)
    return false
  }
}

/**
 * Отправка сообщения с подтверждением доставки
 */
export function sendWithConfirmation(message, timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      reject(new Error('WebSocket не подключен'))
      return
    }
    
    const messageId = Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    const messageToSend = {
      ...message,
      _id: messageId,
      _timestamp: new Date().toISOString()
    }
    
    const timeoutId = setTimeout(() => {
      removeMessageListener(confirmationHandler)
      reject(new Error('Таймаут отправки сообщения'))
    }, timeout)
    
    const confirmationHandler = (response) => {
      if (response._responseTo === messageId) {
        removeMessageListener(confirmationHandler)
        clearTimeout(timeoutId)
        resolve(response)
      }
    }
    
    addMessageListener(confirmationHandler)
    
    try {
      ws.send(JSON.stringify(messageToSend))
    } catch (error) {
      removeMessageListener(confirmationHandler)
      clearTimeout(timeoutId)
      reject(error)
    }
  })
}

/**
 * Проверка статуса WebSocket соединения через API
 */
export async function checkWebSocketStatus() {
  try {
    // Преобразуем WebSocket URL в HTTP URL
    const wsUrl = buildWebSocketUrl()
    const apiBaseUrl = wsUrl
      .replace(/^ws:\/\//, 'http://')
      .replace(/^wss:\/\//, 'https://')
      .replace(/\/ws$/, '') // Убираем /ws в конце
    
    const response = await fetch(`${apiBaseUrl}/status`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Не авторизован для проверки статуса WebSocket')
        return null
      }
      console.warn('Не удалось проверить статус WebSocket:', response.status)
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

/**
 * Подключение к WebSocket серверу
 */
export async function connectWebSocket() {
  // Проверяем, не идет ли уже подключение
  if (isConnecting) {
    console.log('Уже идет подключение WebSocket...')
    return ws
  }
  
  // Если соединение уже открыто, возвращаем его
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('WebSocket уже подключен')
    return ws
  }
  
  // Проверяем доступность сети
  const isNetworkAvailable = await checkNetworkConnection()
  if (!isNetworkAvailable) {
    console.error('Сеть недоступна для подключения WebSocket')
    return null
  }
  
  // Очищаем старое соединение, если оно существует
  if (ws) {
    disconnectWebSocket()
  }
  
  isConnecting = true
  console.log('Начинаю подключение WebSocket...')
  
  try {
    // Получаем токен для WebSocket
    const response = await getWSToken()
    
    if (!response) {
      throw new Error('Пустой ответ от getWSToken()')
    }
    
    if (response.error) {
      throw new Error(`Ошибка API: ${response.error}`)
    }
    
    const token = response.ws_token
    
    if (!validateToken(token)) {
      throw new Error('Невалидный токен WebSocket')
    }
    
    currentToken = token
    
    // Строим URL для подключения
    const wsUrl = buildWebSocketUrl()
    
    // Создаем новое WebSocket соединение
    ws = new WebSocket(wsUrl)
    
    // Таймаут подключения (10 секунд)
    const connectionTimeout = setTimeout(() => {
      if (ws && ws.readyState === WebSocket.CONNECTING) {
        console.error('Таймаут подключения WebSocket')
        ws.close(1006, 'Connection timeout')
        isConnecting = false
      }
    }, 10000)
    
    // Обработчик открытия соединения
    ws.onopen = () => {
      clearTimeout(connectionTimeout)
      console.log('✅ WebSocket подключен, отправляю токен аутентификации...')
      
      reconnectAttempts = 0
      isConnecting = false
      
      // Отправляем токен для аутентификации
      if (currentToken) {
        ws.send(JSON.stringify({ 
          type: 'auth',
          token: currentToken,
          timestamp: new Date().toISOString()
        }))
      } else {
        console.error('Токен не найден, требуется повторная авторизация')
        disconnectWebSocket()
      }
      
      // Запускаем heartbeat
      startHeartbeat()
    }
    
    // Обработчик входящих сообщений
    ws.onmessage = (event) => {
      try {
        // Обработка ping/pong сообщений
        if (event.data === 'ping') {
          ws.send('pong')
          return
        }
        
        if (event.data === 'pong') {
          return
        }
        
        // Игнорируем пустые сообщения
        if (!event.data || typeof event.data !== 'string') {
          return
        }
        
        // Проверяем, является ли сообщение JSON
        if (!isValidJSON(event.data)) {
          // Логируем только нестандартные сообщения
          if (!event.data.startsWith('__')) {
            console.warn('Получено не-JSON сообщение:', event.data.substring(0, 100))
          }
          return
        }
        
        // Парсим JSON
        const data = JSON.parse(event.data)
        
        // Обработка специальных типов сообщений
        switch (data.type) {
          case 'auth_required':
            console.log('Требуется повторная аутентификация WebSocket')
            if (currentToken) {
              ws.send(JSON.stringify({ 
                type: 'auth', 
                token: currentToken 
              }))
            }
            break
            
          case 'auth_success':
            console.log('✅ Аутентификация WebSocket успешна')
            break
            
          case 'auth_failed':
            console.error('❌ Ошибка аутентификации WebSocket:', data.message)
            disconnectWebSocket()
            // Можно вызвать событие для перелогина
            window.dispatchEvent(new CustomEvent('websocket-auth-failed'))
            break
            
          case 'error':
            console.error('Ошибка от WebSocket сервера:', data.message)
            break
            
          case 'ping':
            // Отвечаем на ping
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }))
            break
            
          default:
            // Обычные сообщения добавляем в очередь
            messageQueue.push(data)
            processMessageQueue()
        }
        
      } catch (error) {
        console.warn('Ошибка обработки сообщения WebSocket:', error, 'Данные:', event.data?.substring(0, 200))
      }
    }
    
    // Обработчик закрытия соединения
    ws.onclose = async (event) => {
      clearTimeout(connectionTimeout)
      stopHeartbeat()
      
      console.log(`WebSocket закрыт. Код: ${event.code}, Причина: ${event.reason || 'нет'}`)
      
      isConnecting = false
      
      // Очищаем старый WebSocket объект
      if (ws) {
        ws.onopen = null
        ws.onmessage = null
        ws.onclose = null
        ws.onerror = null
        ws = null
      }
      
      // Очищаем таймаут переподключения
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
        reconnectTimeout = null
      }
      
      // Коды ошибок, при которых не нужно переподключаться
      const noReconnectCodes = [
        1000,  // Нормальное закрытие
        1008,  // Нарушение политики (например, невалидный токен)
        4001,  // Не авторизован
        4002,  // Доступ запрещен
        4003   // Неверные учетные данные
      ]
      
      if (noReconnectCodes.includes(event.code)) {
        console.log('Переподключение не требуется (специальный код закрытия)')
        return
      }
      
      // Проверяем, не превышен ли лимит переподключений
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.error('Достигнут лимит переподключений')
        reconnectAttempts = 0
        return
      }
      
      // Экспоненциальная задержка переподключения
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
      reconnectAttempts++
      
      console.log(`Планирую переподключение через ${delay}ms (попытка ${reconnectAttempts}/${maxReconnectAttempts})`)
      
      // Проверяем сеть перед переподключением
      const isOnline = await checkNetworkConnection()
      if (!isOnline) {
        console.log('Сеть недоступна, увеличиваю задержку переподключения')
        reconnectTimeout = setTimeout(connectWebSocket, 10000) // Ждем 10 секунд
        return
      }
      
      reconnectTimeout = setTimeout(connectWebSocket, delay)
    }
    
    // Обработчик ошибок
    ws.onerror = (error) => {
      clearTimeout(connectionTimeout)
      console.error('WebSocket ошибка:', error)
      isConnecting = false
      // Соединение автоматически закроется, onclose будет вызван
    }
    
    return ws
    
  } catch (error) {
    console.error('Критическая ошибка подключения WebSocket:', error)
    isConnecting = false
    
    // Обработка ошибок авторизации
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.error('Ошибка авторизации WebSocket')
      window.dispatchEvent(new CustomEvent('auth-required'))
    }
    
    return null
  }
}

/**
 * Отключение от WebSocket сервера
 */
export function disconnectWebSocket() {
  console.log('Отключаю WebSocket...')
  
  // Очищаем таймаут переподключения
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }
  
  // Останавливаем heartbeat
  stopHeartbeat()
  
  // Очищаем очередь сообщений
  messageQueue = []
  
  // Закрываем соединение
  if (ws) {
    // Убираем обработчики
    ws.onopen = null
    ws.onmessage = null
    ws.onclose = null
    ws.onerror = null
    
    // Закрываем соединение с кодом 1000 (нормальное закрытие)
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close(1000, 'Закрыто пользователем')
    }
    
    ws = null
  }
  
  // Сбрасываем счетчики
  reconnectAttempts = 0
  isConnecting = false
  currentToken = null
}

/**
 * Получение текущего статуса WebSocket соединения
 */
export function getWebSocketStatus() {
  if (!ws) {
    return 'not_connected'
  }
  
  switch (ws.readyState) {
    case WebSocket.CONNECTING:
      return 'connecting'
    case WebSocket.OPEN:
      return 'connected'
    case WebSocket.CLOSING:
      return 'closing'
    case WebSocket.CLOSED:
      return 'closed'
    default:
      return 'unknown'
  }
}

/**
 * Проверка, активно ли соединение
 */
export function isWebSocketConnected() {
  return ws && ws.readyState === WebSocket.OPEN
}

/**
 * Принудительное переподключение
 */
export async function reconnectWebSocket() {
  console.log('Инициирую принудительное переподключение WebSocket...')
  
  // Сбрасываем счетчик попыток
  reconnectAttempts = 0
  
  // Отключаем текущее соединение
  disconnectWebSocket()
  
  // Ждем немного перед подключением
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Подключаемся заново
  return await connectWebSocket()
}

/**
 * Получение статистики WebSocket
 */
export function getWebSocketStats() {
  return {
    status: getWebSocketStatus(),
    isConnecting: isConnecting,
    reconnectAttempts: reconnectAttempts,
    maxReconnectAttempts: maxReconnectAttempts,
    listenersCount: listeners.length,
    queueLength: messageQueue.length,
    hasToken: !!currentToken
  }
}

/**
 * Очистка очереди сообщений
 */
export function clearMessageQueue() {
  messageQueue = []
  console.log('Очередь сообщений WebSocket очищена')
}

// Экспортируем геттер для отладки (только для разработки)
if (process.env.NODE_ENV === 'development') {
  window.__wsDebug = {
    getInstance: () => ws,
    getStats: getWebSocketStats,
    reconnect: reconnectWebSocket,
    disconnect: disconnectWebSocket
  }
}