<template>
  <div class="v-finance__analysis styled-section">
    <div class="v-finance__analysis-header">
      <div class="v-finance__analysis-title text-section-title">Анализ учеников</div>
      <div class="v-finance__analysis-nav">
        <div
          v-for="(chartType, index) in chartTypes"
          :key="index"
          class="styled-nav"
          :class="{ active: activeChartType === chartType.label }"
          @click="() => setChartType(chartType.label)"
        >
          {{ chartType.name }}
        </div>
      </div>
    </div>
    <div class="v-finance__analysis-element" v-if="currentData.length">
      <div class="v-finance__analysis-wrapper">
        <Bar :data="chartData" :options="chartOptions" :key="chartKey" />
      </div>
    </div>
  </div>
</template>
<script setup>
/* ---------------- Импорты ---------------- */
import { onMounted, ref, computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar } from 'vue-chartjs'
import { useFinanceStore } from '@/stores/financeStore'
import { useChartColors } from '@/composables/useChartColors'
import { studentAnalysisChartOptions } from '@/charts/studentAnalysis'
/* --------- Регистрация компонентов Chart.js --------- */
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels)
/* ---------------- Состояния ---------------- */
const chartKey = ref(0)
const activeChartType = ref('earning')
const store = useFinanceStore()
// Состояние для данных графика
const currentData = ref([])
const currentLabels = ref([])
const currentLabel = ref('')
const isLoading = ref(false)

/* ---------------- Вычисление процентов и общей суммы ---------------- */
const calculatePercentages = (data) => {
  if (!data || data.length === 0) return []

  const total = data.reduce((sum, value) => sum + value, 0)
  return data.map(value => total > 0 ? ((value / total) * 100).toFixed(2) : 0)
}

const calculateTotal = (data) => {
  if (!data || data.length === 0) return 0
  return data.reduce((sum, value) => sum + value, 0)
}
/* ---------------- Вычисление максимального значения для оси Y ---------------- */
const calculateYAxisMax = (data) => {
  if (!data || data.length === 0) return 100

  const maxValue = Math.max(...data)
  const padding = maxValue * 0.15
  return Math.ceil(maxValue + padding)
}
/* ---------------- Конфигурация ---------------- */
// Базовые опции графика
const getBaseChartOptions = (maxValue = 100) => ({
  ...studentAnalysisChartOptions,
  scales: {
    ...studentAnalysisChartOptions.scales,
    x: {
      ...studentAnalysisChartOptions.scales?.x,
      grid: {
        display: false
      },
      categoryPercentage: 0.3,
      barPercentage: 0.3,
      max: maxValue

    },
    y: {
      ...studentAnalysisChartOptions.scales?.y,
      beginAtZero: true,
    }
  },
  plugins: {
    ...studentAnalysisChartOptions.plugins,
    legend: {
      display: false
    },
    datalabels: {
      display: true,
      align: 'end',
      anchor: 'end',
      offset: 4,
      opacity: 0.56,
      color: '#344055',
      font: {
        size: 12,
        weight: 'bold'
      },
      formatter: function(value, context) {
        const percentages = calculatePercentages(context.dataset.data)
        const percentage = percentages[context.dataIndex]
        return `${percentage}% (${value})`
      }
    }
  },
  maintainAspectRatio: false,
  responsive: true
})

const chartOptions = ref(getBaseChartOptions())
useChartColors(chartOptions, chartKey)

const chartTypes = ref([
  { name: 'Заработок', label: 'earning' },
  { name: 'Источник', label: 'source' },
  { name: 'Цели', label: 'goals' },
])
const studentNames = [

]
const studentEarnings = []
const studentSources = []
const studentGoalsData = []

const chartData = computed(() => ({
  labels: currentLabels.value,
  datasets: [{
    data: currentData.value,
    backgroundColor: '#1D4ECC',
    borderRadius: 10,
    barPercentage: 0.6,
    categoryPercentage: 0.3,
    maxBarThickness: 10,
  }]
}))

const updateChartOptions = () => {
  const newMaxValue = calculateYAxisMax(currentData.value)
  chartOptions.value = getBaseChartOptions(newMaxValue)

  useChartColors(chartOptions, chartKey)

  chartKey.value++
}
const setChartType = async (type) => {
  isLoading.value = true
  activeChartType.value = type
  let data, label, labels = studentNames
  try {
    switch (type) {
      case 'earning':
        data = studentEarnings
        label = 'Заработок (руб.)'
        if (store.fetchStudentEarnings) {
          await store.fetchStudentEarnings()
          if (store.studentEarnings && store.studentEarnings.length > 0) {

            const studentData = [];
            const studentLabels = [];

            store.studentEarnings.forEach((student)=>{
              if(parseFloat(student.earnings)) {
              studentData.push(Math.abs(parseFloat(student.earnings)))
              studentLabels.push(student.student_name)
              }

            })
            data = studentData
            labels = studentLabels
          }
        }

        break
      case 'source':
        data = studentSources
        label = 'Количество источников'
        if (store.fetchStudentSources) {
          await store.fetchStudentSources()
          if (store.studentSources && Object.values(store.studentSources).length > 0) {
            console.log('загружаем дату')
            data = Object.values(store.studentSources).splice(0, 6).map(Math.abs)
            labels = Object.keys(store.studentSources).splice(0, 6)
          }
        }
        break
      case 'goals':
        console.log('Делаем запрос по целям')
        await store.fetchStudentGoals()
        if (store.studentGoals && Object.keys(store.studentGoals).length > 0) {
          data = Object.values(store.studentGoals)
          labels = Object.keys(store.studentGoals)
        } else {
          data = studentGoalsData.splice(0, 6).map(Math.abs)
          labels = studentNames.splice(0, 6)
        }
        label = 'Количество целей'
        break
      default:
        data = studentEarnings
        label = 'Заработок (руб.)'
    }
    currentData.value = data
    console.log(currentData.value)
    currentLabels.value = labels
    currentLabel.value = label

    updateChartOptions()

  } catch (error) {
    console.error(`Ошибка загрузки данных для типа ${type}:`, error)
    switch (type) {
      case 'earning':
        currentData.value = studentEarnings
        currentLabels.value = studentNames
        currentLabel.value = 'Заработок (руб.)'
        break
      case 'source':
        currentData.value = studentSources
        currentLabels.value = studentNames
        currentLabel.value = 'Количество источников'
        break
      case 'goals':
        currentData.value = studentGoalsData
        currentLabels.value = studentNames
        currentLabel.value = 'Количество целей'
        break
    }
    updateChartOptions()
  } finally {
    isLoading.value = false
  }
}

const initializeData = () => {
  currentData.value = studentEarnings
  currentLabels.value = studentNames
  currentLabel.value = 'Заработок (руб.)'
}
/* ---------------- Хуки жизненного цикла ---------------- */
onMounted(() => {
  initializeData()
  setChartType(activeChartType.value)
})
</script>
