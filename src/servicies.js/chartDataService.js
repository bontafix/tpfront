// chartDataService.js
import { format } from 'date-fns'
import { formatDate } from '@/utils'
import {
  getStudentResults,
  getAllGradesStudent
} from '@/api/requests'

// Функция для построения датасета
export function buildChartDataset(label, data, color, spanGaps = false, parsing = true) {
  return {
    label,
    parsing,
    data,
    borderColor: color,
    backgroundColor: `${color}1A`,
    pointBackgroundColor: color,
    pointBorderColor: '#FFFFFF',
    pointBorderWidth: 2,
    pointRadius: 5,
    pointHoverRadius: 7,
    spanGaps,
    tension: 0.1,
    pointStyle: 'circle'
  }
}

// Загрузка данных для учителя (оригинальная логика)
export async function fetchTeacherChartData(studentId) {
  try {
    const response = await getStudentResults(studentId)
    const allGrades = await getAllGradesStudent(studentId)

    const allDataByDate = {}

    // Обрабатываем результаты экзаменов и домашних заданий
    for (const item of response) {
      const dateKey = format(new Date(item.date), 'dd.MM.yyyy')
      allDataByDate[dateKey] ??= { examItems: [], homeworkItems: [] }

      if (item.part1_result || item.part2_result) {
        allDataByDate[dateKey].examItems.push({
          score: item.part1_result + item.part2_result,
          id: item.id
        })
      }
      if (item.result) {
        allDataByDate[dateKey].homeworkItems.push({
          score: item.result,
          id: item.id
        })
      }
    }

    const sorted = Object.entries(allDataByDate).sort(([a], [b]) =>
      new Date(a.split('.').reverse().join('-')) - new Date(b.split('.').reverse().join('-'))
    )

    const allLabels = []
    const examScores = []
    const homeworkScores = []
    const allGradesData = []

    for (const [date, data] of sorted) {
      allLabels.push(date)

      if (data.examItems.length)
        examScores.push({ x: date, y: data.examItems[0].score, id: data.examItems[0].id })
      if (data.homeworkItems.length)
        homeworkScores.push({ x: date, y: data.homeworkItems[0].score, id: data.homeworkItems[0].id })
    }

    // Обрабатываем оценки
    if (allGrades?.length) {
      const gradesByDate = {}
      for (const item of allGrades) {
        if (/^[0-9]$/.test(String(item.grade))) {
          const date = item.submission_date
          gradesByDate[date] ??= []
          gradesByDate[date].push({
            grade: Number(item.grade),
            id: item.id,
            homework_id: item.homework_id
          })
        }
      }

      for (const [date, grades] of Object.entries(gradesByDate)) {
        grades.forEach((gradeItem, i) => {
          const adjustedDate = new Date(date)
          adjustedDate.setHours(i * 2)
          allGradesData.push({
            x: formatDate(adjustedDate.toISOString()),
            y: gradeItem.grade,
            id: gradeItem.id,
            homework_id: gradeItem.homework_id,
            originalDate: date
          })
        })
      }

      allGradesData.sort((a, b) => new Date(a.x) - new Date(b.x))
    }

    return {
      homeworkChartData: {
        labels: allGradesData.map(i => i.x),
        datasets: [buildChartDataset('Работа', allGradesData, '#3B82F6')]
      },
      examChartData: {
        labels: allLabels,
        datasets: [
          buildChartDataset('Экзамены', examScores.filter(Boolean), '#3B82F6'),
          buildChartDataset('Работа', homeworkScores.filter(Boolean), '#258D50', true)
        ]
      },
      examResults: response,
      gradesResults: allGrades
    }
  } catch (error) {
    console.error('Ошибка загрузки данных учителя:', error)
    return {
      homeworkChartData: { labels: [], datasets: [] },
      examChartData: { labels: [], datasets: [] },
      examResults: [],
      gradesResults: []
    }
  }
}
export async function fetchStudentChartData(studentId) {
  try {
    if (!studentId) {
      return null
    }

    const response = await getStudentResults(studentId)
    const allGrades = await getAllGradesStudent(studentId)

    const allDataByDate = {}

    // Обрабатываем результаты экзаменов и домашних заданий
    for (const item of response) {
      const dateKey = format(new Date(item.date), 'dd.MM.yyyy')
      allDataByDate[dateKey] ??= { examItems: [], homeworkItems: [] }

      if (item.part1_result || item.part2_result) {
        allDataByDate[dateKey].examItems.push({
          ...item,
          score: (item.part1_result || 0) + (item.part2_result || 0)
        })
      }

      if (item.result !== null && item.result !== undefined) {
        allDataByDate[dateKey].homeworkItems.push({
          ...item,
          score: item.result
        })
      }
    }

    const sorted = Object.entries(allDataByDate).sort(([a], [b]) =>
      new Date(a.split('.').reverse().join('-')) -
      new Date(b.split('.').reverse().join('-'))
    )

    const allLabels = []
    const examScores = []
    const homeworkScores = []
    const allGradesData = []

    for (const [date, data] of sorted) {
      allLabels.push(date)

      if (data.examItems.length) {
        examScores.push({
          x: date,
          y: data.examItems[0].score,
          ...data.examItems[0]
        })
      }

      if (data.homeworkItems.length) {
        homeworkScores.push({
          x: date,
          y: data.homeworkItems[0].score,
          ...data.homeworkItems[0]
        })
      }
    }

    // Обрабатываем оценки (allGrades)
    if (allGrades?.length) {
      const gradesByDate = {}
      for (const item of allGrades) {
        if (/^[0-9]$/.test(String(item.grade))) {
          const date = item.submission_date
          gradesByDate[date] ??= []
          gradesByDate[date].push(item)
        }
      }

      for (const [date, grades] of Object.entries(gradesByDate)) {
        grades.forEach((gradeItem, i) => {
          const adjustedDate = new Date(date)
          adjustedDate.setHours(i * 2)

          allGradesData.push({
            ...gradeItem,
            x: formatDate(adjustedDate.toISOString()),
            y: Number(gradeItem.grade),
            originalDate: date
          })
        })
      }

      allGradesData.sort((a, b) => new Date(a.x) - new Date(b.x))
    }

    return {
      homeworkChartData: {
        labels: allGradesData.map(i => i.x),
        datasets: [buildChartDataset('Работа', allGradesData, '#3B82F6')]
      },
      examChartData: {
        labels: allLabels,
        datasets: [
          buildChartDataset('Экзамены', examScores.filter(Boolean), '#3B82F6'),
          buildChartDataset('Работа', homeworkScores.filter(Boolean), '#258D50', true)
        ]
      },
      examResults: response,
      gradesResults: allGrades
    }
  } catch (error) {
    console.error('Ошибка загрузки данных студента:', error)
    return {
      homeworkChartData: { labels: [], datasets: [] },
      examChartData: { labels: [], datasets: [] }
    }
  }
}

// Функция-заглушка для реальных API запросов студента
export async function fetchStudentChartDataFromAPI(studentId) {
  try {
    // Здесь должны быть реальные API вызовы для студента
    // Например:
    // const studentHomeworkResults = await getStudentHomework(studentId)
    // const studentExamResults = await getStudentExams(studentId)

    // Пока возвращаем пустые данные
    return {
      homeworkChartData: { labels: [], datasets: [] },
      examChartData: { labels: [], datasets: [] }
    }
  } catch (error) {
    console.error('Ошибка загрузки данных студента из API:', error)
    return {
      homeworkChartData: { labels: [], datasets: [] },
      examChartData: { labels: [], datasets: [] }
    }
  }
}
