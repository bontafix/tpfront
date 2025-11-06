<template>
  <div class="v-teacher-info">
    <div class="v-teacher-info__section styled-section">
      <p class="v-teacher-info__section-subtitle caption">Преподаватель</p>
      <div class="v-teacher-info__section-row">
        <h2 class="text-section-title">
          {{ info.teacher_name }}
        </h2>
        <div class="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8.75" fill="url(#paint0_linear_9243_6283)"/>
            <path d="M14.3666 6.38049C14.4445 5.87707 13.9659 5.47972 13.5183 5.67625L4.60301 9.59053C4.28202 9.73146 4.3055 10.2177 4.63842 10.3237L6.47697 10.9092C6.82786 11.0209 7.20783 10.9631 7.51424 10.7514L11.6594 7.88767C11.7844 7.80131 11.9206 7.97904 11.8138 8.08914L8.83007 11.1654C8.54063 11.4638 8.59808 11.9695 8.94623 11.1878L12.2868 14.2827C12.6615 14.5176 13.1436 14.2816 13.2136 13.8288L14.3666 6.38049Z" fill="white"/>
            <defs>
            <linearGradient id="paint0_linear_9243_6283" x1="10" y1="1.25" x2="10" y2="18.75" gradientUnits="userSpaceOnUse">
            <stop stop-color="#37BBFE"/>
            <stop offset="1" stop-color="#007DBB"/>
            </linearGradient>
            </defs>
          </svg>
          <a :href="'tel:' + teacherInfo.phone_number" class="contact-link">
           {{ teacherInfo.phone_number }}
          </a>
        </div>
      </div>
    </div>
    <div class="v-teacher-info__section styled-section">
      <p class="v-teacher-info__section-subtitle caption">Цель занятий</p>
      <div class="v-teacher-info__section-row">
        <h2 class="text-section-title">
          {{ info.lesson_goal }}
        </h2>
      </div>
    </div>
    <div class="v-teacher-info__section styled-section custom-tip-container">
      <p class="v-teacher-info__section-subtitle caption">Средств на счёте</p>
      <div class="v-teacher-info__section-row">
        <h2 class="text-section-title">
          {{ info.balance  }}
        </h2>
        <div class="caption" v-if="info">
          / при ставке {{ studentBalance.rate }} ₽ хватит на {{ studentBalance.balance > 0 ? Math.floor(studentBalance.balance / studentBalance.rate) : 0 }} занятия
        </div>
      </div>
      <div class="custom-tip">
        Если вы оплачивали занятие, сообщите об ошибке преподавателю
      </div>
    </div>

    <!-- Debug информация для кэша -->
    <div v-if="debug" class="debug-info mt-4 p-2 bg-gray-100 rounded">
      <p>Teacher info cache status: {{ teacherCacheStatus }}</p>
      <p>Balance cache status: {{ balanceCacheStatus }}</p>
      <p>Current ID: {{ props.info?.id }}</p>
      <p>Loading: {{ isLoading }}</p>
      <button @click="clearTeacherCache" class="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm">
        Clear Cache
      </button>
      <button @click="refreshData" class="mt-2 ml-2 px-3 py-1 bg-blue-500 text-white rounded text-sm">
        Refresh Data
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { getTeacherInfo, getStudentBalance } from '@/api/requests'

// Глобальные кэши для данных преподавателей и балансов
const teacherInfoCache = new Map()
const studentBalanceCache = new Map()

const props = defineProps({
  info: Object,
  debug: {
    type: Boolean,
    default: false
  }
})

const teacherInfo = ref({})
const studentBalance = ref({})
const loadedId = ref(null)
const isLoading = ref(false)

// Статус кэша для отладки
const teacherCacheStatus = computed(() => {
  const id = props.info?.id
  if (!id) return 'No ID'
  const cached = teacherInfoCache.has(id)
  return cached ? 'Cached' : 'Not cached'
})

const balanceCacheStatus = computed(() => {
  const id = props.info?.id
  if (!id) return 'No ID'
  const cached = studentBalanceCache.has(id)
  return cached ? 'Cached' : 'Not cached'
})

// Cache utilities
function log(...args) {
  if (props.debug) {
    console.log('[TeacherInfo]', ...args)
  }
}

function getCachedTeacherInfo(id) {
  const cached = teacherInfoCache.get(id)
  if (cached) {
    log('Teacher info cache hit for ID:', id, cached)
  }
  return cached
}

function setCachedTeacherInfo(id, data) {
  teacherInfoCache.set(id, {
    data: JSON.parse(JSON.stringify(data)), // Deep copy
    timestamp: Date.now()
  })
  log('Cached teacher info for ID:', id)
}

function getCachedStudentBalance(id) {
  const cached = studentBalanceCache.get(id)
  if (cached) {
    log('Student balance cache hit for ID:', id, cached)
  }
  return cached
}

function setCachedStudentBalance(id, data) {
  studentBalanceCache.set(id, {
    data: JSON.parse(JSON.stringify(data)), // Deep copy
    timestamp: Date.now()
  })
  log('Cached student balance for ID:', id)
}

function isCacheValid(cachedItem, maxAge = 5 * 60 * 1000) { // 5 минут по умолчанию
  if (!cachedItem) return false
  return Date.now() - cachedItem.timestamp < maxAge
}

function clearTeacherCache(id = null) {
  if (id) {
    teacherInfoCache.delete(id)
    studentBalanceCache.delete(id)
    log('Cleared cache for ID:', id)
  } else {
    teacherInfoCache.clear()
    studentBalanceCache.clear()
    log('Cleared all teacher info cache')
  }
}

// Кэшированная загрузка данных преподавателя
async function loadTeacherInfoCached(id) {
  const cached = getCachedTeacherInfo(id)

  if (cached && isCacheValid(cached)) {
    log('Using cached teacher info')
    return cached.data
  }

  log('Fetching teacher info from API')
  try {
    const data = await getTeacherInfo(id)
    setCachedTeacherInfo(id, data)
    return data
  } catch (error) {
    console.error('[TeacherInfo] Error fetching teacher info:', error)

    // Возвращаем устаревшие данные при ошибке, если они есть
    if (cached) {
      console.warn('[TeacherInfo] Using stale cached teacher info due to API error')
      return cached.data
    }

    throw error
  }
}

// Кэшированная загрузка баланса студента
async function loadStudentBalanceCached(id) {
  const cached = getCachedStudentBalance(id)

  if (cached && isCacheValid(cached)) {
    log('Using cached student balance')
    return cached.data
  }

  log('Fetching student balance from API')
  try {
    const data = await getStudentBalance(id)
    setCachedStudentBalance(id, data)
    return data
  } catch (error) {
    console.error('[TeacherInfo] Error fetching student balance:', error)

    // Возвращаем устаревшие данные при ошибке, если они есть
    if (cached) {
      console.warn('[TeacherInfo] Using stale cached student balance due to API error')
      return cached.data
    }

    throw error
  }
}

const loadData = async (id) => {
  if (!id || loadedId.value === id) {
    log('Skipping load - no ID or same ID already loaded:', { id, loadedId: loadedId.value })
    return
  }

  isLoading.value = true
  loadedId.value = id

  log('Loading data for ID:', id)

  try {
    // Загружаем данные параллельно с использованием кэша
    const [teacher, balance] = await Promise.all([
      loadTeacherInfoCached(id),
      loadStudentBalanceCached(id)
    ])

    teacherInfo.value = teacher
    studentBalance.value = balance

    log('Data loaded successfully:', { teacher, balance })
  } catch (error) {
    console.error('[TeacherInfo] Error loading data:', error)
    // При ошибке не сбрасываем loadedId, чтобы не пытаться загрузить снова
  } finally {
    isLoading.value = false
  }
}

// Принудительное обновление данных (минуя кэш)
const refreshData = async () => {
  const id = props.info?.id
  if (id) {
    clearTeacherCache(id)
    loadedId.value = null // Сбрасываем, чтобы загрузить заново
    await loadData(id)
  }
}

onMounted(() => {
  if (props.info?.id) {
    loadData(props.info.id)
  }
})

watch(
  () => props.info?.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      log('Props ID changed:', { oldId, newId })
      loadData(newId)
    }
  }
)

// Экспонируем методы для внешнего использования
defineExpose({
  refreshData,
  clearCache: clearTeacherCache,
  teacherInfo,
  studentBalance,
  isLoading
})
</script>

<style scoped>
.debug-info {
  font-size: 12px;
  font-family: monospace;
  border: 1px solid #ccc;
}

.debug-info button {
  font-size: 11px;
}
</style>
