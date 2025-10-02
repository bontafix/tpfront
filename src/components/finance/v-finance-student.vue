<template>
  <div class="v-finance-student styled-section">
    <div class="v-finance-student__header">
      <div class="v-finance-student__header-block">
        <h2 class="text-section-title">Финансовый анализ ученика</h2>
        <v-styled-select :items="myStudents" @update:model-value="mainStudentSelected"/>
      </div>

        <VueDatePicker
          v-model="date"
          :locale="'ru-RU'"
          :clearable="true"
          :format="formatDateRange"
          :action-buttons="['cancel', 'submit']"
          cancel-text="Отмена"
          select-text="Выбрать"
          class="range custom-datepicker"
          range
          @update-month-year="onMonthChange"
        >
        <template #clear-icon="{ clear }"> </template>
      </VueDatePicker>
      </div>

    <!-- Аналитика -->
     <template v-if="mainStudentData">
      <div class="v-finance-student__analysis" v-show="showAnalysis">
        <ul class="v-finance-student__list">
          <li class="v-finance-student__list-item finance-analytics-card">
            <div class="finance-analytics-card__img">
              <img class="day-el" src="/src/assets/images/finance-plus.svg" alt="" />
              <img class="night-el" src="/src/assets/images/finance-plus-night.svg" alt="" />
            </div>
            <div class="finance-analytics-card__info">
              <p class="finance-analytics-card__subtitle">Заработано</p>
              <div class="flex gap-3">
                <h4 class="finance-analytics-card__price">
                  {{ mainStudentData?.total_earned?.toLocaleString('ru-RU') ?? '0' }} ₽
                </h4>
                <div class="status" :class="{green: parseFloat(mainStudentData?.lessons_earnings_percentage_change) > 0, red: parseFloat(mainStudentData?.lessons_earnings_percentage_change) < 0}">
                  {{ formatPercentage(mainStudentData?.lessons_earnings_percentage_change) }}
                </div>
              </div>
            </div>
          </li>

          <li class="v-finance-student__list-item finance-analytics-card">
            <div class="finance-analytics-card__img">
              <img class="day-el" src="/src/assets/images/finance-plus.svg" alt="" />
              <img class="night-el" src="/src/assets/images/finance-plus-night.svg" alt="" />
            </div>
            <div class="finance-analytics-card__info">
              <p class="finance-analytics-card__subtitle">Запланировано занятий</p>
              <div class="flex gap-3">
                <h4 class="finance-analytics-card__price">
                  {{ mainStudentData?.total_lessons ?? 0 }}
                </h4>
                <div class="status" :class="{green: parseFloat(mainStudentData?.lessons_percentage_change) > 0, red: parseFloat(mainStudentData?.lessons_percentage_change) < 0}">
                  {{ formatPercentage(mainStudentData?.lessons_percentage_change) }}
                </div>
              </div>
            </div>
          </li>

          <li class="v-finance-student__list-item finance-analytics-card">
            <div class="finance-analytics-card__img">
              <img class="day-el" src="/src/assets/images/finance-plus.svg" alt="" />
              <img class="night-el" src="/src/assets/images/finance-plus-night.svg" alt="" />
            </div>
            <div class="finance-analytics-card__info">
              <p class="finance-analytics-card__subtitle">LTV</p>
              <div class="flex gap-3">
                <h4 class="finance-analytics-card__price">
                  {{ mainStudentData?.earned_from_lessons?.toLocaleString('ru-RU') ?? '0' }} ₽
                </h4>
                <div class="status" :class="{green: parseFloat(mainStudentData?.percentage_change) > 0, red: parseFloat(mainStudentData?.percentage_change) < 0}">
                  {{ formatPercentage(mainStudentData?.percentage_change) }}
                </div>
              </div>
            </div>
          </li>
        </ul>

        <ul class="v-finance-student__list">
          <li class="v-finance-student__list-item finance-analytics-card">
            <div class="finance-analytics-card__img">
              <img class="day-el" src="/src/assets/images/finance-minus.svg" alt="" />
              <img class="night-el" src="/src/assets/images/finance-minus-night.svg" alt="" />
            </div>
            <div class="finance-analytics-card__info">
              <p class="finance-analytics-card__subtitle">Отменённые занятия</p>
              <div class="flex gap-3">
                <h4 class="finance-analytics-card__price">
                  {{ mainStudentData?.cancelled_count ?? 0 }}
                </h4>
                <div class="status" :class="{green: parseFloat(mainStudentData?.cancelled_percentage_change) < 0, red: parseFloat(mainStudentData?.cancelled_percentage_change) > 0}">
                  {{ formatPercentage(mainStudentData?.cancelled_percentage_change) }}
                </div>
              </div>
            </div>
          </li>

          <li class="v-finance-student__list-item finance-analytics-card">
            <div class="finance-analytics-card__img">
              <img class="day-el" src="/src/assets/images/finance-minus.svg" alt="" />
              <img class="night-el" src="/src/assets/images/finance-minus-night.svg" alt="" />
            </div>
            <div class="finance-analytics-card__info">
              <p class="finance-analytics-card__subtitle">Коэффициент отмен</p>
              <div class="flex gap-3">
                <h4 class="finance-analytics-card__price">
                  {{ (mainStudentData?.cancelled_ratio ?? 0) + '%' }}
                </h4>
                <div class="status" :class="{green: parseFloat(mainStudentData?.cancelled_ratio_percentage_change) < 0, red: parseFloat(mainStudentData?.cancelled_ratio_percentage_change) > 0}">
                  {{ formatPercentage(mainStudentData?.cancelled_ratio_percentage_change) }}
                </div>
              </div>
            </div>
          </li>

          <li class="v-finance-student__list-item finance-analytics-card">
            <div class="finance-analytics-card__img">
              <img class="day-el" src="/src/assets/images/finance-minus.svg" alt="" />
              <img class="night-el" src="/src/assets/images/finance-minus-night.svg" alt="" />
            </div>
            <div class="finance-analytics-card__info">
              <p class="finance-analytics-card__subtitle">Упущенная выручка</p>
              <div class="flex gap-3">
                <h4 class="finance-analytics-card__price">
                  {{ mainStudentData?.lost_earnings?.toLocaleString('ru-RU') ?? '0' }} ₽
                </h4>
                <div class="status" :class="{green: parseFloat(mainStudentData?.lost_earnings_percentage_change) < 0, red: parseFloat(mainStudentData?.lost_earnings_percentage_change) > 0}">
                  {{ formatPercentage(mainStudentData?.lost_earnings_percentage_change) }}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </template>

    <div class="v-finance-student__compare" v-if="showAnalysis">
      <div class="v-finance-student__compare-block">
        <div class="v-finance-student__compare-subtitle">
          Выбрать ученика для сравнительного анализа
        </div>
        <v-styled-select v-if="comapredStudents" ref="comapredStudentsSelect" :items="comapredStudents" @update:model-value="comparedStudentSelected"/>
      </div>
      <template v-if="comapredStudent !== 'Выберите ученика'">
        <v-compare-chart :compared-chart-data="comparedChartData"  />
      </template>

    </div>
  </div>
</template>

<script setup>
import { formatDate, formatDateRange, formatDateToStandart, getCurrentMonthDates } from '@/utils'
import { ref, onMounted, computed, watch } from 'vue'
import { useStudentsStore } from '@/stores/studentsStore'

import '@vuepic/vue-datepicker/dist/main.css'
import vCompareChart from './v-compare-chart.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import vStyledSelect from '../generalComponents/v-styled-select.vue'
import { getStudentEarning } from '@/api/requests'

const store = useStudentsStore()

const myStudents = computed(() => {
  return ['Выберите ученика', ...store.students]
})

onMounted(() => {
  store.getStudents()
})

const mainStudent = ref(null)
const comapredStudent = ref(null)

const mainStudentData = ref(null)

const comapredStudentsSelect = ref(null)

const comparedChartData = ref({})

const date = ref(getCurrentMonthDates())
const selectFullMonth = ref(false)
const selectedMonth = ref(new Date())
const studentAnalysis = ref(null)

const showAnalysis = computed(()=>{
  return mainStudent.value !== 'Выберите ученика'
})

const comapredStudents = computed(() => {
  if (mainStudent.value) {
    const compared = []
  store.students.forEach((student)=>{
    console.log(mainStudent.value.id)
    if(student.id != mainStudent.value.id) {
      compared.push(student)
    }
  })
  console.log(['Выберите ученика', ...compared])
  return ['Выберите ученика', ...compared]
} else {
  console.log('mainStudent is not defined');

}
return []

});

const transFormDateToValid = (date) =>{
  console.log( date.toISOString().split('T')[0])
  return date.toISOString().split('T')[0]
}

const mainStudentSelected = async (student) => {
  mainStudent.value = student
  if(student.id) {
    mainStudentData.value = await getStudentEarning(student.id, transFormDateToValid(date.value[0]), transFormDateToValid(date.value[1]))
  }
  if(comapredStudent.value) {
    comapredStudent.value = 'Выберите ученика'
    comapredStudentsSelect.value.selectSingle('Выберите ученика')
  }
}

const comparedStudentSelected = async (student) => {
  comapredStudent.value = student
  if(student.id) {
    const comparedStudentEarnings = await getStudentEarning(student.id,transFormDateToValid(date.value[0]), transFormDateToValid(date.value[1]))

    comparedChartData.value = [
      {label: mainStudent.value.student_name, data: transformStudentFinance(mainStudentData.value)},
      {label: student.student_name, data: transformStudentFinance(comparedStudentEarnings)},
    ]

    console.log(comparedChartData.value)
  }

}

function transformStudentFinance(data) {
  const dataArray = [
    data.total_lessons ?? 0,
    data.cancelled_count ?? 0,
     (data.cancelled_ratio ?? 0) * 100,
    (data.lost_earnings ?? 0) ,
    (data.earned_from_lessons ?? 0)
]
  return dataArray
}

function onMonthChange({ month, year }) {
  selectedMonth.value = new Date(year, month, 1)
}

function formatPercentage(value) {
  if (value === 'N/A' || value == null) {
    return '0%';
  }
  const number = parseFloat(value);
  if (isNaN(number)) {
    return '0%';
  }
  const sign = number > 0 ? '+' : (number < 0 ? '' : '');
  return `${sign}${number}%`;
}

function handleMonthCheckbox() {
  if (selectFullMonth.value) {
    const year = selectedMonth.value.getFullYear()
    const month = selectedMonth.value.getMonth()
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)
    date.value = [start, end]
  } else {
    date.value = null
  }
}

const loadData = async () => {
  studentAnalysis.value = await getStudentEarning()
}

const loadMainStudentData = async () => {
  if (mainStudent.value?.id && date.value?.length === 2) {
    mainStudentData.value = await getStudentEarning(
      mainStudent.value.id,
      transFormDateToValid(date.value[0]),
      transFormDateToValid(date.value[1])
    )
  }
}



onMounted(() => {
  loadMainStudentData()
})

watch(date, () => {
  loadMainStudentData()

  if (comapredStudent.value?.id) {
    comparedStudentSelected(comapredStudent.value)
  }
})
</script>
