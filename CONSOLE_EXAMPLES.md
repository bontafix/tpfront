# Примеры использования в консоли браузера

## Проверка базового пути

```javascript
// Узнать текущий базовый путь приложения
getBasePath()
// Для https://dev-teacherplanner.ru/alex/ вернет: "/alex"
// Для http://localhost:5173/ вернет: "/"
```

## Проверка cookies

```javascript
// Полная проверка всех cookies и токена авторизации
checkCookies()
// Вернет объект с информацией:
// {
//   basePath: "/alex",
//   currentUrl: "https://dev-teacherplanner.ru/alex/...",
//   allCookies: { access_token: "..." },
//   tokenNames: { access_token: { found: true, ... } },
//   accessToken: "..."
// }

// Получить конкретную cookie
getCookie('access_token')
// Вернет значение токена или null

// Получить все cookies
getAllCookies()
// Вернет объект: { access_token: "...", other_cookie: "..." }
```

## Ручная установка cookie (для теста)

```javascript
// Установить cookie с правильным path
cookieUtils.setCookie('test_cookie', 'test_value', {
  maxAge: 3600,      // 1 час
  secure: true,
  sameSite: 'Lax'
})
```

## Ручное удаление cookie (для теста)

```javascript
// Удалить cookie со всех возможных путей
cookieUtils.deleteCookie('test_cookie')
```

## Проверка после авторизации

```javascript
// 1. Авторизуйтесь в приложении
// 2. Выполните в консоли:
checkCookies()

// Должны увидеть:
// ✅ basePath: "/alex" (для production)
// ✅ accessToken: "..." (токен найден)
// ✅ allCookies содержит access_token
```

## Проверка после логаута

```javascript
// 1. Выполните logout
// 2. Выполните в консоли:
checkCookies()

// Должны увидеть:
// ✅ basePath: "/alex" (не изменился)
// ❌ accessToken: null (токен удален)
// ❌ allCookies пустой или без access_token
```

## Проверка Path в DevTools

1. Откройте **DevTools** (F12)
2. Перейдите в **Application** → **Cookies** → `dev-teacherplanner.ru`
3. Найдите cookie `access_token`
4. Проверьте колонку **Path** - должно быть `/alex` (или `/alex/`)

## Отладка проблем

### Если токен не найден после авторизации:

```javascript
// Проверяем что в консоли
checkCookies()

// Проверяем localStorage (workaround)
localStorage.getItem('access_token')

// Проверяем все возможные имена cookies
['access_token', 'accessToken', 'token'].forEach(name => {
  console.log(name, getCookie(name))
})
```

### Если cookie не удаляется:

```javascript
// Смотрим какие пути пробуются при удалении
// (должно быть в консоли сообщение с массивом путей)

// Проверяем текущие cookies
document.cookie

// Пробуем удалить вручную с разными путями
document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;'
document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/alex;'
document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/alex/;'
```

## Полезные команды для тестирования

```javascript
// Очистить все cookies (для чистого теста)
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + 
    '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;'
})

// Посмотреть текущий URL и pathname
console.log({
  url: window.location.href,
  pathname: window.location.pathname,
  basePath: getBasePath()
})
```
