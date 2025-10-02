<template>
  <div class="v-student-analytics">
    <div class="v-student-analytics__container">
      <div class="v-student-analytics__prev">
        <LessonsSwiper
          :student-id="studentId"
          :debug="debug"
          @add-topic="openModal"
          ref="lessonsSwiperRef"
        />
       <!--  {{ examChartData }} -->
      </div>
      <div class="v-student-analytics__charts" v-show="gradesResults.length || examResults.length">
        <div class="v-student-analytics__chart" v-show="gradesResults.length">
          <h2 class="v-student-analytics__chart-title text-section-title">
            Прогресс оценок ученика за домашнее задание
          </h2>
          <div class="v-student-analytics__chart-container">
            <Line
              ref="homeworkChartRef"
              v-if="chartDataLoaded"
              :key="chartKey"
              :data="homeworkChartData"
              :options="chartOptions"
              @click="handleHomeworkChartClick"
            />

          </div>
        </div>
        <div class="v-student-analytics__chart" v-show="examResults.length">
          <h2 class="v-student-analytics__chart-title text-section-title">
            Прогресс оценок ученика за экзамены
          </h2>
          <div class="v-student-analytics__chart-container">
            <Line
              ref="examChartRef"
              v-if="chartDataLoaded"
              :key="examChartKey"
              :data="examChartData"
              :options="examChartOptions"
              @click="handleExamChartClick"
            />
          </div>
        </div>
      </div>
      <div class="mt-10 null-screen" v-show="!gradesResults.length && !examResults.length">
        <h1>Чтобы увидеть аналитику ученика, добавьте результат</h1>
      </div>
    </div>
    <v-homework-stat />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  getStudentResults,
  getAllGradesStudent
} from '@/api/requests'
import { useCurrentStudentStore } from '@/stores/currentStudentStore'
import { chartData, chartOptions } from '@/charts/chartConfig'
import { format } from 'date-fns'
import { formatDate } from '@/utils'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import LessonsSwiper from './LessonsSwiper.vue'
import vHomeworkStat from '@/components/generalComponents/v-homework-stat.vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const emit = defineEmits(['add-topic', 'show-result'])
const route = useRoute()
const studentId = ref(null)
const debug = false
const store = useCurrentStudentStore()
const lessonsSwiperRef = ref(null)

const homeworkChartData = ref({ labels: [], datasets: [] })
const examChartData = ref({ labels: [], datasets: [] })
const chartKey = ref(0)
const examChartKey = ref(0)
const chartDataLoaded = ref(false)
const examResults = ref([])
const gradesResults = ref([])

const examChartOptions = ref({
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    legend: {
      display: false
    }
  }
})

const homeworkChartRef = ref(null)
const examChartRef = ref(null)

const openModal = (modal, lessonId) => {
  emit('add-topic', modal, lessonId)
}

function buildChartDataset(label, data, color, spanGaps = false, parsing = true) {
  return {
    ...chartData.datasets[0],
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
    spanGaps
  }
}

function handleHomeworkChartClick(event) {
  const chart = homeworkChartRef.value?.chart
  if (!chart) return

  const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false)
  if (points.length) {
    const firstPoint = points[0]
    const dataset = chart.data.datasets[firstPoint.datasetIndex]
    const dataPoint = dataset.data[firstPoint.index]

    emit('show-result', {
      id: dataPoint.id,
      homework_id: dataPoint.homework_id,
      grade: dataPoint.y,
      submission_date: dataPoint.originalDate || dataPoint.x.split('T')[0],
      result: dataPoint.y
    })
  }
}

function handleExamChartClick(event) {
  const chart = examChartRef.value?.chart
  if (!chart) return

  const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false)
  if (points.length) {
    const firstPoint = points[0]
    const dataset = chart.data.datasets[firstPoint.datasetIndex]
    const dataPoint = dataset.data[firstPoint.index]

    if (dataPoint?.id) {
      const selected = examResults.value.find(item => item.id === dataPoint.id)
      if (selected) emit('show-result', selected)
    }
  }
}

async function fetchResultData() {
  try {
    const response = await getStudentResults(studentId.value)
    const allGrades = await getAllGradesStudent(studentId.value)

    const sortedResponse = response.sort((a, b) => new Date(a.date) - new Date(b.date))
    const sortedAllGrades = allGrades.sort((a, b) => new Date(a.submission_date) - new Date(b.submission_date))

    examResults.value = sortedResponse
    gradesResults.value = sortedAllGrades

    const allDataByDate = {}

    for (const item of sortedResponse) {
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

    const sorted = Object.entries(allDataByDate).sort(([a], [b]) => {
      const dateA = new Date(a.split('.').reverse().join('-'))
      const dateB = new Date(b.split('.').reverse().join('-'))
      return dateA - dateB
    })

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

    if (allGrades?.length) {
      const gradesByDate = {}
      for (const item of sortedAllGrades) {
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

      allGradesData.sort((a, b) => {
        const dateA = new Date(a.x)
        const dateB = new Date(b.x)
        return dateA - dateB
      })
    }

    homeworkChartData.value = {
      labels: allGradesData.map(i => i.x),
      datasets: [buildChartDataset('Работа', allGradesData, '#3B82F6')]
    }

    examChartData.value = {
      labels: allLabels,
      datasets: [
        buildChartDataset('Экзамены', examScores.filter(Boolean), '#3B82F6'),
        buildChartDataset('Работа', homeworkScores.filter(Boolean), '#258D50', true)
      ]
    }

    chartKey.value++
    examChartKey.value++
    chartDataLoaded.value = true
  } catch (e) {
    console.error('Ошибка аналитики:', e)
    chartDataLoaded.value = true
  }
}

onMounted(async () => {
  studentId.value = route.params.id
  await store.setStudentAnalytics()
  await fetchResultData()
})
</script>
