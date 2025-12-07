# 🔄 Визуальная схема проверки токена после перезагрузки

## 📊 ПОЛНЫЙ FLOW (упрощенная схема)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ПЕРЕЗАГРУЗКА СТРАНИЦЫ (F5)                                │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. router.beforeEach (src/router/index.js:261)               │
│    └─► await store.setUserAuthenticated()                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. setUserAuthenticated() (src/stores/myStore.js:89)         │
│                                                               │
│    Проверка 1: isAuth === true? ──► ДА ──► return ✅        │
│    Проверка 2: isAuth === false? ──► ДА ──► return ✅        │
│    Проверка 3: getAccessToken() ──► получаем токен          │
│    Проверка 4: !token && isAuth === true? ──► ДА ──► return │
│    Проверка 5: isAuth === null && !token?                    │
│                └─► ДА ──► isAuth = false, return ✅          │
│                └─► НЕТ ──► продолжаем                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. checkUserAuth() (src/api/requests.js:1045)                │
│                                                               │
│    Проверка: window.__isHandlingUnauthorized?               │
│    └─► ДА ──► return { authorized: false } ✅               │
│    └─► НЕТ ──► продолжаем                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Interceptor REQUEST (src/api/requests.js:17)               │
│                                                               │
│    getAccessToken() ──► получаем токен из cookies            │
│    └─► Если токен найден:                                    │
│        └─► config.headers.Authorization = `Bearer ${token}` │
│    └─► Если токен не найден:                                 │
│        └─► Запрос идет без заголовка                         │
│        └─► Но HttpOnly cookies отправятся автоматически      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. ЗАПРОС К API: GET /api/user/me                            │
│                                                               │
│    Браузер отправляет:                                       │
│    ├─► Authorization: Bearer <token> (если есть)            │
│    └─► Все cookies (включая HttpOnly)                        │
└─────────────────────────────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
┌───────────────────────┐   ┌───────────────────────┐
│ 7a. УСПЕХ (200 OK)    │   │ 7b. ОШИБКА (401)      │
│                       │   │                       │
│ {                     │   │ 401 Unauthorized     │
│   authorized: true,  │   │                       │
│   user_type: '...'   │   │                       │
│ }                     │   │                       │
└───────────────────────┘   └───────────────────────┘
            │                           │
            │                           ▼
            │           ┌───────────────────────────────┐
            │           │ 8. Interceptor RESPONSE        │
            │           │    (src/api/requests.js:79)    │
            │           │                                │
            │           │ Проверка: __isHandling...?    │
            │           │ └─► ДА ──► reject(error) ✅    │
            │           │ └─► НЕТ ──► handleUnauthorized() │
            │           └───────────────────────────────┘
            │                           │
            │                           ▼
            │           ┌───────────────────────────────┐
            │           │ 9. handleUnauthorized()       │
            │           │    (src/utils.js:391)         │
            │           │                                │
            │           │ 1. Установка флагов           │
            │           │ 2. Закрытие WebSocket         │
            │           │ 3. Очистка cookies            │
            │           │ 4. Очистка localStorage       │
            │           │ 5. Очистка store              │
            │           │ 6. Редирект на /login         │
            │           └───────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. ОБРАБОТКА В STORE (src/stores/myStore.js:119)            │
│                                                               │
│    Если response === 401:                                    │
│    └─► await handleUnauthorized()                            │
│                                                               │
│    Если response успешный:                                    │
│    └─► this.isAuth = response.authorized                     │
│    └─► this.user_type = response.user_type                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 11. ВОЗВРАТ В router.beforeEach                              │
│                                                               │
│    const authenticated = store.isAuth                        │
│    const userType = store.user_type                          │
│                                                               │
│    Если !authenticated:                                       │
│    └─► next({ name: 'login' })                               │
│                                                               │
│    Если authenticated:                                        │
│    └─► next() (разрешить навигацию)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 ДЕТАЛЬНАЯ ПРОВЕРКА ТОКЕНА

### Функция: `getAccessToken()`
**Файл:** `src/utils.js:95-108`

```
getAccessToken()
    │
    ├─► cookieUtils.getCookie('access_token')
    │   └─► Найден? ──► ДА ──► return decodeURIComponent(token) ✅
    │   └─► НЕТ ──► продолжаем
    │
    ├─► cookieUtils.getCookie('accessToken')
    │   └─► Найден? ──► ДА ──► return decodeURIComponent(token) ✅
    │   └─► НЕТ ──► продолжаем
    │
    ├─► cookieUtils.getCookie('token')
    │   └─► Найден? ──► ДА ──► return decodeURIComponent(token) ✅
    │   └─► НЕТ ──► продолжаем
    │
    └─► Fallback: document.cookie.match(/(^| )access_token=([^;]+)/)
        └─► Найден? ──► ДА ──► return decodeURIComponent(match[2]) ✅
        └─► НЕТ ──► return null ❌
```

---

## 🎯 РЕШЕНИЯ ПРОБЛЕМ

### ✅ Проблема: Множественные запросы при 401
**Решение:** Флаг `window.__isHandlingUnauthorized`

```
Запрос 1 → 401 → handleUnauthorized() → флаг = true
Запрос 2 → 401 → проверка флага → ДА → пропуск ✅
Запрос 3 → 401 → проверка флага → ДА → пропуск ✅
```

### ✅ Проблема: HttpOnly токен не виден
**Решение:** Всегда делаем запрос к API, если isAuth === null

```
getAccessToken() → null (HttpOnly не виден)
НО: isAuth === null → делаем запрос к API
Браузер автоматически отправляет HttpOnly cookie
Сервер проверяет и возвращает результат ✅
```

### ✅ Проблема: Нет токена → лишний запрос
**Решение:** Проверка перед запросом

```
getAccessToken() → null
isAuth === null && !token → ДА
→ isAuth = false, return (БЕЗ запроса к API) ✅
```

---

## 📝 КЛЮЧЕВЫЕ МОМЕНТЫ

1. **Проверка токена происходит в `router.beforeEach`** - при каждой навигации
2. **Токен ищется в 3 местах:** `access_token`, `accessToken`, `token`
3. **HttpOnly cookies не видны через JS**, но отправляются автоматически
4. **Если токена нет и isAuth === null** → устанавливаем false БЕЗ запроса к API
5. **При 401** → автоматический логаут через `handleUnauthorized()`
6. **Защита от множественных запросов** → флаг `__isHandlingUnauthorized`
