# Исправление проблемы с путем cookies

## Проблема

При деплое приложения по адресу `https://dev-teacherplanner.ru/alex/` cookies сохранялись для корневого пути `/` домена `dev-teacherplanner.ru`, вместо правильного пути `/alex/`.

Это приводило к следующим проблемам:
- Cookies были доступны для всех путей домена, а не только для `/alex/`
- При логауте cookies не удалялись корректно, так как удаление происходило с неправильным path
- Потенциальные конфликты с другими приложениями на том же домене

## Решение

### 1. Добавлена функция `getBasePath()`

Функция автоматически определяет базовый путь приложения:
```javascript
export function getBasePath() {
  // Сначала проверяет import.meta.env.BASE_URL из Vite
  // Затем извлекает из текущего URL (например, /alex/some-page -> /alex)
  // По умолчанию возвращает '/'
}
```

**Где:** `src/utils_auth.js`

### 2. Добавлена функция `cookieUtils.setCookie()`

Новая функция для установки cookies с правильным path:
```javascript
cookieUtils.setCookie('access_token', token, {
  maxAge: 86400,
  secure: true,
  sameSite: 'Lax'
})
```

**Особенности:**
- Автоматически использует правильный path из `getBasePath()`
- Устанавливает `secure: true` для HTTPS
- Устанавливает `sameSite: Lax` для безопасности

**Где:** `src/utils_auth.js`

### 3. Обновлена функция `cookieUtils.deleteCookie()`

Теперь функция пытается удалить cookies для всех возможных путей:
- `/` (корневой путь)
- `/alex/` (базовый путь приложения)
- Все варианты с/без слеша на конце

**Где:** `src/utils_auth.js`

### 4. Обновлен код авторизации

В `v-login.vue` заменен прямой вызов `document.cookie` на использование `cookieUtils.setCookie()`:

**Было:**
```javascript
document.cookie = `access_token=${tokenFromResponse}; path=/; max-age=86400`
```

**Стало:**
```javascript
cookieUtils.setCookie('access_token', tokenFromResponse, {
  maxAge: 86400,
  secure: true,
  sameSite: 'Lax'
})
```

**Где:** `src/components/user/v-login.vue`

### 5. Добавлены утилиты для отладки

В консоли браузера теперь доступны:
```javascript
checkCookies()  // Проверить все cookies и токен авторизации
getCookie(name) // Получить конкретную cookie
getAllCookies() // Получить все cookies
getBasePath()   // Получить базовый путь приложения
```

**Где:** `src/main.js`

## Как проверить

1. **Открыть консоль браузера** на странице `https://dev-teacherplanner.ru/alex/`

2. **Проверить базовый путь:**
   ```javascript
   getBasePath()
   // Должно вернуть: "/alex"
   ```

3. **Авторизоваться** и проверить cookies:
   ```javascript
   checkCookies()
   // Должно показать:
   // - basePath: "/alex"
   // - Все установленные cookies
   // - Токен авторизации
   ```

4. **Проверить cookies в DevTools:**
   - Открыть **Application** → **Cookies** → `dev-teacherplanner.ru`
   - Проверить, что `access_token` имеет **Path: `/alex`**

## Результат

После этих изменений:
✅ Cookies сохраняются с правильным path (`/alex/`)
✅ Cookies корректно удаляются при логауте
✅ Нет конфликтов с другими приложениями на том же домене
✅ Улучшена безопасность (secure, sameSite)

## Примечание для бэкенда

⚠️ **Важно:** Бэкенд также должен устанавливать cookies с правильным path!

Если бэкенд устанавливает cookies через HTTP заголовок `Set-Cookie`, убедитесь что он использует:
```
Set-Cookie: access_token=...; Path=/alex/; Secure; HttpOnly; SameSite=Lax
```

Иначе cookies от бэкенда будут по-прежнему устанавливаться с `Path=/`.
