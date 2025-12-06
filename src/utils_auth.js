import { checkUserAuth } from '@/api/requests';

export function getAccessToken() {
  // Пробуем получить токен из cookies разными способами
  const token = cookieUtils.getCookie('access_token') ||
                cookieUtils.getCookie('accessToken') ||
                cookieUtils.getCookie('token')

  if (token) {
    return decodeURIComponent(token)
  }

  // Fallback на старый способ парсинга cookies
  const match = document.cookie.match(/(^| )access_token=([^;]+)/)
  if (match) {
    return decodeURIComponent(match[2])
  }

  // WORKAROUND: Проверяем localStorage как последний fallback
  // Это необходимо для HTTPS доменов, где cookies могут не устанавливаться
  const localStorageToken = localStorage.getItem('access_token')
  if (localStorageToken) {
    console.log('🔧 [AUTH] Используем токен из localStorage (workaround для HTTPS)')
    return localStorageToken
  }

  return null
}

export const cookieUtils = {
  // Получить куки по имени
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop().split(';').shift());
    }
    return null;
  },

  // Проверить существование куки
  hasCookie(name) {
    return this.getCookie(name) !== null;
  },

  // Удалить куки (для logout)
  deleteCookie(name) {
    // В проде фронт может жить не в корне домена (например, /alex/).
    // Тогда бэкенд ставит куки с path=/alex, а удаление только с path=/
    // не сработает. Здесь пробуем удалить куку сразу по нескольким путям.

    // Базовые кандидаты путей
    const paths = new Set(['/'])

    // Путь из BASE_URL (Vite)
    try {
      const baseUrl = import.meta.env.BASE_URL || '/'
      if (baseUrl && baseUrl !== '/') {
        let normalized = baseUrl
        if (!normalized.startsWith('/')) normalized = '/' + normalized
        // с / на конце
        if (!normalized.endsWith('/')) normalized = normalized + '/'
        paths.add(normalized)
        // и без / на конце
        paths.add(normalized.replace(/\/$/, ''))
      }
    } catch {
      // import.meta.env недоступен — просто игнорируем
    }

    // Текущий "корневой" сегмент пути (например, /alex)
    if (typeof window !== 'undefined') {
      const segments = window.location.pathname.split('/').filter(Boolean)
      if (segments.length > 0) {
        paths.add('/' + segments[0])
        paths.add('/' + segments[0] + '/')
      }
    }

    // Пытаемся удалить куку для всех собранных путей
    paths.forEach((path) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path};`
    })
  },

  // Получить все куки в виде объекта
  getAllCookies() {
    const cookies = {};
    if (document.cookie) {
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name) {
          cookies[name] = decodeURIComponent(value || '');
        }
      });
    }
    return cookies;
  },

  // Проверить токен авторизации
  checkAuthToken() {
    console.log('🍪 Проверка токена авторизации:');
    console.log('  - Все куки:', document.cookie);
    console.log('  - Все куки (объект):', this.getAllCookies());

    const possibleTokenNames = ['access_token', 'accessToken', 'token', 'auth_token', 'jwt', 'session'];
    const foundTokens = {};

    possibleTokenNames.forEach(name => {
      const value = this.getCookie(name);
      if (value) {
        foundTokens[name] = {
          found: true,
          length: value.length,
          preview: value.substring(0, 30) + '...'
        };
      } else {
        foundTokens[name] = { found: false };
      }
    });

    console.log('  - Проверка возможных имен токенов:', foundTokens);

    const token = getAccessToken();
    console.log('  - Токен из getAccessToken():', token ? `✅ Найден (длина: ${token.length})` : '❌ Не найден');

    return {
      allCookies: this.getAllCookies(),
      tokenNames: foundTokens,
      accessToken: token
    };
  }
};

export const isUserAuth = async () => {
  // Если уже идет процесс логаута, не делаем запрос
  if (isHandlingUnauthorized || (typeof window !== 'undefined' && window.__isHandlingUnauthorized)) {
    return false
  }

  try {
    const response = await checkUserAuth()

    // Если checkUserAuth вернул 401, значит идет процесс логаута
    if (response === 401 || typeof response === 'number') {
      return false
    }

    return response?.authorized ?? false
  } catch (error) {
    // Если это 401 ошибка, значит идет процесс логаута
    if (error.response?.status === 401) {
      return false
    }
    return false
  }
}

// Флаг для предотвращения множественных одновременных вызовов handleUnauthorized
let isHandlingUnauthorized = false

// Экспортируем функцию для проверки флага (для использования в других модулях)
export function getIsHandlingUnauthorized() {
  return isHandlingUnauthorized
}

/**
 * Централизованная функция для обработки неавторизованных запросов (401)
 * Очищает токены, состояние и перенаправляет на страницу логина
 */
export async function handleUnauthorized() {
  // Предотвращаем множественные одновременные вызовы
  if (isHandlingUnauthorized || (typeof window !== 'undefined' && window.__isHandlingUnauthorized)) {
    console.log('⚠️ [AUTH] handleUnauthorized уже выполняется, пропускаем повторный вызов')
    return
  }

  // Устанавливаем флаги СРАЗУ, чтобы предотвратить новые запросы
  isHandlingUnauthorized = true
  if (typeof window !== 'undefined') {
    window.__isHandlingUnauthorized = true
  }

  console.warn('⚠️ [AUTH] Обнаружена ошибка 401 - токен недействителен, выполняю автоматический логаут')

  try {
    // Импортируем динамически, чтобы избежать циклических зависимостей
    const { logoutUser } = await import('@/api/requests')
    const { disconnectWebSocket } = await import('@/ws')
    const router = (await import('@/router')).default

    // Закрываем WebSocket соединение
    try {
      disconnectWebSocket()
    } catch (wsError) {
      console.warn('Ошибка при закрытии WebSocket:', wsError)
    }

    // Очищаем все возможные токены из cookies
    cookieUtils.deleteCookie('access_token')
    cookieUtils.deleteCookie('accessToken')
    cookieUtils.deleteCookie('token')
    cookieUtils.deleteCookie('auth_token')
    cookieUtils.deleteCookie('jwt')
    cookieUtils.deleteCookie('session')

    // Очищаем localStorage
    localStorage.removeItem('user_type')
    localStorage.removeItem('isAuth')
    localStorage.removeItem('access_token') // WORKAROUND: очищаем токен из localStorage

    // Очищаем состояние store
    const { useMyStore } = await import('@/stores/myStore')
    const store = useMyStore()
    store.isAuth = false
    store.user_type = ''
    store.info = null
    store.userInfo = null
    store.notifications = null

    // Вызываем logout на сервере (если возможно, но не ждем результата)
    // Используем Promise без await, чтобы не блокировать процесс
    logoutUser().catch((error) => {
      // Игнорируем ошибки при logout, так как токен уже недействителен
      console.warn('Не удалось вызвать logout на сервере (токен уже недействителен):', error)
    })

    // Перенаправляем на страницу логина, если мы не на ней уже
    const currentRoute = router.currentRoute.value
    if (currentRoute.name !== 'login' && currentRoute.name !== 'landing') {
      router.push({ name: 'login' }).catch((routerError) => {
        console.warn('Ошибка при перенаправлении на логин:', routerError)
      })
    }

    console.log('✅ [AUTH] Автоматический логаут выполнен успешно')
  } catch (error) {
    console.error('❌ [AUTH] Ошибка при выполнении автоматического логаута:', error)
    // В любом случае пытаемся перенаправить на логин
    try {
      const router = (await import('@/router')).default
      const currentRoute = router.currentRoute.value
      if (currentRoute.name !== 'login' && currentRoute.name !== 'landing') {
        router.push({ name: 'login' }).catch(() => {
          // Игнорируем ошибки перенаправления
        })
      }
    } catch (routerError) {
      console.error('Не удалось перенаправить на страницу логина:', routerError)
    }
  } finally {
    // Сбрасываем флаг через небольшую задержку, чтобы избежать повторных вызовов
    setTimeout(() => {
      isHandlingUnauthorized = false
      if (typeof window !== 'undefined') {
        window.__isHandlingUnauthorized = false
      }
    }, 1000)
  }
}