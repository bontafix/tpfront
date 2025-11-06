# Исправление конфигурации nginx для /alex/

## Проблема

В текущей конфигурации nginx есть проблема с обработкой SPA роутинга для поддиректории `/alex/`:

```nginx
location ^~ /alex/ {
    alias /var/www/dev-tp-alex/;
    try_files $uri $uri/ /alex/index.html;  # ❌ НЕПРАВИЛЬНО
    error_page 404 = /alex/index.html;      # ❌ Может конфликтовать
}
```

**Почему это не работает:**
- При использовании `alias`, путь в `try_files` должен быть относительно директории `alias`, а не абсолютный путь с `/alex/`
- `error_page 404` может конфликтовать с `try_files` и создавать проблемы

## Решение

**КРИТИЧЕСКИ ВАЖНО:** Именованный location `@alex_fallback` должен быть **НА УРОВНЕ SERVER**, а НЕ внутри блока `location ^~ /alex/`.

Замените блок `location ^~ /alex/` и добавьте именованный location на том же уровне (внутри блока `server`, но вне других `location` блоков):

```nginx
# Обработка запроса без завершающего слэша (перед блоком /alex/)
location = /alex {
    return 301 /alex/;
}

# Основной блок для /alex/
location ^~ /alex/ {
    # Корневая директория для тестовой версии
    alias /var/www/dev-tp-alex/;
    
    access_log /var/log/nginx/tp/www-alex-access.log;
    error_log /var/log/nginx/tp/www-alex-error.log;
    
    index index.html;
    
    # Используем именованный location для правильной обработки SPA
    try_files $uri $uri/ @alex_fallback;
    
    # Статические файлы для тестовой версии
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|mp4)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public";
    }
}

# Именованный location для fallback - ДОЛЖЕН БЫТЬ НА УРОВНЕ SERVER (не внутри location ^~ /alex/)
# Возвращает index.html для всех маршрутов SPA
location @alex_fallback {
    rewrite ^/alex/(.*)$ /index.html break;
    root /var/www/dev-tp-alex;
}
```

## Что изменить в вашей конфигурации

1. **Удалите строку** `error_page 404 = /alex/index.html;` из блока `/alex/`
2. **Замените** `try_files $uri $uri/ /alex/index.html;` на `try_files $uri $uri/ @alex_fallback;`
3. **Убедитесь, что блок `location ^~ /alex/` закрыт** (закрывающая скобка `}`)
4. **Добавьте именованный location `@alex_fallback` НА УРОВНЕ SERVER** (после блока `/alex/`, но на том же уровне отступа, что и другие `location` блоки)
5. **Добавьте** (опционально) блок `location = /alex` для редиректа (перед блоком `/alex/`)
6. **Удалите дубликаты** - убедитесь, что нет двух блоков `location = /alex`

**Структура должна быть такой:**
```
server {
    ...
    
    location = /alex {
        return 301 /alex/;
    }
    
    location ^~ /alex/ {
        ...
        try_files $uri $uri/ @alex_fallback;
        ...
    }
    
    location @alex_fallback {
        ...
    }
    
    location / {
        ...
    }
}
```

## Проверка

После изменений:

```bash
# Проверьте синтаксис конфигурации
sudo nginx -t

# Если все ОК, перезагрузите nginx
sudo systemctl reload nginx
```

## Отладка

Если проблема сохраняется:

1. Проверьте логи:
   ```bash
   tail -f /var/log/nginx/tp/www-alex-error.log
   ```

2. Проверьте, что файлы на месте:
   ```bash
   ls -la /var/www/dev-tp-alex/
   ls -la /var/www/dev-tp-alex/index.html
   ```

3. Проверьте права доступа:
   ```bash
   sudo chown -R www-data:www-data /var/www/dev-tp-alex
   sudo chmod -R 755 /var/www/dev-tp-alex
   ```

4. Откройте консоль браузера (F12) и проверьте:
   - Загружаются ли CSS/JS файлы (вкладка Network)
   - Есть ли ошибки в консоли (вкладка Console)

## Полный блок для замены

См. файл `nginx-fix.conf` для готового блока конфигурации.

