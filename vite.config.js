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
const faviconVersionPlugin = () => {
  return {
    name: 'favicon-version',
    transformIndexHtml(html) {
      // Добавляем версию к favicon ссылкам для обхода кэша браузера
      return html.replace(
        /(href=["']\/[^"']*favicon[^"']*\.(ico|png))(["'])/gi,
        `$1?v=${appVersion}$3`
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), faviconVersionPlugin()],
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
  base: '/',
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'static',
  },
})
