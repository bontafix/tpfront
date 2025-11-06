<template>
  <div class="v-stable-form">
    <div class="periodicity">
      <ul class="periodicity__list">
        <li
          class="periodicity__list-item"
          :class="{ active: day.active }"
          v-for="day in periodicityDays"
          :key="day.id"
          @click="togglePeriodicity(day)"
        >
          {{ day.text }}
        </li>
      </ul>
      <div class="periodicity__container">
        <div class="periodicity__row" v-for="item in periodicityStack" :key="item.id">
          <h4 class="periodicity__row-title">{{ item.full_name }}</h4>
          <div class="time">
            <div class="time__block modal-row__block" v-if="timeInputs[item.id]">
              <VueTimepicker
                @update:modelValue="(modelValue) => handleTime(modelValue, item.id)"
                v-model="timeInputs[item.id].start"
                placeholder="--:--"
                :clearable="false"
              />
              <VueTimepicker
                v-model="timeInputs[item.id].end"
                @update:modelValue="(modelValue) => handleTimeEnd(modelValue, item.id)"
                :placeholder="timeInputs[item.id].end"
                :clearable="false"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-field row">
      <div class="modal-field__title mr-12">Повторять до</div>
      <div class="modal-field__date">
        <VueDatePicker
          class="custom-datepicker"
          :format="formatDay"
          :locale="'ru-ru'"
          v-model="repeatUntill"
          :auto-apply="true"
        >
          <template #clear-icon="{ clear }"> </template>
        </VueDatePicker>
      </div>
    </div>
  <div class="modal-field col" v-if="!props.ruleData">
      <div class="flex items-center gap-3 my-6">
        <div class="styled-checkbox">
          <input id="remind" v-model="remind" type="checkbox"/>
          <label for="remind"></label>
        </div>
        <label for="remind"> Напоминать о занятии </label>
      </div>
        <div class="custom-radio-container" v-if="remind">
        <div class="custom-radio" v-for="value in [5, 10, 15]" :key="value">
          <input
            :id="'reminder-' + value"
            type="radio"
            name="reminder"
            :value="value"
            :checked="reminder === value"
            @click="toggleRadio('reminder', value)"
          />

          <label :for="'reminder-' + value">за {{ value }} минут </label>
        </div>
      </div>

    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'

/* Импорт компонентов */
import VueTimepicker from 'vue3-timepicker'
import 'vue3-timepicker/dist/VueTimepicker.css'
import '@vuepic/vue-datepicker/dist/main.css'
import VueDatePicker from '@vuepic/vue-datepicker'

import { formatDay } from '@/utils'

/* -------------------- Переменные -------------------- */
const emit = defineEmits(['formSubmited'])

/* Переменные состояния */
const remind = ref(false)
const periodicityStack = ref([]) // Стек выбранных дней
const reminder = ref(0) // Напоминание за (минуты)
const break_group = ref(null) // Перерыв после (минуты)
const repeatUntill = ref(new Date()) // Дата окончания повторения

const timeInputs = ref({}) // Время для каждого дня
const periodicityDays = ref([
  // Дни недели
  { id: 1, text: 'ПН', full_name: 'Понедельник', active: false, day_of_week: 1 },
  { id: 2, text: 'ВТ', full_name: 'Вторник', active: false, day_of_week: 2 },
  { id: 3, text: 'СР', full_name: 'Среда', active: false, day_of_week: 3 },
  { id: 4, text: 'ЧТ', full_name: 'Четверг', active: false, day_of_week: 4 },
  { id: 5, text: 'ПТ', full_name: 'Пятница', active: false, day_of_week: 5 },
  { id: 6, text: 'СБ', full_name: 'Суббота', active: false, day_of_week: 6 },
  { id: 7, text: 'ВС', full_name: 'Воскресенье', active: false, day_of_week: 7 },
])

const stableForm = ref({}) // Данные формы для отправки

const props = defineProps({
  ruleData: {
    type: Object,
    required: false,
  },
})

const daysOfWeek = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
const fullDaysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']

/* -------------------- Методы -------------------- */
const saveRuleData = () => {
  if (!props.ruleData || !props.ruleData.days_of_week) return

  periodicityStack.value = []
  periodicityDays.value.forEach((day) => (day.active = false)) // Сброс активности

  Object.entries(props.ruleData.days_of_week).forEach(([dayStr, timeArray]) => {
    const dayNum = Number(dayStr)
    const time = timeArray[0] // Берем первый временной интервал

    const obj = {
      id: dayNum,
      text: daysOfWeek[dayNum - 1],
      full_name: fullDaysOfWeek[dayNum - 1],
      active: true,
      dayOfWeek: dayNum,
    }

    // Обновляем список дней
    const targetDay = periodicityDays.value.find((d) => d.day_of_week === dayNum)
    if (targetDay) targetDay.active = true

    // Обновляем `timeInputs`
    timeInputs.value[dayNum] = {
      start: time.start_time || '--:--',
      end: time.end_time || '--:--',
    }

    periodicityStack.value.push(obj)
  })

  // Обновляем дату повторения
  repeatUntill.value = props.ruleData.repeat_until
    ? new Date(props.ruleData.repeat_until)
    : new Date()
}

/* Добавление/удаление дня из стека */
const addDayToStack = (day) => {
  if (day.active) {
    // Удалить день из стека
    const index = periodicityStack.value.findIndex((item) => item.id === day.id)
    if (index !== -1) {
      periodicityStack.value.splice(index, 1)
    }
    day.active = false
    delete timeInputs.value[day.id]
  } else {
    // Добавить день в стек
    periodicityStack.value.push(day)
    periodicityStack.value.sort((a, b) => a.id - b.id)
    day.active = true
    timeInputs.value[day.id] = { start: '--:--', end: '--:--' }
  }
}

/* обновление времени конца */
const handleTimeEnd = (modelValue, id) => {
  timeInputs.value[id].end = modelValue
}

/* Обработчик отправки формы */
const submitForm = () => {
  const upd = props.ruleData ? 'updated_' : ''
  stableForm.value[upd + 'days_of_week'] = []
  stableForm.value[upd + 'start_times'] = []
  stableForm.value[upd + 'end_times'] = []
  stableForm.value['reminder_minutes'] = reminder.value || 0
  stableForm.value['break_minutes'] = break_group.value || 0

  periodicityStack.value.forEach((el) => {
    stableForm.value[upd + 'days_of_week'].push(el.id)

    const startTime = timeInputs.value[el.id].start
    const endTime = timeInputs.value[el.id].end

    // Добавление ведущего нуля для времени
    const formattedStartTime = startTime.split(':')
    const formattedEndTime = endTime.split(':')

    const formattedStart = `${String(formattedStartTime[0]).padStart(2, '0')}:${String(formattedStartTime[1]).padStart(2, '0')}`
    const formattedEnd = `${String(formattedEndTime[0]).padStart(2, '0')}:${String(formattedEndTime[1]).padStart(2, '0')}`

    // Создание даты с правильным временем
    const TimeStringStart = `${formattedStart}:00.000Z`
    const TimeStringEnd = `${formattedEnd}:00.000Z`

    stableForm.value[upd + 'start_times'].push(TimeStringStart)
    stableForm.value[upd + 'end_times'].push(TimeStringEnd)
    stableForm.value['repeat_until'] = new Date(repeatUntill.value).toISOString().split('T')[0]
  })

  emit('formSubmited', stableForm.value)
}

/* Обработчик изменения времени */
const changeTime = (id) => {
  const currentTime = timeInputs.value[id].start.split(':')
  const hour = parseInt(currentTime[0]) + 1
  const minutes = currentTime[1]
  const endTime = `${hour}:${minutes}`
  timeInputs.value[id].end = endTime
}

/* Установка даты окончания повторения */
const setDate = (day) => {
  const currentDate = new Date()
  const dayOfWeek = currentDate.getDay()
  const difference = day.day_of_week - dayOfWeek

  if (difference > 0) {
    currentDate.setDate(currentDate.getDate() + difference + 1)
  } else {
    currentDate.setDate(currentDate.getDate() + difference + 8)
  }

  const formattedDate = currentDate.toISOString().split('T')[0]
  if (!maxDate || maxDate < formattedDate) {
    repeatUntill.value = formattedDate
    maxDate = formattedDate
  }
}

let maxDate = null // Максимальная дата для повторения

/* Переключатель радиокнопок */
const toggleRadio = (radio, value) => {
  const target = radio === 'reminder' ? reminder : break_group
  target.value = target.value === value ? null : value
}

/* Переключение активности дня */
const togglePeriodicity = (day) => {
  addDayToStack(day)
  setDate(day)
}

/* Обработчик времени в VueTimepicker */
const handleTime = (modelValue, id) => {
  timeInputs.value[id].start = modelValue
  changeTime(id)
}

defineExpose({
  submitForm
})

onMounted(() => {
  saveRuleData()
})
</script>
