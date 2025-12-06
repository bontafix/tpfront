import { format, startOfWeek, endOfWeek } from 'date-fns'
import { ru } from 'date-fns/locale'
import { computed } from 'vue'
import { checkUserAuth } from '@/api/requests'
import { useGeneralStore } from '@/stores/generalStore'

export const domain = import.meta.env.VITE_API_URL
export const wsDomain = import.meta.env.VITE_API_WS_URL
export const domainDownload = import.meta.env.VITE_URL_DOWNLOAD

export const STABLE_ORDER = [
  'student_id',
  'goal',
  'days_of_week',
  'start_times',
  'end_times',
  'repeat_until',
  'reminder_minutes',
  'break_minutes',
  'in_rule',
  'time_zone_teacher'
]

export const UPDATED_STABLE_ORDER = [
  'student_id',
  'lesson_id',
  'updated_days_of_week',
  'updated_start_times',
  'updated_end_times',
  'repeat_until',
  'reminder_minutes',
  'break_minutes',
  'time_zone_teacher'
]

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

export const DAYS_WEEK = [
  { days_week: 'Пн', id: 1 },
  { days_week: 'Вт', id: 2 },
  { days_week: 'Ср', id: 3 },
  { days_week: 'Чт', id: 4 },
  { days_week: 'Пт', id: 5 },
  { days_week: 'Сб', id: 6 },
  { days_week: 'Вс', id: 7 }
]

// Утилиты для работы с временем
export function changeTime(id, timeInputs) {
  const input = timeInputs[id]
  if (!input?.start) return

  input.start = input.start.replace('mm', '00')
  const [hours, minutes] = input.start.split(':').map(Number)

  if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes >= 60) {
    console.error('Некорректное время:', input.start)
    return
  }

  const nextHour = (hours + 1) % 24
  input.end = `${String(nextHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

// Утилиты для работы с датами
export function formatDate(date, formatString = 'd.MM.yyyy') {
  if (!date) return ''
  try {
    return format(new Date(date), formatString, { locale: ru })
  } catch {
    return ''
  }
}

export function formatDay(date) {
  return formatDate(date, 'd.MM.yyyy')
}

export function formatWeek(date) {
  if (!date) return ''
  
  const start = startOfWeek(new Date(date), { weekStartsOn: 1 })
  const end = endOfWeek(new Date(date), { weekStartsOn: 1 })
  
  return `${format(start, 'dd.MM')} - ${format(end, 'dd.MM yyyy')}`
}

export function formatMonth(date) {
  const d = new Date(date)
  const month = MONTHS[d.getMonth()]
  const year = d.getFullYear()
  
  return d.getFullYear() !== new Date().getFullYear() 
    ? `${month}, ${year}`
    : month
}

export function formatDateToBase(date) {
  return format(new Date(date), 'yyyy-MM-dd')
}

export function formatDateToStandart(date) {
  return format(new Date(date), 'dd.MM.yyyy')
}

export function formatDateRange(dates) {
  if (!Array.isArray(dates) || dates.length !== 2) return ''
  
  const [start, end] = dates
  if (!start || !end) return ''
  
  return `${formatDateToStandart(start)} - ${formatDateToStandart(end)}`
}

// Утилиты для работы с файлами
export function formatFileSize(size) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  return `${(size / (1024 * 1024)).toFixed(2)} MB`
}

// Утилиты для работы с днями недели
export function getNextMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 1 ? 7 : (8 - day) % 7
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getPreviousMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 1 ? 7 : day - 1
  d.setDate(d.getDate() - diff)
  return d
}

// Утилиты для работы с временем
export function addTimeWithDuration(timeStr, durationMinutes) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMinutes = totalMinutes % 60
  
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
}

export const formatTimeRate = (minutes) => {
  if (minutes < 60) return `${minutes} мин.`
  
  const hours = minutes / 60
  if (hours === 1) return '1 час'
  if (hours === 1.5) return '1.5 часа'
  if (hours < 5) return `${hours} часа`
  return `${hours} часов`
}

// Утилиты для работы с объектами
export function sortObject(obj, order) {
  return Object.fromEntries(
    order
      .filter(key => key in obj)
      .map(key => [key, obj[key]])
  )
}

// Утилиты для получения классов CSS
export function getHomeworkClass(value) {
  const status = String(value).toLowerCase()
  if (status.includes('оценено') || status.includes('проверено')) return 'green'
  if (status.includes('просрочено')) return 'red'
  return ''
}

export function getStatusClass(value) {
  const num = Number(value)
  if (num > 0) return 'green'
  if (num < 0) return 'red'
  return ''
}

// Утилиты для работы с ценами
export function prettyPrice(price) {
  return new Intl.NumberFormat('ru-RU').format(Number(price) || 0)
}

// Утилиты для работы с цветами
export function getColors() {
  const store = useGeneralStore()
  const nightMode = computed(() => store.nightMode).value
  
  return {
    blue: nightMode ? '#1F5EFF' : '#1D4ECC',
    lightBlue: '#E4EFFF',
    blueStroke: nightMode ? '#2D313B' : '#CCD8F8',
    gray: 'rgba(113, 118, 128, 0.2)',
    blackText: nightMode ? '#fff' : '#344055',
    transperentBlackText: 'rgba(52, 64, 85, 0.56)',
  }
}

// Утилиты для работы с датами
export function getCurrentMonthDates() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return [startOfMonth, now]
}

export function getDayOfWeek(dateStr, day) {
  if (!dateStr || !day) return ''
  
  try {
    const [month, year] = dateStr.split('.')
    const date = new Date(`${year}-${month}-${day}`)
    const days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']
    const weekday = days[date.getDay()]
    return `${weekday}, ${day}`
  } catch {
    return `${day}`
  }
}

// Утилиты для работы с куками
export const cookieUtils = {
  getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      try {
        return decodeURIComponent(parts.pop().split(';').shift())
      } catch {
        return null
      }
    }
    return null
  },

  hasCookie(name) {
    return this.getCookie(name) !== null
  },

  deleteCookie(name) {
    const paths = new Set(['/'])
    
    // Добавляем путь из BASE_URL
    try {
      const baseUrl = import.meta.env.BASE_URL || '/'
      if (baseUrl && baseUrl !== '/') {
        const normalized = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`
        paths.add(normalized)
        paths.add(normalized.replace(/\/$/, ''))
      }
    } catch {}
    
    // Добавляем текущий путь
    if (typeof window !== 'undefined') {
      const segments = window.location.pathname.split('/').filter(Boolean)
      if (segments[0]) {
        paths.add(`/${segments[0]}`)
      }
    }
    
    // Удаляем куку для всех путей
    const expiration = 'Thu, 01 Jan 1970 00:00:00 GMT'
    paths.forEach(path => {
      document.cookie = `${name}=; expires=${expiration}; path=${path}`
    })
  },

  getAllCookies() {
    const cookies = {}
    if (document.cookie) {
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=')
        if (name) {
          try {
            cookies[name] = decodeURIComponent(value || '')
          } catch {
            cookies[name] = value || ''
          }
        }
      })
    }
    return cookies
  }
}

// Утилиты для работы с авторизацией
export function getAccessToken() {
  const possibleNames = ['access_token', 'accessToken', 'token']
  
  for (const name of possibleNames) {
    const token = cookieUtils.getCookie(name)
    if (token) return token
  }
  
  return null
}

let isHandlingUnauthorized = false

export async function isUserAuth() {
  if (isHandlingUnauthorized) return false
  
  try {
    const response = await checkUserAuth()
    return response?.authorized ?? false
  } catch (error) {
    if (error.response?.status === 401) {
      return false
    }
    console.error('Ошибка проверки авторизации:', error)
    return false
  }
}

export async function handleUnauthorized() {
  if (isHandlingUnauthorized) return
  
  isHandlingUnauthorized = true
  
  try {
    const [{ logoutUser }, { disconnectWebSocket }, router, { useMyStore }] = await Promise.all([
      import('@/api/requests'),
      import('@/ws'),
      import('@/router').then(m => m.default),
      import('@/stores/myStore')
    ])
    
    // Закрываем WebSocket
    try {
      disconnectWebSocket()
    } catch (error) {
      console.warn('Ошибка закрытия WebSocket:', error)
    }
    
    // Очищаем куки
    ['access_token', 'accessToken', 'token', 'auth_token', 'jwt', 'session']
      .forEach(name => cookieUtils.deleteCookie(name))
    
    // Очищаем localStorage
    localStorage.removeItem('user_type')
    localStorage.removeItem('isAuth')
    
    // Очищаем store
    const store = useMyStore()
    store.isAuth = false
    store.user_type = ''
    store.info = null
    store.userInfo = null
    store.notifications = null
    
    // Логаут на сервере (не блокируем)
    logoutUser().catch(() => {})
    
    // Перенаправляем
    const currentRoute = router.currentRoute.value
    if (currentRoute.name !== 'login' && currentRoute.name !== 'landing') {
      router.push({ name: 'login' }).catch(() => {})
    }
  } catch (error) {
    console.error('Ошибка при логауте:', error)
  } finally {
    setTimeout(() => {
      isHandlingUnauthorized = false
    }, 1000)
  }
}