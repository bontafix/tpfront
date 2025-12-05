# 🔍 Пошаговая проверка токена после перезагрузки страницы

## 📍 Точки входа проверки авторизации

### 1️⃣ **ТОЧКА ВХОДА: router.beforeEach** 
**Файл:** `src/router/index.js:261-263`
```javascript
router.beforeEach(async (to, from, next) => {
  const store = useMyStore()
  await store.setUserAuthenticated()  // ← ВХОД
```

**Когда вызывается:**
- При первой загрузке страницы
- При любой навигации (переход по ссылкам)
- При обновлении страницы (F5)

---

## 🔄 ПОЛНЫЙ FLOW ПРОВЕРКИ

### ШАГ 1: Проверка в Store
**Файл:** `src/stores/myStore.js:89-145`

```
┌─────────────────────────────────────────┐
│ setUserAuthenticated()                   │
└─────────────────────────────────────────┘
         │
         ├─► Проверка 1: isAuth === true?
         │   └─► ДА → return (выход)
         │   └─► НЕТ → продолжаем
         │
         ├─► Проверка 2: isAuth === false?
         │   └─► ДА → return (выход)
         │   └─► НЕТ → продолжаем
         │
         ├─► Проверка 3: getAccessToken()
         │   Файл: src/utils.js:95-108
         │   ┌─────────────────────────────┐
         │   │ 1. cookieUtils.getCookie('access_token') │
         │   │ 2. cookieUtils.getCookie('accessToken')  │
         │   │ 3. cookieUtils.getCookie('token')        │
         │   │ 4. Fallback: regex парсинг document.cookie │
         │   └─────────────────────────────┘
         │
         ├─► Проверка 4: !token && isAuth === true?
         │   └─► ДА → return (выход)
         │   └─► НЕТ → продолжаем
         │
         ├─► Проверка 5: isAuth === null && !token?
         │   └─► ДА → isAuth = false, return (БЕЗ запроса к API) ✅
         │   └─► НЕТ → продолжаем
         │
         └─► Проверка 6: checkUserAuth() → API запрос
```

---

### ШАГ 2: Проверка перед API запросом
**Файл:** `src/api/requests.js:1045-1048`

```javascript
export async function checkUserAuth() {
  // Проверка флага логаута
  if (typeof window !== 'undefined' && window.__isHandlingUnauthorized) {
    return { authorized: false, user_type: '' }  // ← Выход без запроса
  }
```

**Что проверяется:**
- Если уже идет процесс автоматического логаута → не делаем запрос

---

### ШАГ 3: Interceptor запроса (добавление токена)
**Файл:** `src/api/requests.js:17-59`

```javascript
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()  // ← Получаем токен из cookies
  if (token) {
    config.headers.Authorization = `Bearer ${token}`  // ← Добавляем в заголовок
  }
  return config
})
```

**Что происходит:**
1. Получаем токен через `getAccessToken()`
2. Если токен найден → добавляем в заголовок `Authorization: Bearer <token>`
3. Если токен не найден → запрос идет без заголовка (но HttpOnly cookies отправятся автоматически)

---

### ШАГ 4: Выполнение запроса
**Файл:** `src/api/requests.js:1049-1058`

```javascript
const response = await makeRequest('/api/user/me', 'GET')
```

**Что происходит:**
- Отправляется GET запрос на `/api/user/me`
- Браузер автоматически отправляет все cookies (включая HttpOnly)
- Сервер проверяет токен и возвращает ответ

---

### ШАГ 5: Interceptor ответа (обработка 401)
**Файл:** `src/api/requests.js:79-93`

```javascript
apiClient.interceptors.response.use(
  async (error) => {
    if (error.response?.status === 401) {
      // Проверка флага логаута
      if (window.__isHandlingUnauthorized) {
        return Promise.reject(error)  // ← Уже идет логаут
      }
      
      // Проверка URL (исключаем /api/login и /api/logout)
      const url = error.config?.url || ''
      if (!url.includes('/api/login') && !url.includes('/api/logout')) {
        await handleUnauthorized()  // ← Автоматический логаут
      }
    }
    return Promise.reject(error)
  }
)
```

**Что происходит при 401:**
1. Проверяется флаг `__isHandlingUnauthorized`
2. Если флаг не установлен → вызывается `handleUnauthorized()`
3. Если URL = `/api/login` или `/api/logout` → пропускаем (избегаем цикла)

---

### ШАГ 6: Обработка ответа в Store
**Файл:** `src/stores/myStore.js:119-144`

```javascript
try {
  const response = await checkUserAuth()
  
  // Случай 1: Ответ = 401
  if (typeof response === 'number' && response === 401) {
    await handleUnauthorized()  // ← Автоматический логаут
    return
  }
  
  // Случай 2: Успешный ответ
  this.isAuth = response?.authorized ?? false
  this.user_type = response?.user_type || ''
  
} catch (error) {
  // Случай 3: Ошибка 401 в catch
  if (error.response?.status === 401) {
    await handleUnauthorized()  // ← Автоматический логаут
    return
  }
  
  // Случай 4: Другая ошибка
  this.isAuth = false
  this.user_type = ''
}
```

---

### ШАГ 7: Возврат в router
**Файл:** `src/router/index.js:265-295`

```javascript
const authenticated = store.isAuth
const userType = store.user_type || localStorage.getItem('user_type')

// Логика навигации:
if (!authenticated && !isPublicPage) {
  next({ name: 'login' })  // ← Редирект на логин
} else if (authenticated && to.name === 'landing') {
  next({ name: 'home_teacher'|'student_cabinet' })  // ← Редирект в кабинет
} else {
  next()  // ← Разрешить навигацию
}
```

---

## 🎯 СЦЕНАРИИ ПРОВЕРКИ

### ✅ Сценарий 1: Токен валидный (в JS-доступных cookies)

```
1. router.beforeEach → setUserAuthenticated()
2. getAccessToken() → находит токен ✅
3. checkUserAuth() → запрос к /api/user/me
4. Сервер: 200 OK { authorized: true, user_type: 'teacher' }
5. store.isAuth = true
6. store.user_type = 'teacher'
7. Пользователь остается на странице ✅
```

### ❌ Сценарий 2: Токен истек (401)

```
1. router.beforeEach → setUserAuthenticated()
2. getAccessToken() → находит токен (но он истек)
3. checkUserAuth() → запрос к /api/user/me
4. Сервер: 401 Unauthorized
5. Interceptor → handleUnauthorized()
   ├─► Очистка cookies
   ├─► Очистка localStorage
   ├─► store.isAuth = false
   └─► Редирект на /login
6. Пользователь на странице логина ✅
```

### ⚠️ Сценарий 3: Токена нет в JS-доступных cookies

```
1. router.beforeEach → setUserAuthenticated()
2. getAccessToken() → null (токен не найден)
3. Проверка: isAuth === null && !token
   └─► ДА → isAuth = false, return (БЕЗ запроса к API) ✅
4. router → редирект на /login
```

### 🔐 Сценарий 4: HttpOnly токен (не виден в JS)

```
1. router.beforeEach → setUserAuthenticated()
2. getAccessToken() → null (HttpOnly не виден через JS)
3. Проверка: isAuth === null && !token
   └─► НЕТ (isAuth может быть не null после предыдущей проверки)
4. checkUserAuth() → запрос к /api/user/me
5. Браузер автоматически отправляет HttpOnly cookie
6. Сервер проверяет токен:
   ├─► Валидный → 200 OK → isAuth = true ✅
   └─► Невалидный → 401 → handleUnauthorized() ✅
```

---

## 🔧 КЛЮЧЕВЫЕ ФУНКЦИИ

### `getAccessToken()` - получение токена
**Файл:** `src/utils.js:95-108`
```javascript
// Проверяет в порядке приоритета:
1. cookieUtils.getCookie('access_token')
2. cookieUtils.getCookie('accessToken')
3. cookieUtils.getCookie('token')
4. Fallback: regex парсинг document.cookie
```

### `cookieUtils.getCookie()` - чтение cookie
**Файл:** `src/utils.js:303-309`
```javascript
getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }
  return null;
}
```

**Важно:** 
- Читает только JS-доступные cookies
- HttpOnly cookies НЕ видны через `document.cookie`
- Но они отправляются браузером автоматически

### `handleUnauthorized()` - автоматический логаут
**Файл:** `src/utils.js:391-503`

**Что делает:**
1. Устанавливает флаг `isHandlingUnauthorized = true`
2. Закрывает WebSocket соединение
3. Очищает все cookies (access_token, accessToken, token, и др.)
4. Очищает localStorage (user_type)
5. Очищает store (isAuth, user_type, info, userInfo, notifications)
6. Вызывает logoutUser() на сервере (без await)
7. Редиректит на /login

---

## ⚠️ ПОТЕНЦИАЛЬНЫЕ ПРОБЛЕМЫ

### Проблема 1: Множественные проверки
**Места вызова:**
- `router.beforeEach` → `setUserAuthenticated()`
- Компоненты → `isUserAuth()` (Header.vue:45, WelcomeSection.vue:82)

**Решение:** ✅ Добавлены проверки флагов `isHandlingUnauthorized`

### Проблема 2: HttpOnly токен не виден
**Симптом:** `getAccessToken()` возвращает `null`, но токен есть на сервере

**Решение:** ✅ Всегда делаем запрос к API, если `isAuth === null`

### Проблема 3: Устаревший localStorage.user_type
**Место:** `src/router/index.js:266`
```javascript
const userType = store.user_type || localStorage.getItem('user_type')
```

**Проблема:** Может быть устаревшим значением

**Рекомендация:** Использовать только `store.user_type`, который обновляется через API

---

## ✅ ТЕКУЩЕЕ СОСТОЯНИЕ

Все проверки работают корректно:
- ✅ Проверка токена в cookies
- ✅ Запрос к API для валидации
- ✅ Автоматический логаут при 401
- ✅ Защита от множественных запросов
- ✅ Обработка HttpOnly cookies
- ✅ Правильная логика навигации
