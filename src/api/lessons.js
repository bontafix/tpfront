import { makeRequest, makeGetRequest, domain } from './apiClient'
import axios from 'axios'
import router from '@/router'
import emitter from '@/eventBus'

/* =================================================================== Уроки =============================================================== */

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

export async function getNewsById(id) {
  try {
    return await makeGetRequest(`/api/public/news/${id}`)
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
    return await makeGetRequest(`/api/today-lessons?date=${date}`)
  } catch (error) {
    console.error('Произошла ошибка при получении уроков на день', error)
  }
}

export async function getMyLessons(date) {
  try {
    return await makeGetRequest(`/api/today-lessons?date=${date}`)
  } catch (error) {
    console.error('Произошла ошибка при получении моих уроков', error)
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

export async function deleteLessonById(lesson_id) {
  try {
    await makeRequest(`/api/lessons/${lesson_id}`, 'DELETE')
    router.go(0)
  } catch (error) {
    console.error('Произошла ошибки при удалении урока', error)
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

export async function setStableGroupLesson(data) {
  try {
    const response = await makeRequest(`/api/lessons-create-group`, 'POST', data)
    if (response.status === 200) {
      router.go(0)
    } else {
      emitter.emit('notify', {
        type: 'error',
        message: 'Произошла ошибка при создании постоянного урока для группы',
      })
    }
    return response
  } catch (error) {
    console.error('Произошла ошибка при создании постоянного урока для группы', error)
  }
}

export async function setStableLesson(data) {
  try {
    const response = await makeRequest('/api/lessons', 'POST', data)
    if (response.status === 200) {
      router.go(0)
    } else {
      emitter.emit('notify', {
        type: 'error',
        message: 'Произошла ошибки при создании постоянного урока',
      })
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

/* Проблемы предыдущего занятия */

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

/* Домашние задания */

export async function getLessonHomeWork(lesson_id) {
  try {
    return await makeGetRequest(`/api/lesson-homework/${lesson_id}`)
  } catch (error) {
    console.error('Произошла ошибка при получении списка домашних заданий урока', error)
  }
}

export async function getlastHomework(lesson_id) {
  try {
    return makeGetRequest(`/api/lesson-last-homework/${lesson_id}`)
  } catch (error) {
    console.error('Произошла ошибка при получении последнего домашнего задания', error)
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

export async function createSubmission(homework_id, request_body) {
  try {
    await axios.post(`${domain}/api/create-homework-submission/${homework_id}`, request_body, {
      withCredentials: true,
    })

    router.go(0)
  } catch (error) {
    console.error('Произошла ошибка при создании отправки домашнего задания', error)
  }
}

export async function uploadFIleHomework(homework_id, data) {
  try {
    return await axios.post(`${domain}/api/homework/${homework_id}/upload-files`, data)
  } catch (error) {
    console.error('Произошла ошибка при отправке файлов домашнего задания', error)
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
