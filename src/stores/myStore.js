// store/modalsStore.js
import { defineStore } from 'pinia'
import { checkUserAuth, getMyInfo, getStudentNotifications, getTeacherNotifications, getUserInfo } from '@/api/requests'
import { getAccessToken } from '@/utils'

export const useMyStore = defineStore('myStore', {
  state: () => ({
    info: null,
    userInfo: null,
    notifications: null,
    isAuth: null,

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

    user_type: '',

    infoLoading: false,
    userInfoLoading: false,
    notificationsLoading: false,
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
        await this.setUserInfo()
        const userType = this.user_type || localStorage.getItem('user_type')
        if (userType === 'student') {
          this.notifications = await getStudentNotifications()
        } else {
          this.notifications = await getTeacherNotifications()
        }
      } finally {
        this.notificationsLoading = false
      }
    },

    async setUserAuthenticated() {
      console.log('🔵 [STORE] setUserAuthenticated вызван')
      console.log('  - this.isAuth:', this.isAuth)
      console.log('  - this.user_type:', this.user_type)
      
      // Если авторизация уже установлена (isAuth = true) и есть тип пользователя — не сбрасываем
      // Это важно, так как токен может быть в HttpOnly cookie, недоступной через JavaScript
      if (this.isAuth === true && this.user_type) {
        console.log('✅ [STORE] Авторизация уже установлена (isAuth=true), пропускаем проверку')
        return
      }

      // Сначала проверяем наличие токена в cookies
      const token = getAccessToken()
      console.log('  - token найден:', !!token)
      console.log('  - token (первые 20 символов):', token ? token.substring(0, 20) + '...' : null)
      console.log('  - document.cookie:', document.cookie)

      // Если токена нет в JavaScript-доступных cookies — проверяем через API
      // Токен может быть в HttpOnly cookie, который недоступен через JavaScript
      if (!token) {
        console.log('⚠️ [STORE] Токен не найден в JS-доступных cookies, проверяем через API')
        // Не сбрасываем isAuth сразу, сначала проверим через API
        // Если isAuth уже был установлен в true, не сбрасываем его
        if (this.isAuth === true) {
          console.log('  - isAuth уже true, не сбрасываем')
          return
        }
      }

      // Проверяем авторизацию через API (токен может быть в HttpOnly cookie)
      console.log('🟡 [STORE] Вызов checkUserAuth()...')
      try {
        const response = await checkUserAuth()
        console.log('🟢 [STORE] checkUserAuth вернул:')
        console.log('  - response:', response)
        console.log('  - response?.authorized:', response?.authorized)
        console.log('  - response?.user_type:', response?.user_type)
        
        this.isAuth = response?.authorized ?? false
        this.user_type = response?.user_type || ''
        
        console.log('✅ [STORE] Установлены значения:')
        console.log('  - this.isAuth:', this.isAuth)
        console.log('  - this.user_type:', this.user_type)
      } catch (error) {
        console.error('❌ [STORE] Ошибка при checkUserAuth:', error)
        // Если isAuth уже был установлен в true, не сбрасываем его при ошибке
        if (this.isAuth !== true) {
          this.isAuth = false
          this.user_type = ''
        }
      }
    }
  },
})
