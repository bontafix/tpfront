<template>
  <StudentChartsComponent
    :student-id="studentId"
    :data-fetcher="cachedDataFetcher"
    title="Ваш прогресс"
    homework-chart-title="Оценки за домашнее задание"
    exam-chart-title="Оценки за экзамены"
    empty-data-message="У вас пока нет результатов"
    :enable-scrollable-charts="true"
    @show-result="handleShowResult"
    @chart-click="handleChartClick"
    ref="chartsRef"
  />

  <!-- Debug информация для кэша -->
  <div v-if="debug" class="debug-info mt-4 p-2 bg-gray-100 rounded">
    <p>Chart cache status: {{ chartCacheStatus }}</p>
    <button @click="clearChartCache" class="mt-2 px-3 py-1 bg-red-500 text-white rounded">
      Clear Chart Cache
    </button>
    <button @click="refreshChartsData" class="mt-2 ml-2 px-3 py-1 bg-blue-500 text-white rounded">
      Refresh Charts
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchStudentChartData } from '@/servicies.js/chartDataService'
import StudentChartsComponent from '../generalComponents/studentChartsComponent.vue'
import { useMyStore } from '@/stores/myStore'

// Глобальный кэш для данных графиков
const chartDataCache = new Map()

const emit = defineEmits(['show-result', 'chart-click'])
const route = useRoute()
const studentId = ref(null)
const chartsRef = ref(null)

const props = defineProps({
  profile: {
    type: Object,
    default: () => ({})
  },
  debug: {
    type: Boolean,
    default: false
  }
})

const store = useMyStore()
const userInfo = computed(() => store.userInfo)

// Статус кэша графиков
const chartCacheStatus = computed(() => {
  const id = studentId.value
  if (!id) return 'No student ID'
  const cached = chartDataCache.has(id)
  return cached ? 'Cached' : 'Not cached'
})

// Cache utilities для графиков
function getCachedChartData(studentId) {
  const cached = chartDataCache.get(studentId)
  if (cached && props.debug) {
    console.log('[Charts] Cache hit for student:', studentId, cached)
  }
  return cached
}

function setCachedChartData(studentId, data) {
  chartDataCache.set(studentId, {
    data: JSON.parse(JSON.stringify(data)), // Deep copy
    timestamp: Date.now()
  })
  if (props.debug) {
    console.log('[Charts] Cached data for student:', studentId)
  }
}

function isChartCacheValid(cachedItem, maxAge = 5 * 60 * 1000) { // 5 минут
  if (!cachedItem) return false
  return Date.now() - cachedItem.timestamp < maxAge
}

function clearChartCache(studentId = null) {
  if (studentId) {
    chartDataCache.delete(studentId)
    if (props.debug) {
      console.log('[Charts] Cleared cache for student:', studentId)
    }
  } else {
    chartDataCache.clear()
    if (props.debug) {
      console.log('[Charts] Cleared all chart cache')
    }
  }
}

// Кэшированная версия fetchStudentChartData
const cachedDataFetcher = async (studentId) => {
  if (props.debug) {
    console.log('[Charts] Fetching data for student:', studentId)
  }

  // Проверяем кэш
  const cached = getCachedChartData(studentId)

  if (cached && isChartCacheValid(cached)) {
    if (props.debug) {
      console.log('[Charts] Using cached data')
    }
    return cached.data
  }

  // Загружаем из API
  if (props.debug) {
    console.log('[Charts] Fetching from API')
  }

  try {
    const data = await fetchStudentChartData(studentId)

    // Кэшируем результат
    setCachedChartData(studentId, data)

    return data
  } catch (error) {
    console.error('[Charts] Error fetching chart data:', error)

    // В случае ошибки, возвращаем кэшированные данные если они есть (даже устаревшие)
    if (cached) {
      console.warn('[Charts] Using stale cached data due to API error')
      return cached.data
    }

    throw error
  }
}

const handleShowResult = (resultData) => {
  console.log(resultData)
  const data = {
    student_name: 'Вы',
    ...resultData
  }
  emit('show-result', data)
}

const handleChartClick = (clickData) => {
  emit('chart-click', clickData)
}

const loadData = async () => {
  studentId.value = props.profile.id
  if (!studentId.value) {
    console.warn('Student ID не найден. Проверьте параметры роута или store.')
    return
  }

  if (props.debug) {
    console.log('[Charts] Loading data for student:', studentId.value)
  }
}

// Принудительное обновление данных графиков
const refreshChartsData = async () => {
  if (studentId.value) {
    clearChartCache(studentId.value)
    await chartsRef.value?.fetchData()
  }
}

onMounted(() => {
  loadData()
})

watch(() => props.profile, (newProfile, oldProfile) => {
  // Загружаем данные только если profile действительно изменился
  if (newProfile?.id && newProfile.id !== oldProfile?.id) {
    loadData()
  }
}, { deep: true })

// Экспонируем методы
defineExpose({
  refreshCharts: () => chartsRef.value?.fetchData(),
  updateChart: () => chartsRef.value?.updateCharts(),
  refreshChartsData,
  clearChartCache,
  chartsRef
})
</script>

<style scoped>
.debug-info {
  font-size: 12px;
  font-family: monospace;
}
</style>
