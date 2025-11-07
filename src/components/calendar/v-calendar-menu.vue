<template>
  <div class="v-calendar-menu">
    <div class="v-calendar-menu__top">
      <h1 class="text-title">Календарь</h1>
      <div class="v-calendar-menu__buttons">
        <div class="v-calendar-menu__button custom-btn white trial" @click="toggleModals('trial_lesson')">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.99984 4.16663V15.8333M4.1665 9.99996H15.8332"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          Пробное занятие
        </div>
        <div class="v-calendar-menu__button custom-btn blue lesson" @click="toggleModals('lessons')">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.99984 4.16663V15.8333M4.1665 9.99996H15.8332"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Занятие
        </div>
      </div>
    </div>
    <div class="v-calendar-menu__block">
      <div class="flex gap-2">
        <div class="v-calendar-menu__picker picker">
          <router-link
            :to="{ name: 'calendar-week' }"
            class="v-calendar-menu__picker-item picker__item"
            :class="{ active: type === 'calendar-week' }"
            @click="setViewType('calendar-week')"
            >Неделя</router-link
          >
          <router-link
            to="/calendar"
            class="v-calendar-menu__picker-item picker__item"
            :class="{ active: type === 'home' }"
            @click="setViewType('home')"
            >Месяц</router-link
          >
        </div>

        <div class="v-calendar-menu__select">
          <div class="v-calendar-menu__select-buttons">
            <div class="v-calendar-menu__select-button" @click.prevent="prevAction">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.20975 5.99989H2.42188M2.42188 5.99989L5.81581 9.39383M2.42188 5.99989L5.81581 2.60595"
                  stroke="#717680"
                  stroke-width="1.48444"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="v-calendar-menu__select-button">
              <VueDatePicker
                v-if="type === 'home'"
                class="v-calendar-menu__select-month"
                month-picker
                month-name-format="long"
                :locale="ru"
                :auto-apply="true"
                :format="formatMonth"
                v-model="monthInput"
                @update:model-value="onMonthSelect"
              >
                <template #clear-icon="{ clear }"> </template>
              </VueDatePicker>
              <VueDatePicker
                class="v-calendar-menu__select-week"
                v-if="type === 'calendar-week'"
                week-picker
                :format="formatWeek"
                :locale="'ru-ru'"
                :auto-apply="true"
                v-model="startDate"
                @update:model-value="onWeekSelect"
              >
                <template #clear-icon="{ clear }"> </template>
              </VueDatePicker>
              <div class="v-calendar-menu__select-button-image">
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1.5L6 6.5L11 1.5"
                    stroke="#717680"
                    stroke-width="1.66667"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div class="v-calendar-menu__select-button" @click.prevent="nextAction">
              <svg
                class="rotate-180"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.20975 5.99989H2.42188M2.42188 5.99989L5.81581 9.39383M2.42188 5.99989L5.81581 2.60595"
                  stroke="#717680"
                  stroke-width="1.48444"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
        <div class="v-calendar-menu__checkbox flex gap-2" v-if="isShowedBreak">
          <div class="flex items-center gap-2">
            <div class="v-calendar-menu__checkbox-subtitle">Показывать перерывы</div>
            <label class="switch">
            <input id="break" type="checkbox"  @change="changeBreakMode" v-model="showBreakInput">
              <span class="slider"></span>
            </label>
          </div>

        </div>
      </div>
      <!-- /* toggleModals('trial_lesson') */ -->
      <div class="v-calendar-menu__meanings flex">
        <div class="v-calendar-menu__meaning blue" @click="toggleModals('trial_lesson')">
          <div></div>
          Занятие
        </div>
        <div class="v-calendar-menu__meaning green" @click="toggleModals('lessons')">
          <div></div>
          Пробное занятие
        </div>
      </div>
    </div>
  </div>
  <div class="v-calendar-menu mob" v-if="isMobile.isMobile">
    <div class="v-calendar-menu__block">
      <div class="flex gap-2 items-center justify-center">
        <div class="v-calendar-menu__picker picker">
          <router-link
            :to="{ name: 'calendar-week' }"
            class="v-calendar-menu__picker-item picker__item"
            :class="{ active: type === 'calendar-week' }"
            @click="setViewType('calendar-week')"
            >Неделя</router-link
          >
          <router-link
            :to="{ name: 'home' }"
            class="v-calendar-menu__picker-item picker__item"
            :class="{ active: type === 'home' }"
            @click="setViewType('home')"
            >Месяц</router-link
          >
        </div>
      </div>
      <div class="v-calendar-menu__date flex items-center justify-center">
        <a class="v-calendar-menu__date-back" @click.prevent="prevAction">
          <img src="/src/assets/images/arrow-right-finance.svg" alt="">
        </a>
        <h3 class="v-calendar-menu__date-text" v-if="type == 'calendar-week'">
          {{ weekStart }} - {{ weekEnd }}
        </h3>
        <div v-if="type == 'home'">
          <h3 class="v-calendar-menu__date-text">{{ selectedMonthName }} {{ selectedYear }}</h3>
        </div>
        <a class="v-calendar-menu__date-next" @click.prevent="nextAction">
          <img src="/src/assets/images/arrow-right-finance.svg" alt="">
        </a>
      </div>
      <div class="v-calendar-menu__meanings flex">
        <div class="v-calendar-menu__meaning blue" @click="toggleModals('trial_lesson')">
          <div></div>
          Занятие
        </div>
        <div class="v-calendar-menu__meaning green" @click="toggleModals('lessons')">
          <div></div>
          Пробное занятие
        </div>
      </div>
    </div>
  </div>
  <transition name="fade">
    <v-lesson-modal v-if="modals.lessons" @close="toggleModals('lessons')" />
  </transition>
  <transition name="fade">
    <v-trial-modal v-if="modals.trial_lesson" @close="toggleModals('trial_lesson')" />
  </transition>
</template>

<script setup>
import vTrialModal from '../modals/v-trial-modal.vue'
import vLessonModal from '../modals/v-lesson-modal.vue'

import {
  formatWeek,
  formatMonth,
  getMonthByIndex,
  transformDate,
  formatDay,
  formatDate,
  getNextMonday,
} from '@/utils'

import '@vuepic/vue-datepicker/dist/main.css'
import VueDatePicker from '@vuepic/vue-datepicker'

import { ru } from 'date-fns/locale';
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, computed, nextTick, watch } from 'vue'

import { useIsMobile } from '@/composables/useIsMobile'

const emit = defineEmits([
  'toggleBreakMode',
  'setMonth',
  'setWeek',
  'paginateMonth',
  'paginateWeek',
])

const showBreakInput = ref(localStorage.getItem('breakMode'))
const startDate = ref(null)
const monthInput = ref()

const today = new Date()
const selectedMonth = ref(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`)
const selectedYear = ref(selectedMonth.value.slice(0, 4))
const selectedMonthName = ref()

const isTablet = useIsMobile(768)
const isMobile = useIsMobile(480)

const weekStart = ref()
const weekEnd = ref()

const router = useRouter()
const route = useRoute()

const props = defineProps({
  isShowedBreak: {
    type: Boolean,
    required: false,
  },
  type: {
    type: String,
    required: true,
  },
})

const modals = ref({
  lessons: false,
  trial_lesson: false,
})

/* ================================== Вспомогательные функции ================================== */

/**
 * Получает понедельник для заданной даты
 */
const getMondayOfWeek = (date = new Date()) => {
  const currentDate = new Date(date);
  const dayOfWeek = currentDate.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Воскресенье = 0

  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() - daysToSubtract);
  monday.setHours(0, 0, 0, 0);

  return monday;
};

/**
 * Форматирует дату в формат dd.mm.yyyy
 */
const formatDateForUrl = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.error('Invalid date for formatting:', date);
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

/**
 * Парсит дату из формата dd.mm.yyyy
 */
const parseDateFromUrl = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  const dateParts = dateString.split('.');
  if (dateParts.length !== 3) {
    return null;
  }

  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // 0-индексированный месяц
  const year = parseInt(dateParts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return null;
  }

  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? null : date;
};

/* ================= Для месяца ================= */

const updateQueryParam = () => {
  const month = selectedMonth.value.split('-')[1]
  const year = selectedMonth.value.split('-')[0]

  const query = {
    ...route.query,
    selected_date: `${month}.${year}`,
  }

  router.push({ query })
}

const paginateMonth = (type) => {
  let month = parseInt(selectedMonth.value.split('-')[1])
  let year = parseInt(selectedMonth.value.split('-')[0])

  if (type == 'next') {
    if (month === 12) {
      month = 1
      year += 1
    } else {
      month += 1
    }
  } else if (type === 'prev') {
    if (month === 1) {
      month = 12
      year -= 1
    } else {
      month -= 1
    }
  }

  selectedMonthName.value = getMonthByIndex(month - 1)
  selectedMonth.value = `${year}-${String(month).padStart(2, 0)}`
  monthInput.value = { month: month - 1, year }

  emit('paginateMonth', { month, year })
  updateQueryParam()
}

/* ================= Для недели ================= */

const updateQueryParamWeek = async (dateString) => {
  const query = {
    ...route.query,
    start_date: dateString,
  }
  await router.push({ query })
}

const paginateWeek = async (type) => {
  console.log('paginateWeek called with type:', type);
  console.log('Current startDate.value:', startDate.value);

  // Инициализируем startDate если он не установлен
  if (!startDate.value || !Array.isArray(startDate.value) || startDate.value.length === 0 || !startDate.value[0]) {
    console.warn('startDate is not properly initialized, initializing with current week');
    const today = new Date();
    const monday = getMondayOfWeek(today);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    startDate.value = [monday, sunday];
    console.log('Initialized startDate.value:', startDate.value);
  }

  // Получаем текущую дату начала недели
  let currentStartDate;
  if (startDate.value[0] instanceof Date) {
    currentStartDate = new Date(startDate.value[0]);
  } else {
    console.error('startDate[0] is not a Date object:', startDate.value[0]);
    return;
  }

  // Проверяем валидность даты
  if (isNaN(currentStartDate.getTime())) {
    console.error('Invalid date in startDate:', currentStartDate);
    return;
  }

  console.log('Valid currentStartDate:', currentStartDate);

  // Добавляем или вычитаем неделю
  const daysToAdd = type === 'next' ? 7 : -7;
  const newStartDate = new Date(currentStartDate);
  newStartDate.setDate(currentStartDate.getDate() + daysToAdd);

  console.log('New start date after adding', daysToAdd, 'days:', newStartDate);

  // Создаем конечную дату недели (воскресенье)
  const newEndDate = new Date(newStartDate);
  newEndDate.setDate(newStartDate.getDate() + 6);

  console.log('New week range:', newStartDate, 'to', newEndDate);

  // Обновляем startDate
  startDate.value = [newStartDate, newEndDate];

  // Форматируем дату для URL
  const formattedStartDate = formatDateForUrl(newStartDate);
  console.log('Formatted date for URL:', formattedStartDate);

  if (!formattedStartDate) {
    console.error('Failed to format date for URL');
    return;
  }

  try {
    await updateQueryParamWeek(formattedStartDate);
    updateWeekFromUrl();
    emit('paginateWeek');
    console.log('Week pagination completed successfully');
  } catch (error) {
    console.error('Error updating week:', error);
  }
};

const onWeekSelect = (modelData) => {
  console.log('onWeekSelect called with:', modelData);
  if (modelData && Array.isArray(modelData) && modelData.length >= 1) {
    startDate.value = modelData;
    const startDateStr = modelData[0].toLocaleDateString('ru-RU');
    emit('setWeek', startDateStr);
  }
}

const updateWeekFromUrl = () => {
  const queryParams = route.query;

  if (!queryParams.start_date) {
    console.warn('No start_date in query params');
    return;
  }

  try {
    console.log('Parsing start_date from URL:', queryParams.start_date);

    const parsedDate = parseDateFromUrl(queryParams.start_date);

    if (!parsedDate) {
      console.error('Failed to parse date from URL:', queryParams.start_date);
      return;
    }

    console.log('Parsed date:', parsedDate);

    const options = { day: 'numeric', month: 'long' };

    // Формируем дату начала недели
    weekStart.value = parsedDate.toLocaleDateString('ru-RU', options);

    // Создаем дату конца недели (добавляем 6 дней)
    const endDate = new Date(parsedDate);
    endDate.setDate(parsedDate.getDate() + 6);
    weekEnd.value = endDate.toLocaleDateString('ru-RU', options);

    // Устанавливаем startDate для выбора недели
    startDate.value = [parsedDate, endDate];

    console.log('Updated week display:', weekStart.value, '-', weekEnd.value);
    console.log('Updated startDate.value:', startDate.value);
  } catch (error) {
    console.error('Error updating week from URL:', error);
  }
};

const checkWeek = () => {
  const queryParams = route.query;

  if (!queryParams.start_date) {
    console.log('No start_date in query, setting current week');
    // Если нет параметра в URL, устанавливаем текущую неделю
    const today = new Date();
    const monday = getMondayOfWeek(today);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Устанавливаем startDate для VueDatePicker
    startDate.value = [monday, sunday];

    // Обновляем отображение недели
    const options = { day: 'numeric', month: 'long' };
    weekStart.value = monday.toLocaleDateString('ru-RU', options);
    weekEnd.value = sunday.toLocaleDateString('ru-RU', options);

    const formattedDate = formatDateForUrl(monday);
    if (formattedDate) {
      updateQueryParamWeek(formattedDate);
    }
    return;
  }

  updateWeekFromUrl();
};

/* ================= Общие ================= */

const setDateFromUrl = () => {
  if (props.type === 'home') {
    checkMonth();
  } else if (props.type === 'calendar-week') {
    checkWeek();
  }
}

// Добавляем watcher для отслеживания изменения типа просмотра
const initializeDatePicker = () => {
  if (props.type === 'calendar-week') {
    // Если startDate не инициализирован, устанавливаем текущую неделю
    if (!startDate.value || !Array.isArray(startDate.value) || startDate.value.length === 0) {
      const queryParams = route.query;

      if (queryParams.start_date) {
        // Если есть дата в URL, используем её
        updateWeekFromUrl();
      } else {
        // Иначе устанавливаем текущую неделю
        const today = new Date();
        const monday = getMondayOfWeek(today);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        startDate.value = [monday, sunday];

        const options = { day: 'numeric', month: 'long' };
        weekStart.value = monday.toLocaleDateString('ru-RU', options);
        weekEnd.value = sunday.toLocaleDateString('ru-RU', options);

        console.log('Initialized week picker with current week:', startDate.value);
      }
    }
  } else if (props.type === 'home') {
    checkMonth();
  }
}

const toggleModals = (modalName) => {
  modals.value[modalName] = !modals.value[modalName]
}

const changeBreakMode = () => {
  emit('toggleBreakMode')
}

const onMonthSelect = (modelData) => {
  monthInput.value = modelData
  selectedMonth.value = `${modelData.year}-${String(modelData.month + 1).padStart(2, '0')}`

  emit('setMonth', modelData)
}

const checkMonth = () => {
  if (route.query.selected_date) {
    const [month, year] = route.query.selected_date.split('.').map(Number)
    selectedMonthName.value = getMonthByIndex(month - 1)

    if (!isNaN(month) && !isNaN(year)) {
      monthInput.value = { month: month - 1, year: year }
    }
  } else {
    const month = new Date().getMonth()
    const year = new Date().getFullYear()
    selectedMonthName.value = getMonthByIndex(month)

    monthInput.value = { month: month, year: year }
  }
}

const checkIsModalFromUrl = () => {
  if (route.query['modal'] === 'modal_add') {
    modals.value.lessons = true
    const { modal, ...newQuery } = route.query
    router.replace({ query: newQuery })
  }
}

const setViewType = (viewType) => {
  localStorage.setItem('activePage', viewType)
  console.log('Switching to view type:', viewType)

  // Сначала переходим по роуту
  router.push({ name: viewType }).then(() => {
    // После успешного перехода инициализируем датапикер
    nextTick(() => {
      if (viewType === 'calendar-week') {
        // Для недельного просмотра проверяем startDate
        if (!startDate.value || !Array.isArray(startDate.value) || startDate.value.length === 0) {
          const today = new Date();
          const monday = getMondayOfWeek(today);
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);

          startDate.value = [monday, sunday];
          console.log('Set default week for picker:', startDate.value);
        }
      }
    });
  });
}

// Computed свойства для действий навигации
const nextAction = computed(() => {
  return props.type === 'home' ? () => paginateMonth('next') : () => paginateWeek('next')
})

const prevAction = computed(() => {
  return props.type === 'home' ? () => paginateMonth('prev') : () => paginateWeek('prev')
})

onMounted(() => {
  console.log('Component mounted, type:', props.type);
  initializeDatePicker();
  checkIsModalFromUrl();
})

// Отслеживаем изменение типа просмотра
watch(() => props.type, (newType, oldType) => {
  console.log('View type changed from', oldType, 'to', newType);

  // Небольшая задержка для корректной работы с роутером
  nextTick(() => {
    initializeDatePicker();
  });
}, { immediate: false })

// Отслеживаем изменения в URL для недельного просмотра
watch(() => route.query.start_date, (newStartDate, oldStartDate) => {
  if (props.type === 'calendar-week' && newStartDate !== oldStartDate) {
    console.log('start_date changed in URL:', newStartDate);
    if (newStartDate) {
      updateWeekFromUrl();
    } else {
      // Если start_date удалился из URL, устанавливаем текущую неделю
      initializeDatePicker();
    }
  }
}, { immediate: false })
</script>
