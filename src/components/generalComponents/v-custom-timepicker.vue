<template>
  <div class="v-custom-timepicker">
    <input
      v-model="inputValue"
      @input="onInputChange"
      class="v-custom-timepicker__input"
      placeholder="HH:MM"
      @click="showDropdown = !showDropdown"
    />
    <div
      v-if="showDropdown"
      class="v-custom-timepicker__dropdown"
    >
      <div class="v-custom-timepicker__column v-custom-timepicker__column--left">
        <div
          v-for="h in 24"
          :key="h"
          @click="selectHour(h - 1)"
          class="v-custom-timepicker__option"
          :class="{ 'v-custom-timepicker__option--selected': selectedHour === h - 1 }"
        >
          {{ (h - 1).toString().padStart(2, '0') }}
        </div>
      </div>
      <div class="v-custom-timepicker__separator">
        :
      </div>
      <div class="v-custom-timepicker__column v-custom-timepicker__column--right">
        <div
          v-for="m in 60"
          :key="m"
          @click="selectMinute(m - 1)"
          class="v-custom-timepicker__option"
          :class="{ 'v-custom-timepicker__option--selected': selectedMinute === m - 1 }"
        >
          {{ (m - 1).toString().padStart(2, '0') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '00:00',
  },
})

const emit = defineEmits(['update:modelValue'])

const showDropdown = ref(false)
const selectedHour = ref(0)
const selectedMinute = ref(0)

// Синхронизируем inputValue с modelValue
const inputValue = ref(props.modelValue)

// Следим за внешним modelValue
watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal
  const match = newVal.match(/^(\d{1,2}):(\d{1,2})$/)
  if (match) {
    selectedHour.value = parseInt(match[1])
    selectedMinute.value = parseInt(match[2])
  }
})

// Следим за внутренним inputValue и уведомляем родителя
watch(inputValue, (newVal) => {
  emit('update:modelValue', newVal)
})

// При ручном вводе
const onInputChange = () => {
  let cleaned = inputValue.value.replace(/\D/g, '').slice(0, 4) // только цифры, максимум 4 символа
  if (cleaned.length >= 3) {
    const h = cleaned.slice(0, 2)
    const m = cleaned.slice(2)
    inputValue.value = `${h}:${m}`
  }

  const match = inputValue.value.match(/^(\d{2}):(\d{2})$/)
  if (!match) return

  const h = parseInt(match[1])
  const m = parseInt(match[2])
  if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
    selectedHour.value = h
    selectedMinute.value = m
    emit('update:modelValue', inputValue.value)
  }
}


// При выборе из списка
const updateInputValue = () => {
  inputValue.value = `${selectedHour.value.toString().padStart(2, '0')}:${selectedMinute.value.toString().padStart(2, '0')}`
}

const selectHour = (h) => {
  selectedHour.value = h
  updateInputValue()
}

const selectMinute = (m) => {
  selectedMinute.value = m
  if (selectedHour.value !== null) {
    updateInputValue()
    showDropdown.value = false
  }
}

</script>

<style scoped>
/* Прокрутка только внутри колонок */
::-webkit-scrollbar {
display: none;
}
::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 4px;
}
</style>
