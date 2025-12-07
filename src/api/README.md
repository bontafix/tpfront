# API Модули

Структура API запросов разделена на модули по сущностям для улучшения организации кода и удобства поддержки.

## Структура модулей

### 📦 `apiClient.js` - Базовый клиент
Основной модуль с настройкой axios, interceptors и базовыми функциями запросов.

**Экспорты:**
- `apiClient` - настроенный экземпляр axios
- `domain` - базовый URL API
- `makeRequest(endpoint, method, body, headers)` - универсальная функция для запросов
- `makeGetRequest(endpoint)` - функция для GET запросов

**Функционал:**
- Автоматическое добавление токена авторизации в заголовки
- Обработка ошибок 401 (Unauthorized)
- Логирование запросов и ответов
- Обработка cookies для авторизации

---

### 👨‍🎓 `students.js` - Ученики
Все запросы, связанные с учениками и их профилями.

**Основные функции:**
- `getUserInfo()` - получение информации о пользователе-ученике
- `getStudentById(student_id)` - получение профиля ученика
- `updateStudentProfile(student_id, request_body)` - обновление профиля
- `setStudentProfile(student_profile)` - создание профиля
- `deleteStudentProfile(data)` - удаление профиля
- `getStudentLessons(student_profile_id, page, per_page)` - уроки ученика
- `getStudentBalance(student_profile_id)` - баланс ученика
- `getStudentAnalytics(student_id)` - аналитика ученика
- `getStudentResults(student_id)` - результаты ученика
- `getStudentSchedule(year, month)` - расписание ученика
- `getAllStudents()` - все ученики
- `getMyStudents(search_item)` - мои ученики с поиском
- `toggleStudentArchive(student_id)` - добавить/удалить из архива
- `importStudents(files)` - импорт учеников из Excel

**Домашние задания:**
- `setStudentHomework(homework_id, student_profile_id, files)` - отправка ДЗ
- `deleteStudentAnswer(answer_id, student_profile_id)` - удаление ответа
- `getAllStudentHomework(student_id)` - все ДЗ ученика
- `manualGrade(request_body)` - ручная оценка ДЗ

**Результаты:**
- `setResult(request_body)` - добавление результата
- `updateResultById(result_id, request_body)` - обновление результата
- `deleteResultById(result_id)` - удаление результата

**Прочее:**
- `createDemoRequest(data)` - заявка на демо-урок
- `getReviews()` - получение отзывов
- `setNewReviews(review)` - создание отзыва
- `getTimeZones()` - временные зоны
- `getTypesConnect()` - типы связи
- `getStudnetSource()` - анализ по источникам
- `getStudnetGoals()` - анализ по целям

---

### 👨‍🏫 `teachers.js` - Учителя
Все запросы, связанные с учителями и их профилями.

**Основные функции:**
- `getTeacherById(teacherId)` - получение учителя по ID
- `getMyInfo()` - получение информации о текущем учителе
- `updateTeacherProfile(request_body)` - обновление профиля учителя
- `changeEmail(email)` - изменение email

**Финансовые операции:**
- `getTeacherOperations()` - операции учителя
- `deleteTeacherOperations(payment_id)` - удаление операции
- `cancelOperation(operation_id)` - отмена операции
- `setIncome(requestBody)` - добавление дохода
- `getTeacherIncome()` - получение доходов
- `setExpense(requestBody)` - добавление расхода
- `getTeacherExpenses()` - получение расходов
- `deleteExpenditure(id)` - удаление расхода
- `setPayment(requestBody)` - добавление оплаты

**Задачи учителя:**
- `getTeacherTasks()` - получение задач
- `setTeacherTasks(data)` - создание задачи
- `deleteTeacherTask(task_id)` - удаление задачи

---

### 📚 `lessons.js` - Уроки
Все запросы, связанные с уроками и занятиями.

**Получение уроков:**
- `getLessonsOnMonth(year, month)` - уроки на месяц
- `getLessonsOnWeek(startDate)` - уроки на неделю
- `getTodayLessons()` - уроки на сегодня
- `getLessonsOnDay(date)` - уроки на день
- `getMyLessons(date)` - мои уроки
- `getLessonById(id)` - урок по ID
- `getCurrentLessons()` - текущие уроки

**Управление уроками:**
- `setOneTimeLesson(data, updatable)` - создание одноразового урока
- `setTrialLesson(data, updatable)` - создание пробного урока
- `setStableLesson(data)` - создание постоянного урока
- `setStableGroupLesson(data)` - создание постоянного группового урока
- `deleteLessonById(lesson_id)` - удаление урока
- `transferLesson(lesson_id, data, updateAfterTransfer)` - перенос урока
- `cancelLesson(lesson_data)` - отмена урока

**Правила и расписание:**
- `getWeeks()` - получение недель
- `getRule(query)` - получение правила
- `editRule(data)` - редактирование правила
- `deleteRuleLessons(query)` - удаление уроков по правилу

**Проблемы урока:**
- `getPreviousProblems(lesson_id)` - проблемы предыдущего урока
- `getLessonProblems(lesson_id)` - проблемы урока
- `setLessonProblems(data)` - создание проблем
- `deleteLessonProblem(problem_id)` - удаление проблемы

**Домашние задания:**
- `getLessonHomeWork(lesson_id)` - ДЗ урока
- `getlastHomework(lesson_id)` - последнее ДЗ
- `setLessonHomeWork(lesson_id, data)` - создание ДЗ
- `deleteLessonHomework(homework_id)` - удаление ДЗ
- `createSubmission(homework_id, request_body)` - создание отправки ДЗ
- `uploadFIleHomework(homework_id, data)` - загрузка файлов ДЗ

**Темы урока:**
- `getLessonTopics(lesson_id)` - темы урока
- `setTopic(data)` - создание темы
- `setLessonTopics(data)` - создание тем урока
- `deleteLessonTopic(topic_id)` - удаление темы

**Новости:**
- `getNews()` - получение новостей
- `getNewsById(id)` - новость по ID

---

### 🔐 `auth.js` - Авторизация
Все запросы, связанные с аутентификацией и авторизацией.

**Основные функции:**
- `registerUser(requestBody)` - регистрация пользователя
- `loginUser(requestBody)` - вход в систему
- `logoutUser()` - выход из системы
- `checkUserAuth()` - проверка авторизации
- `deleteAccount()` - удаление аккаунта
- `changePassword(request_body)` - смена пароля
- `linkProfileForApi(request_body)` - привязка профиля студента
- `getWSToken()` - получение токена для WebSocket

---

### 💰 `finance.js` - Финансы
Все запросы, связанные с финансовыми показателями и заработком.

**Заработок учителя:**
- `getEarningsForDay()` - заработок за день
- `getEarningsForPeriod(startDate, endDate)` - заработок за период
- `getMonthlyEarnings(year)` - заработок по месяцам
- `getWeeklyEarnings(start_date, end_date)` - заработок по неделям
- `getEarningsForYear(year)` - заработок за год
- `getDailyEarnings(startDate, endDate)` - заработок по дням
- `getStudentsEarnings()` - заработок по ученикам
- `getStudentEarning(student_id, start_date, end_date)` - заработок от ученика

---

### 🔔 `notifications.js` - Уведомления
Все запросы, связанные с уведомлениями.

**Уведомления учителя:**
- `getTeacherNotifications()` - получение уведомлений
- `deleteTeacherNotifications(notification_id)` - удаление уведомления

**Уведомления ученика:**
- `getStudentNotifications()` - получение уведомлений
- `deleteStudentNotifications(notification_id)` - удаление уведомления

---

### 👥 `groups.js` - Группы
Все запросы, связанные с группами учеников.

**Управление группами:**
- `createGroup(data)` - создание группы
- `getGroups()` - получение групп учителя
- `updateGroup(request_body)` - обновление группы
- `deleteGroup(data)` - удаление группы
- `getGroupStudents(group_id)` - получение учеников группы

**Уроки для групп:**
- `createGroupLesson(data, updatable)` - создание группового урока
- `createGroupLessons(data)` - создание групповых уроков
- `createHomeworkGroup(group_id, request_body)` - создание общего ДЗ для группы

---

### 📄 `requests.js` - Главный файл
Реэкспортирует все функции из модулей для обеспечения обратной совместимости.

Вы можете импортировать функции напрямую из `requests.js`:
```javascript
import { getStudentById, loginUser, getLessonById } from '@/api/requests'
```

Или импортировать из конкретного модуля:
```javascript
import { getStudentById } from '@/api/students'
import { loginUser } from '@/api/auth'
import { getLessonById } from '@/api/lessons'
```

---

## Преимущества новой структуры

1. **Модульность** - код разделен по логическим сущностям
2. **Удобство поддержки** - легко найти нужную функцию
3. **Масштабируемость** - легко добавлять новые функции в соответствующий модуль
4. **Обратная совместимость** - старый код продолжает работать через `requests.js`
5. **Читаемость** - структура проекта более понятна

## Миграция

Существующий код не требует изменений - все импорты из `requests.js` продолжат работать.

При написании нового кода рекомендуется импортировать напрямую из соответствующих модулей для большей ясности.
