# Тестирование исправления cookies

## Шаги для тестирования

### 1. Проверка базового пути

Откройте консоль браузера на странице `https://dev-teacherplanner.ru/alex/` и выполните:

```javascript
getBasePath()
```

**Ожидаемый результат:** `/alex`

### 2. Проверка установки cookies при авторизации

1. **Очистите cookies** (Application → Cookies → Clear all cookies)
2. **Авторизуйтесь** в приложении
3. **Проверьте cookies** в консоли:

```javascript
checkCookies()
```

**Ожидаемый результат:**
```javascript
{
  basePath: "/alex",
  currentUrl: "https://dev-teacherplanner.ru/alex/...",
  currentPathname: "/alex/...",
  allCookies: {
    access_token: "..." // Должен быть установлен
  },
  tokenNames: {
    access_token: {
      found: true,
      length: ...,
      preview: "..."
    }
  },
  accessToken: "..." // Токен найден
}
```

4. **Проверьте Path в DevTools:**
   - Откройте **Application** → **Cookies** → `dev-teacherplanner.ru`
   - Найдите cookie `access_token`
   - Проверьте поле **Path**: должно быть `/alex` (или `/alex/`)

### 3. Проверка удаления cookies при логауте

1. **Выполните logout**
2. **Проверьте cookies** в консоли:

```javascript
checkCookies()
```

**Ожидаемый результат:**
```javascript
{
  basePath: "/alex",
  allCookies: {}, // Пустой объект - все cookies удалены
  tokenNames: {
    access_token: { found: false },
    accessToken: { found: false },
    token: { found: false }
  },
  accessToken: null // Токен не найден
}
```

3. **Проверьте в DevTools:**
   - **Application** → **Cookies** → `dev-teacherplanner.ru`
   - Cookie `access_token` должна **отсутствовать**

### 4. Проверка в консоли при логировании

При авторизации в консоли должны появиться следующие сообщения:

```
🔧 [LOGIN] Устанавливаем токен из ответа API в localStorage
🍪 [COOKIE] Установлена cookie "access_token" с path="/alex"
```

При логауте:

```
🍪 [COOKIE] Удаление cookie "access_token" для путей: ["/", "/alex", "/alex/"]
```

## Проверка на разных окружениях

### Локальная разработка (localhost:5173)

```javascript
getBasePath() // Должно вернуть: "/"
```

Cookies должны устанавливаться с `Path: /`

### Production (dev-teacherplanner.ru/alex/)

```javascript
getBasePath() // Должно вернуть: "/alex"
```

Cookies должны устанавливаться с `Path: /alex`

## Что делать если cookies по-прежнему устанавливаются с Path=/

Если после авторизации cookie `access_token` имеет `Path: /`, это значит что **бэкенд** устанавливает cookies с неправильным путем.

В этом случае нужно обратиться к бэкенд-разработчику и попросить:

1. Определять базовый путь из `Referer` заголовка HTTP запроса
2. Устанавливать cookies с правильным Path в заголовке `Set-Cookie`:

```
Set-Cookie: access_token=...; Path=/alex/; Secure; HttpOnly; SameSite=Lax
```

## Возможные проблемы

### Проблема 1: getBasePath() возвращает '/' вместо '/alex'

**Причина:** `import.meta.env.BASE_URL` не установлен или приложение собрано без `VITE_BASE_PATH`

**Решение:** Убедиться что сборка выполняется с правильной командой:
```bash
npm run build:alex
```

### Проблема 2: Cookies устанавливаются, но не удаляются

**Причина:** Cookies установлены с одним path, а удаляются с другим

**Решение:** Функция `deleteCookie()` уже пытается удалить cookies со всех возможных путей, но если проблема остается:

```javascript
// Вручную удалить cookie
document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/alex;'
document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;'
```

### Проблема 3: Cookies не читаются после установки

**Причина:** Cookies установлены с `HttpOnly` флагом (это нормально для безопасности)

**Решение:** HttpOnly cookies недоступны через JavaScript, но автоматически отправляются с запросами. Это правильное поведение для токенов авторизации.

## Итоговый чеклист

- [ ] `getBasePath()` возвращает правильный путь (`/alex` для production)
- [ ] После авторизации `checkCookies()` показывает найденный токен
- [ ] В DevTools cookie `access_token` имеет правильный Path
- [ ] После логаута `checkCookies()` показывает что токен удален
- [ ] В DevTools cookie `access_token` отсутствует после логаута
- [ ] В консоли видны сообщения об установке/удалении cookies с правильным path
