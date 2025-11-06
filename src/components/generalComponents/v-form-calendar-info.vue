<template>
  <form action="" class="v-form-calendar-info">
    <div class="v-form-calendar-info__row">
      <div class="modal-field col v-form-calendar-info__date" v-if="!removeDate">
        <div class="modal-field__title">Дата</div>
        <VueDatePicker
          class="custom-datepicker"
          :format="formatDay"
          :locale="'ru-ru'"
          v-model="date"
          :auto-apply="true"
        >
          <template #clear-icon="{ clear }"> </template>
        </VueDatePicker>
      </div>
      <div class="modal-field col time" v-if="!removeDate">
        <div class="modal-field__title">Время</div>
        <div class="time__row">
         <!--  <VueTimepicker
            @update:modelValue="handleTimeUpdate"
            v-model="timeInputs[1].start"
            placeholder="--:--"
            :clearable="false"
            :manual-input="true"
             :default-minute="0"
          /> -->
           <v-custom-timepicker   v-model="timeInputs[1].start" @update:modelValue="handleTimeUpdate" />
          <v-custom-timepicker v-model="timeInputs[1].end"/>
          <!-- <VueTimepicker
            v-model="timeInputs[1].end"
            :placeholder="timeInputs[1].end"
            :clearable="false"
          /> -->
        </div>
      </div>
    </div>


    <div class="periodicity" v-if="removeDate">
      <h2 class="periodicity__title title">Периодичность</h2>
      <ul class="periodicity__list">
        <li
          class="periodicity__list-item"
          :class="{ active: day.active }"
          v-for="day in periodicityDays"
          :key="day.id"
          @click="addDayToStack(day)"
        >
          {{ day.text }}
        </li>
      </ul>
    </div>
    <div class="modal-row" v-if="removeDate">
      <div class="modal-row__title">Повторять до</div>
      <div class="modal-row__block">
        <VueDatePicker
          class="datepicker"
          :format="formatDay"
          :locale="'ru-ru'"
          v-model="repeatUntill"
          :auto-apply="true"
        >
          <template #clear-icon="{ clear }"> </template>
        </VueDatePicker>
      </div>
    </div>
    <div class="modal-field col">
      <div class="flex items-center gap-3 mt-6">
        <div class="styled-checkbox">
          <input id="remind" type="checkbox" v-model="lessonReminder"/>
          <label for="remind"></label>
        </div>
        <label for="remind"> Напоминать о занятии </label>
      </div>
        <div class="custom-radio-container" v-if="lessonReminder">
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

  </form>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { changeTime, formatDay } from '@/utils'

/* timepicker */
import VueTimepicker from 'vue3-timepicker'
import 'vue3-timepicker/dist/VueTimepicker.css'

import vCustomTimepicker from './v-custom-timepicker.vue'

/* datepicker */
import '@vuepic/vue-datepicker/dist/main.css'
import VueDatePicker from '@vuepic/vue-datepicker'

const reminder = ref(0)
const break_group = ref(null)
const date = ref(new Date())
const nextDate = ref(new Date())
nextDate.value.setDate(date.value.getDate() + 1)
const repeatUntill = ref(new Date())
const costLesson = ref()
const lessonReminder = ref(false)

const emit = defineEmits(['formSubmited'])

const periodicityDays = ref([
  { id: 1, text: 'ПН', full_name: 'Понедельник', active: false, day_of_week: 1 },
  { id: 2, text: 'ВТ', full_name: 'Вторник', active: false, day_of_week: 2 },
  { id: 3, text: 'СР', full_name: 'Среда', active: false, day_of_week: 3 },
  { id: 4, text: 'ЧТ', full_name: 'Четверг', active: false, day_of_week: 4 },
  { id: 5, text: 'ПТ', full_name: 'Пятница', active: false, day_of_week: 5 },
  { id: 6, text: 'СБ', full_name: 'Суббота', active: false, day_of_week: 6 },
  { id: 7, text: 'ВС', full_name: 'Воскресенье', active: false, day_of_week: 7 },
])

const timeInputs = ref({
  1: {
    start: '00:00',
    end: '01:00',
  },
})
const today = new Date()
const submitForm = () => {
  if(timeInputs.value[1].start === '--:--' || timeInputs.value[1].end === '--:--') {
    alert('Заполните все поля формы!')
    return
  }

  const start_time = timeInputs.value[1].start;
  const end_time = timeInputs.value[1].end;

  let conductedDate;
  if (date.value) {
    if (date.value instanceof Date) {
      conductedDate = getTodayDate(date.value);
    } else {
      conductedDate = date.value;
    }
  } else {
    conductedDate = null;
  }

  let reminderTime;
  try {
    const reminderMinutes = lessonReminder.value ? (reminder.value || 0) : 0;

    const dateTimeString = `${conductedDate}T${start_time}:00`;
    const startDateTime = new Date(dateTimeString);

    if (isNaN(startDateTime.getTime())) {
      throw new Error('Invalid date');
    }

    startDateTime.setMinutes(startDateTime.getMinutes() - reminderMinutes);
    reminderTime = startDateTime.toISOString();
  } catch (error) {
    console.error('Ошибка при создании времени напоминания:', error);
    alert('Ошибка в дате или времени!');
    return;
  }

  const createdDate = getTodayDate(today);

  const lessonData = {
    day_of_week_id: date.value ? (date.value instanceof Date ? date.value.getDay() || 7 : new Date(date.value).getDay() || 7) : null,
    start_time: start_time + ':00.000Z',
    end_time: end_time + ':00.000Z',
    reminder_minutes: lessonReminder.value ? (reminder.value || 0) : 0,
    break_minutes: break_group.value || 0,
    amount_deducted: false,
    status: 'completed',
    conducted_date: conductedDate,
    created_date: createdDate,
    reminder_time: reminderTime,
    one_time: true,
    trial: true,
    paid: false,
    cost_lesson_one_time: 0,
    in_rule: false,
    time_zone_teacher: "Europe/Chisinau"
  }
  const criticalFields = ['start_time', 'end_time', 'conducted_date', 'reminder_time'];
  const isValid = criticalFields.every(field => lessonData[field] !== undefined && lessonData[field] !== null);

  if (isValid) {
    emit('formSubmited', lessonData)
  } else {
    alert('Заполните все поля формы!')
    console.error('Некоторые поля пустые или некорректные!', lessonData)
  }
}

function getTodayDate(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


const toggleRadio = (radio, value) => {
  const target = radio === 'reminder' ? reminder : break_group
  target.value = target.value === value ? null : value
}

const handleTimeUpdate = (newValue) => {
  const result = newValue.replace('mm', '00')
  timeInputs.value[1].start = result
  timeInputs.value[1].end = result
  changeTime(1, timeInputs.value)
}


const props = defineProps({
  removeDate: Boolean,
})

defineExpose({
  submitForm
})

onMounted(() => {
  console.log(props.removeDate)
})
</script>
