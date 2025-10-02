<!-- StudentChartsComponent.vue -->
<template>
  <div class="v-student-charts">
    <h2 v-if="showTitle" class="v-student-charts__title custom-title">{{ title }}</h2>
    <div class="v-student-charts__container" v-show="hasAnyData && chartDataLoaded">
      <!-- График домашних заданий/оценок -->
      <div class="v-student-analytics__chart" v-show="showHomeworkChart && homeworkChartData.datasets.length">
        <h2 class="v-student-analytics__chart-title text-section-title">
          {{ homeworkChartTitle }}
        </h2>
        <div class="v-student-analytics__chart-container" ref="homeworkChartContainer">
          <Line
            ref="homeworkChartRef"
            v-if="chartDataLoaded"
            :key="homeworkChartKey"
            :data="homeworkChartData"
            :options="dynamicHomeworkChartOptions"
            @click="handleHomeworkChartClick"
          />
        </div>
      </div>

      <!-- График экзаменов -->
      <div class="v-student-analytics__chart" v-show="showExamChart && examChartData.datasets.length">
        <h2 class="v-student-analytics__chart-title text-section-title">
          {{ examChartTitle }}
        </h2>
        <div class="v-student-analytics__chart-container" ref="examChartContainer">
          <Line
            ref="examChartRef"
            v-if="chartDataLoaded"
            :key="examChartKey"
            :data="examChartData"
            :options="dynamicExamChartOptions"
            @click="handleExamChartClick"
          />
        </div>
      </div>
    </div>

    <!-- Пустой экран если нет данных -->
    <div class="mt-10 null-screen" v-show="!hasAnyData && chartDataLoaded">
      <h1>{{ emptyDataMessage }}</h1>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps({
  // Основные настройки
  title: {
    type: String,
    default: 'Ваш прогресс'
  },
  showTitle: {
    type: Boolean,
    default: true
  },
  emptyDataMessage: {
    type: String,
    default: 'Чтобы увидеть аналитику ученика, добавьте результат'
  },

  // Настройки графиков
  homeworkChartTitle: {
    type: String,
    default: 'Оценки за домашнее задание'
  },
  examChartTitle: {
    type: String,
    default: 'Оценки за экзамены'
  },
  showHomeworkChart: {
    type: Boolean,
    default: true
  },
  showExamChart: {
    type: Boolean,
    default: true
  },

  // Функция загрузки данных
  dataFetcher: {
    type: Function,
    required: true
  },

  // ID студента (если нужен)
  studentId: {
    type: [String, Number],
    default: null
  },

  // Настройки отображения
  enableScrollableCharts: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['chart-click', 'show-result'])

// Refs
const homeworkChartRef = ref(null)
const examChartRef = ref(null)
const homeworkChartContainer = ref(null)
const examChartContainer = ref(null)

// Состояние
const chartDataLoaded = ref(false)
const homeworkChartKey = ref(0)
const examChartKey = ref(0)
const homeworkContainerWidth = ref(0)
const examContainerWidth = ref(0)

// Данные графиков
const homeworkChartData = ref({ labels: [], datasets: [] })
const examChartData = ref({ labels: [], datasets: [] })

const colors = {
  gray: 'rgba(0, 0, 0, 0.1)'
}

// Вычисляем есть ли данные для отображения
const hasAnyData = computed(() => {
  const hasHomework = homeworkChartData.value.datasets.length > 0 &&
                     homeworkChartData.value.datasets.some(d => d.data.length > 0)
  const hasExam = examChartData.value.datasets.length > 0 &&
                 examChartData.value.datasets.some(d => d.data.length > 0)
  return hasHomework || hasExam
})

// Вычисляем минимальную ширину для домашних заданий
const homeworkMinComfortableWidth = computed(() => {
  if (!props.enableScrollableCharts) return 0
  const uniqueLabels = [...new Set(homeworkChartData.value.labels)]
  const minWidthPerLabel = 80
  const padding = 100
  return uniqueLabels.length * minWidthPerLabel + padding
})

// Вычисляем минимальную ширину для экзаменов
const examMinComfortableWidth = computed(() => {
  if (!props.enableScrollableCharts) return 0
  const uniqueLabels = [...new Set(examChartData.value.labels)]
  const minWidthPerLabel = 80
  const padding = 100
  return uniqueLabels.length * minWidthPerLabel + padding
})

// Определяем нужен ли скролл для домашних заданий
const homeworkNeedsScroll = computed(() => {
  return props.enableScrollableCharts &&
         homeworkContainerWidth.value > 0 &&
         homeworkContainerWidth.value < homeworkMinComfortableWidth.value
})

// Определяем нужен ли скролл для экзаменов
const examNeedsScroll = computed(() => {
  return props.enableScrollableCharts &&
         examContainerWidth.value > 0 &&
         examContainerWidth.value < examMinComfortableWidth.value
})

// Базовые настройки графика
const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      left: 0,
      right: 20,
      top: 0,
      bottom: 0,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
        color: colors.gray,
      },
      border: {
        display: false,
      },
      ticks: {
        padding: 20,
        font: {
          size: 12,
          weight: 'bold',
          family: 'Inter',
        },
        color: '#344055',
        maxRotation: 0,
        minRotation: 0
      },
    },
    y: {
      display: false,
      beginAtZero: false,
      min: 2,
      ticks: {
        display: false,
        stepSize: 1,
        font: {
          size: 15,
          family: 'Inter',
        },
        color: '#344055',
      },
      grid: {
        display: true,
        drawBorder: false,
        color: colors.gray,
      },
      border: {
        display: false,
      },
    },
  },
}

const dynamicHomeworkChartOptions = computed(() => ({
  ...baseChartOptions,
  responsive: !homeworkNeedsScroll.value,
}))

const dynamicExamChartOptions = computed(() => ({
  ...baseChartOptions,
  responsive: !examNeedsScroll.value,
}))

function handleHomeworkChartClick(event) {
  const chart = homeworkChartRef.value?.chart
  if (!chart) return

  const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false)
  if (points.length) {
    const firstPoint = points[0]
    const dataset = chart.data.datasets[firstPoint.datasetIndex]
    const dataPoint = dataset.data[firstPoint.index]

    emit('chart-click', {
      type: 'homework',
      data: dataPoint,
      rawEvent: event
    })

    // Для обратной совместимости
    if (dataPoint.id) {
      emit('show-result', {
        id: dataPoint.id,
        homework_id: dataPoint.homework_id,
        grade: dataPoint.y,
        submission_date: dataPoint.originalDate || dataPoint.x.split('T')[0],
        result: dataPoint.y
      })
    }
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

    emit('chart-click', {
      type: 'exam',
      data: dataPoint,
      rawEvent: event
    })

    // Для обратной совместимости
    if (dataPoint?.id) {
      emit('show-result', dataPoint)
    }
  }
}

// Функция для построения датасета
function buildChartDataset(label, data, color, spanGaps = false, parsing = true) {
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

// Функция измерения контейнеров
const measureContainers = () => {
  if (homeworkChartContainer.value) {
    homeworkContainerWidth.value = homeworkChartContainer.value.clientWidth
  }
  if (examChartContainer.value) {
    examContainerWidth.value = examChartContainer.value.clientWidth
  }
}

// Обработчик изменения размера окна
const handleResize = () => {
  measureContainers()
  updateCharts()
}

// Обновление графиков
const updateCharts = () => {
  homeworkChartKey.value++
  examChartKey.value++
}

// Загрузка данных
async function fetchData() {
  try {
    chartDataLoaded.value = false

    const result = await props.dataFetcher(props.studentId)

    if (result.homeworkChartData) {
      homeworkChartData.value = result.homeworkChartData
    }
    if (result.examChartData) {
      examChartData.value = result.examChartData
    }

    chartDataLoaded.value = true

    // Применяем скролл если нужно
    if (props.enableScrollableCharts) {
      await nextTick()

      if (homeworkNeedsScroll.value && homeworkChartRef.value?.chart?.canvas) {
        const canvas = homeworkChartRef.value.chart.canvas
        canvas.style.width = `${homeworkMinComfortableWidth.value}px`
        canvas.width = homeworkMinComfortableWidth.value
      }

      if (examNeedsScroll.value && examChartRef.value?.chart?.canvas) {
        const canvas = examChartRef.value.chart.canvas
        canvas.style.width = `${examMinComfortableWidth.value}px`
        canvas.width = examMinComfortableWidth.value
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки данных графиков:', error)
    chartDataLoaded.value = true
  }
}

// Наблюдение за изменением studentId
watch(() => props.studentId, () => {
  if (props.studentId) {
    fetchData()
  }
}, { immediate: false })

// Инициализация
onMounted(async () => {
  if (props.enableScrollableCharts) {
    measureContainers()
    window.addEventListener('resize', handleResize)
  }

  await fetchData()
})

// Экспонируем методы
defineExpose({
  updateCharts,
  fetchData,
  homeworkChartRef,
  examChartRef,
  buildChartDataset
})
</script>

<style scoped>
.v-student-analytics__chart-container {
  overflow-x: v-bind('homeworkNeedsScroll || examNeedsScroll ? "auto" : "visible"');
  overflow-y: hidden;
}

.v-student-analytics__chart-container canvas {
  width: v-bind('homeworkNeedsScroll ? homeworkMinComfortableWidth + "px" : examNeedsScroll ? examMinComfortableWidth + "px" : "100%"') !important;
}
</style>
