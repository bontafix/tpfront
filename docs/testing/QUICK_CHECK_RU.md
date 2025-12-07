# Быстрая проверка проблемы с cookies

## 🔍 Диагностика

### Шаг 1: Откройте консоль браузера на странице авторизации

`https://dev-teacherplanner.ru/alex/login`

### Шаг 2: Проверьте базовый путь

```javascript
getBasePath()
```

**Ожидается:** `/alex`

### Шаг 3: Попробуйте авторизоваться

Смотрите на логи в консоли. Ключевые моменты:

```
🟢 [LOGIN] Ответ от loginUser получен:
  - response.data: {message: 'Login successful', user_type: 'teacher', ...}
🔵 [LOGIN] Токен в ответе API: ❌ Не найден  ← ПРОБЛЕМА ЗДЕСЬ
```

### Шаг 4: Проверьте cookies после авторизации

```javascript
checkCookies()
```

**Что видим сейчас:**
```javascript
{
  basePath: "/alex",
  allCookies: {
    _ym_uid: "...",
    _ym_d: "...",
    // ❌ access_token отсутствует!
  },
  accessToken: null  // ❌ Токен не найден
}
```

### Шаг 5: Тест - можем ли мы установить cookie вручную?

```javascript
// Попробуем установить тестовую cookie
cookieUtils.setCookie('test_token', 'my_test_value_123', {
  maxAge: 3600,
  secure: true,
  sameSite: 'Lax'
})

// Проверяем
getCookie('test_token')
```

**Если тестовая cookie устанавливается:**
```javascript
"my_test_value_123"  // ✅ Фронтенд работает правильно!
```

**Это означает:** 
- ✅ Фронтенд может устанавливать cookies с правильным path
- ❌ **Проблема на бэкенде** - он не возвращает токен!

## 🎯 Проблема

**Бэкенд не возвращает токен авторизации!**

Текущий ответ от бэкенда:
```json
{
  "message": "Login successful",
  "user_type": "teacher",
  "code": "success"
  // ❌ Отсутствует: "access_token"
}
```

## ✅ Решение

### Вариант 1: Добавить токен в ответ (БЫСТРО)

На бэкенде в `/api/login` добавить:

```python
return {
    "message": "Login successful",
    "user_type": "teacher",
    "code": "success",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # ← ДОБАВИТЬ!
}
```

Фронтенд автоматически подхватит токен и установит cookie с правильным path.

### Вариант 2: Установить cookie через Set-Cookie (ЛУЧШЕ)

На бэкенде в `/api/login`:

```python
response.set_cookie(
    key="access_token",
    value=access_token,
    path="/alex",  # ← ВАЖНО: правильный path!
    secure=True,
    httponly=True,
    samesite="lax",
    max_age=86400
)
```

### Вариант 3: И то, и другое (ИДЕАЛЬНО)

Установить HttpOnly cookie через Set-Cookie + вернуть в ответе для fallback.

## 📋 Чеклист для проверки

После исправлений на бэкенде:

- [ ] `getBasePath()` возвращает `/alex`
- [ ] После авторизации в консоли: `🔵 [LOGIN] Токен в ответе API: ✅ Найден`
- [ ] `checkCookies()` показывает `access_token` в `allCookies`
- [ ] В DevTools → Cookies → `access_token` с `Path: /alex`
- [ ] После авторизации нет автоматического логаута
- [ ] WebSocket подключается успешно

## 🚨 Текущая ситуация

```
❌ Бэкенд НЕ возвращает токен в ответе
❌ Бэкенд НЕ устанавливает cookie через Set-Cookie
✅ Фронтенд готов принять токен и установить cookie
✅ Фронтенд правильно определяет path (/alex)
✅ Фронтенд правильно удаляет cookies при логауте

🎯 ВЫВОД: Нужно исправить бэкенд!
```

## 📞 Что сказать бэкенд-разработчику

> Привет! После авторизации бэкенд не возвращает токен в ответе от `/api/login`. 
> 
> Текущий ответ:
> ```json
> {"message": "Login successful", "user_type": "teacher", "code": "success"}
> ```
> 
> Нужно добавить поле `access_token` в ответ:
> ```json
> {"message": "Login successful", "user_type": "teacher", "code": "success", "access_token": "..."}
> ```
> 
> Или установить cookie через `Set-Cookie` заголовок с path `/alex`.
> 
> Подробности в файле `CHECK_BACKEND_COOKIES.md`.

## 🧪 Финальная проверка после исправления

1. Очистите cookies (DevTools → Application → Clear site data)
2. Авторизуйтесь заново
3. Выполните в консоли:

```javascript
checkCookies()
```

Должно показать:
```javascript
{
  basePath: "/alex",
  allCookies: {
    access_token: "eyJhbG..."  // ✅ Токен есть!
  },
  accessToken: "eyJhbG..."  // ✅ Токен найден!
}
```

4. Проверьте в DevTools → Application → Cookies:
   - `access_token` должен быть с `Path: /alex`

5. Обновите страницу - не должно быть автоматического логаута!


