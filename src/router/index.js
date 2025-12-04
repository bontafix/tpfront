import VFaq from '@/components/faq/v-faq.vue'
import VStudentsArchive from '@/components/students/v-students-archive.vue'
import VRegister from '@/components/user/v-register.vue'
import { useMyStore } from '@/stores/myStore'
import { createRouter, createWebHistory } from 'vue-router'


/* ================================================================== Импорты ================================================================== */

/* Лендинг */
const vLanding = () => import('@/components/landing/v-landing.vue')

/* Ошибки */

const vServerError = () => import('@/components/errorPages/v-server-error.vue')

/* Календарь */
const VCalendarDay = () => import('@/components/calendar/v-calendar-day.vue')
const VCalendarWeek = () => import('@/components/calendar/v-calendar-week.vue')
const VCalendarIndex = () => import('@/components/calendar/v-calendar-index.vue')
const vCalendarMonth = () => import('@/components/calendar/v-calendar-month.vue')

/* Онбординг */
const VonBoardingHome = () => import('@/components/onboardingPage/vonBoardingHome.vue')
const vOnboardingStart = () => import('@/components/onboardingPage/v-onboarding-start.vue')

/* Главная */
const vHome = () => import('@/components/home/v-home.vue')

/* Ученики */
const vChartTest = () => import('@/components/modals/v-chart-test.vue')
const vStudents = () => import('@/components/students/v-students.vue')
const VStudentPage = () => import('@/components/students/studentPage/v-student-page.vue')

/* Финансы */
const vFinance = () => import('@/components/finance/v-finance.vue')
const vGroupDetails = () => import('@/components/students/v-group-details.vue')
const VHistoryOperations = () => import('@/components/finance/v-history-operations.vue')

/* Личный кабинет учителя */
const vCabinet = () => import('@/components/teacherCabinet/v-cabinet.vue')

/* Новости */
const vNews = () => import('@/components/newsPage/v-news.vue')

/* Авторизация / Регистрация */
const vLogin = () => import('@/components/user/v-login.vue')

/* Кабинет ученика */
const vStudentCabinet = () => import('@/components/studentCabinet/v-student-cabinet.vue')

/* Уведомления */
const vNotifications = () => import('@/components/notificationsPage/v-notifications.vue')

const vConditionalRoute = () => import('@/components/conditionalRoute/v-conditional-route.vue')

const blogsPage = () => import('@/components/blogPage/blogsPage.vue')
const blogPage = () => import('@/components/blogPage/blogPage.vue')

const notFoundPage = () => import('@/components/404Page/404Page.vue')


/* ================================================================== Маршруты ================================================================== */

/* Ошибки */

const errorRoutes = [
  {
    path: '500',
    name: 'error_500',
    component: vServerError,
  },
]

/* Календарь */
const calendarRoutes = [
  {
    path: '',
    name: 'home',
    component: VCalendarIndex,
  },
  {
    path: 'day',
    name: 'calendar-day',
    component: VCalendarDay,
  },
  {
    path: 'week',
    name: 'calendar-week',
    component: VCalendarWeek,
  },
]

/* Онбординг */
const onBoardingRoutes = [
  {
    path: 'guide',
    name: 'onboarding_home',
    component: VonBoardingHome,
  },
  {
    path: '',
    name: 'onboarding',
    component: vOnboardingStart,
  },
]

/* Главная учителя */

const homeTeacherRoutes = [
  {
    path: '',
    name: 'home_teacher',
    component: vHome,
  },
]

/* Ученики */

const studentsRoutes = [
  { path: '', name: 'my_students', component: vStudents },
  { path: 'group/:id', name: 'group', component: vGroupDetails },
  { path: 'student/:id', name: 'student', component: VStudentPage },
  { path: 'archive', name: 'archive_students', component: VStudentsArchive },
]

/* Финансы */

const financeRoutes = [
  {
    path: '',
    name: 'finance',
    component: vFinance,
  },
  {
    path: '/history',
    name: 'history_operations',
    component: VHistoryOperations,
  },
]

const userRoutes = [
  {
    path: 'login/',
    name: 'login',
    component: vLogin,
  },
  {
    path: 'register',
    name: 'register',
    component: VRegister,
  }
]

/* Кабинет ученика */

const studentCabinet = [
  {
    path: 'student-cabinet/',
    name: 'student_cabinet',
    component: vStudentCabinet,
    meta: { isStudent: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'landing',
      path: '/',
      component: vLanding,
    },
    {
      name: 'faq',
      path: '/faq',
      component: VFaq
    },
    {
      path: '/chart/test',
      name: 'chart-test',
      component: vChartTest,
    },
    {
      path: '/calendar/',
      children: calendarRoutes,
    },

    {
      path: '/onboarding/guide',
      name: 'onboarding_home',
      component: VonBoardingHome,
    },
    {
      path: '/onboarding/',
      children: onBoardingRoutes,
    },
    {
      path: '/home-teacher-test/',
      children: homeTeacherRoutes,
    },
    {
      path: '/my-students-test/',
      children: studentsRoutes,
    },
    {
      path: '/finance/',
      children: financeRoutes,
    },
    {
      path: '/news/',
      name: 'news',
      component: vNews,
    },
    {
      path: '/user/',
      children: userRoutes,
    },
    {
      path: '/teacher-cabinet/',
      name: 'teacher_cabinet',
      component: vCabinet
    },
    {
      path: '/error/',
      children: errorRoutes,
    },
    {
      path: '/student/',
      children: studentCabinet
    },
    {
      path: '/notifications/',
      name: 'notifications',
      component: vNotifications
    },
    {
      path: '/link-profile',
      name: 'link_profile',
      component: vConditionalRoute
    },
    {
      path: '/blogs',
      name: 'blogs',
      component: blogsPage
    },
    {
      path: '/blog/:id/:slug',
      name: 'blog',
      component: blogPage
    },
    {
      path: '/:pathMatch(.*)',
      name: '404',
      component: notFoundPage,
    }
  ],
})


router.beforeEach(async (to, from, next) => {
  console.log('🔵 [ROUTER] beforeEach вызван')
  console.log('  - from:', from.name, from.path)
  console.log('  - to:', to.name, to.path)
  
  const store = useMyStore()
  console.log('  - store.isAuth до setUserAuthenticated:', store.isAuth)
  console.log('  - store.user_type до setUserAuthenticated:', store.user_type)
  
  await store.setUserAuthenticated()

  const authenticated = store.isAuth
  const userType = store.user_type || localStorage.getItem('user_type')
  
  console.log('  - authenticated:', authenticated)
  console.log('  - userType:', userType)
  console.log('  - localStorage.user_type:', localStorage.getItem('user_type'))

  if (
    !authenticated &&
    to.name !== 'landing' &&
    to.name !== 'blogs' &&
    to.name !== 'blog' &&
    to.name !== 'faq' &&
    to.name !== 'login' &&
    to.name !== 'register' &&
    to.name !== 'link_profile'
  ) {
    console.log('❌ [ROUTER] Пользователь не авторизован, редирект на login')
    return next({ name: 'login' })
  } else if (authenticated && to.name === 'landing') {
    console.log('🟡 [ROUTER] Пользователь авторизован на landing, редирект по типу')
    if (userType === 'teacher') {
      console.log('  - Редирект на home_teacher')
      next({ name: 'home_teacher' })
    } else if (userType === 'student') {
      console.log('  - Редирект на student_cabinet')
      next({ name: 'student_cabinet' })
    } else {
      console.log('  - userType неизвестен, продолжаем на landing')
      next()
    }
  } else {
    console.log('✅ [ROUTER] Навигация разрешена, продолжаем')
    // user_type может быть 'student' или 'teacher'
    // if (to.meta.isStudent && userType === 'teacher') {
    //   // запрещаем teacher заходить на student-only страницы
    //   return next({ name: 'home_teacher' })
    // }

    next()
  }
})

router.afterEach((to, from) => {
  console.log('🟢 [ROUTER] afterEach - навигация завершена')
  console.log('  - from:', from.name, from.path)
  console.log('  - to:', to.name, to.path)
  console.log('  - current route:', router.currentRoute.value.name, router.currentRoute.value.path)
})

export default router
