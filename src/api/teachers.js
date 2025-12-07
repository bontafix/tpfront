import { makeRequest, makeGetRequest } from './apiClient'
import router from '@/router'

/* =================================================================== Учителя =============================================================== */

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
