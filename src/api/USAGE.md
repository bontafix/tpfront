# Руководство по использованию API модулей

## Три способа импорта

### 1. Импорт из главного файла requests.js (рекомендуется для обратной совместимости)
```javascript
import { getStudentById, loginUser, getLessonById } from '@/api/requests'
```

### 2. Импорт из индексного файла (рекомендуется для нового кода)
```javascript
import { getStudentById, loginUser, getLessonById } from '@/api'
```

### 3. Импорт из конкретных модулей (максимальная ясность)
```javascript
import { getStudentById } from '@/api/students'
import { loginUser } from '@/api/auth'
import { getLessonById } from '@/api/lessons'
```

## Примеры использования

### Работа с учениками
```javascript
import { 
  getStudentById, 
  updateStudentProfile,
  getStudentLessons 
} from '@/api/students'

// Получить профиль ученика
const student = await getStudentById(123)

// Обновить профиль
await updateStudentProfile(123, { name: 'Иван Иванов' })

// Получить уроки ученика
const lessons = await getStudentLessons(123, 1, 10)
```

### Авторизация
```javascript
import { 
  loginUser, 
  checkUserAuth, 
  logoutUser 
} from '@/api/auth'

// Вход
const response = await loginUser({ 
  email: 'user@example.com', 
  password: '123456' 
})

// Проверка авторизации
const authStatus = await checkUserAuth()

// Выход
await logoutUser()
```

### Работа с уроками
```javascript
import { 
  getLessonsOnMonth,
  setOneTimeLesson,
  getLessonById,
  setLessonHomeWork
} from '@/api/lessons'

// Получить уроки на месяц
const lessons = await getLessonsOnMonth(2024, 12)

// Создать одноразовый урок
await setOneTimeLesson({
  student_id: 123,
  date: '2024-12-07',
  time: '14:00'
})

// Получить урок по ID
const lesson = await getLessonById(456)

// Создать домашнее задание
await setLessonHomeWork(456, formData)
```

### Финансы
```javascript
import { 
  getEarningsForDay,
  getMonthlyEarnings,
  getStudentEarning
} from '@/api/finance'

// Заработок за день
const dailyEarnings = await getEarningsForDay()

// Заработок по месяцам
const monthlyEarnings = await getMonthlyEarnings(2024)

// Заработок от конкретного ученика
const studentEarnings = await getStudentEarning(123, '2024-01-01', '2024-12-31')
```

### Группы
```javascript
import { 
  getGroups,
  createGroup,
  createGroupLesson
} from '@/api/groups'

// Получить все группы
const groups = await getGroups()

// Создать группу
await createGroup({
  name: 'Группа А',
  student_ids: [1, 2, 3]
})

// Создать урок для группы
await createGroupLesson({
  group_id: 5,
  date: '2024-12-07',
  time: '15:00'
})
```

### Уведомления
```javascript
import { 
  getTeacherNotifications,
  deleteTeacherNotifications
} from '@/api/notifications'

// Получить уведомления
const notifications = await getTeacherNotifications()

// Удалить уведомление
await deleteTeacherNotifications(123)
```

## Обработка ошибок

Все функции API обрабатывают ошибки внутри try-catch блоков и логируют их в консоль. Для дополнительной обработки ошибок используйте собственный try-catch:

```javascript
import { getStudentById } from '@/api/students'

try {
  const student = await getStudentById(123)
  // Обработка успешного ответа
} catch (error) {
  // Дополнительная обработка ошибки
  console.error('Не удалось загрузить студента:', error)
}
```

## Работа с токенами

Токены авторизации обрабатываются автоматически через interceptors в `apiClient.js`:

1. **Bearer токен** добавляется автоматически в заголовок `Authorization`
2. **HttpOnly cookies** отправляются автоматически благодаря `withCredentials: true`
3. При ошибке 401 происходит автоматический логаут (кроме специальных endpoint'ов)

## Базовые функции запросов

Для создания новых endpoint'ов используйте базовые функции из `apiClient.js`:

```javascript
import { makeRequest, makeGetRequest } from '@/api/apiClient'

// GET запрос
const data = await makeGetRequest('/api/custom-endpoint')

// POST запрос
const response = await makeRequest('/api/custom-endpoint', 'POST', {
  key: 'value'
})

// PUT запрос
const response = await makeRequest('/api/custom-endpoint/123', 'PUT', {
  key: 'new value'
})

// DELETE запрос
const response = await makeRequest('/api/custom-endpoint/123', 'DELETE')
```

## Структура проекта

```
src/api/
├── apiClient.js        # Базовый axios клиент с настройками
├── apiMessages.js      # Обработка сообщений API (не изменялся)
├── students.js         # API для работы с учениками
├── teachers.js         # API для работы с учителями
├── lessons.js          # API для работы с уроками
├── auth.js             # API для авторизации
├── finance.js          # API для финансов
├── notifications.js    # API для уведомлений
├── groups.js           # API для групп
├── requests.js         # Реэкспорты для обратной совместимости
├── index.js            # Главный экспортный файл
├── README.md           # Подробная документация
└── USAGE.md            # Это руководство
```

## Рекомендации

1. **Для нового кода** - импортируйте из `@/api` или конкретных модулей
2. **Для старого кода** - оставьте импорты из `@/api/requests` как есть
3. **Для ясности** - указывайте конкретный модуль при импорте
4. **Для краткости** - используйте `@/api` для импорта нескольких функций

## Дополнительная информация

Подробная документация всех функций находится в [README.md](./README.md)
