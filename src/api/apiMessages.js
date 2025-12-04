export const apiMessages = {
  login: {
    // Общий успешный текст
    success: 'Вы успешно вошли в систему',

    // Типовые ошибки
    invalid_credentials: 'Неверный логин или пароль',
    user_type_missing: 'Не удалось определить тип пользователя',
    network_error: 'Нет связи с сервером, проверьте подключение к интернету',
    unknown_error: 'Произошла ошибка при авторизации, попробуйте позже',

    // Маппинг по HTTP‑статусам, если бэкенд не вернул свой код
    byStatus: {
      400: 'Некорректные данные для входа',
      401: 'Неверный логин или пароль',
      403: 'Доступ запрещён. Проверьте логин и пароль.',
      500: 'На сервере произошла ошибка, попробуйте позже',
    },
  },

  register: {
    success: 'Вы успешно зарегистрировались',
    email_taken: 'Пользователь с такой почтой уже существует',
    unknown_error: 'Произошла ошибка при регистрации, попробуйте позже',
    byStatus: {
      400: 'Проверьте корректность введённых данных',
      409: 'Пользователь с таким логином или email уже существует',
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

  // Приоритет 1: явный "код" с бэкенда (например, data.code = 'invalid_credentials')
  const backendCode = data.code || data.error_code || data.key
  if (backendCode && cfg[backendCode]) {
    return cfg[backendCode]
  }

  // Приоритет 2: маппинг по статусу
  if (status && cfg.byStatus && cfg.byStatus[status]) {
    return cfg.byStatus[status]
  }

  // Приоритет 3: текст из бэкенда (message/detail)
  if (typeof data.message === 'string') return data.message
  if (typeof data.detail === 'string') return data.detail

  // Приоритет 4: дефолты из вызова
  if (status && status >= 200 && status < 300) {
    return defaultSuccess || cfg.success || 'Операция выполнена успешно'
  }

  return defaultError || cfg.unknown_error || 'Произошла ошибка, попробуйте позже'
}


