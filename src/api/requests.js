// Базовый клиент и функции запросов
export { apiClient, domain, makeRequest, makeGetRequest } from './apiClient'

// Экспорт всех функций для работы с учениками
export {
  createDemoRequest,
  getUserInfo,
  getStudentFutureLessons,
  getStudentLastLessons,
  getStudentLessons,
  getStudentAnalytics,
  getAllGradesStudent,
  getStudentById,
  getTimeZones,
  getArchivedStudents,
  getTypesConnect,
  toggleStudentArchive,
  setStudentHomework,
  getReviews,
  setNewReviews,
  deleteStudentAnswer,
  updateStudentProfile,
  setStudentProfile,
  getStudentBalance,
  getTeacherInfo,
  deleteStudentProfile,
  setResult,
  updateResultById,
  deleteResultById,
  getStudentResults,
  getStudentSubjects,
  getStudentSchedule,
  getAllStudents,
  getMyStudents,
  importStudents,
  getStudnetSource,
  getStudnetGoals,
  getAllStudentHomework,
  manualGrade,
} from './students'

// Экспорт всех функций для работы с учителями
export {
  getTeacherById,
  getMyInfo,
  getTeacherOperations,
  getTeacherExpenses,
  getTeacherIncome,
  deleteTeacherOperations,
  cancelOperation,
  setIncome,
  setExpense,
  deleteExpenditure,
  setPayment,
  updateTeacherProfile,
  changeEmail,
  getTeacherTasks,
  setTeacherTasks,
  deleteTeacherTask,
} from './teachers'

// Экспорт всех функций для работы с уроками
export {
  getWeeks,
  getNews,
  getNewsById,
  getLessonsOnMonth,
  getLessonsOnWeek,
  getTodayLessons,
  getLessonsOnDay,
  getMyLessons,
  getRule,
  getLessonById,
  getCurrentLessons,
  deleteLessonById,
  transferLesson,
  setTopic,
  setOneTimeLesson,
  setTrialLesson,
  setStableGroupLesson,
  setStableLesson,
  editRule,
  cancelLesson,
  deleteRuleLessons,
  getPreviousProblems,
  getLessonProblems,
  setLessonProblems,
  deleteLessonProblem,
  getLessonHomeWork,
  getlastHomework,
  setLessonHomeWork,
  deleteLessonHomework,
  createSubmission,
  uploadFIleHomework,
  getLessonTopics,
  setLessonTopics,
  deleteLessonTopic,
} from './lessons'

// Экспорт всех функций для авторизации/регистрации
export {
  registerUser,
  loginUser,
  logoutUser,
  deleteAccount,
  checkUserAuth,
  changePassword,
  linkProfileForApi,
  getWSToken,
} from './auth'

// Экспорт всех функций для работы с финансами
export {
  getEarningsForDay,
  getEarningsForPeriod,
  getMonthlyEarnings,
  getWeeklyEarnings,
  getEarningsForYear,
  getDailyEarnings,
  getStudentsEarnings,
  getStudentEarning,
} from './finance'

// Экспорт всех функций для работы с уведомлениями
export {
  getTeacherNotifications,
  deleteTeacherNotifications,
  getStudentNotifications,
  deleteStudentNotifications,
} from './notifications'

// Экспорт всех функций для работы с группами
export {
  createGroup,
  getGroups,
  createHomeworkGroup,
  updateGroup,
  getGroupStudents,
  deleteGroup,
  createGroupLesson,
  createGroupLessons,
} from './groups'
