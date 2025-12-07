import { makeRequest, makeGetRequest } from './apiClient'

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
  } catch (error) {
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
