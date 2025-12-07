import { makeRequest, makeGetRequest, domain } from './apiClient'
import axios from 'axios'
import router from '@/router'

/* ======================================================================== Группы ======================================================================== */

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
