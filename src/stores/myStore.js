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
      // Если авторизационный статус уже определён и есть тип пользователя — повторный запрос не нужен
      if (this.isAuth !== null && this.user_type) {
        return
      }

      // Сначала проверяем наличие токена в cookies
      const token = getAccessToken()

      // Если токена нет — считаем пользователя неавторизованным и не шлём запрос на бэкенд
      if (!token) {
        this.isAuth = false
        this.user_type = ''
        return
      }

      // Если токен есть — подтверждаем авторизацию у бэкенда
      const response = await checkUserAuth()
      this.isAuth = response?.authorized ?? false
      this.user_type = response?.user_type || ''
    }
  },
})
