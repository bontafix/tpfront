import { makeRequest, makeGetRequest } from './apiClient'

/* =================================================================== Финансы =============================================================== */

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
