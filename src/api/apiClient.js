const domain = import.meta.env.VITE_API_URL
import axios from 'axios'
import jsonOrder from 'json-order'
import { getAccessToken, handleUnauthorized } from '@/utils_auth'

const apiClient = axios.create({
  baseURL: domain,
  withCredentials: true,
  headers: {
    'Cache-Control': 'no-store',
  },
  // Отключаем автоматическое бросание исключений для HTTP ошибок
  // Это убирает красные сообщения в консоли, но сохраняет все ответы
  validateStatus: function (status) {
    // Считаем все статусы валидными (не бросаем исключение)
    // Обработка ошибок будет происходить в interceptor и makeRequest
    return true
  },
})

// Interceptor для добавления токена авторизации в заголовки
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 [REQUEST] Токен добавлен в заголовок Authorization для:', config.url)
    } else {
      // Если токен не найден через JavaScript, но withCredentials: true,
      // то токен может быть в HttpOnly cookies и будет отправлен автоматически браузером
      // Это нормальная ситуация для безопасного хранения токенов
      if (config.withCredentials) {
        // console.log('ℹ️ [REQUEST] Токен не найден в доступных cookies через JavaScript, но withCredentials: true - HttpOnly cookies будут отправлены автоматически')
        // console.log('  - URL запроса:', config.url)
      } else {
        // Только если withCredentials: false, это может быть проблемой
        console.warn('⚠️ [REQUEST] Токен авторизации не найден и withCredentials: false для запроса:', config.url)
        console.warn('  - Доступные cookies:', document.cookie)
      }
    }
    
    // Логируем информацию о куках, которые будут отправлены (только для важных запросов)
    if (config.withCredentials && (config.url?.includes('/api/') || config.url?.includes('ws/'))) {
      // console.log('🍪 [REQUEST] withCredentials: true - куки будут отправлены автоматически')
      // console.log('  - URL запроса:', config.url)
      // console.log('  - Метод:', config.method?.toUpperCase())
      if (document.cookie) {
        const cookieCount = document.cookie.split(';').length
        // console.log(`  - Количество доступных куков (не HttpOnly): ${cookieCount}`)
        // Показываем только имена куков для безопасности
        const cookieNames = document.cookie.split(';').map(c => c.trim().split('=')[0])
        // console.log('  - Имена доступных куков:', cookieNames)
        // console.log('  - ⚠️ Примечание: HttpOnly cookies не видны через document.cookie, но будут отправлены автоматически')
      } else {
        // console.log('  - ⚠️ Доступные cookies отсутствуют, но HttpOnly cookies могут быть отправлены автоматически')
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor для обработки ошибок авторизации
apiClient.interceptors.response.use(
  async (response) => {
    // Логируем успешные ответы для проверки куков
    if (response.config?.url?.includes('/api/login') && response.status >= 200 && response.status < 300) {
      console.log('✅ [RESPONSE] Успешный ответ от /api/login')
      console.log('  - Статус:', response.status)
      console.log('  - Заголовки ответа (Set-Cookie):', response.headers['set-cookie'] || 'Не найдены')
      console.log('  - Все заголовки ответа:', Object.keys(response.headers))
      
      // Проверяем куки после ответа
      setTimeout(() => {
        console.log('🍪 [RESPONSE] Куки после ответа от сервера:')
        console.log('  - document.cookie:', document.cookie)
      }, 50)
    }
    
    // Обрабатываем HTTP ошибки (теперь они приходят как обычные ответы благодаря validateStatus)
    if (response.status === 401) {
      // Проверяем, не идет ли уже процесс логаута
      if (typeof window !== 'undefined' && window.__isHandlingUnauthorized) {
        // Уже идет процесс логаута, просто возвращаем ответ
        return response
      }

      const url = response.config?.url || ''

      // Исключаем запросы к /api/login, /api/logout, /ws/token и /api/user/me, чтобы избежать бесконечного цикла
      // WebSocket токены и запросы проверки авторизации могут быть недоступны без необходимости логаута пользователя
      if (!url.includes('/api/login') && !url.includes('/api/logout') && !url.includes('/ws/token') && !url.includes('/api/user/me')) {
        // Для других запросов 401 - это проблема с токеном
        console.error('❌ [RESPONSE] 401 Unauthorized - проблема с токеном авторизации')
        console.error('  - URL запроса:', url)
        console.error('  - Доступные cookies:', document.cookie)
        console.error('  - Заголовки запроса:', response.config?.headers)

        // Выполняем автоматический логаут
        await handleUnauthorized()
      } else if (url.includes('/api/user/me')) {
        // Для запросов проверки авторизации 401 - это нормальное состояние
        console.log('ℹ️ [AUTH] Проверка авторизации: пользователь не авторизован')
      }
      // Для /api/login, /api/logout, /ws/token - просто возвращаем ответ без логаута
    }
    
    return response
  },
  async (error) => {
    // Обработка сетевых ошибок (не HTTP ошибок, а реальных сетевых проблем)
    console.error('❌ [RESPONSE] Сетевая ошибка:', error.message)
    return Promise.reject(error)
  },
)

// Общая функция для выполнения запросов
export async function makeRequest(endpoint, method = 'GET', body = null, headers = null) {
  const config = {
    method: method.toLowerCase(),
    url: endpoint,
    withCredentials: true,
    headers: {
      'Cache-Control': 'no-store',
      ...headers,
    },
  }

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.headers['Content-Type'] = 'application/json'
    config.data =
      method === 'POST' || method === 'PUT' ? jsonOrder.stringify(body) : JSON.stringify(body)
  } else if (body && method === 'DELETE') {
    config.data = JSON.stringify(body)
  }

  try {
    const response = await apiClient(config)
    
    // Теперь все HTTP статусы приходят как успешные ответы благодаря validateStatus
    // Проверяем статус и обрабатываем ошибки без красных сообщений в консоли
    const statusCode = response.status
    const url = config.url || ''
    
    // Для успешных запросов (2xx)
    if (statusCode >= 200 && statusCode < 300) {
      const result = method === 'GET' ? response.data : response
      return result
    }
    
    // Для запросов проверки авторизации 401 - это нормальное состояние, не ошибка
    if (url.includes('/api/user/me') && statusCode === 401) {
      console.log('ℹ️ [AUTH] Проверка авторизации: пользователь не авторизован')
      return statusCode
    }
    
    // Для ошибок сервера (5xx)
    if (statusCode >= 500) {
      /* if (import.meta.env.PROD) {
        router.push({name: 'error_500'})
        console.log('Перенаправление')
      } */
    }
    
    // Для всех остальных ошибочных статусов (4xx, 5xx) возвращаем полный ответ
    // ✅ Возвращаем полный объект ответа для resolveApiMessage
    // Логируем информативно, но не как ошибку (без console.error)
    console.log(`ℹ️ [API] Ответ со статусом ${statusCode} от ${endpoint}`)
    return response
  } catch (error) {
    // Обрабатываем реальные сетевые ошибки (не HTTP ошибки)
    /* if (import.meta.env.PROD) {
      router.push({name: 'error_500'})
      console.log('Перенаправление')
    } */
    console.error(`❌ [API] Сетевая ошибка при ${method}-запросе ${endpoint}:`, error.message)
    throw error
  }
}

// Существующий метод GET оставляем для обратной совместимости
export async function makeGetRequest(endpoint) {
  return makeRequest(endpoint, 'GET')
}

export { apiClient, domain }
