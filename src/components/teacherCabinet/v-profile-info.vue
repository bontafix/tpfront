<template>
  <div class="v-profile-info styled-section">
    <h2 class="v-profile-info__title">
      Информация о профиле
    </h2>
    <div class="v-profile-info__column">
      <label class="v-profile-info__subtitle">
        Часовой пояс
      </label>
      <v-styled-select
        v-if="timeZoneItems"
        :items="timeZoneItems"
        :default-value="defaultTimezone"
        v-model="currentTimezone"
        @update:model-value="timeZoneSelected"
      />
    </div>
    <div class="v-profile-info__column">
      <label class="v-profile-info__subtitle">
        ФИО
      </label>
      <input
        class="custom-input"
        type="text"
        placeholder="Как к вам обращаются ученики"
        v-model="profileData.name"
      >
    </div>
    <div class="v-profile-info__column">
      <label class="v-profile-info__subtitle">
        Предмет
      </label>
      <v-styled-select
        v-if="subjects"
        :items="subjects"
        :default-value="defaultSubject"
        v-model="currentSubject"
        @update:model-value="subjectSelected"
      />
    </div>
    <div class="v-profile-info__column">
      <label class="v-profile-info__subtitle">
        Номер телефона для связи
      </label>
      <input
        class="custom-input"
        type="text"
        placeholder="Номер телефона"
        v-model="profileData.phone_number"
      >
    </div>
    <div class="v-profile-info__button">
      <button
        class="custom-btn blue"
        :class="{ unactive: !hasChanges }"
        @click="submitForm"
      >
        Сохранить изменения
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useMyStore } from '@/stores/myStore';
import vStyledSelect from '../generalComponents/v-styled-select.vue';
import { updateTeacherProfile } from '@/api/requests';

import { useStudentsStore } from '@/stores/studentsStore';

const props = defineProps({
  studentInfo: {
    type: Object,
    required: true
  },
  subjects: {
    type: Array,
    required: true
  }
})

const store = useStudentsStore()

const originalData = ref({})
const profileData = ref({})
const currentSubject = ref(null)
const currentTimezone = ref(null)
const isInitialized = ref(false)

const defaultSubject = computed(() => {
  if (!props.subjects || !props.studentInfo?.subject_id) return null
  return props.subjects.find(subject => subject.id == props.studentInfo.subject_id) || null
})

const defaultTimezone = computed(() => {
  if (!timeZoneItems.value || !props.studentInfo?.timezone_utc_id) return null
  return timeZoneItems.value.find(timezone => timezone.id == props.studentInfo.timezone_utc_id) || null
})

const timeZoneItems = computed(() => {
  return store.timeZone
})

// Утилитарные функции
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  return JSON.parse(JSON.stringify(obj))
}

const objectsEqual = (obj1, obj2) => {
  if (!obj1 || !obj2) return false

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  return keys1.every(key => obj1[key] === obj2[key])
}

// Инициализация данных
const initializeData = (data) => {
  if (!data || !data.name || typeof data.phone_number === 'undefined') return

  const cleanData = {
    name: data.name || '',
    phone_number: data.phone_number || '',
    subject_id: data.subject_id || null,
    timezone_id: data.timezone_id || null
  }

  originalData.value = deepClone(cleanData)
  profileData.value = deepClone(cleanData)
  currentSubject.value = defaultSubject.value
  currentTimezone.value = defaultTimezone.value
  isInitialized.value = true
}

// Отслеживание изменений в props
watch(() => props.studentInfo, (newInfo, oldInfo) => {
  console.log('studentInfo changed:', newInfo)

  if (!newInfo) return

  // Инициализируем только если данные действительно изменились или это первая загрузка
  if (!isInitialized.value || !objectsEqual(newInfo, oldInfo)) {
    initializeData(newInfo)
  }
}, { immediate: true, deep: true })

const hasChanges = computed(() => {
  if (!isInitialized.value || !originalData.value || !profileData.value) {
    return false
  }

  const changes = !objectsEqual(originalData.value, profileData.value)

  // Отладочная информация
  if (changes) {
    console.log('Обнаружены изменения:')
    Object.keys(originalData.value).forEach(key => {
      if (originalData.value[key] !== profileData.value[key]) {
        console.log(`${key}: "${originalData.value[key]}" -> "${profileData.value[key]}"`)
      }
    })
  }

  return changes
})

const subjectSelected = (subject) => {
  if (subject && subject.id) {
    profileData.value.subject_id = subject.id
    currentSubject.value = subject
  }
}

const timeZoneSelected = (timezone) => {
  if (timezone && timezone.id) {
    profileData.value.timezone_utc_id = timezone.id
    currentTimezone.value = timezone
  }
}

const submitForm = async () => {
  try {
    console.log('Отправка данных:', profileData.value)

    if (!hasChanges.value) {
      console.log('Нет изменений для сохранения')
      return
    }

    await updateTeacherProfile(profileData.value)

    // Обновляем исходные данные после успешного сохранения
    originalData.value = deepClone(profileData.value)

    console.log('Данные успешно сохранены')
  } catch (error) {
    console.error('Ошибка при сохранении:', error)
  }
}

const resetChanges = () => {
  profileData.value = deepClone(originalData.value)
  currentSubject.value = defaultSubject.value
  currentTimezone.value = defaultTimezone.value
}

onMounted(() => {
  store.setTimezone()
})

defineExpose({
  resetChanges,
  hasChanges
})
</script>
