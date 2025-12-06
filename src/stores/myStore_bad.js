// store/modalsStore.js
import { defineStore } from 'pinia'
import { checkUserAuth, getMyInfo, getStudentNotifications, getTeacherNotifications, getUserInfo } from '@/api/requests'
import { getAccessToken, handleUnauthorized } from '@/utils_auth'

export const useMyStore = defineStore('myStore', {
  state: () => {
    // Восстанавливаем состояние из localStorage при инициализации
    // Это позволяет быстро восстановить состояние авторизации при перезагрузке
    let savedUserType = ''
    let savedIsAuth = false
    
    if (typeof window !== 'undefined') {
      savedUserType = localStorage.getItem('user_type') || ''
      savedIsAuth = localStorage.getItem('isAuth') === 'true'
    }
    
    return {
      info: null,
      userInfo: null,
      notifications: null,
      // Восстанавливаем isAuth из localStorage, если есть user_type
      // Это позволяет избежать повторной проверки при перезагрузке
      // Но все равно делаем проверку через API для валидации токена
      isAuth: savedUserType && savedIsAuth ? true : null,

      subjects: [
        { id: 1, name: "Английский язык" },
        { id: 2, name: "Математика" },
        { id: 3, name: "Физика" },
        { id: 4, name: "Химия" },
        { id: 5, name: "Биология" },
        { id: 6, name: "Русский язык" },
        { id: 7, name: "Литература" },
        { id: 8, name: "Музыка" },
        { id: 9, name: "Информатика" },
        { id: 10, name: "Программирование" },
        { id: 11, name: "Китайский язык" },
        { id: 12, name: "Корейский язык" },
        { id: 13, name: "Японский язык" },
        { id: 14, name: "Немецкий язык" },
        { id: 15, name: "Окружающий мир" },
        { id: 16, name: "География" },
        { id: 17, name: "История" },
        { id: 18, name: "Обществознание" },
        { id: 19, name: "Французский язык" },
        { id: 20, name: "Испанский язык" }
      ],

      // Восстанавливаем user_type из localStorage
      user_type: savedUserType || '',

      infoLoading: false,
      userInfoLoading: false,
      notificationsLoading: false,
    }
  }),
  actions: {
    async setMyInfo() {
      if (this.info || this.infoLoading) return
      this.infoLoading = true
      try {
        this.info = await getMyInfo() || {}
        console.log('Получаем инфо', this.info)
      } finally {
        this.infoLoading = false
      }
    },

    async setUserInfo() {
      // Проверяем тип пользователя - getUserInfo() нужен только для студентов
      const userType = this.user_type || localStorage.getItem('user_type')
      if (userType !== 'student') {
        console.log('setUserInfo: пропущен, пользователь не студент')
        return
      }
      
      if (this.userInfo || this.userInfoLoading) return
      this.userInfoLoading = true
      try {
        this.userInfo = await getUserInfo()
      } finally {
        this.userInfoLoading = false
      }
    },

    async setNotifications() {
      console.log(this.notifications || this.notificationsLoading)
      if (this.notifications || this.notificationsLoading) return
      this.notificationsLoading = true
      try {
        const userType = this.user_type || localStorage.getItem('user_type')
        // setUserInfo() нужен только для студентов, для учителей он вызывает 401
        if (userType === 'student') {
          await this.setUserInfo()
          this.notifications = await getStudentNotifications()
        } else {
          this.notifications = await getTeacherNotifications()
        }
      } finally {
        this.notificationsLoading = false
      }
    },

    async setUserAuthenticated() {
      // Если авторизация уже установлена (isAuth = true) и есть тип пользователя — не сбрасываем
      // Но все равно делаем проверку через API для валидации токена (в фоне, если нужно)
      if (this.isAuth === true && this.user_type) {
        // Делаем проверку в фоне для валидации токена, но не блокируем навигацию
        // Это позволяет быстро восстановить состояние, но проверить валидность токена
        // Делаем проверку в фоне для валидации токена, но не блокируем навигацию
        checkUserAuth().then((response) => {
          if (typeof response === 'number' && response === 401) {
            // Токен недействителен - выполняем автоматический логаут
            // Не используем await, так как это фоновая проверка и не должна блокировать
            handleUnauthorized().catch((error) => {
              console.warn('Ошибка при автоматическом логауте:', error)
            })
          } else if (response?.authorized === false) {
            // Авторизация не подтверждена - очищаем состояние
            this.isAuth = false
            this.user_type = ''
            localStorage.removeItem('isAuth')
            localStorage.removeItem('user_type')
          } else if (response?.authorized === true) {
            // Обновляем user_type, если он изменился
            if (response.user_type && response.user_type !== this.user_type) {
              this.user_type = response.user_type
              localStorage.setItem('user_type', response.user_type)
            }
            // Обновляем isAuth в localStorage на всякий случай
            localStorage.setItem('isAuth', 'true')
          }
        }).catch((error) => {
          // Игнорируем ошибки при фоновой проверке, но логируем для отладки
          console.warn('Фоновая проверка авторизации не удалась:', error)
          // Если это 401 ошибка, все равно делаем логаут
          if (error.response?.status === 401) {
            handleUnauthorized().catch((err) => {
              console.warn('Ошибка при автоматическом логауте:', err)
            })
          }
        })
        return
      }

      // Если isAuth === false (явно установлено, например, после logout), не делаем запрос к API
      // Это предотвращает лишние запросы после logout, даже если токен еще есть в cookies
      if (this.isAuth === false) {
        this.user_type = ''
        return
      }

      // Проверяем наличие токена в cookies (включая возможный HttpOnly, который проверяется на бэкенде)
      const token = getAccessToken()

      // Если токена нет в JS-доступных cookies, но isAuth уже true — не трогаем состояние
      // Это может быть HttpOnly токен, который не виден через JavaScript
      // Но если isAuth восстановлен из localStorage, все равно делаем проверку через API
      if (!token && this.isAuth === true && this.user_type) {
        // Если isAuth восстановлен из localStorage, делаем проверку через API
        // для валидации токена (может быть HttpOnly)
        // Но не блокируем навигацию - делаем в фоне
        checkUserAuth().then((response) => {
          if (typeof response === 'number' && response === 401) {
            handleUnauthorized().catch((err) => {
              console.warn('Ошибка при автоматическом логауте:', err)
            })
          } else if (response?.authorized === false) {
            this.isAuth = false
            this.user_type = ''
            localStorage.removeItem('isAuth')
            localStorage.removeItem('user_type')
          }
        }).catch((error) => {
          if (error.response?.status === 401) {
            handleUnauthorized().catch((err) => {
              console.warn('Ошибка при автоматическом логауте:', err)
            })
          }
        })
        return
      }

      // Если isAuth === null и токена нет, сразу устанавливаем false без запроса к API
      // Это предотвращает лишние запросы при первой загрузке, если пользователь не авторизован
      if (this.isAuth === null && !token) {
        this.isAuth = false
        this.user_type = ''
        // Очищаем localStorage на всякий случай
        localStorage.removeItem('isAuth')
        localStorage.removeItem('user_type')
        return
      }

      // Проверяем авторизацию через API (токен может быть в HttpOnly cookie)
      try {
        const response = await checkUserAuth()
        
        // Если checkUserAuth вернул код ошибки (число), значит запрос не удался
        if (typeof response === 'number' && response === 401) {
          // Токен недействителен - выполняем автоматический логаут
          await handleUnauthorized()
          return
        }
        
        this.isAuth = response?.authorized ?? false
        this.user_type = response?.user_type || ''
        
        // Сохраняем состояние в localStorage для восстановления при перезагрузке
        if (this.isAuth && this.user_type) {
          localStorage.setItem('isAuth', 'true')
          localStorage.setItem('user_type', this.user_type)
        } else {
          localStorage.removeItem('isAuth')
          localStorage.removeItem('user_type')
        }
      } catch (error) {
        console.error('Ошибка при checkUserAuth:', error)
        
        // Если это 401 ошибка, выполняем автоматический логаут
        if (error.response?.status === 401 || error.response?.statusCode === 401) {
          await handleUnauthorized()
          return
        }
        
        if (this.isAuth !== true) {
          this.isAuth = false
          this.user_type = ''
          localStorage.removeItem('isAuth')
          localStorage.removeItem('user_type')
        }
      }
    }
  },
})
