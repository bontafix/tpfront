# Исправление проблемы с cookies

## 🎯 Проблема

Приложение расположено по адресу `https://dev-teacherplanner.ru/alex/`, но cookies сохранялись для корневого пути `/` вместо `/alex/`.

## ✅ Решение

Внесены следующие изменения:

### 1. Новая функция `getBasePath()` в `src/utils_auth.js`

Автоматически определяет базовый путь приложения:
- Для `https://dev-teacherplanner.ru/alex/` → вернет `/alex`
- Для `http://localhost:5173/` → вернет `/`

### 2. Новая функция `cookieUtils.setCookie()` в `src/utils_auth.js`

Устанавливает cookies с правильным путем:
```javascript
cookieUtils.setCookie('access_token', token, {
  maxAge: 86400,     // 24 часа
  secure: true,      // Только HTTPS
  sameSite: 'Lax'    // Защита от CSRF
})
```

### 3. Улучшена функция `cookieUtils.deleteCookie()` в `src/utils_auth.js`

Теперь удаляет cookies для всех возможных путей:
- `/` (корневой)
- `/alex` (базовый путь)
- `/alex/` (с слешем)

### 4. Обновлен код авторизации в `src/components/user/v-login.vue`

Заменен прямой вызов `document.cookie` на `cookieUtils.setCookie()` с автоматическим определением правильного пути.

### 5. Добавлены утилиты для отладки в `src/main.js`

В консоли браузера доступны:
```javascript
checkCookies()  // Проверить все cookies и токен
getBasePath()   // Узнать базовый путь приложения
getCookie(name) // Получить конкретную cookie
getAllCookies() // Получить все cookies
```

## 🧪 Как проверить

1. Откройте консоль на `https://dev-teacherplanner.ru/alex/`
2. Выполните `getBasePath()` - должно вернуть `/alex`
3. Авторизуйтесь и выполните `checkCookies()` - должны увидеть токен
4. Откройте DevTools → Application → Cookies → проверьте Path для `access_token`

## 📋 Файлы изменены

- ✅ `src/utils_auth.js` - добавлены функции `getBasePath()` и `setCookie()`
- ✅ `src/components/user/v-login.vue` - использование новой функции `setCookie()`
- ✅ `src/main.js` - добавлены утилиты для отладки

## ⚠️ Важно для бэкенда

Если бэкенд также устанавливает cookies, убедитесь что он использует правильный Path:

```http
Set-Cookie: access_token=...; Path=/alex/; Secure; HttpOnly; SameSite=Lax
```

Иначе cookies от бэкенда будут по-прежнему устанавливаться с `Path=/`.

## 📖 Дополнительная документация

- `COOKIE_PATH_FIX.md` - подробное описание проблемы и решения
- `TEST_COOKIES.md` - инструкции по тестированию
