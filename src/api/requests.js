const domain = import.meta.env.VITE_API_URL
import router from '@/router'
import jsonOrder from 'json-order'
import axios from 'axios'
import emitter from '@/eventBus'
import { getAccessToken } from '@/utils'

const apiClient = axios.create({
  baseURL: domain,
  withCredentials: true,
  headers: {
    'Cache-Control': 'no-store',
  },
})

// Interceptor для добавления токена авторизации в заголовки
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      // Логируем только если токена нет (для отладки)
      console.debug('Токен авторизации не найден в cookies для запроса:', config.url)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor для обработки ошибок авторизации
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - возможно проблема с токеном авторизации')
      // Можно добавить логику редиректа на логин или обновления токена
    }
    return Promise.reject(error)
  }
)

// Общая функция для выполнения запросов
async function makeRequest(endpoint, method = 'GET', body = null, headers = null) {
  try {
    const config = {
      method: method.toLowerCase(),
      url: endpoint,
      withCredentials: true,
      headers: {
        'Cache-Control': 'no-store',
        ...headers,
      },
    }

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.headers['Content-Type'] = 'application/json'
      config.data =
        method === 'POST' || method === 'PUT' ? jsonOrder.stringify(body) : JSON.stringify(body)
    } else if (body && method === 'DELETE') {
      config.data = JSON.stringify(body)
    }

    const response = await apiClient(config)
    return method === 'GET' ? response.data : response
  } catch (error) {
    if (error.response) {
      const errorCode = error.response.status
      if (errorCode >= 500) {
        /* if (import.meta.env.PROD) {
          router.push({name: 'error_500'})
          console.log('Перенаправление')
        } */
      }
      console.error(`API Error: ${errorCode}`)
      return errorCode
    } else {
      /* if (import.meta.env.PROD) {
        router.push({name: 'error_500'})
        console.log('Перенаправление')
      } */
      console.error(`Произошла ошибка при ${method}-запросе ${endpoint}:`, error)
      throw error
    }
  }
}

// Существующий метод GET оставляем для обратной совместимости
async function makeGetRequest(endpoint) {
  return makeRequest(endpoint, 'GET')
}

/*=================================================================== Ученики =============================================================== */

export async function createDemoRequest(data) {
  try {
    return await axios.post(
      `${domain}/api/public/demo-request`,
      data,
      {
        withCredentials: true,
      },
    )
  } catch (error) {
    console.error('Произошла ошибка при создании заявки на демонстрацию', error)
  }
}

export async function getUserInfo() {
  try {
    return await makeGetRequest('/api/student/user-info')
  } catch (error) {
    console.error('Произошла ошибка при получении информации о пользователе', error)
  }
}

export async function getStudentFutureLessons(student_id, page, page_size) {
  try {
    return await makeGetRequest(
      `/api/student-future-lessons?student_id=${student_id}&page=${page}&page_size=${page_size}`,
    )
  } catch (error) {
    console.error('Произошла ошибка при получении будущих уркоов ученика', error)
  }
}

export async function getStudentLastLessons(student_id, page, page_size) {
  try {
    return await makeGetRequest(
      `/api/student-last-lessons?student_id=${student_id}&page=${page}&page_size=${page_size}`,
    )
  } catch (error) {
    console.error('Произошла ошибка при получении предыдущих уроков ученика', error)
  }
}

export async function getStudentLessons(student_profile_id, page, per_page) {
  try {
    return await makeGetRequest(
      `/api/student/lessons?student_profile_id=${student_profile_id}&page=${page}&per_page=${per_page}`,
    )
  } catch (error) {
    console.error('Произошла ошибка при получении уроков ученика', error)
  }
}

export async function getStudentAnalytics(student_id) {
  try {
    return await makeRequest(`/api/analutics-student/${student_id}`)
  } catch (error) {
    console.error('Произошла ошибка при получении данных для аналитики ученика', error)
  }
}

export async function getAllGradesStudent(student_id) {
  try {
    return await makeGetRequest(`/api/students-all-grades/${student_id}`)
  } catch (error) {
    console.error('Произошла ошибка при получении всех оценок ученика', error)
  }
}

export async function getStudentById(student_id) {
  try {
    return await makeRequest(`/api/student-profile/${student_id}`)
  } catch (error) {
    console.error('Произошла ошиббка при получении профиля ученика', error)
  }
}

export async function getTimeZones() {
  try {
    return await makeGetRequest(`/api/time_zone`)
  } catch (error) {
    console.error('Произошла ошибка при получении временных зон', error)
  }
}

export async function getArchivedStudents() {
  try {
    return await makeGetRequest(`/api/all-students-archive-teachers`)
  } catch (error) {
    console.error('Произошла ошибка при получении учеников из архива', error)
  }
}

export async function getTypesConnect() {
  try {
    return await makeGetRequest('/api/type-connects')
  } catch (error) {
    console.error('Произошла ошибка при получении типов связи', error)
  }
}

export async function toggleStudentArchive(student_id) {
  try {
    const response = await makeRequest(`/api/toggle-student-archive/${student_id}`, 'POST')
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибка при добавлении/удалении ученика из архива', error)
  }
}

export async function setStudentHomework(homework_id, student_profile_id, files) {
  try {
    return await axios.post(
      `${domain}/api/student/homework/${homework_id}/submit?student_profile_id=${student_profile_id}`,
      files,
      {
        withCredentials: true,
      },
    )
  } catch (error) {
    console.error('Произошла ошибка при отправки домашнего задания', error)
  }
}

export async function getReviews() {
  try {
    return await makeRequest('/api/admin/reviews')
  } catch (error) {
    console.error('Произошла ошибка при получении отзывов', error)
  }
}

export async function setNewReviews(review) {
  try {
    return await axios.post(
      `${domain}/api/public/reviews`,
      review,
      {
        withCredentials: true,
      },
    )
  } catch(error) {
    console.error('Произошла ошибка при создании отзыва', error)
  }
}

export async function deleteStudentAnswer(answer_id, studnet_profile_id) {
  try {
    return await makeRequest(
      `/api/student/homework-answers/${answer_id}?student_profile_id=${studnet_profile_id}`,
    )
  } catch (error) {
    console.error('Произошла ошибка при удалении ответа ученика', error)
  }
}

export async function updateStudentProfile(student_id, request_body) {
  try {
    return await makeRequest(`/api/student-update/${student_id}`, 'PUT', request_body)
  } catch (error) {
    console.error('Произошла ошибка при обновлении профиля ученика', error)
  }
}

export async function setStudentProfile(student_profile) {
  try {
    const response = await makeRequest('/api/student-create', 'POST', student_profile)
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибка при соаздании профиля студента', error)
  }
}

export async function getStudentBalance(student_profile_id) {
  try {
    return await makeGetRequest(`/api/student/balance?student_profile_id=${student_profile_id}`)
  } catch (error) {
    console.error('Произошла ошибка при получении баланса ученика', error)
  }
}

export async function getTeacherInfo(student_profile_id) {
  try {
    return await makeGetRequest(
      `/api/student/teacher-info?student_profile_id=${student_profile_id}`,
    )
  } catch (error) {
    console.error('Произошла ошибка при получении информации об учителе', error)
  }
}

export async function deleteStudentProfile(data) {
  try {
    const response = await axios.delete(`${domain}/api/students/`, {
      data: data,
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.name && response.name !== 'AxiosError') {
      router.go(0)
    } else {
      emitter.emit('notify', {
        type: 'error',
        message: 'Произошла ошибка при удалении ученика',
      })
    }
    return response
  } catch (error) {
    console.error('Произошла ошибка при удалении ученика', error)
  }
}

export async function setResult(request_body) {
  try {
    const response = await axios.post(`${domain}/api/results`, request_body, {
      withCredentials: true,
    })
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибка при добавлении результата ученика', error)
  }
}

export async function updateResultById(result_id, request_body) {
  try {
    await axios.put(`${domain}/api/results/${result_id}`, request_body, { withCredentials: true })
    router.go(0)
  } catch (error) {
    console.error('Произошла ошибка при обновлении результата', error)
  }
}

export async function deleteResultById(result_id) {
  try {
    await makeRequest(`/api/results/${result_id}`, 'DELETE')
    router.go(0)
  } catch (error) {
    console.error('произошл ошибка при удалении результата', error)
  }
}

export async function getStudentResults(student_id) {
  try {
    return await makeGetRequest(`/api/student-results?student_id=${student_id}`)
  } catch (error) {
    console.error('Произошла ошибка при получении результатов ученика', error)
  }
}

export async function getlastHomework(lesson_id) {
  try {
    return makeGetRequest(`/api/lesson-last-homework/${lesson_id}`)
  } catch (error) {
    console.error('Произошла ошибка при получении последнего домашнего задания', error)
  }
}

export async function createSubmission(homework_id, request_body) {
  try {
    await axios.post(`${domain}/api/create-homework-submission/${homework_id}`, request_body, {
      withCredentials: true,
    })

    /* router.go(0) */
  } catch (error) {
    console.error('Произошла ошибка при создании отправки домашнего задания', error)
  }
}

export async function getStudentSubjects() {
  try {
    return makeGetRequest(`/api/student/profiles`)
  } catch (error) {
    console.error('Произошла ошибка при получении информациио профиле студента', error)
  }
}

export async function getStudentSchedule(year, month) {
  try {
    return makeGetRequest(`/api/student/schedule?year=${year}&month=${month}`)
  } catch (error) {
    console.error('ПРоизошла ошибка при получении расписаня ученика')
  }
}
/*=================================================================== Учителя =============================================================== */

export async function getTeacherById(teacherId) {
  try {
    return await makeGetRequest(`/api/teachers/${teacherId}`)
  } catch (error) {
    console.error('Произошла ошибка при получении учителя', error)
  }
}

export async function getMyInfo() {
  try {
    const response = await makeGetRequest('/api/get-me-info')
    /* if(response >=   400) {
      router.push({name: 'login'})
    } */
    return response
  } catch (error) {
    console.error('Произошла ошибка при получении информации об учителе', error)
  }
}

export async function getTeacherOperations() {
  try {
    return await makeGetRequest('/api/operations')
  } catch (error) {
    console.error('Произошла ошибка при получении информации об операциях учителя', error)
  }
}

export async function getTeacherExpenses() {
  try {
    return await makeGetRequest('/api/expenditures')
  } catch (error) {
    console.error('Произошла ошибка при получении расходов учителя', error)
  }
}

export async function getTeacherIncome() {
  try {
    return await makeGetRequest('/api/incomes')
  } catch (error) {
    console.error('Произошла ошибка при получении доходов учителей', error)
  }
}

export async function deleteTeacherOperations(payment_id) {
  try {
    const response = await makeRequest(`/api/payments/${payment_id}`, 'DELETE')
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибка при получении информации об операциях учителя', error)
  }
}

export async function cancelOperation(operation_id) {
  try {
    const response = await makeRequest(`/api/cancel-operation/${operation_id}`, 'DELETE')
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибка при отмене операции', error)
  }
}

export async function setIncome(requestBody) {
  try {
    const response = await makeRequest('/api/income', 'POST', requestBody)
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибка при добавлении дохода учителя', error)
  }
}

export async function setExpense(requestBody) {
  try {
    const response = await makeRequest('/api/expenditures', 'POST', requestBody)
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибка при добавлении расхода учителя', error)
  }
}

export async function deleteExpenditure(id) {
  try {
    const response = await makeRequest(`/api/expenditures/${id}`, 'DELETE')
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибка при удалении расхода', error)
  }
}

export async function setPayment(requestBody) {
  try {
    const response = await makeRequest('/api/payments', 'POST', requestBody)
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибка при добавлении оплаты', error)
  }
}

export async function updateTeacherProfile(request_body) {
  try {
    return await makeRequest(`/api/update-teacher-profile`, 'PUT', request_body)
  } catch (error) {
    console.error('Произошла ошибка при обновлении информации об учителе', error)
  }
}

export async function changeEmail(email) {
  try {
    const response = await makeRequest(`/api/user/change_email?new_email=${email}`, 'PUT')
    if (response !== 422) {
      router.go(0)
    }
    return response
  } catch (error) {
    console.error('Произошла ошибка при обновлении почты', error)
  }
}

/*=================================================================== Уроки =============================================================== */
export async function getWeeks() {
  try {
    return await makeGetRequest('/api/weeks')
  } catch (error) {
    console.error('Произошла ошибка при получении недель', error)
  }
}

export async function getNews() {
  try {
    return await makeGetRequest('/api/public/news')
  } catch (error) {
    console.error('Произошла ошибка при получении новостей', error)
  }
}

export async function getLessonsOnMonth(year, month) {
  try {
    return await makeGetRequest(`/api/lessons/${year}/${month}`)
  } catch (error) {
    console.error('Произошла ошибка при получении уроков учителя на месяц', error)
  }
}

export async function getLessonsOnWeek(startDate) {
  try {
    return await makeGetRequest(`/api/lessons/week/${startDate}`)
  } catch (error) {
    console.error('Произошла ошибка при получении уроков учителя на неделю', error)
  }
}

export async function getTodayLessons() {
  try {
    return await makeRequest('/api/today-lessons')
  } catch (error) {
    console.error('Произошла ошибка при получении уроков на сегодня', error)
  }
}

export async function getLessonsOnDay(date) {
  try {
    return await makeGetRequest(`/api/lessons/day?date=${date}`)
  } catch (error) {
    console.error('Произошла ошибка при получении уроков на день', error)
  }
}

export async function getMyLessons(date) {
  try {
    return await makeGetRequest(`/api/lessons/day?date=${date}`)
  } catch (error) {
    console.error('Произошла ошибка при получении моих уроков', error)
  }
}

export async function getMyStudents(search_item = null) {
  try {
    if (search_item) {
      return await makeGetRequest(`/api/all-students-teachers?search=${search_item}`)
    }
    return await makeGetRequest('/api/all-students-teachers')
  } catch (error) {
    console.error('Произошла ошибка при получении списка моих студентов', error)
  }
}

export async function getRule(query) {
  try {
    return await makeGetRequest(`/api/lessons/get-rule?${query}`)
  } catch (error) {
    console.error('Произошла ошибка при получении правила урока', error)
  }
}

export async function getLessonById(id) {
  try {
    return await makeGetRequest(`/api/lesson/${id}`)
  } catch (error) {
    console.error('Произошла ошибка при получении списка текущих уроков', error)
  }
}

export async function getCurrentLessons() {
  try {
    return await makeGetRequest('/api/current-lessons')
  } catch (error) {
    console.error('Произошла ошибка при получении списка текущих уроков', error)
  }
}

/* Пробелмы предыдущего занятяи */

export async function getPreviousProblems(lesson_id) {
  try {
    return await makeGetRequest(`/api/lesson-last-problems/${lesson_id}`)
  } catch (error) {
    console.error('Произошла ошибка при получении списка проблем прошлого занятия', error)
  }
}

/* Проблемы занятия */

export async function getLessonProblems(lesson_id) {
  try {
    return await makeGetRequest(`/api/lesson-problems/${lesson_id}`)
  } catch (error) {
    console.error('Произошла ошибка при получении списка проблем урока')
  }
}

export async function setLessonProblems(data) {
  try {
    return await makeRequest(`/api/create-lesson-problems`, 'POST', data)
  } catch (error) {
    console.error('Произошла ошибка при создании проблем урока', error)
  }
}

export async function deleteLessonProblem(problem_id) {
  try {
    return await makeRequest(`/api/delete-problem/${problem_id}`, 'DELETE')
  } catch (error) {
    console.error('Произошла ошибка при удалении проблемы', error)
  }
}

export async function cancelLesson(lesson_data) {
  try {
    const response = await makeRequest(`/api/cancel-lesson`, 'POST', lesson_data)
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибка при удалении проблемы', error)
  }
}

export async function deleteRuleLessons(query) {
  try {
    const response = await makeRequest(`/api/delete-student-rule-lessons/?${query}`, 'DELETE')
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибка при удалении уроков в правиле', error)
  }
}

export async function importStudents(files) {
  try {
    return fetch(`${domain}/api/students/import-excel/`, {
      method: 'POST',
      body: files,
    })
  } catch (error) {
    console.error('Произошла ошибка при импорте учеников из Excel', error)
  }
}

/* Домашние задания */

export async function getLessonHomeWork(lesson_id) {
  try {
    return await makeGetRequest(`/api/lesson-homework/${lesson_id}`)
  } catch (error) {
    console.error('Произошла ошибка при получении списка домашних заданий урока', error)
  }
}

export async function setLessonHomeWork(lesson_id, data) {
  try {
    const response = await axios.post(`${domain}/api/create-homework-lesson/${lesson_id}`, data, {
      withCredentials: true,
    })

    /*  router.go(0) */

    return response
  } catch (error) {
    console.error('Произошла ошибка при создании домашнего задания урока', error)
  }
}

export async function deleteLessonHomework(homework_id) {
  try {
    return await makeRequest(`/api/delete-homework/${homework_id}`, 'DELETE')
  } catch (error) {
    console.error('Произошла ошибка при удалении домашнего задания', error)
  }
}

/* Темы занятия */

export async function getLessonTopics(lesson_id) {
  try {
    return await makeGetRequest(`/api/lesson-topics/${lesson_id}`)
  } catch (error) {
    console.error('Произошла ошибка при получении списка тем урока', error)
  }
}

export async function getAllStudents() {
  try {
    return await makeRequest('/api/all-students-teachers')
  } catch (error) {
    console.error('Произошла ошибка получения всех учеников для учителя', error)
  }
}

export async function setLessonTopics(data) {
  try {
    return await makeRequest(`/api/create-topic`, 'POST', data)
  } catch (error) {
    console.error('Произошла ошибка при создании проблем урока', error)
  }
}

export async function deleteLessonTopic(topic_id) {
  try {
    return await makeRequest(`/api/delete-topic/${topic_id}`, 'DELETE')
  } catch (error) {
    console.error('Произошла ошибка при удалении проблемы', error)
  }
}

/*=================================================================== Остальные методы с использованием общей функции =============================================================== */
export async function deleteLessonById(lesson_id) {
  try {
    await makeRequest(`/api/lessons/${lesson_id}`, 'DELETE')
    router.go(0)
  } catch (error) {
    console.error('Произошла ошибки при удалении урока', error)
  }
}

export async function getTeacherTasks() {
  try {
    return await makeRequest(`/api/teacher-tasks`, 'GET')
  } catch (error) {
    console.error('Произошла ошибки при получении заданий учителя', error)
  }
}

export async function setTeacherTasks(data) {
  try {
    return makeRequest(`/api/add-task-teacher`, 'POST', data)
  } catch (error) {
    console.error('Произошла ошибки при создании задач учителя', error)
  }
}

export async function deleteTeacherTask(task_id) {
  try {
    await makeRequest(`/api/delete/task-teacher/${task_id}`, 'DELETE')
  } catch (error) {
    console.error('Произошла ошибки при удалении задачи учителя', error)
  }
}

export async function transferLesson(lesson_id, data, updateAfterTransfer = false) {
  try {
    const response = await makeRequest(`/api/lessons/${lesson_id}`, 'PUT', data)
    /*  if (updateAfterTransfer) {
      router.go(0)
    } */
    console.log('Запрос прошёл успешно')
    return response
  } catch (error) {
    console.error('Произошла ошибки при переносе урока', error)
  }
}

export async function setTopic(data) {
  try {
    const response = await makeRequest('/api/create-topic/', 'POST', data)
    console.log('Запрос прошёл успешно')
    return response
  } catch (error) {
    console.error('Произошла ошибки при создании темы', error)
  }
}

export async function setOneTimeLesson(data, updatable = false) {
  try {
    const requestData = data
    const response = await makeRequest('/api/lesson-one-time', 'POST', requestData)
    if (updatable) {
      router.go(0)
    }
    return response
  } catch (error) {
    console.error('Произошла ошибки при добавлении одноразового урока', error)
  }
}

export async function setTrialLesson(data, updatable = false) {
  try {
    const requestData = data.requestBody || data
    const response = await makeRequest('/api/lesson-trial', 'POST', requestData)
    if (updatable) {
      router.go(0)
    }
    return response
  } catch (error) {
    console.error('Произошла ошибки при добавлении одноразового урока', error)
  }
}

export async function setStableGroupLesson(data, updatable = false) {
  try {
    const response = await makeRequest(`/api/lessons-create-group`, 'POST', data)
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибка при создании постоянного урока для группы', error)
  }
}

export async function setStableLesson(data, updatable = false) {
  try {
    const response = await makeRequest('/api/lessons', 'POST', data)
    if (updatable) {
      /*  router.go(0) */
    }
    return response
  } catch (error) {
    console.error('Произошла ошибки при создании постоянного урока', error)
  }
}

export async function editRule(data) {
  try {
    const response = await makeRequest('/api/edit-rule', 'PUT', data)
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибки при переносе урока', error)
  }
}

/*=================================================================== Финансы =============================================================== */

export async function getEarningsForDay() {
  try {
    return await makeGetRequest(`/api/earned-for-today`)
  } catch (error) {
    console.error('Произошла ошибка при получении зарабтка учителя за день', error)
  }
}

export async function getEarningsForPeriod(startDate, endDate) {
  try {
    return await makeGetRequest(
      `/api/earned-for-period?start_date=${startDate}&end_date=${endDate}`,
    )
  } catch (error) {
    console.error('Произошла ошибка при получении зарабтка учителя за промежуток', error)
  }
}

export async function getMonthlyEarnings(year) {
  try {
    return await makeGetRequest(`/api/monthly-earnings?year=${year}`)
  } catch (error) {
    console.error('Произошла ошибка при получении зарабтка учителя за год по месяцам', error)
  }
}

export async function getWeeklyEarnings(start_date, end_date) {
  try {
    return makeRequest(`/api/weekly-earnings?start_date=${start_date}&end_date=${end_date}`)
  } catch (error) {
    console.error('Произошла ошибка при получении зарабтка учителя за промежуток по неделям', error)
  }
}

export async function getEarningsForYear(year) {
  try {
    return await makeGetRequest(`/api/total-earnings?year=${year}`)
  } catch (error) {
    console.error('Произошла ошибка при получении зарабтка учителя за год', error)
  }
}

export async function getDailyEarnings(startDate, endDate) {
  try {
    return await makeGetRequest(`/api/daily-earnings?start_date=${startDate}&end_date=${endDate}`)
  } catch (error) {
    console.error('Произошла ошибка при получении зарабтка учителя за промежуток по дням', error)
  }
}

export async function getStudentsEarnings() {
  try {
    return await makeGetRequest(`/api/students-earnings`)
  } catch (error) {
    console.error('Произошла ошибка при получении зарабтка учителя поу ученикам', error)
  }
}

export async function getStudentEarning(student_id, start_date, end_date) {
  try {
    return await makeGetRequest(
      `/api/student-earnings?student_id=${student_id}&start_date=${start_date}&end_date=${end_date}`,
    )
  } catch (error) {
    console.error('Произошла ошибка при получении зарабтка учителя поу ученикам', error)
  }
}

export async function getStudnetSource() {
  try {
    return await makeRequest('/api/earned-source')
  } catch (error) {
    console.error(
      'Произошла ошибка при получении информации об анализе учеников по источникам',
      error,
    )
  }
}

export async function getStudnetGoals() {
  try {
    return await makeRequest('/api/earned-goal')
  } catch (error) {
    console.error('Произошла ошибка при получении информации об анализе учеников по целям', error)
  }
}

/* ======================================================================== Регистрация / Авторизация ======================================================================== */

export async function registerUser(requestBody) {
  console.log(requestBody)
  try {
    return await makeRequest('/api/register', 'POST', requestBody)
  } catch (error) {
    console.error('Произошла ошибка при регистрации', error)
  }
}

export async function loginUser(requestBody) {
  try {
    return await makeRequest('/api/login', 'POST', requestBody)
  } catch (error) {
    console.error('Произошла ошибка при авторизаци', error)
    return error
  }
}

export async function logoutUser() {
  try {
    return await makeRequest('/api/logout', 'POST')
  } catch (error) {
    console.error('Произошла ошибка при выходе из аккаунта', error)
  }
}

export async function deleteAccount() {
  try {
    return await makeGetRequest('/api/delete-account')
  } catch (error) {
    console.error('Произошла ошибка при удалении аккаунта', error)
  }
}

export async function checkUserAuth() {
  try {
    return await makeRequest('/api/user/me', 'GET')
  } catch (error) {
    console.error('Произошла ошибка при проверке авторизации пользователя', error)
  }
}

export async function changePassword(request_body) {
  try {
    return await makeRequest('/api/request-password-reset', 'POST', request_body)
  } catch (error) {
    console.error('Произошла ошибка при смене пароля', error)
  }
}

export async function linkProfileForApi(request_body) {
  try {
    return await makeRequest(`/api/student/link-profile`, 'POST', request_body)
  } catch (error) {
    console.error('Произошла ошибка при привязке студента', error)
  }
}

export async function getWSToken() {
  try {
    return await makeGetRequest('ws/token')
  } catch (error) {
    console.error('Произошла ошибка при получении токена для WebSocket', error)
  }
}

/* ======================================================================== Уведомления ======================================================================== */

export async function getTeacherNotifications() {
  try {
    return await makeGetRequest('/api/notifications_teacher')
  } catch (error) {
    console.error('При получении уведомлений учителя произошла ошибка', error)
  }
}

export async function deleteTeacherNotifications(notification_id) {
  try {
    return await makeRequest(`/api/notification_teacher/${notification_id}`, 'DELETE')
  } catch {
    console.error('Произошла ошибка при удалении уведомления учителя', error)
  }
}

export async function getStudentNotifications() {
  try {
    return await makeGetRequest('/api/notifications_student')
  } catch (error) {
    console.error('При получении уведомлений ученика произошла ошибка', error)
  }
}

export async function deleteStudentNotifications(notification_id) {
  try {
    return await makeRequest(`/api/notification_student/${notification_id}`, 'DELETE')
  } catch (error) {
    console.error('Произошла ошибка при удалении уведомления ученика', error)
  }
}

/* ======================================================================== Группы ========================================================================*/

export async function createGroup(data) {
  try {
    const response = await makeRequest(`/api/groups/create`, 'POST', data)
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибка при создании группы', error)
  }
}

export async function getGroups() {
  try {
    return await makeGetRequest('/api/groups/by-teacher')
  } catch (error) {
    console.error('Произошла ошибка при получении групп учителя', error)
  }
}

export async function createHomeworkGroup(group_id, request_body) {
  try {
    return await axios.post(`${domain}/api/create-homework-group/${group_id}`, request_body, {
      withCredentials: true,
    })
    /* router.go(0) */
  } catch (error) {
    console.error('Произошла ошибка при создании общего домашнего задания для всей группы', error)
    return error
  }
}

export async function updateGroup(request_body) {
  try {
    const response = await makeRequest(`/api/update-group`, 'POST', request_body)
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибка при обновлении группы', error)
  }
}

export async function getGroupStudents(group_id) {
  try {
    return makeGetRequest(`/api/groups/${group_id}`)
  } catch (error) {
    console.error('Произошла ошибка при получении учеников группы', error)
  }
}

export async function deleteGroup(data) {
  try {
    const response = await axios.delete(`${domain}/api/groups`, {
      data: data,
      withCredentials: true,
    })
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибка при удалении группы', error)
  }
}

export async function createGroupLesson(data, updatable = false) {
  try {
    const response = await makeRequest(`/api/create_group_lesson`, 'POST', data)
    if (updatable) {
      /* router.go(0) */
    }
    return response
  } catch (error) {
    console.error('Произошла ошибка при создании группового урока', error)
  }
}

export async function createGroupLessons(data) {
  try {
    const response = await makeRequest(`/api/create_group_lesson`, 'POST', data)
    router.go(0)
    return response
  } catch (error) {
    console.error('Произошла ошибка при создании групповых уроков')
  }
}

export async function uploadFIleHomework(homework_id, data) {
  try {
    return await axios.post(`${domain}/api/homework/${homework_id}/upload-files`, data)
  } catch (error) {
    console.error('Произошла ошибка при отправке файлов домашнего задания', error)
  }
}

export async function getAllStudentHomework(student_id) {
  try {
    return await makeGetRequest(`/api/all-homeworks-by-student/${student_id}`)
  } catch (error) {
    console.error('Произошла ошибка при получении всего домашнего задания ученика', error)
  }
}

export async function manualGrade(request_body) {
  try {
    return await axios.post(`${domain}/api/manual-grade`, request_body, { withCredentials: true })
  } catch (error) {
    console.error('Произошла ошибка при добавлении оценки домашнего задания', error)
  }
}
