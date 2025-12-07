import { makeRequest, makeGetRequest } from './apiClient'
import { getAccessToken } from '@/utils_auth'

/* ======================================================================== Регистрация / Авторизация ======================================================================== */

export async function registerUser(requestBody) {
  try {
    return await makeRequest('/api/register', 'POST', requestBody)
  } catch (error) {
    console.error('Произошла ошибка при регистрации', error)
  }
}

export async function loginUser(requestBody) {
  try {
    const response = await makeRequest('/api/login', 'POST', requestBody)
    return response
  } catch (error) {
    console.error('Произошла ошибка при авторизаци', error)
    return error
  }
}

export async function logoutUser() {
  try {
    return await makeRequest('/api/logout', 'POST')
  } catch (error) {
    console.error('Произошла ошибка при выходе из аккаунта', error)
  }
}

export async function deleteAccount() {
  try {
    return await makeGetRequest('/api/delete-account')
  } catch (error) {
    console.error('Произошла ошибка при удалении аккаунта', error)
  }
}

export async function checkUserAuth() {
  // Проверяем, не идет ли уже процесс логаута (используем глобальный флаг)
  if (typeof window !== 'undefined' && window.__isHandlingUnauthorized) {
    return { authorized: false, user_type: '' }
  }

  try {
    const response = await makeRequest('/api/user/me', 'GET')
    // Если makeRequest вернул код ошибки (число), значит запрос не удался
    if (typeof response === 'number') {
      // Если это 401, возвращаем специальный код для обработки
      if (response === 401) {
        return 401
      }
      return { authorized: false, user_type: '' }
    }
    return response
  } catch (error) {
    // Для запросов проверки авторизации ошибки обрабатываем тихо
    // Если это 401 ошибка, возвращаем код для обработки
    if (error.response?.status === 401) {
      console.log('ℹ️ [AUTH] Проверка авторизации: токен недействителен или отсутствует')
      return 401
    }
    console.warn('⚠️ [AUTH] Ошибка при проверке авторизации:', error.message)
    return { authorized: false, user_type: '' }
  }
}

export async function changePassword(request_body) {
  try {
    return await makeRequest('/api/request-password-reset', 'POST', request_body)
  } catch (error) {
    console.error('Произошла ошибка при смене пароля', error)
  }
}

export async function linkProfileForApi(request_body) {
  try {
    return await makeRequest(`/api/student/link-profile`, 'POST', request_body)
  } catch (error) {
    console.error('Произошла ошибка при привязке студента', error)
  }
}

export async function getWSToken() {
  try {
    // Проверяем наличие токена перед запросом
    const token = getAccessToken()
    console.log(token)
    console.log(`>>>>>>>>>>>>>>>>>>> token <<<<<<<<<<<<<<<`)
    if (!token) {
      console.warn('Токен авторизации не найден перед запросом ws/token')
      console.warn('Доступные cookies:', document.cookie)
    }

    const response = await makeGetRequest('ws/token')

    if (!response || !response.ws_token) {
      console.error('Не удалось получить ws_token из ответа:', response)
      throw new Error('ws_token не найден в ответе сервера')
    }

    return response
  } catch (error) {
    console.error('Произошла ошибка при получении токена для WebSocket', error)
    if (error.response) {
      console.error('Статус ответа:', error.response.status)
      console.error('Данные ответа:', error.response.data)
    }
    throw error
  }
}
