import { makeRequest, makeGetRequest, domain } from './apiClient'
import axios from 'axios'
import router from '@/router'
import emitter from '@/eventBus'

/* =================================================================== Ученики =============================================================== */

export async function createDemoRequest(data) {
  try {
    return await axios.post(`${domain}/api/public/demo-request`, data, {
      withCredentials: true,
    })
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
    return await axios.post(`${domain}/api/public/reviews`, review, {
      withCredentials: true,
    })
  } catch (error) {
    console.error('Произошла ошибка при создании отзыва', error)
  }
}

export async function deleteStudentAnswer(answer_id, student_profile_id) {
  try {
    return await makeRequest(
      `/api/student/homework-answers/${answer_id}?student_profile_id=${student_profile_id}`,
      'DELETE',
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

export async function getAllStudents() {
  try {
    return await makeRequest('/api/all-students-teachers')
  } catch (error) {
    console.error('Произошла ошибка получения всех учеников для учителя', error)
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

export async function getAllStudentHomework(student_id) {
  try {
    const result = await makeGetRequest(`/api/all-homeworks-by-student/${student_id}`)
    console.log(result)
    console.log('all-homeworks-by-student >>>>>>>>>>>>>>>>>>>>')
    return result
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
