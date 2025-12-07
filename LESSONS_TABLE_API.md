# API функции для таблицы занятий

## Обзор
Таблица занятий (`/src/components/lessons/v-lessons.vue`) использует следующие API функции для загрузки и отображения данных.

---

## 1. Основные API для загрузки списка занятий

### 1.1 `getLessonsOnWeek(startDate)`
**Файл:** `/src/api/lessons.js:40-46`

**API эндпоинт:** `GET /api/lessons/week/${startDate}`

**Параметры:**
- `startDate` - дата начала недели в формате `DD.MM.YYYY` (например, `04.12.2024`)

**Возвращает:** Массив объектов занятий
```javascript
[
  {
    id: 123,
    student_name: "Иван Иванов",
    conducted_date: "2024-12-04",
    start_time: "10:00:00",
    end_time: "11:00:00",
    trial: false,
    amount_deducted: true,
    cancelled_lesson: false,
    // ... другие поля
  },
  // ...
]
```

**Используется для фильтров:**
- ✅ Сегодня (загружает неделю, фильтрует по дате)
- ✅ Предыдущая неделя
- ✅ Текущая неделя
- ✅ Следующая неделя

---

### 1.2 `getLessonsOnMonth(year, month)`
**Файл:** `/src/api/lessons.js:32-38`

**API эндпоинт:** `GET /api/lessons/{year}/{month}`

**Параметры:**
- `year` - год (например, `2024`)
- `month` - месяц (например, `12`)

**Возвращает:** Массив объектов занятий (такой же формат как в `getLessonsOnWeek`)

**Используется для фильтров:**
- ✅ Предыдущий месяц
- ✅ Текущий месяц

---

## 2. API для индикаторов (иконки в таблице)

Для каждого занятия в списке делаются дополнительные запросы для загрузки индикаторов.

### 2.1 `getLessonTopics(lesson_id)`
**Файл:** `/src/api/lessons.js:316-322`

**API эндпоинт:** `GET /api/lesson-topics/{lesson_id}`

**Параметры:**
- `lesson_id` - ID занятия

**Возвращает:** Массив тем занятия
```javascript
[
  {
    id: 456,
    name: "Времена глаголов",
    lesson_id: 123
  },
  // ...
]
```

**Отображается:** 📚 Синий индикатор с количеством тем

---

### 2.2 `getLessonProblems(lesson_id)`
**Файл:** `/src/api/lessons.js:230-236`

**API эндпоинт:** `GET /api/lesson-problems/{lesson_id}`

**Параметры:**
- `lesson_id` - ID занятия

**Возвращает:** Массив проблем занятия
```javascript
[
  {
    id: 789,
    problem_text: "Не понимает артикли",
    lesson_id: 123
  },
  // ...
]
```

**Отображается:** ⚠️ Красный индикатор с количеством проблем

---

### 2.3 `getLessonHomeWork(lesson_id)`
**Файл:** `/src/api/lessons.js:256-262`

**API эндпоинт:** `GET /api/lesson-homework/{lesson_id}`

**Параметры:**
- `lesson_id` - ID занятия

**Возвращает:** Объект домашнего задания
```javascript
{
  id: 101,
  lesson_id: 123,
  description: "Выполнить упражнения 1-5",
  files: [
    {
      id: 202,
      name: "homework.pdf",
      url: "https://example.com/files/homework.pdf"
    }
  ]
}
```

**Отображается:** 📝 Фиолетовый индикатор (если есть description или files)

---

### 2.4 `getPreviousProblems(lesson_id)`
**Файл:** `/src/api/lessons.js:220-226`

**API эндпоинт:** `GET /api/lesson-last-problems/{lesson_id}`

**Параметры:**
- `lesson_id` - ID занятия

**Возвращает:** Массив проблем предыдущего занятия
```javascript
[
  {
    id: 999,
    problem_text: "Плохо запоминает слова",
    lesson_id: 122
  }
]
```

**Используется:** В модальном окне "Детали занятия"

---

## 3. Логика загрузки данных

### 3.1 Загрузка списка занятий
**Функция:** `loadLessons(filter)` в `/src/components/lessons/v-lessons.vue:227-295`

**Алгоритм:**
1. Устанавливает `isLoading = true`
2. В зависимости от фильтра вызывает:
   - `getLessonsOnWeek()` для недельных фильтров
   - `getLessonsOnMonth()` для месячных фильтров
3. Сортирует занятия по дате и времени
4. Вызывает `loadIndicators()` для загрузки индикаторов
5. Устанавливает `isLoading = false`

### 3.2 Загрузка индикаторов
**Функция:** `loadIndicators()` в `/src/components/lessons/v-lessons.vue:297-339`

**Алгоритм:**
1. Для каждого занятия параллельно (`Promise.all`) загружает:
   - Темы (`getLessonTopics`)
   - Проблемы (`getLessonProblems`)
   - Домашнее задание (`getLessonHomeWork`)
2. Проверяет наличие реального контента:
   - Темы: есть ли элементы в массиве
   - Проблемы: есть ли элементы в массиве
   - ДЗ: есть ли `description` (не пустая) ИЛИ `files` (не пустой массив)
3. Формирует массив `lessonsWithIndicators` с флагами:
   - `hasTopics`, `topicsCount`
   - `hasProblems`, `problemsCount`
   - `hasHomework`

---

## 4. Оптимизация

### Параллельная загрузка
Все индикаторы для одного занятия загружаются параллельно:
```javascript
const [problems, topics, homework] = await Promise.all([
  getLessonProblems(lesson.id),
  getLessonTopics(lesson.id),
  getLessonHomeWork(lesson.id)
])
```

### Обработка ошибок
Каждый запрос оборачивается в `.catch(() => [])` или `.catch(() => null)`, чтобы ошибка одного запроса не ломала загрузку остальных.

---

## 5. Формат данных для фильтров

| Фильтр | API функция | Параметры | Количество запросов |
|--------|-------------|-----------|---------------------|
| Сегодня | `getLessonsOnWeek` | Текущая неделя + фильтрация | 1 + N×3* |
| Предыдущая неделя | `getLessonsOnWeek` | Смещение -7 дней | 1 + N×3* |
| Текущая неделя | `getLessonsOnWeek` | Текущая неделя | 1 + N×3* |
| Следующая неделя | `getLessonsOnWeek` | Смещение +7 дней | 1 + N×3* |
| Предыдущий месяц | `getLessonsOnMonth` | Прошлый месяц | 1 + N×3* |
| Текущий месяц | `getLessonsOnMonth` | Текущий месяц | 1 + N×3* |

\* N - количество занятий, ×3 - три запроса на каждое занятие (темы, проблемы, ДЗ)

---

## 6. Пример последовательности запросов

При выборе "Текущий месяц" с 10 занятиями:

1. `GET /api/lessons/2024/12` → получаем 10 занятий
2. Для каждого занятия параллельно:
   - `GET /api/lesson-topics/123`
   - `GET /api/lesson-problems/123`
   - `GET /api/lesson-homework/123`
3. **Итого:** 1 + 10×3 = **31 запрос**

При выборе "Предыдущий месяц" с 50 занятиями:
- **Итого:** 1 + 50×3 = **151 запрос** ⚠️

---

## 7. Потенциальные узкие места

### 7.1 Большое количество запросов
При загрузке месяца с большим количеством занятий делается очень много запросов к API.

**Решение:** Можно добавить batch API эндпоинт, который возвращает индикаторы для нескольких занятий сразу:
```
GET /api/lessons/indicators?ids=123,124,125,...
```

### 7.2 Медленная загрузка месячных периодов
API `/api/lessons/{year}/{month}` может работать медленно при большом количестве занятий.

**Текущее решение:** Блокировка кнопок фильтров во время загрузки (`isLoading`)

---

## 8. Используемые вспомогательные файлы

- `/src/api/apiClient.js` - базовые функции `makeGetRequest`, `makeRequest`
- `/src/api/lessons.js` - все функции для работы с занятиями
- `/src/api/index.js` - экспорт всех API функций

---

## Итого

**Основные функции для таблицы:**
1. ✅ `getLessonsOnWeek(startDate)` - список занятий на неделю
2. ✅ `getLessonsOnMonth(year, month)` - список занятий на месяц
3. ✅ `getLessonTopics(lesson_id)` - темы занятия
4. ✅ `getLessonProblems(lesson_id)` - проблемы занятия
5. ✅ `getLessonHomeWork(lesson_id)` - домашнее задание
6. ✅ `getPreviousProblems(lesson_id)` - проблемы прошлого занятия
