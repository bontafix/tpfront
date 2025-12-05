# Анализ процесса проверки токена после перезагрузки страницы

## 📋 Пошаговый процесс проверки авторизации

### Шаг 1: Загрузка приложения (main.js)
**Файл:** `src/main.js`
- Приложение инициализируется
- Создается Pinia store
- Регистрируется Vue Router
- **Токен НЕ проверяется на этом этапе**

---

### Шаг 2: Первая навигация (router.beforeEach)
**Файл:** `src/router/index.js:261-263`
```javascript
router.beforeEach(async (to, from, next) => {
  const store = useMyStore()
  await store.setUserAuthenticated()  // ← ПЕРВАЯ ПРОВЕРКА
```

**Что происходит:**
1. При любой навигации (включая первую загрузку) вызывается `router.beforeEach`
2. Вызывается `store.setUserAuthenticated()`

---

### Шаг 3: Проверка в Store (setUserAuthenticated)
**Файл:** `src/stores/myStore.js:89-145`

#### 3.1. Первая проверка - уже авторизован?
```javascript
if (this.isAuth === true && this.user_type) {
  return  // ← Выход, если уже авторизован
}
```
**Результат:** При первой загрузке `isAuth = null`, поэтому продолжаем

#### 3.2. Вторая проверка - явный logout?
```javascript
if (this.isAuth === false) {
  this.user_type = ''
  return  // ← Выход, если явно не авторизован
}
```
**Результат:** При первой загрузке `isAuth = null`, поэтому продолжаем

#### 3.3. Третья проверка - получение токена из cookies
**Файл:** `src/utils.js:95-108`
```javascript
const token = getAccessToken()
// Проверяет cookies: 'access_token', 'accessToken', 'token'
```

**Что проверяется:**
1. `cookieUtils.getCookie('access_token')`
2. `cookieUtils.getCookie('accessToken')`
3. `cookieUtils.getCookie('token')`
4. Fallback: парсинг `document.cookie` через regex

**Важно:** 
- Проверяются только JS-доступные cookies
- HttpOnly cookies НЕ видны через JavaScript
- Но они могут быть отправлены автоматически браузером

#### 3.4. Четвертая проверка - токен есть, но isAuth уже true?
```javascript
if (!token && this.isAuth === true && this.user_type) {
  return  // ← Не трогаем состояние
}
```
**Результат:** При первой загрузке `isAuth = null`, поэтому продолжаем

#### 3.5. Пятая проверка - нет токена и isAuth = null?
```javascript
if (this.isAuth === null && !token) {
  this.isAuth = false
  this.user_type = ''
  return  // ← Устанавливаем false без запроса к API
}
```
**Результат:** 
- Если токена нет → `isAuth = false`, запрос к API НЕ делается ✅
- Если токен есть → продолжаем дальше

#### 3.6. Шестая проверка - запрос к API
```javascript
const response = await checkUserAuth()
```

---

### Шаг 4: Запрос к API (checkUserAuth)
**Файл:** `src/api/requests.js:1039-1058`

#### 4.1. Проверка флага логаута
```javascript
if (typeof window !== 'undefined' && window.__isHandlingUnauthorized) {
  return { authorized: false, user_type: '' }
}
```
**Результат:** Если идет процесс логаута, сразу возвращаем false

#### 4.2. Выполнение запроса
```javascript
const response = await makeRequest('/api/user/me', 'GET')
```

**Что происходит в makeRequest:**
1. Создается axios запрос через `apiClient`
2. Interceptor добавляет токен в заголовок (если есть)
3. Запрос отправляется на `/api/user/me`

#### 4.3. Обработка ответа

**Успешный ответ (200):**
```javascript
return response  // { authorized: true, user_type: 'teacher'|'student' }
```

**Ошибка 401:**
```javascript
if (typeof response === 'number' && response === 401) {
  return 401  // Специальный код для обработки
}
```

**Другие ошибки:**
```javascript
return { authorized: false, user_type: '' }
```

---

### Шаг 5: Interceptor для 401 ошибок
**Файл:** `src/api/requests.js:79-93`

**Что происходит при 401:**
1. Проверяется флаг `window.__isHandlingUnauthorized`
2. Если флаг не установлен:
   - Логируется ошибка
   - Проверяется URL (исключаются `/api/login` и `/api/logout`)
   - Вызывается `handleUnauthorized()`

---

### Шаг 6: Обработка ответа в Store
**Файл:** `src/stores/myStore.js:119-144`

#### 6.1. Если ответ = 401
```javascript
if (typeof response === 'number' && response === 401) {
  await handleUnauthorized()  // ← Автоматический логаут
  return
}
```

#### 6.2. Если ответ успешный
```javascript
this.isAuth = response?.authorized ?? false
this.user_type = response?.user_type || ''
```

#### 6.3. Если ошибка в catch
```javascript
if (error.response?.status === 401) {
  await handleUnauthorized()  // ← Автоматический логаут
  return
}
```

---

### Шаг 7: Возврат в router.beforeEach
**Файл:** `src/router/index.js:265-295`

```javascript
const authenticated = store.isAuth
const userType = store.user_type || localStorage.getItem('user_type')
```

**Логика навигации:**
1. Если не авторизован и не на публичных страницах → редирект на `/login`
2. Если авторизован и на `/landing` → редирект на кабинет
3. Иначе → разрешить навигацию

---

## 🔍 Проблемные места

### Проблема 1: Проверка токена только в JS-доступных cookies
**Место:** `src/utils.js:95-108`
- HttpOnly cookies не видны через `document.cookie`
- Но они могут быть валидными на сервере
- Решение: Всегда делаем запрос к API, если есть хотя бы один токен

### Проблема 2: Множественные проверки при загрузке
**Места:**
- `router.beforeEach` → `setUserAuthenticated()`
- `App.vue:onMounted` → проверка `store.isAuth` (но не вызывает проверку)
- Компоненты → `isUserAuth()` (Header.vue, WelcomeSection.vue)

**Решение:** ✅ Уже исправлено - добавлены проверки флагов

### Проблема 3: localStorage.user_type как fallback
**Место:** `src/router/index.js:266`
```javascript
const userType = store.user_type || localStorage.getItem('user_type')
```
- Может быть устаревшим значением
- Не синхронизируется с сервером

---

## ✅ Текущая логика (после исправлений)

### Сценарий 1: Токен валидный
1. `getAccessToken()` находит токен в cookies
2. Делается запрос к `/api/user/me`
3. Сервер возвращает 200 с данными пользователя
4. `isAuth = true`, `user_type = 'teacher'|'student'`
5. Пользователь остается на странице

### Сценарий 2: Токен истек (401)
1. `getAccessToken()` находит токен в cookies
2. Делается запрос к `/api/user/me`
3. Сервер возвращает 401
4. Interceptor вызывает `handleUnauthorized()`
5. Очищаются cookies, localStorage, store
6. Редирект на `/login`

### Сценарий 3: Токена нет
1. `getAccessToken()` возвращает `null`
2. `isAuth = false` устанавливается БЕЗ запроса к API ✅
3. Пользователь перенаправляется на `/login`

### Сценарий 4: HttpOnly токен (не виден в JS)
1. `getAccessToken()` возвращает `null` (токен не виден)
2. Но `isAuth = null`, поэтому делается запрос к API
3. Браузер автоматически отправляет HttpOnly cookie
4. Сервер проверяет токен и возвращает результат
5. Если валидный → `isAuth = true`
6. Если невалидный → 401 → автоматический логаут

---

## 🎯 Рекомендации

1. ✅ Текущая логика правильная - всегда проверяем через API, если есть подозрение на токен
2. ✅ Защита от множественных запросов работает
3. ⚠️ Можно добавить проверку времени истечения токена на клиенте (если токен JWT)
4. ⚠️ Можно кешировать результат проверки на короткое время (например, 1 минута)
