<template>
  <div class="v-finance__chart styled-section">
    <div class="v-finance__chart-header">
      <div class="v-finance__chart-header-wrapper">
        <div class="v-finance__chart-header-block">
          <div class="v-finance__chart-title text-section-title">График заработка</div>

          <div class="v-finance__chart-pagination" v-show="currentState !== 'По годам'">
            <img
              src="/src/assets/images/arrow-left-finance.svg"
              alt=""
              @click="handlePrevPeriod"
              class="cursor-pointer"
              :class="{ disabled: !canNavigatePrev }"
            />
            {{ currentPaginationRange }}
            <img
              src="/src/assets/images/arrow-right-finance.svg"
              alt=""
              @click="handleNextPeriod"
              class="cursor-pointer"
              :class="{ disabled: !canNavigateNext }"
            />
          </div>
        </div>

        <div class="flex gap-5">
          <v-styled-select
            :items="['По годам', 'По месяцам', 'По неделям', 'По дням']"
            @update:model-value="onSelectChartType"
          />
          <div class="v-finance__chart-pagination mob" v-if="currentState !== 'По годам'">
            <img
              src="/src/assets/images/arrow-left-finance.svg"
              alt=""
              @click="handlePrevPeriod"
              class="cursor-pointer"
              :class="{ disabled: !canNavigatePrev }"
            />
            {{ currentPaginationRange }}
            <img
              src="/src/assets/images/arrow-right-finance.svg"
              alt=""
              @click="handleNextPeriod"
              class="cursor-pointer"
              :class="{ disabled: !canNavigateNext }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Сообщение о том, что данных нет -->
    <div v-if="noEarningsMessage" class="v-finance__chart-no-data">
      <div class="no-data-message">
        {{ noEarningsMessage }}
      </div>
    </div>

    <div class="v-finance__chart-element" v-else-if="chartData.datasets[0].data && chartData.datasets[0].data.length">
      <div
        class="v-finance__chart-wrapper"
        :class="{
          year: isYearlyChart,
          weeks: currentState === 'По неделям',
          days: currentState === 'По дням'
        }"
        :style="getChartWidth()"
      >
        <Bar :data="chartData" :options="chartOptions" :key="chartKey" />
      </div>
    </div>

    <!-- Лоадер -->
    <div v-if="isLoading" class="v-finance__chart-loading">
      <div class="loading-spinner">Загрузка...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { monthBarChartOptions } from '@/charts/financeChartConfig'
import { useFinanceStore } from '@/stores/financeStore'

import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import vStyledSelect from '../generalComponents/v-styled-select.vue'
import { useChartColors } from '@/composables/useChartColors'
import { getDailyEarnings, getEarningsForYear, getMonthlyEarnings, getWeeklyEarnings } from '@/api/requests'
import { formatDate } from '@/utils'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
)

const financeStore = useFinanceStore()
const currentState = ref('По годам')
const chartKey = ref(0)
const isYearlyChart = ref(false)
const currentPeriodIndex = ref(0)
const isLoading = ref(false)

// Состояние для пагинации
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const currentMonthYear = ref(new Date().getFullYear())
const minYear = ref(2020)
const maxYear = ref(new Date().getFullYear() + 1)

// Данные из API
const monthlyApiData = ref({})
const yearlyApiData = ref([])
const dailyApiData = ref({})
const weeklyApiData = ref({})

// Кэш для данных
const monthlyDataCache = ref(new Map())
const weeklyDataCache = ref(new Map())

const noEarningsMessage = ref('')

// Форматирование числа в рубли
const formatRubles = (value) => {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽'
}

// Форматирование даты
const formatDateCustom = (date) => {
  const options = { month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString('ru-RU', options)
}

// Форматирование дня недели и даты
const formatDayDate = (date) => {
  const weekdayOptions = { weekday: 'long' }
  const dayOptions = { day: 'numeric' }

  const weekday = new Date(date).toLocaleDateString('ru-RU', weekdayOptions)
  const day = new Date(date).toLocaleDateString('ru-RU', dayOptions)

  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  return `${capitalizedWeekday}, ${day}`
}

// Маппинг месяцев
const monthMapping = {
  0: 'Январь',
  1: 'Февраль',
  2: 'Март',
  3: 'Апрель',
  4: 'Май',
  5: 'Июнь',
  6: 'Июль',
  7: 'Август',
  8: 'Сентябрь',
  9: 'Октябрь',
  10: 'Ноябрь',
  11: 'Декабрь'
}

const monthMappingEng = {
  'January': 'Январь',
  'February': 'Февраль',
  'March': 'Март',
  'April': 'Апрель',
  'May': 'Май',
  'June': 'Июнь',
  'July': 'Июль',
  'August': 'Август',
  'September': 'Сентябрь',
  'October': 'Октябрь',
  'November': 'Ноябрь',
  'December': 'Декабрь'
}

const monthOrder = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Данные по дням
const dayData = ref([])

// Получение количества дней в месяце
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate()
}

// Получение всех недель месяца
const getWeeksInMonth = (year, month) => {
  const weeks = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Находим понедельник первой недели
  let weekStart = new Date(firstDay)
  const firstDayOfWeek = firstDay.getDay()
  const daysToMonday = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
  weekStart.setDate(weekStart.getDate() - daysToMonday)

  let weekNumber = 1

  while (weekStart <= lastDay) {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    // Проверяем, пересекается ли неделя с текущим месяцем
    const weekStartInMonth = weekStart <= lastDay
    const weekEndInMonth = weekEnd >= firstDay

    if (weekStartInMonth && weekEndInMonth) {
      const displayStart = new Date(Math.max(weekStart, firstDay))
      const displayEnd = new Date(Math.min(weekEnd, lastDay))

      const formattedWeekStart =  formatDate(weekStart).slice(0, 5)
      const formattedWeekEnd =  formatDate(weekStart).slice(0, 5)

      weeks.push({
        weekNumber,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        displayStart: displayStart.toISOString().split('T')[0],
        displayEnd: displayEnd.toISOString().split('T')[0],
        label: `${formattedWeekStart} - ${formattedWeekEnd}`
      })
    }

    weekStart.setDate(weekStart.getDate() + 7)
    weekNumber++

    // Защита от бесконечного цикла
    if (weekNumber > 10) break
  }

  return weeks
}

// Тестовые данные
const generateTestWeeklyData = (year, month) => {
  const weeks = getWeeksInMonth(year, month)
  const weeklyEarnings = {}

  weeks.forEach((week, index) => {
    // 70% шанс что есть заработок за неделю
    const hasEarnings = Math.random() > 0.3
    weeklyEarnings[week.weekNumber] = hasEarnings ? Math.floor(Math.random() * 50000) + 10000 : 0
  })

  return { weekly_earnings: weeklyEarnings }
}

const generateTestMonthlyData = (year) => {
  const monthlyEarnings = {}

  monthOrder.forEach((month) => {
    // 80% шанс что есть заработок за месяц
    const hasEarnings = Math.random() > 0.2
    monthlyEarnings[month] = hasEarnings ? Math.floor(Math.random() * 200000) + 50000 : 0
  })

  return monthlyEarnings
}

// Вычисляемые свойства
const canNavigatePrev = computed(() => {
  if (currentState.value === 'По месяцам') {
    return currentYear.value > minYear.value
  } else if (currentState.value === 'По неделям') {
    const minDate = new Date(minYear.value, 0)
    const currentDate = new Date(currentMonthYear.value, currentMonth.value)
    return currentDate > minDate
  } else if (currentState.value === 'По дням') {
    return currentPeriodIndex.value > 0
  }
  return false
})

const canNavigateNext = computed(() => {
  if (currentState.value === 'По месяцам') {
    return currentYear.value < maxYear.value
  } else if (currentState.value === 'По неделям') {
    const maxDate = new Date(maxYear.value, 11)
    const currentDate = new Date(currentMonthYear.value, currentMonth.value)
    return currentDate < maxDate
  } else if (currentState.value === 'По дням') {
    return dayData.value.length > 0 && currentPeriodIndex.value < dayData.value.length - 1
  }
  return false
})

const currentPaginationRange = computed(() => {
  if (currentState.value === 'По месяцам') {
    return currentYear.value.toString()
  } else if (currentState.value === 'По неделям') {
    return `${monthMapping[currentMonth.value]} ${currentMonthYear.value}`
  } else if (currentState.value === 'По дням') {
    const dayPeriod = dayData.value[currentPeriodIndex.value]
    if (dayPeriod) {
      const firstDate = new Date(dayPeriod.startDate)
      const lastDate = new Date(dayPeriod.endDate)
      return `${formatDateCustom(firstDate)} - ${formatDateCustom(lastDate)}`
    }
    return ''
  }
  return null
})

// Настройки графика
const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Заработок',
      data: [],
      backgroundColor: '#1D4ECC',
      borderRadius: 12,
      barPercentage: 0.3,
      categoryPercentage: 0.4,
      maxBarThickness: 10
    },
    {
      label: 'Потенциальный',
      data: [],
      backgroundColor: '#CCD8F8',
      borderRadius: 12,
      barPercentage: 0.3,
      categoryPercentage: 0.4,
      maxBarThickness: 10
    },
  ],
})

const chartOptions = ref({
  ...monthBarChartOptions,
  plugins: {
    ...monthBarChartOptions.plugins,
    datalabels: {
      color: '#000',
      anchor: 'end',
      align: 'top',
      offset: 0,
      font: {
        weight: 'bold',
        size: 12
      },
      formatter: (value) => value ? formatRubles(value) : '',
      display: (context) => context.dataset.data[context.dataIndex] > 0
    }
  }
})

useChartColors(chartOptions, chartKey)

// Методы
const initializeAvailableYears = () => {
  if (yearlyApiData.value.length > 0) {
    const years = yearlyApiData.value.map(item => item.year).sort((a, b) => a - b)
    minYear.value = Math.min(...years)
    maxYear.value = Math.max(...years, new Date().getFullYear())

    if (currentYear.value < minYear.value) {
      currentYear.value = minYear.value
    } else if (currentYear.value > maxYear.value) {
      currentYear.value = maxYear.value
    }

    if (currentMonthYear.value < minYear.value) {
      currentMonthYear.value = minYear.value
    } else if (currentMonthYear.value > maxYear.value) {
      currentMonthYear.value = maxYear.value
    }
  }
}

const processYearlyData = (apiData) => {
  console.log(apiData)
  if (!Array.isArray(apiData) || apiData.length === 0) {
    return { earningsData: [], potentialData: [], labels: [] }
  }

  const earningsData = []
  const potentialData = []
  const yearlyLabels = []

  const sortedData = apiData.sort((a, b) => a.year - b.year)

  sortedData.forEach(item => {
    const earnings = parseFloat(item.total_earnings || 0)
    const potencial_earnings = parseFloat(item.potencial_earnings || 0)
    console.log(item, potencial_earnings)
    if (earnings > 0 || potencial_earnings > 0) {
      earningsData.push(earnings)
      potentialData.push(potencial_earnings)
      yearlyLabels.push(item.year.toString())
    }
  })

  return { earningsData, potentialData, labels: yearlyLabels }
}

const processMonthlyData = (apiData) => {
  const earningsData = []
  const potentialData = []
  const monthlyLabels = []

  monthOrder.forEach(englishMonth => {
    const earnings = parseFloat(apiData[englishMonth]?.earnings || 0)
    const potencial_earnings = parseFloat(apiData[englishMonth]?.potencial_earnings || 0)

    console.log(apiData[englishMonth])

    // Показываем месяц если есть хотя бы один из видов заработка
    if (earnings > 0 || potencial_earnings > 0) {
      earningsData.push(earnings)
      potentialData.push(potencial_earnings)
      monthlyLabels.push(monthMappingEng[englishMonth])
    }
  })

  return {
    earningsData,
    potentialData,
    labels: monthlyLabels
  }
}

const processWeeklyData = (apiData, year, month) => {
  if (!apiData || !apiData.weekly_earnings) {
    return { earningsData: [], potentialData: [], labels: [] }
  }

  const earningsData = []
  const potentialData = []
  const weeklyLabels = []

  // Получаем ключи недель из API и сортируем их
  const weekKeys = Object.keys(apiData.weekly_earnings).sort()

  weekKeys.forEach(weekKey => {
    const weekData = apiData.weekly_earnings[weekKey]
    const earnings = parseFloat(weekData.earnings || 0)
    const potential_earnings = parseFloat(weekData.potencial_earnings || 0) // обратите внимание на опечатку в API

    // Показываем только недели с заработком или потенциальным заработком больше 0
    if (earnings > 0 || potential_earnings > 0) {
      earningsData.push(earnings)
      potentialData.push(potential_earnings)

      // Формируем лейбл из дат начала и конца недели
      const startDate = new Date(weekData.week_start)
      const endDate = new Date(weekData.week_end)

      const formattedStart = formatDate(startDate).slice(0, 5) // DD.MM
      const formattedEnd = formatDate(endDate).slice(0, 5) // DD.MM

      weeklyLabels.push(`${formattedStart} - ${formattedEnd}`)
    }
  })
  return { earningsData, potentialData, labels: weeklyLabels }
}

const processDailyData = (apiData) => {
  if (!apiData || !apiData.daily_earnings || Object.keys(apiData.daily_earnings).length === 0) {
    return { data: [], labels: [], startDate: null, endDate: null }
  }

  const dailyEarnings = apiData.daily_earnings
  const dates = Object.keys(dailyEarnings).sort()

  const earningsData = []
  const potentialData = []
  dates.forEach(date => {
    const dayData = dailyEarnings[date]
    if (typeof dayData === 'object' && dayData.earnings !== undefined) {
      earningsData.push(parseFloat(dayData.earnings) || 0)
      potentialData.push(parseFloat(dayData.potencial_earnings) || 0)
    }
    earningsData.push(parseFloat(dayData) || 0)
  })

  const labels = dates.map(date => formatDayDate(date))

  return {
    earningsData,
    potentialData,
    labels,
    startDate: apiData.start_date,
    endDate: apiData.end_date
  }
}

const filterZeroValues = (data, labels) => {
  const filteredIndexes = []

  for (let i = 0; i < data.length; i++) {
    if (data[i] > 0) {
      filteredIndexes.push(i)
    }
  }

  const filteredData = filteredIndexes.map(i => data[i])
  const filteredLabels = filteredIndexes.map(i => labels[i])

  return { data: filteredData, labels: filteredLabels }
}

const loadMonthlyDataForYear = async (year) => {
  const cacheKey = year.toString()

  if (monthlyDataCache.value.has(cacheKey)) {
    return monthlyDataCache.value.get(cacheKey)
  }

  try {
    isLoading.value = true

    // Используем реальный API запрос
    const monthlyEarnings = await getMonthlyEarnings(year)

    monthlyDataCache.value.set(cacheKey, monthlyEarnings)
    return monthlyEarnings
  } catch (error) {
    console.error(`Ошибка при загрузке данных за ${year} год:`, error)

    // Fallback к тестовым данным в случае ошибки API
    const testData = generateTestMonthlyData(year)
    monthlyDataCache.value.set(cacheKey, testData)
    return testData
  } finally {
    isLoading.value = false
  }
}

const loadWeeklyDataForMonth = async (year, month) => {
  const cacheKey = `${year}-${month}`

  if (weeklyDataCache.value.has(cacheKey)) {
    return weeklyDataCache.value.get(cacheKey)
  }

  try {
    isLoading.value = true

    // Формируем даты начала и конца месяца
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0) // Последний день месяца

    // Форматируем даты в формат YYYY-MM-DD
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    const apiResponse = await getWeeklyEarnings(startDateStr, endDateStr)

    let weeklyEarnings

    if (apiResponse && apiResponse.weekly_earnings) {
      weeklyEarnings = apiResponse
    } else if (apiResponse && typeof apiResponse === 'object') {
      weeklyEarnings = { weekly_earnings: apiResponse }
    } else {
      weeklyEarnings = { weekly_earnings: {} }
    }

    weeklyDataCache.value.set(cacheKey, weeklyEarnings)
    return weeklyEarnings
  } catch (error) {
    console.error(`Ошибка при загрузке недельных данных за ${month + 1}/${year}:`, error)

    const testData = generateTestWeeklyData(year, month)
    weeklyDataCache.value.set(cacheKey, testData)
    return testData
  } finally {
    isLoading.value = false
  }
}

const loadYearlyData = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i)

    const yearlyPromises = years.map(year =>
      getEarningsForYear(year).catch(err => {
        console.warn(`Нет данных за ${year} год:`, err)
        return null
      })
    )

    const yearlyResults = await Promise.all(yearlyPromises)

    const validYearlyData = []
    yearlyResults.forEach((result, index) => {
      if (result && (result.earnings || result.potencial_earnings)) {
        validYearlyData.push({
          year: years[index],
          total_earnings: result.earnings || 0,
          potencial_earnings: result.potencial_earnings || 0
        })
      }
    })

    yearlyApiData.value = validYearlyData
    initializeAvailableYears()

  } catch (error) {
    console.error('Ошибка при загрузке данных по годам:', error)
  }
}

const updateDatasetForPeriod = async () => {
  noEarningsMessage.value = ''

  if (currentState.value === 'По дням') {
    if (Object.keys(dailyApiData.value).length > 0) {
      const processed = processDailyData(dailyApiData.value)

      // Создаем недельные чанки
      const weeklyChunks = []
      const dailyEarnings = dailyApiData.value.daily_earnings
      const sortedDates = Object.keys(dailyEarnings).sort()

      for (let i = 0; i < sortedDates.length; i += 7) {
        const chunkDates = sortedDates.slice(i, i + 7)
        const chunkEarnings = []
        const chunkPotential = []
        const chunkLabels = []

        chunkDates.forEach(date => {
          const dayData = dailyEarnings[date]
          let earnings = 0
          let potential = 0

          console.log(dayData)

          if (typeof dayData === 'object' && dayData.earnings !== undefined) {
            earnings = parseFloat(dayData.earnings) || 0
            potential = parseFloat(dayData.potencial_earnings) || 0
          } else {
            earnings = parseFloat(dayData) || 0
          }

          // Добавляем все дни, даже с нулевыми значениями
          chunkEarnings.push(earnings)
          chunkPotential.push(potential)
          chunkLabels.push(formatDayDate(date))
        })

        // Проверяем есть ли хотя бы один день с заработком в этом чанке
        const hasEarnings = chunkEarnings.some(val => val > 0) || chunkPotential.some(val => val > 0)

        if (hasEarnings) {
          weeklyChunks.push({
            earningsData: chunkEarnings,
            potentialData: chunkPotential,
            labels: chunkLabels,
            startDate: chunkDates[0],
            endDate: chunkDates[chunkDates.length - 1]
          })
        }
      }

      if (weeklyChunks.length > 0) {
        dayData.value = weeklyChunks

        // Корректируем индекс если он выходит за границы
        if (currentPeriodIndex.value >= dayData.value.length) {
          currentPeriodIndex.value = dayData.value.length - 1
        }

        // Берем данные для текущего периода (недели)
        const currentDayPeriod = dayData.value[currentPeriodIndex.value]
        if (currentDayPeriod) {
          chartData.value = {
            labels: currentDayPeriod.labels,
            datasets: [
              {
                ...chartData.value.datasets[0],
                data: currentDayPeriod.earningsData,
              },
              {
                ...chartData.value.datasets[1],
                data: currentDayPeriod.potentialData
              }
            ],
          }
        }
      } else {
        noEarningsMessage.value = 'За этот период вы ничего не заработали'
        chartData.value = {
          labels: [],
          datasets: [
            { ...chartData.value.datasets[0], data: [] },
            { ...chartData.value.datasets[1], data: [] }
          ]
        }
      }
    } else {
      noEarningsMessage.value = 'Нет данных для отображения по дням'
      chartData.value = {
        labels: [],
        datasets: [
          { ...chartData.value.datasets[0], data: [] },
          { ...chartData.value.datasets[1], data: [] }
        ]
      }
    }
  } else if (currentState.value === 'По месяцам') {
    const monthlyData = await loadMonthlyDataForYear(currentYear.value)
    if (Object.keys(monthlyData).length > 0) {
      const processed = processMonthlyData(monthlyData)

      // Проверяем есть ли хотя бы один месяц с данными
      if (processed.earningsData.some(value => value > 0) || processed.potentialData.some(value => value > 0)) {
        chartData.value = {
          labels: processed.labels,
          datasets: [
            {
              ...chartData.value.datasets[0],
              data: processed.earningsData,
            },
            {
              ...chartData.value.datasets[1],
              data: processed.potentialData,
            }
          ],
        }
      } else {
        noEarningsMessage.value = `За ${currentYear.value} год вы ничего не заработали`
        chartData.value = {
          labels: [],
          datasets: [
            { ...chartData.value.datasets[0], data: [] },
            { ...chartData.value.datasets[1], data: [] }
          ]
        }
      }
    } else {
      noEarningsMessage.value = `За ${currentYear.value} год данные отсутствуют`
      chartData.value = {
        labels: [],
        datasets: [
          { ...chartData.value.datasets[0], data: [] },
          { ...chartData.value.datasets[1], data: [] }
        ]
      }
    }
  } else if (currentState.value === 'По неделям') {
    const weeklyData = await loadWeeklyDataForMonth(currentMonthYear.value, currentMonth.value)

    if (weeklyData && Object.keys(weeklyData.weekly_earnings || {}).length > 0) {
      const processed = processWeeklyData(weeklyData, currentMonthYear.value, currentMonth.value)

      if (processed.earningsData.length > 0 || processed.potentialData.length > 0) {
        chartData.value = {
          labels: processed.labels,
          datasets: [
            {
              ...chartData.value.datasets[0],
              data: processed.earningsData,
            },
            {
              ...chartData.value.datasets[1],
              data: processed.potentialData,
            }
          ],
        }
      } else {
        noEarningsMessage.value = `За ${monthMapping[currentMonth.value]} ${currentMonthYear.value} вы ничего не заработали`
        chartData.value = {
          labels: [],
          datasets: [
            { ...chartData.value.datasets[0], data: [] },
            { ...chartData.value.datasets[1], data: [] }
          ]
        }
      }
    } else {
      noEarningsMessage.value = `За ${monthMapping[currentMonth.value]} ${currentMonthYear.value} вы ничего не заработали`
      chartData.value = {
        labels: [],
        datasets: [
          { ...chartData.value.datasets[0], data: [] },
          { ...chartData.value.datasets[1], data: [] }
        ]
      }
    }
  } else if (currentState.value === 'По годам') {
    if (yearlyApiData.value.length > 0) {
      const processed = processYearlyData(yearlyApiData.value)

      if (processed.earningsData.length > 0 || processed.potentialData.length > 0) {
        chartData.value = {
          labels: processed.labels,
          datasets: [
            {
              ...chartData.value.datasets[0],
              data: processed.earningsData,
            },
            {
              ...chartData.value.datasets[1],
              data: processed.potentialData,
            }
          ],
        }
      } else {
        noEarningsMessage.value = 'Нет данных для отображения по годам'
        chartData.value = {
          labels: [],
          datasets: [
            { ...chartData.value.datasets[0], data: [] },
            { ...chartData.value.datasets[1], data: [] }
          ]
        }
      }
    } else {
      noEarningsMessage.value = 'Нет данных для отображения по годам'
      chartData.value = {
        labels: [],
        datasets: [
          { ...chartData.value.datasets[0], data: [] },
          { ...chartData.value.datasets[1], data: [] }
        ]
      }
    }
  }

  // Принудительно обновляем график
  chartKey.value++
}

const handlePrevPeriod = async () => {
  if (!canNavigatePrev.value || isLoading.value) return

  if (currentState.value === 'По месяцам') {
    currentYear.value--
    await updateDatasetForPeriod()
  } else if (currentState.value === 'По неделям') {
    if (currentMonth.value === 0) {
      currentMonth.value = 11
      currentMonthYear.value--
    } else {
      currentMonth.value--
    }
    await updateDatasetForPeriod()
  } else if (currentState.value === 'По дням' && currentPeriodIndex.value > 0) {
    currentPeriodIndex.value--
    updateDatasetForPeriod()
  }
}

const handleNextPeriod = async () => {
  if (!canNavigateNext.value || isLoading.value) return

  if (currentState.value === 'По месяцам') {
    currentYear.value++
    await updateDatasetForPeriod()
  } else if (currentState.value === 'По неделям') {
    if (currentMonth.value === 11) {
      currentMonth.value = 0
      currentMonthYear.value++
    } else {
      currentMonth.value++
    }
    await updateDatasetForPeriod()
  } else if (currentState.value === 'По дням' && currentPeriodIndex.value < dayData.value.length - 1) {
    currentPeriodIndex.value++
    updateDatasetForPeriod()
  }
}

const getChartWidth = () => {
  const styles = {}

  if (isYearlyChart.value) {
    const count = chartData.value.labels.length || 2
    styles['min-width'] = `${count * 100}px`
    styles.width = `${count * 100}px`
  } else if (currentState.value === 'По дням') {
    const count = chartData.value.labels.length || 7
    styles['min-width'] = `${Math.max(count * 80, 500)}px`
    styles.width = '100%'
  } else if (currentState.value === 'По неделям') {
    const count = chartData.value.labels.length || 4
    styles['min-width'] = `${Math.max(count * 120, 500)}px`
    styles.width = '100%'
  } else if (currentState.value === 'По месяцам') {
    const count = chartData.value.labels.length || 12
    styles['min-width'] = `${Math.max(count * 80, 800)}px`
    styles.width = '100%'
  }

  return styles
}

const onSelectChartType = async (value) => {
  if (isLoading.value) return

  currentState.value = value
  currentPeriodIndex.value = 0
  isYearlyChart.value = value === 'По годам'

  // Сброс на текущие значения при переключении режима
  if (value === 'По месяцам') {
    currentYear.value = new Date().getFullYear()
  } else if (value === 'По неделям') {
    currentMonth.value = new Date().getMonth()
    currentMonthYear.value = new Date().getFullYear()
  }

  // Очищаем график перед загрузкой новых данных
  chartData.value = {
    labels: [],
    datasets: [
      { ...chartData.value.datasets[0], data: [] },
      { ...chartData.value.datasets[1], data: [] }
    ]
  }

  chartOptions.value = {
    ...monthBarChartOptions,
    plugins: {
      ...monthBarChartOptions.plugins,
      datalabels: {
        color: '#344055',
        opacity: 0.56,
        anchor: 'end',
        align: 'top',
        textAlign: 'center',
        offset: 0,
        font: { weight: 'bold', size: 12 },

        formatter: (value, context) => {
          const earnings = context.chart.data.datasets[0].data[context.dataIndex]
          const potential = context.chart.data.datasets[1].data[context.dataIndex]

          // Определяем какой столбец выше
          const isEarningsHigher = earnings >= potential
          const isPotentialHigher = potential > earnings

          // Показываем лейбл только над самым высоким столбцом
          if ((context.datasetIndex === 0 && isEarningsHigher) ||
              (context.datasetIndex === 1 && isPotentialHigher)) {

            // Показываем данные только если есть хотя бы один из видов заработка
            if (earnings > 0 || potential > 0) {
              return `${formatRubles(earnings)}\n(${formatRubles(potential)} план.)`
            }
          }
          return ''
        },

        display: (context) => {
          const earnings = context.chart.data.datasets[0].data[context.dataIndex]
          const potential = context.chart.data.datasets[1].data[context.dataIndex]

          // Показываем только если есть данные и это самый высокий столбец
          if (earnings > 0 || potential > 0) {
            const isEarningsHigher = earnings >= potential
            const isPotentialHigher = potential > earnings

            return (context.datasetIndex === 0 && isEarningsHigher) ||
                   (context.datasetIndex === 1 && isPotentialHigher)
          }
          return false
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
          drawTicks: false,
          drawBorder: false
        },
        ticks: {
          display: true
        },
        border: {
          display: false
        },
      },
      y: {
        grid: {
          display: false,
          drawTicks: false,
          drawBorder: false
        },
        ticks: {
          display: false
        },
        border: {
          display: false
        },
      }
    }
  }

  await updateDatasetForPeriod()

  // Принудительно обновляем ключ графика для полной перерисовки
  chartKey.value++
}

const loadData = async () => {
  try {
    await loadYearlyData()

    const dailyEarnings = await getDailyEarnings(
      financeStore.currentRange[0],
      financeStore.currentRange[1]
    ).catch(err => {
      console.error('Ошибка загрузки дневных данных:', err)
      return { daily_earnings: {} }
    })

    dailyApiData.value = dailyEarnings

    await updateDatasetForPeriod()

  } catch (error) {
    console.error('Ошибка при загрузке данных:', error)
  }
}

watch(() => financeStore.lastUpdated, () => {
  loadData()
  chartKey.value++
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.v-finance__chart-wrapper {
  overflow-x: auto;
}

.v-finance__chart-wrapper.weeks {
  min-height: 300px;
}

.v-finance__chart-wrapper.days {
  min-height: 350px;
}

.cursor-pointer {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.cursor-pointer.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.cursor-pointer:not(.disabled):hover {
  opacity: 0.7;
}

.v-finance__chart-no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.no-data-message {
  font-size: 18px;
  color: #666;
  text-align: center;
  padding: 20px;
  border: 2px dashed #ccc;
  border-radius: 12px;
  background-color: #f9f9f9;
}

.v-finance__chart-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-spinner {
  font-size: 16px;
  color: #1D4ECC;
  text-align: center;
  padding: 20px;
}
</style>
