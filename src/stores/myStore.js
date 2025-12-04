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
      if (this.isAuth === true && this.user_type) {
        return
      }

      // Проверяем наличие токена в cookies (включая возможный HttpOnly, который проверяется на бэкенде)
      const token = getAccessToken()

      // Если токена нет в JS-доступных cookies, но isAuth уже true — не трогаем состояние
      if (!token && this.isAuth === true && this.user_type) {
        return
      }

      // Проверяем авторизацию через API (токен может быть в HttpOnly cookie)
      try {
        const response = await checkUserAuth()
        this.isAuth = response?.authorized ?? false
        this.user_type = response?.user_type || ''
      } catch (error) {
        console.error('Ошибка при checkUserAuth:', error)
        if (this.isAuth !== true) {
          this.isAuth = false
          this.user_type = ''
        }
      }
    }
  },
})
