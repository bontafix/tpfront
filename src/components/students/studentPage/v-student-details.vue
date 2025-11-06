<template>
  <div class="v-student-details">
    <div class="v-student-details__info">
      <h2 class="v-student-details__title custom-title">Детали об ученике</h2>
      <div class="v-student-details__form">
        <div class="v-student-details__info-column">
          <div class="v-student-details__info-field">
            <p class="v-student-details__info-subtitle">Имя ученика</p>
            <input type="text" class="custom-input" v-model="editedStudent.student_name" @input="checkChanges" placeholder="Имя ученика" />
          </div>
          <div class="v-student-details__info-field">
            <p class="v-student-details__info-subtitle">Источник</p>
            <input type="text" class="custom-input" v-model="editedStudent.source" @input="checkChanges" placeholder="Источник" />
          </div>
          <div class="v-student-details__info-field">
            <p class="v-student-details__info-subtitle">Цель занятий</p>
            <input type="text" class="custom-input" v-model="editedStudent.goal" @input="checkChanges" placeholder="Цель занятий" />
          </div>
          <div class="v-student-details__info-field">
            <p class="v-student-details__info-subtitle">Комиссия</p>
            <input type="text" class="custom-input" v-model="editedStudent.commission" @input="checkChanges" placeholder="Комиссия" />
          </div>
        </div>
        <div class="v-student-details__info-column">
          <div class="v-student-details__info-field">
            <p class="v-student-details__info-subtitle">Способ связи</p>
            <div class="v-student-details__info-type-connect">
              <input type="text" class="custom-input" v-model="editedStudent.phone_number" @input="checkChanges" maxlength="20" placeholder="Способ связи" />
              <v-styled-select
                v-if="typeConnectItems"
                :items="typeConnectItems"
                :default-value="getTypeConnectItem(editedStudent.type_connect)"
                @update:modelValue="onTypeConnectChange"
              />
            </div>
            <p>Контакты ученика указываются с его согласия и видны исключительно преподавателю.</p>
          </div>
          <div class="v-student-details__info-field">
            <p class="v-student-details__info-subtitle">Ставка</p>
            <div class="v-student-details__info-row">
              <input type="text" class="custom-input" v-model="editedStudent.rate" @input="checkChanges" placeholder="Ставка" />
              <v-styled-select
                :items="rateItems"
                :default-value="getTimeRateItem(timeRate)"
                @update:modelValue="onTimeRateChange"
              />
              <v-styled-select
                :items="currencyItems"
                :default-value="editedStudent.currency"
                @update:modelValue="(value) => checkChanges(value, 'currency')"
              />
            </div>
          </div>
          <div class="v-student-details__info-field">
            <p class="v-student-details__info-subtitle">Часовые пояса</p>
            <div class="v-student-details__info-row">
                <v-styled-select
                :default-value="getDefaultTimezone(editedStudent.timezone_id)"
                @update:model-value="(value) => checkChanges(value, 'timezone_id')"
                :items="timeZoneItems"/>
            </div>
          </div>
        </div>
      </div>
      <div class="v-student-details__info-field">
        <p class="v-student-details__info-subtitle">Комментарий</p>
        <textarea
          class="v-student-details__info-text"
          v-model="editedStudent.comment"
          @input="checkChanges"
          placeholder="Комментарий о ученике (виден только вам)"
        ></textarea>
      </div>
      <div class="flex justify-end">
        <button class="custom-btn blue" :class="{ unactive: !hasChanges }" @click="saveChanges">Сохранить изменения</button>
      </div>
    </div>
    <div class="v-student-details__side">
      <div class="v-student-details__side-block">
        <h2 class="v-student-details__title custom-title">Средств на счёте</h2>
        <input type="text" :value="student?.balance" class="custom-input" :class="{ red: student?.balance < 0 }" maxlength="20" readonly />
        <p class="caption">При ставке {{ student?.rate }} ₽ хватит на {{ futurelessons > 0 ? futurelessons : 0 }} занятия</p>
      </div>
      <div class="v-student-details__side-block">
        <h2 class="v-student-details__title custom-title">Реферальная ссылка</h2>
        <input type="text" :value="link" class="custom-input" readonly @click="copyLink" />
        <p class="caption">Ученику необходимо зарегистрироваться по вашей ссылке для синхронизации аккаунтов</p>
        <transition name="fade">
          <div class="copy-window" v-show="copyWindowOpen">Ссылка скопирована в буфер обмена</div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStudentsStore } from '@/stores/studentsStore'
import VStyledSelect from '@/components/generalComponents/v-styled-select.vue'


import { updateStudentProfile } from '@/api/requests'
import { formatTimeRate } from '@/utils'

const store = useStudentsStore()
const props = defineProps({
  student: Object,
})

const link = computed(()=>{
  const refCode = props.student?.teacher_ref_cod
  return `${window.origin}/link-profile/?ref_code=${refCode}` || 'У этого ученика нет реферального кода'
})
const copyWindowOpen = ref(false)
const currentStudent = ref({ ...props.student, comment: '' })
const editedStudent = ref({ ...props.student, comment: '' })

// ⏱ timeRate и формат
const timeRate = ref(editedStudent.value?.time_rate || 60)
const formattedTimeRate = computed(() => formatTimeRate(timeRate.value))



const onTimeRateChange = (value) => {
  const minutes = typeof value === 'object' ? value.value : parseInt(value)
  timeRate.value = minutes
  editedStudent.value.time_rate = minutes
  checkChanges(minutes, 'time_rate')
}

// Обработчик изменения типа связи
const onTypeConnectChange = (value) => {
  // Обновляем значение
  editedStudent.value.type_connect = value

  console.log(editedStudent.value)

}

// Селекты
const rateItems = computed(() => store.rate)
const currencyItems = computed(() => store.currency)
const typeConnectItems = computed(() => store.typeConnect)
const timeZoneItems = computed(() => store.timeZone)

// Функции для получения текущих значений селектов
const getTimeRateItem = (minutes) => {
  return rateItems.value.find((item) => item.value === minutes)
}

const getTypeConnectItem = (typeConnectValue) => {
  if (!typeConnectItems.value || !typeConnectValue) {
    return  {id: 3, text: '-'}
  }

  return typeConnectValue
}

// Изменения
const hasChanges = computed(() => {
  return Object.keys(currentStudent.value).some(
    (key) => currentStudent.value[key] !== editedStudent.value[key]
  )
})

const checkChanges = (value, key) => {
  if (key) {
    // Если передан конкретный ключ, используем его
    if (typeof value === 'object') {
      editedStudent.value[key] = value.value ?? value.id ?? value.text
    } else {
      editedStudent.value[key] = value
    }
  } else {
    // Для обычных input полей, где value приходит из события
    if (typeof value === 'object' && value.target) {
      // Это событие input
      const inputValue = value.target.value
      // Определяем поле по v-model (можно улучшить эту логику)
      // Пока оставим как есть, так как это работает для обычных input
    }
  }
}

// Будущие занятия
const futurelessons = computed(() => {
  const rate = props.student?.rate || 1
  const balance = props.student?.balance || 0
  return Math.floor(balance / rate) || 0
})

const copyLink = () => {
  navigator.clipboard.writeText(link.value).then(() => {
    copyWindowOpen.value = true
    setTimeout(() => (copyWindowOpen.value = false), 3000)
  })
}

const saveChanges = async () => {
  try {
    console.log('=== SAVING CHANGES ===')

    const filtered = Object.fromEntries(
      Object.entries(editedStudent.value).filter(([k, v]) => k !== 'undefined' && v !== undefined && v !== null)
    )
    filtered['student_id'] = String(editedStudent.value.id)
    console.log(editedStudent.value.type_connect, editedStudent.value)
    filtered['type_connect_id'] = editedStudent.value.type_connect?.id || 3
    filtered['currency_id'] = 1;
    delete filtered.currency
    delete filtered.type_connect
    if (!filtered.commission || filtered.commission === "") {
      filtered.commission = 0;
    }


    if(filtered)

    console.log('Filtered student data:', filtered)
    await updateStudentProfile(editedStudent.value.id, filtered)
    currentStudent.value = { ...editedStudent.value }

    console.log('Current student after save:', currentStudent.value)
  } catch (error) {
    console.error('Не удалось обновить профиль ученика:', error)
  }
}

const getDefaultTimezone = (timezone_id) => {
  if(!timezone_id) {
    return timeZoneItems.value.filter((timezone) => timezone.id === 16)[0]
  }
  return timeZoneItems.value.find(timezone => timezone.id === timezone_id)
}

// Watcher
watch(
  () => props.student,
  (newStudent) => {
    if (newStudent) {
      currentStudent.value = { ...newStudent, comment: newStudent.comment ?? '' }
      editedStudent.value = { ...newStudent, comment: newStudent.comment ?? '' }
      if (newStudent?.time_rate && newStudent.time_rate !== timeRate.value) {
        timeRate.value = newStudent.time_rate
      }
      console.log('Student updated, new type_connect:', newStudent.type_connect)
    }
  },
  { immediate: true, deep: true }
)

const loadData = () => {
  Promise.all([store.setTimezone(), store.setTypeConnects()])
}

// Дополнительный watcher для type_connect
watch(
  () => editedStudent.value.type_connect,
  (newValue, oldValue) => {
    console.log('type_connect changed from', oldValue, 'to', newValue)
  }
)

onMounted(() => {
  loadData()
})
</script>
