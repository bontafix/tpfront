// ws.js - ВЕРСИЯ БЕЗ АВТОЛОГАУТА ПРИ НЕВАЛИДНОМ ТОКЕНЕ WS
import { getWSToken } from '@/api/auth'
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
let tokenValidationTimer = null
let isWsAvailable = false // Флаг доступности WebSocket

// ==================== УТИЛИТНЫЕ ФУНКЦИИ ====================

/**
 * Проверка валидности токена WebSocket (без логаута)
 */
function validateWSToken(token) {
  // 1. Проверка наличия токена
  if (!token) {
    console.warn('Токен WebSocket отсутствует')
    return { valid: false, reason: 'Токен отсутствует' }
  }
  
  // 2. Проверка типа
  if (typeof token !== 'string') {
    console.warn('Токен WebSocket должен быть строкой:', typeof token)
    return { valid: false, reason: 'Некорректный тип токена' }
  }
  
  // 3. Проверка длины
  if (token.length < 10) {
    console.warn('Токен WebSocket слишком короткий:', token.length)
    return { valid: false, reason: 'Токен слишком короткий' }
  }
  
  // 4. Проверка формата (пример для JWT)
  try {
    // Если токен в формате JWT (3 части разделенные точками)
    const parts = token.split('.')
    if (parts.length === 3) {
      // Проверяем, что это действительно JWT
      const header = JSON.parse(atob(parts[0]))
      const payload = JSON.parse(atob(parts[1]))
      
      // Проверяем срок действия токена (если есть exp)
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000)
        if (payload.exp < now) {
          console.warn('Токен WebSocket истек')
          return { valid: false, reason: 'Токен истек' }
        }
      }
    }
  } catch (error) {
    // Если не JWT, проверяем минимальные требования
    if (!/^[a-zA-Z0-9_\-]+$/.test(token)) {
      console.warn('Токен содержит недопустимые символы')
      return { valid: false, reason: 'Невалидный формат токена' }
    }
  }
  
  console.log('✅ Токен WebSocket валиден')
  return { valid: true, reason: '' }
}

/**
 * Запуск периодической проверки валидности токена
 */
function startTokenValidation() {
  stopTokenValidation()
  
  tokenValidationTimer = setInterval(() => {
    if (currentToken) {
      const validation = validateWSToken(currentToken)
      if (!validation.valid) {
        console.warn(`Токен WebSocket стал невалидным: ${validation.reason}`)
        // Отправляем событие, но не логаутим
        window.dispatchEvent(new CustomEvent('ws-token-invalid', {
          detail: { reason: validation.reason }
        }))
        
        // При невалидном токене отключаем WebSocket
        disconnectWebSocket()
        isWsAvailable = false
      }
    }
  }, 60000) // Проверяем каждую минуту
}

/**
 * Остановка проверки валидности токена
 */
function stopTokenValidation() {
  if (tokenValidationTimer) {
    clearInterval(tokenValidationTimer)
    tokenValidationTimer = null
  }
}

/**
 * Получение нового токена с обработкой ошибок
 */
async function fetchWSTokenWithValidation() {
  try {
    const response = await getWSToken()
    
    if (!response) {
      console.error('Пустой ответ при получении токена WebSocket')
      isWsAvailable = false
      return null
    }

    // Проверяем, если ответ является кодом ошибки (числом)
    if (typeof response === 'number') {
      console.warn('Ошибка API при получении токена WebSocket:', response)

      // Если ошибка авторизации, отключаем WebSocket, но не логаутим
      if (response === 401) {
        console.warn('WebSocket недоступен: требуется авторизация')
        isWsAvailable = false

        // Отправляем событие о недоступности WebSocket
        window.dispatchEvent(new CustomEvent('ws-unavailable', {
          detail: { reason: 'Ошибка авторизации WebSocket' }
        }))

        return null
      }

      // Другие ошибки - считаем WebSocket недоступным
      console.warn('WebSocket недоступен из-за ошибки API')
      isWsAvailable = false
      return null
    }

    if (response.error) {
      console.warn('Ошибка API при получении токена WebSocket:', response.error)
      
      // Если ошибка авторизации, отключаем WebSocket, но не логаутим
      if (response.error.includes('401') || 
          response.error.includes('Unauthorized') ||
          response.error.includes('auth')) {
        console.warn('WebSocket недоступен: требуется авторизация')
        isWsAvailable = false
        
        // Отправляем событие о недоступности WebSocket
        window.dispatchEvent(new CustomEvent('ws-unavailable', {
          detail: { reason: response.error }
        }))
        
        return null
      }
      
      // Другие ошибки - считаем WebSocket недоступным
      console.warn('WebSocket недоступен из-за ошибки API')
      isWsAvailable = false
      return null
    }
    
    const token = response.ws_token
    
    if (!token) {
      console.warn('Токен WebSocket не получен')
      isWsAvailable = false
      return null
    }
    
    const validation = validateWSToken(token)
    if (!validation.valid) {
      console.warn('Получен невалидный токен WebSocket:', validation.reason)
      isWsAvailable = false
      return null
    }
    
    // Если токен валиден, WebSocket доступен
    isWsAvailable = true
    console.log('✅ WebSocket доступен, токен получен')
    
    return token
    
  } catch (error) {
    console.warn('Ошибка получения токена WebSocket:', error.message)
    
    // Если это ошибка авторизации, WebSocket недоступен
    if (error.message.includes('401') || 
        error.message.includes('auth') ||
        error.message.includes('Unauthorized')) {
      console.warn('WebSocket недоступен: ошибка авторизации')
      isWsAvailable = false
      
      window.dispatchEvent(new CustomEvent('ws-unavailable', {
        detail: { reason: 'Ошибка авторизации WebSocket' }
      }))
    } else {
      // Другие ошибки - сетевые проблемы и т.д.
      isWsAvailable = false
      console.warn('WebSocket временно недоступен')
    }
    
    return null
  }
}

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
 * Проверка статуса WebSocket соединения
 */
export function checkWebSocketStatus() {
  return {
    connected: isWebSocketConnected(),
    status: getWebSocketStatus(),
    wsAvailable: isWsAvailable,
    hasToken: !!currentToken,
    tokenValid: currentToken ? validateWSToken(currentToken).valid : false
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
    console.warn('Сеть недоступна для подключения WebSocket')
    isWsAvailable = false
    return null
  }
  
  // Очищаем старое соединение, если оно существует
  if (ws) {
    disconnectWebSocket()
  }
  
  isConnecting = true
  console.log('Начинаю подключение WebSocket...')
  
  try {
    // Получаем токен для WebSocket с валидацией
    const token = await fetchWSTokenWithValidation()
    
    // Если токен не получен или невалиден, WebSocket недоступен
    if (!token) {
      console.warn('WebSocket недоступен: не удалось получить валидный токен')
      isConnecting = false
      isWsAvailable = false
      
      // Отправляем событие о недоступности
      window.dispatchEvent(new CustomEvent('ws-unavailable', {
        detail: { reason: 'Не удалось получить валидный токен' }
      }))
      
      return null
    }
    
    // Сохраняем токен
    currentToken = token
    isWsAvailable = true
    
    // Запускаем периодическую проверку токена
    startTokenValidation()
    
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
        isWsAvailable = false
      }
    }, 10000)
    
    // Обработчик открытия соединения
    ws.onopen = () => {
      clearTimeout(connectionTimeout)
      console.log('✅ WebSocket подключен, отправляю токен аутентификации...')
      
      reconnectAttempts = 0
      isConnecting = false
      isWsAvailable = true
      
      // Отправляем токен для аутентификации
      if (currentToken) {
        ws.send(JSON.stringify({ 
          type: 'auth',
          token: currentToken,
          timestamp: new Date().toISOString()
        }))
      } else {
        console.error('Токен не найден, WebSocket будет закрыт')
        disconnectWebSocket()
        isWsAvailable = false
        
        window.dispatchEvent(new CustomEvent('ws-unavailable', {
          detail: { reason: 'Токен не найден при подключении' }
        }))
      }
      
      // Запускаем heartbeat
      startHeartbeat()
      
      // Отправляем событие об успешном подключении
      window.dispatchEvent(new CustomEvent('ws-connected'))
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
            window.dispatchEvent(new CustomEvent('ws-auth-success'))
            break
            
          case 'auth_failed':
            console.warn('❌ Ошибка аутентификации WebSocket:', data.message)
            // При ошибке аутентификации очищаем токен
            currentToken = null
            isWsAvailable = false
            
            window.dispatchEvent(new CustomEvent('ws-auth-failed', {
              detail: { message: data.message }
            }))
            
            disconnectWebSocket()
            break
            
          case 'token_expired':
            console.warn('❌ Токен WebSocket истек')
            currentToken = null
            isWsAvailable = false
            
            window.dispatchEvent(new CustomEvent('ws-token-expired'))
            
            disconnectWebSocket()
            break
            
          case 'error':
            console.warn('Ошибка от WebSocket сервера:', data.message)
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
      
      // Коды ошибок, при которых не переподключаемся
      const noReconnectCodes = [
        1000,  // Нормальное закрытие
        1008,  // Нарушение политики (например, невалидный токен)
        4001,  // Не авторизован
        4002,  // Доступ запрещен
        4003   // Неверные учетные данные
      ]
      
      if (noReconnectCodes.includes(event.code)) {
        console.log('Переподключение не требуется:', event.code)
        isWsAvailable = false
        
        window.dispatchEvent(new CustomEvent('ws-closed', {
          detail: { 
            code: event.code, 
            reason: event.reason,
            permanent: true 
          }
        }))
        
        return
      }
      
      // Проверяем, не превышен ли лимит переподключений
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.warn('Достигнут лимит переподключений')
        reconnectAttempts = 0
        isWsAvailable = false
        
        window.dispatchEvent(new CustomEvent('ws-reconnect-limit'))
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
      
      window.dispatchEvent(new CustomEvent('ws-reconnecting', {
        detail: { attempt: reconnectAttempts, delay }
      }))
    }
    
    // Обработчик ошибок
    ws.onerror = (error) => {
      clearTimeout(connectionTimeout)
      console.error('WebSocket ошибка:', error)
      isConnecting = false
      isWsAvailable = false
      
      // Соединение автоматически закроется, onclose будет вызван
    }
    
    return ws
    
  } catch (error) {
    console.error('Критическая ошибка подключения WebSocket:', error)
    isConnecting = false
    isWsAvailable = false
    
    window.dispatchEvent(new CustomEvent('ws-connection-error', {
      detail: { error: error.message }
    }))
    
    return null
  }
}

/**
 * Отключение от WebSocket сервера
 */
export function disconnectWebSocket() {
  console.log('Отключаю WebSocket...')
  
  // Останавливаем проверку токена
  stopTokenValidation()
  
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
  // Токен не сбрасываем - он может быть нужен для REST API
  
  window.dispatchEvent(new CustomEvent('ws-disconnected'))
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
 * Проверка, доступен ли WebSocket вообще
 */
export function getWsAvailable() {
  return isWsAvailable
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
  const tokenValidation = currentToken ? validateWSToken(currentToken) : { valid: false, reason: 'Нет токена' }
  
  return {
    status: getWebSocketStatus(),
    isConnecting: isConnecting,
    wsAvailable: isWsAvailable,
    reconnectAttempts: reconnectAttempts,
    maxReconnectAttempts: maxReconnectAttempts,
    listenersCount: listeners.length,
    queueLength: messageQueue.length,
    hasToken: !!currentToken,
    tokenValid: tokenValidation.valid,
    tokenValidationReason: tokenValidation.reason
  }
}

/**
 * Очистка очереди сообщений
 */
export function clearMessageQueue() {
  messageQueue = []
  console.log('Очередь сообщений WebSocket очищена')
}

/**
 * Явная установка токена (например, после перелогина)
 */
export function setWSToken(token) {
  const validation = validateWSToken(token)
  if (!validation.valid) {
    console.warn('Невалидный токен WebSocket:', validation.reason)
    isWsAvailable = false
    return false
  }
  
  currentToken = token
  startTokenValidation()
  isWsAvailable = true
  return true
}

/**
 * Очистка токена (при логауте)
 */
export function clearWSToken() {
  currentToken = null
  stopTokenValidation()
  disconnectWebSocket()
  isWsAvailable = false
  console.log('Токен WebSocket очищен')
}

/**
 * Ручная проверка доступности WebSocket
 */
export async function checkWsAvailability() {
  try {
    const token = await fetchWSTokenWithValidation()
    return {
      available: !!token,
      hasToken: !!currentToken,
      tokenValid: currentToken ? validateWSToken(currentToken).valid : false
    }
  } catch (error) {
    return {
      available: false,
      error: error.message
    }
  }
}

// Экспортируем геттер для отладки (только для разработки)
if (process.env.NODE_ENV === 'development') {
  window.__wsDebug = {
    getInstance: () => ws,
    getStats: getWebSocketStats,
    reconnect: reconnectWebSocket,
    disconnect: disconnectWebSocket,
    validateToken: validateWSToken
  }
}