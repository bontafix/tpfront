<template>
  <div class="v-compare-chart" ref="container" @mousemove="handleMouseMove" v-if="chartReady">
    <div class="v-compare-chart__wrapper">
      <div class="v-compare-chart__container">
        <Bar :data="chartData" :options="chartOptions" />
        <transition name="fade">
          <div
            v-if="tooltip.visible"
            class="custom-tooltip"
            :style="{ left: tooltip.x + 30 + 'px', top: tooltip.y - 20 + 'px' }"
          >
            <div class="tooltip-body">{{ tooltip.value }}</div>
            <div class="tooltip-arrow"></div>
          </div>
        </transition>
        <div class="labels-container">
          <div v-for="(label, index) in labels" :key="index" class="label-item">
            <div class="label-content">{{ label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import { useGeneralStore } from '@/stores/generalStore'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const container = ref(null)
const store = useGeneralStore()

const props = defineProps({
  comparedChartData: {
    type: Array,
    required: false,
    default: () => [],
  },
  chartLabels: {
    type: Array,
    default: () => [
      'Прогнозируемое количество занятий',
      'Отмененные занятия',
      'Коэффициент отмен',
      'Упущенная выручка',
      'Ожидаемая выручка',
    ]
  },
  mode: {
    type: String,
    default: 'category', // 'default' для глобальной нормализации, 'category' для нормализации по парам
    validator: (value) => ['default', 'category'].includes(value)
  }
})

const nightMode = computed(() => store.nightMode)

const labels = computed(() => {
  return props.chartLabels
})

const tooltip = reactive({
  visible: false,
  value: '',
  x: 0,
  y: 0,
})

const mousePos = ref({ x: 0, y: 0 })

const handleMouseMove = (event) => {
  if (!container.value) return
  const rect = container.value.getBoundingClientRect()
  mousePos.value.x = event.clientX - rect.left
  mousePos.value.y = event.clientY - rect.top
}

// Проверка, чтобы график рисовался только если есть данные
const chartReady = computed(() => {
  return props.comparedChartData.length > 0
})

// Константа максимальной высоты для нормализации
const MAX_BAR_HEIGHT = 100

// Функция для глобальной нормализации данных (относительно всего графика)
const normalizeDataGlobally = (data) => {
  if (!data || data.length < 2) return []

  // Находим глобальный максимум среди всех значений
  const allValues = data.flatMap(dataset => dataset.data)
  const globalMax = Math.max(...allValues)

  const result = data.map(dataset => ({
    ...dataset,
    normalizedData: dataset.data.map(value =>
      globalMax === 0 ? 0 : (value / globalMax) * MAX_BAR_HEIGHT
    ),
    originalData: [...dataset.data]
  }))

  return result
}

// Функция для нормализации данных по категориям (по парам)
const normalizeDataByCategoryGroups = (data) => {
  if (!data || data.length < 2) return []

  const result = [
    { ...data[0], normalizedData: [] },
    { ...data[1], normalizedData: [] }
  ]

  // Проходим по каждой категории (индексу данных)
  for (let i = 0; i < data[0].data.length; i++) {
    const value1 = data[0].data[i]
    const value2 = data[1].data[i]

    // Находим максимальное значение в текущей категории
    const maxValue = Math.max(value1, value2)

    if (maxValue === 0) {
      // Если оба значения равны нулю, устанавливаем нормализованные значения в 0
      result[0].normalizedData[i] = 0
      result[1].normalizedData[i] = 0
    } else {
      // Нормализуем значения относительно максимума в категории
      result[0].normalizedData[i] = (value1 / maxValue) * MAX_BAR_HEIGHT
      result[1].normalizedData[i] = (value2 / maxValue) * MAX_BAR_HEIGHT
    }
  }

  // Сохраняем оригинальные данные для отображения в подсказке
  result[0].originalData = [...data[0].data]
  result[1].originalData = [...data[1].data]

  return result
}

const chartData = computed(() => {
  if (!chartReady.value) {
    return { labels: [], datasets: [] }
  }

  // Выбираем метод нормализации в зависимости от режима
  const normalizedData = props.mode === 'default'
    ? normalizeDataGlobally(props.comparedChartData)
    : normalizeDataByCategoryGroups(props.comparedChartData)

  const datasets = [
    {
      label: normalizedData[0].label,
      backgroundColor: !nightMode.value ? '#1D4ECC' : '#1F5EFF',
      data: normalizedData[0].normalizedData, // Используем нормализованные данные для отображения
      barPercentage: 0.3,
      categoryPercentage: 0.5,
      borderRadius: 10,
      // Сохраняем оригинальные данные для подсказок
      originalData: normalizedData[0].originalData
    },
    {
      label: normalizedData[1].label,
      backgroundColor: !nightMode.value ? '#CCD8F8' : '#2D313B',
      data: normalizedData[1].normalizedData, // Используем нормализованные данные для отображения
      barPercentage: 0.3,
      categoryPercentage: 0.5,
      borderRadius: 10,
      // Сохраняем оригинальные данные для подсказок
      originalData: normalizedData[1].originalData
    },
  ]

  return {
    labels: ['', '', '', '', ''],
    datasets: datasets,
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: {
      display: false,
    },
    legend: {
      position: 'top',
      align: 'start',
      labels: {
        boxWidth: 8,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      enabled: false,
      external: (context) => {
        const tooltipModel = context.tooltip

        if (tooltipModel.opacity === 0) {
          tooltip.visible = false
          return
        }

        // Получаем индекс набора данных и индекс категории
        const datasetIndex = tooltipModel.dataPoints[0].datasetIndex
        const index = tooltipModel.dataPoints[0].dataIndex

        // Получаем оригинальное значение вместо нормализованного
        const originalValue = chartData.value.datasets[datasetIndex].originalData[index]
        const datasetLabel = chartData.value.datasets[datasetIndex].label || ''

        tooltip.value = originalValue
        tooltip.x = mousePos.value.x
        tooltip.y = mousePos.value.y
        tooltip.visible = true
      },
      mode: 'nearest',
      intersect: true,
      callbacks: {
        title: function (context) {
          const index = context[0].dataIndex
          return labels.value[index] || ''
        },
        label: function (context) {
          // Этот коллбэк не используется, так как мы переопределили tooltip через external
          const index = context.dataIndex

          // Используем оригинальное значение для отображения
          const originalValue = context.dataset.originalData ?
            context.dataset.originalData[index] :
            context.parsed.y

          return originalValue
        },
      },
    },
  },
  scales: {
    y: {
      display: false,
      beginAtZero: true,
      grid: {
        display: false,
        drawBorder: false,
      },
    },
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        display: false,
      },
      border: {
        display: false,
      },
    },
  },
  layout: {
    padding: {
      top: 20,
      right: 20,
      bottom: 10,
      left: 20,
    },
  },
}

/* watch(() => props.comparedChartData, (newData) => {
  if (newData.length > 0) {
    chartReady.value = true
  } else {
    chartReady.value = false
  }
}, { immediate: true }) */
</script>

<style scoped>
.v-compare-chart {
  position: relative;
  height: 350px;
  width: 100%;
}

.v-compare-chart__wrapper {
  overflow-x: auto;
  height: 370px;
}

.v-compare-chart__wrapper::-webkit-scrollbar {
  display: none;
}

.v-compare-chart__container {
  min-width: 900px;
  height: 80%;
}

.labels-container {
  display: flex;
  gap: 20px;
  width: 100%;
  margin-top: 5px;
  padding: 0 20px;
}

.label-item {
  color: var(--custom-black-text);
  flex: 1;
  display: flex;
  justify-content: center;
  text-align: center;
  max-width: 16.66%;
}

.label-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 40px;
  line-height: 1.2;
  font-size: 13px;
  font-weight: 500;
}

.custom-tooltip {
  position: absolute;
  color: var(--custom-black-text);
  background: var(--custom-white);
  border-radius: 8px;
  min-width: 38px;
  min-height: 34px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 6px 10px;
  font-size: 12px;
  pointer-events: none;
  z-index: 10;
  transform: translate(-50%, -12px);
}

.tooltip-body {
  font-weight: 500;
  text-align: center;
}

.tooltip-arrow {
  position: absolute;
  left: 50%;
  bottom: -6px;
  transform: translateY(-160%) translateX(-250%) rotate(45deg);
  width: 10px;
  height: 10px;
  background: var(--custom-white);
  z-index: -1;
}

.night__mode .custom-tooltip,
.night__mode .tooltip-arrow {
  background-color: var(--custom-black);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
