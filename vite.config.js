import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'

// Читаем версию из package.json
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'))
const appVersion = packageJson.version

// Плагин для добавления версии к favicon ссылкам
const faviconVersionPlugin = (basePath = '/') => {
  return {
    name: 'favicon-version',
    transformIndexHtml(html) {
      // Добавляем версию к favicon ссылкам для обхода кэша браузера
      // Учитываем base path в путях
      const baseRegex = basePath === '/' ? '' : basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return html.replace(
        new RegExp(`(href=["']${baseRegex}[^"']*favicon[^"']*\\.(ico|png))(["'])`, 'gi'),
        `$1?v=${appVersion}$3`
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const basePath = process.env.VITE_BASE_PATH || '/'
  
  return {
    plugins: [vue(), vueJsx(), faviconVersionPlugin(basePath)],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
    base: basePath,
    server: {
      port: 5173,
      host: '0.0.0.0', // Слушаем на всех интерфейсах, чтобы можно было обращаться и через localhost, и через local.dev-teacherplanner.ru
      strictPort: true,
      // Настройки для работы с куками на одном домене
      cors: true,
      // Разрешаем использование локального домена
      allowedHosts: [
        'local.dev-teacherplanner.ru',
        'dev-teacherplanner.ru',
        'localhost',
      ],
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
    },
  }
})
