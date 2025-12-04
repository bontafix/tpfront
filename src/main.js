import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { cookieUtils, getAccessToken } from './utils'

// Вывод версии приложения в консоль
const appVersion = __APP_VERSION__
console.log(
  `%cTeacher Planner client v${appVersion}`,
  'color:rgb(0, 90, 173); font-size: 14px; padding: 4px 8px; background:rgb(255, 255, 255); border-radius: 2px;'
)


const app = createApp(App)

app.use(createPinia())
app.use(router)

// ---- ЯНДЕКС МЕТРИКА ----
;(function (m, e, t, r, i, k, a) {
  m[i] =
    m[i] ||
    function () {
      (m[i].a = m[i].a || []).push(arguments)
    }
  m[i].l = 1 * new Date()
  for (let j = 0; j < document.scripts.length; j++) {
    if (document.scripts[j].src === r) return
  }
  k = e.createElement(t)
  a = e.getElementsByTagName(t)[0]
  k.async = 1
  k.src = r
  a.parentNode.insertBefore(k, a)
})(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym')

// Дожидаемся загрузки ym
;(function waitForYm() {
  if (typeof window.ym !== 'function') {
    return setTimeout(waitForYm, 100)
  }
  window.ym(99575921, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
  })
})()

// Отслеживание всех переходов по маршрутам
router.afterEach((to) => {
  if (typeof window.ym === 'function') {
    window.ym(99575921, 'hit', to.fullPath)
  }
})
// ---- КОНЕЦ КОДА МЕТРИКИ ----

// Глобальная функция для проверки куков из консоли браузера
// Использование: window.checkCookies() или просто checkCookies()
if (typeof window !== 'undefined') {
  window.checkCookies = () => {
    return cookieUtils.checkAuthToken()
  }
  
  window.getCookie = (name) => {
    return cookieUtils.getCookie(name)
  }
  
  window.getAllCookies = () => {
    return cookieUtils.getAllCookies()
  }
  
  console.log('%c🍪 Утилиты для проверки куков доступны:', 'color: #4CAF50; font-weight: bold;')
  console.log('  - checkCookies() - проверить токен авторизации')
  console.log('  - getCookie(name) - получить куку по имени')
  console.log('  - getAllCookies() - получить все куки')
}

app.directive('click-outside', {
  beforeMount(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  },
})

app.mount('#app')
