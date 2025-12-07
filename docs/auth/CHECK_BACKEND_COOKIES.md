# Проверка установки cookies бэкендом

## Проблема

Из логов видно, что после успешной авторизации:

```
✅ [LOGIN] Статус ответа успешный (2xx)
🔵 [LOGIN] Токен в ответе API: ❌ Не найден
🍪 [COOKIES] Проверка куков после авторизации:
  - Все куки (document.cookie): _ym_uid=...; _ym_d=...; _ym_isad=...; _ym_visorc=...
  - ❌ Кука "access_token" не найдена
```

**Бэкенд НЕ устанавливает cookies с токеном авторизации!**

## Что нужно проверить на бэкенде

### 1. Проверить ответ от `/api/login`

Бэкенд должен либо:

**Вариант A: Возвращать токен в теле ответа**
```json
{
  "message": "Login successful",
  "user_type": "teacher",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Вариант B: Устанавливать cookie через заголовок Set-Cookie**
```http
Set-Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/alex/; Secure; HttpOnly; SameSite=Lax; Max-Age=86400
```

Сейчас бэкенд делает **НИ ТО, НИ ДРУГОЕ!**

### 2. Проверить текущий ответ бэкенда

Текущий ответ от бэкенда:
```json
{
  "message": "Login successful",
  "user_type": "teacher",
  "code": "success"
}
```

❌ **Отсутствует:** `access_token`
❌ **Отсутствует:** заголовок `Set-Cookie`

### 3. Что нужно исправить на бэкенде

#### Вариант 1: Добавить токен в ответ (РЕКОМЕНДУЕТСЯ)

```python
# Python/FastAPI пример
@app.post("/api/login")
async def login(credentials: LoginCredentials):
    # ... проверка credentials ...
    
    # Создаем токен
    access_token = create_access_token(user_id=user.id)
    
    return {
        "message": "Login successful",
        "user_type": "teacher",
        "code": "success",
        "access_token": access_token  # ← ДОБАВИТЬ ЭТО!
    }
```

#### Вариант 2: Установить cookie через Set-Cookie

```python
# Python/FastAPI пример
from fastapi import Response

@app.post("/api/login")
async def login(credentials: LoginCredentials, response: Response):
    # ... проверка credentials ...
    
    # Создаем токен
    access_token = create_access_token(user_id=user.id)
    
    # Определяем правильный path на основе Referer или Origin
    referer = request.headers.get("referer", "")
    path = "/alex/" if "/alex/" in referer else "/"
    
    # Устанавливаем cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        path=path,  # ← ВАЖНО: правильный path!
        secure=True,
        httponly=True,
        samesite="lax",
        max_age=86400
    )
    
    return {
        "message": "Login successful",
        "user_type": "teacher",
        "code": "success"
    }
```

#### Вариант 3: И то, и другое (НАИЛУЧШИЙ)

```python
@app.post("/api/login")
async def login(credentials: LoginCredentials, response: Response):
    # ... проверка credentials ...
    
    access_token = create_access_token(user_id=user.id)
    
    # Устанавливаем HttpOnly cookie для безопасности
    referer = request.headers.get("referer", "")
    path = "/alex/" if "/alex/" in referer else "/"
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        path=path,
        secure=True,
        httponly=True,  # Недоступен из JavaScript
        samesite="lax",
        max_age=86400
    )
    
    # И возвращаем в ответе для fallback
    return {
        "message": "Login successful",
        "user_type": "teacher",
        "code": "success",
        "access_token": access_token  # Fallback для проблемных случаев
    }
```

### 4. Проверка правильного Path

Фронтенд расположен по адресу: `https://dev-teacherplanner.ru/alex/`

Cookie должна устанавливаться с:
- `Path=/alex/` или `Path=/alex` (без слеша на конце)
- НЕ `Path=/` (будет доступна для всего домена)

**Определение правильного path на бэкенде:**

```python
def get_cookie_path(request):
    """Определить правильный path для cookie на основе Referer"""
    referer = request.headers.get("referer", "")
    origin = request.headers.get("origin", "")
    
    # Проверяем Referer
    if "/alex/" in referer:
        return "/alex"
    
    # Проверяем Origin
    if origin:
        from urllib.parse import urlparse
        parsed = urlparse(origin)
        # Если есть дополнительная информация в path
        if parsed.path and parsed.path != "/":
            return parsed.path.rstrip("/")
    
    # По умолчанию корневой путь
    return "/"
```

### 5. Как проверить исправления

После исправлений на бэкенде, в консоли браузера должно появиться:

```
🟢 [LOGIN] Ответ от loginUser получен:
  - response.data: {message: 'Login successful', user_type: 'teacher', access_token: 'eyJ...'}
🔵 [LOGIN] Токен в ответе API: ✅ Найден
🍪 [COOKIE] Установлена cookie "access_token" с path="/alex"
🍪 [COOKIES] Проверка куков после авторизации:
  - ✅ Кука "access_token" найдена (длина: ...)
```

И в DevTools → Application → Cookies → `dev-teacherplanner.ru`:
```
Name: access_token
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Path: /alex
Secure: ✓
HttpOnly: ✓ (если установлена через Set-Cookie)
SameSite: Lax
```

## Временное решение на фронтенде (workaround)

Если бэкенд не может быть быстро исправлен, можно попросить бэкенд вернуть токен хотя бы в теле ответа:

```json
{
  "message": "Login successful",
  "user_type": "teacher",
  "code": "success",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Фронтенд уже настроен на обработку этого случая и автоматически установит cookie с правильным path.

## Проверка текущей ситуации

Выполните в консоли браузера после попытки авторизации:

```javascript
// 1. Проверить все cookies
checkCookies()

// 2. Проверить localStorage (workaround)
localStorage.getItem('access_token')

// 3. Проверить базовый путь
getBasePath()

// 4. Попробовать установить тестовую cookie
cookieUtils.setCookie('test_token', 'test_value_123', {
  maxAge: 3600,
  secure: true,
  sameSite: 'Lax'
})

// 5. Проверить, что тестовая cookie установилась
getCookie('test_token')
```

Если тестовая cookie устанавливается, но реальная нет - проблема точно на бэкенде!


