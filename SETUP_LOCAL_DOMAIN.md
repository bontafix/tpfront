# Настройка локальной разработки с доменом local.dev-teacherplanner.ru

Этот гайд поможет настроить локальную разработку с использованием домена `local.dev-teacherplanner.ru` для решения проблем с куками.

## Проблема

Когда фронтенд работает на `localhost:5173`, а бэкенд на другом домене (например, `dev-teacherplanner.ru`), браузер может блокировать установку куков из-за политики SameSite и разных доменов.

## Решение

Использовать один и тот же домен для фронтенда и бэкенда через настройку hosts файла.

## Шаги настройки

### 1. Настройка hosts файла

**Linux/Mac:**
```bash
sudo nano /etc/hosts
```

**Windows:**
Откройте `C:\Windows\System32\drivers\etc\hosts` от имени администратора

Добавьте строку:
```
127.0.0.1       local.dev-teacherplanner.ru
```

Сохраните файл.

### 2. Создание .env.local файла

Создайте файл `.env.local` в корне проекта:

```bash
cp .env.local.example .env.local
```

Отредактируйте `.env.local` и укажите правильные URL для вашего бэкенда:

```env
# Если бэкенд на том же домене, но другом порту (например, 8000)
VITE_API_URL=http://local.dev-teacherplanner.ru:8000/api
VITE_API_WS_URL=ws://local.dev-teacherplanner.ru:8000/ws

# Или если бэкенд на том же домене и порту (через прокси)
VITE_API_URL=http://local.dev-teacherplanner.ru/api
VITE_API_WS_URL=ws://local.dev-teacherplanner.ru/ws
```

### 3. Настройка Vite (уже сделано)

Конфигурация Vite уже настроена в `vite.config.js` для работы с доменом `local.dev-teacherplanner.ru`. Сервер будет слушать на всех интерфейсах (`0.0.0.0`), что позволяет обращаться и через `localhost:5173`, и через `local.dev-teacherplanner.ru:5173`. Домен добавлен в `allowedHosts`.

### 4. Запуск приложения

```bash
npm run dev
```

Приложение будет доступно по адресу: **http://local.dev-teacherplanner.ru:5173**

### 5. Проверка работы куков

1. Откройте DevTools (F12)
2. Перейдите на вкладку **Application** → **Cookies**
3. Выполните авторизацию
4. Проверьте, что куки установлены для домена `local.dev-teacherplanner.ru`
5. В консоли выполните: `checkCookies()` для проверки токена

## Важные замечания

1. **Порт 5173**: Vite по умолчанию использует порт 5173. Если нужно изменить, отредактируйте `vite.config.js`

2. **HTTPS**: Если бэкенд требует HTTPS, вам может понадобиться:
   - Использовать прокси (nginx, Caddy)
   - Или настроить самоподписанный сертификат для локального домена

3. **CORS**: Убедитесь, что бэкенд настроен для работы с доменом `local.dev-teacherplanner.ru:5173`

4. **Очистка куков**: Если что-то не работает, очистите куки для домена `local.dev-teacherplanner.ru` в браузере

## Альтернативный вариант: прокси через Vite

Если бэкенд на другом порту, можно настроить прокси в `vite.config.js`:

```js
server: {
  port: 5173,
  host: '0.0.0.0',
  allowedHosts: ['local.dev-teacherplanner.ru'],
  proxy: {
    '/api': {
      target: 'http://localhost:8000', // или другой порт бэкенда
      changeOrigin: true,
      secure: false,
    }
  }
}
```

Тогда в `.env.local` можно использовать относительные пути:
```env
VITE_API_URL=/api
```

