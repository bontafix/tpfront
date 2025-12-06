/**
 * Конфигурация сообщений для API ответов
 * 
 * Примеры ответов от сервера:
 * 
 * УСПЕХ (200-299):
 * { status: 200, data: { user_type: 'teacher' } }
 * { status: 200, data: { user_type: 'teacher', message: 'Добро пожаловать!' } }
 * 
 * ОШИБКА с кодом:
 * { status: 401, data: { code: 'invalid_credentials' } }
 * { status: 409, data: { error_code: 'email_taken' } }
 * { status: 400, data: { key: 'user_type_missing' } }
 * 
 * ОШИБКА с текстом:
 * { status: 500, data: { message: 'Сервер временно недоступен' } }
 * { status: 400, data: { detail: 'Email имеет неверный формат' } }
 */
export const apiMessages = {
  login: {
    // Общий успешный текст
    success: 'Вы успешно вошли в систему',

    // Типовые ошибки
    invalid_credentials: 'Неверный логин или пароль',
    user_type_missing: 'Не удалось определить тип пользователя',
    network_error: 'Нет связи с сервером, проверьте подключение к интернету',
    unknown_error: 'Произошла ошибка при авторизации, попробуйте позже',

    // Маппинг по HTTP‑статусам
    // Может быть строкой или объектом с кодами для конкретного статуса
    byStatus: {
      400: 'Некорректные данные для входа',
      401: {
        // Сообщение по умолчанию для 401
        _default: 'Неверный логин или пароль',
        // Специфичные коды для 401
        invalid_credentials: 'Неверный логин или пароль',
        token_expired: 'Сессия истекла, войдите заново',
        account_disabled: 'Учётная запись отключена',
      },
      403: 'Доступ запрещён. Проверьте логин и пароль.',
      500: 'На сервере произошла ошибка, попробуйте позже',
    },
  },

  register: {
    success: 'Вы успешно зарегистрировались',
    email_taken: 'Пользователь с такой почтой уже существует',
    username_taken: 'Такой пользователь уже существует',
    unknown_error: 'Произошла ошибка при регистрации, попробуйте позже',
    byStatus: {
      400: {
        _default: 'Проверьте корректность введённых данных',
        invalid_email: 'Неверный формат email',
        password_too_short: 'Пароль слишком короткий (минимум 8 символов)',
        invalid_username: 'Неверный формат имени пользователя',
      },
      409: {
        _default: 'Пользователь с таким логином или email уже существует',
        email_taken: 'Пользователь с такой почтой уже существует',
        username_taken: 'Такой пользователь уже существует',
      },
      500: 'На сервере произошла ошибка, попробуйте позже',
    },
  },
}

/**
 * Унифицированное определение текста сообщения для пользователя по результату запроса.
 *
 * @param {string} context - контекст запроса ('login', 'register', 'getUserInfo' и т.п.)
 * @param {any} result - успешный ответ axios или ошибка (error/код)
 * @param {Object} options
 * @param {string} [options.defaultSuccess] - дефолтный текст для успеха, если ничего не подошло
 * @param {string} [options.defaultError] - дефолтный текст для ошибки, если ничего не подошло
 */
export function resolveApiMessage(context, result, options = {}) {
  const cfg = apiMessages[context] || {}
  const { defaultSuccess, defaultError } = options

  // result может быть: успешный ответ axios или ошибка (error/код)
  const status = result?.status || result?.response?.status
  const data = result?.data || result?.response?.data || {}

  // Извлекаем код из разных возможных мест
  // 1. Прямо в data: data.code, data.error_code, data.key
  // 2. Вложенный в detail: data.detail.code
  let backendCode = data.code || data.error_code || data.key
  
  // Если detail - это объект с полем code, извлекаем его
  if (!backendCode && typeof data.detail === 'object' && data.detail !== null && data.detail.code) {
    backendCode = data.detail.code
  }

  // Логирование для отладки
  console.log('📝 [resolveApiMessage] Обработка ответа:', {
    context,
    status,
    data,
    backendCode,
    hasCode: !!backendCode,
    hasMessage: !!(data.message || (typeof data.detail === 'string' && data.detail) || (typeof data.detail === 'object' && data.detail?.message)),
  })
  
  // Сначала проверяем, есть ли код в byStatus для конкретного статуса
  if (backendCode && status && cfg.byStatus && cfg.byStatus[status]) {
    const statusMapping = cfg.byStatus[status]
    
    // Если byStatus[status] - это объект с кодами
    if (typeof statusMapping === 'object' && statusMapping[backendCode]) {
      console.log(`✅ [resolveApiMessage] Найден код "${backendCode}" для статуса ${status}:`, statusMapping[backendCode])
      return statusMapping[backendCode]
    }
  }
  
  // Затем проверяем общий код в корне конфигурации
  if (backendCode && cfg[backendCode]) {
    console.log(`✅ [resolveApiMessage] Найден общий код "${backendCode}":`, cfg[backendCode])
    return cfg[backendCode]
  }

  // Приоритет 2: маппинг по статусу
  if (status && cfg.byStatus && cfg.byStatus[status]) {
    const statusMapping = cfg.byStatus[status]
    
    // Если это объект с _default, используем _default
    if (typeof statusMapping === 'object' && statusMapping._default) {
      console.log(`✅ [resolveApiMessage] Используется _default для статуса ${status}:`, statusMapping._default)
      return statusMapping._default
    }
    
    // Если это строка, используем её напрямую
    if (typeof statusMapping === 'string') {
      console.log(`✅ [resolveApiMessage] Используется маппинг статуса ${status}:`, statusMapping)
      return statusMapping
    }
  }

  // Приоритет 3: текст из бэкенда (message/detail)
  // Сначала проверяем прямое сообщение
  if (typeof data.message === 'string' && data.message.trim()) {
    console.log('✅ [resolveApiMessage] Используется data.message:', data.message)
    return data.message
  }
  
  // Затем проверяем detail
  if (typeof data.detail === 'string' && data.detail.trim()) {
    console.log('✅ [resolveApiMessage] Используется data.detail (строка):', data.detail)
    return data.detail
  }
  
  // Если detail - это объект с полем message, используем его
  if (typeof data.detail === 'object' && data.detail !== null && typeof data.detail.message === 'string' && data.detail.message.trim()) {
    console.log('✅ [resolveApiMessage] Используется data.detail.message:', data.detail.message)
    return data.detail.message
  }

  // Приоритет 4: дефолты из вызова
  if (status && status >= 200 && status < 300) {
    const successMsg = defaultSuccess || cfg.success || 'Операция выполнена успешно'
    console.log('✅ [resolveApiMessage] Используется дефолтное сообщение успеха:', successMsg)
    return successMsg
  }

  const errorMsg = defaultError || cfg.unknown_error || 'Произошла ошибка, попробуйте позже'
  console.log('⚠️ [resolveApiMessage] Используется дефолтное сообщение ошибки:', errorMsg)
  return errorMsg
}


