import { computed } from 'vue'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

import { startOfWeek, endOfWeek } from 'date-fns'

import { checkUserAuth } from '@/api/requests';
import { useGeneralStore } from '@/stores/generalStore'


export const domain = import.meta.env.VITE_API_URL
export const wsDomain = import.meta.env.VITE_API_WS_URL
export const domainDownload = import.meta.env.VITE_URL_DOWNLOAD

export const stableOrder = [
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

export const updatedStableOrder = [
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

const months = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

export const daysWeek = [
  { days_week: 'Пн', id: 1 },
  { days_week: 'Вт', id: 2 },
  { days_week: 'Ср', id: 3 },
  { days_week: 'Чт', id: 4 },
  { days_week: 'Пт', id: 5 },
  { days_week: 'Сб', id: 6 },
  { days_week: 'Вс', id: 7 },
]

export function changeTime(id, timeInputs) {
  /* Добавляет 1 час к началу занятия и помещает в поле времени конца занятия */
  timeInputs[id].start = timeInputs[id].start.replace('mm', '00')
  console.log(timeInputs[id])
  const currentTime = timeInputs[id].start.split(':')

  // Проверяем, что время имеет правильный формат (часы:минуты)
  if (currentTime.length !== 2 || isNaN(currentTime[0]) || isNaN(currentTime[1])) {
    console.error('Некорректное время:', timeInputs[id].start)
    return
  }

  let hour = parseInt(currentTime[0], 10)
  const minutes = currentTime[1]

  // Проверка на диапазон минут
  if (parseInt(minutes, 10) < 0 || parseInt(minutes, 10) >= 60) {
    console.error('Некорректные минуты:', minutes)
    return
  }

  // Увеличиваем час на 1, при этом учитываем переход через 24 часа
  hour = (hour + 1) % 24

  // Форматируем время
  const endTime = `${hour.toString().padStart(2, '0')}:${minutes}`
  // Обновляем поле времени конца занятия
  timeInputs[id].end = endTime
}

export function getAccessToken() {
  // Пробуем получить токен из cookies разными способами
  const token = cookieUtils.getCookie('access_token') || 
                cookieUtils.getCookie('accessToken') ||
                cookieUtils.getCookie('token')
  
  if (token) {
    return decodeURIComponent(token)
  }
  
  // Fallback на старый способ парсинга
  const match = document.cookie.match(/(^| )access_token=([^;]+)/)
  return match ? decodeURIComponent(match[2]) : null
}

export function formatDay(date) {
  if (!date) return ''
  const formattedDate = format(date, 'd.MM.yyyy')

  return formattedDate
}

export function formatWeek(date) {
  console.log(date)
  if (!date) return '';

  const pad = (n) => n.toString().padStart(2, '0');

  const day = date.getDay();
  const diffToMonday = (day + 6) % 7; // Понедельник — 0
  const start = new Date(date);
  start.setDate(date.getDate() - diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startStr = `${pad(start.getDate())}.${pad(start.getMonth() + 1)}`;
  const endStr = `${pad(end.getDate())}.${pad(end.getMonth() + 1)}`;
  const year = end.getFullYear();

  return `${startStr} - ${endStr} ${year}`;
}


export function getMonthByIndex(monthIndex) {
  return months[monthIndex]
}

export function formatMonth(date) {
  const month = getMonthByIndex(date.getMonth())
  const year = date.getFullYear()

  const currentYear = new Date().getFullYear()
  return currentYear !== year ? `${month}, ${year}` : month
}
export function transformDate(input) {
  const output = input.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1T') + '00:00:00'
  return output
}

export function formatDate(date) {
  // формат dd.mm.yyyy
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateToBase(date) {
  // В формат yyyy-mm-dd
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Месяцы от 0 до 11
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}


export function formatDateRange (dates) {
  if (!dates) return '';

  const format = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  if (Array.isArray(dates) && dates.length === 2) {
    const [start, end] = dates;
    if (start && end) {
      return `${format(start)} - ${format(end)}`;
    }
  }

  return '';
};


export function formatFileSize (size) {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

export function formatDateToStandart(date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Месяцы начинаются с 0
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

export function getNextMonday(date) {
  const day = date.getDay()
  const diff = (7 - day + 1) % 7 // Расчет разницы до следующего понедельника
  const nextMonday = new Date(date)
  nextMonday.setDate(date.getDate() + diff) // Устанавливаем следующую дату понедельника
  nextMonday.setHours(0, 0, 0, 0) // Устанавливаем время на 00:00:00
  return nextMonday
}
export function getPreviousMonday(date) {
  const dayOfWeek = date.getDay() // 0 - воскресенье, 1 - понедельник, ..., 6 - суббота
  const daysAgo = dayOfWeek === 1 ? 7 : dayOfWeek - 1 // Если понедельник, то возвращаем 7 дней назад
  const previousMonday = new Date(date)
  previousMonday.setDate(date.getDate() - daysAgo)
  return previousMonday
}

export function sortObject(obj, order) {
  return Object.fromEntries(order.map((key) => [key, obj[key]]))
}

export function addTimeWithDuration(timeStr, durationMinutes) {
  let [hours, minutes] = timeStr.split(':').map(Number)

  // Добавляем минуты
  minutes += durationMinutes

  // Учитываем переход через час
  hours += Math.floor(minutes / 60)
  minutes %= 60

  // Форматируем результат в "HH:MM"
  return [String(hours).padStart(2, '0'), String(minutes).padStart(2, '0')].join(':')
}

export function getHomeworkClass(value) {
  if (value === 'Оценено' || value === 'Проверено') return 'green'
  if (value === 'Просрочено') return 'red'
  return ''
}

export function prettyPrice(price) {
  return price.toLocaleString()
}

export function getColors() {
  const store = useGeneralStore()

  const nightMode = store.nightMode

  return {
    blue: nightMode ? '#1F5EFF' : '#1D4ECC',
    lightBlue: '#E4EFFF',
    blueStroke: nightMode ? '#2D313B' : '#CCD8F8',
    gray: 'rgba(113, 118, 128, 0.2)',
    blackText: nightMode ? '#fff' : '#344055',
    transperentBlackText: 'rgba(52, 64, 85, 0.56)',
  }
}

export function getCurrentMonthDates () {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfDate= new Date();
  const endFormatted = endOfDate.toISOString().slice(0, 10);

  return [startOfMonth, endOfDate]
}


export function getDayOfWeek  (date, day) {

  const [ month, year] = date.split('.');

  const jsDate = new Date(`${year}-${month}-${day}`);

  const days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

  const weekday = days[jsDate.getDay()];

  return `${weekday}, ${day}`;

}


export function getStatusClass  (value)  {
  if (parseInt(value) > 0) return 'green';
  if (parseInt(value) < 0) return 'red';
  return '';
};


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
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
};


export const formatTimeRate = (minutes) => {
  if (minutes < 60) return `${minutes} мин.`
  const hours = Math.floor(minutes / 60)
  return `${minutes === 90 ? 1.5 : hours } ${minutes === 60 ? 'час' : 'часа'}`
}


export const isUserAuth = async () => {
  const response = await checkUserAuth()
  return response.authorized
}
