<template>
  <form @submit.prevent="submit">
    <div class="input-field">
      <input
        class="input-field__input"
        type="text"
        :placeholder="placeholder"
        v-model="inputValue"
      />
      <button type="submit" class="input-field__submit">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M7.99975 12.2424V3.75751M7.99975 3.75751L3.75732 7.99993M7.99975 3.75751L12.2422 7.99993"
            stroke="#717680"
            stroke-width="1.85556"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </form>
  <!-- <div class="add-field" ref="addFieldRef" v-click-outside="closeInputVisibility">
    <button class="add-field__button custom-btn light-blue" @click="toggleInputVisibility">
      Добавить
    </button>
    <div class="add-field__field" v-show="isVisible">
      <form method="POST" @submit.prevent="submit">
        <div class="add-field__block">
          <input
            class="add-field__input"
            type="text"
            :placeholder="placeholder"
            v-model="inputValue"
          />
          <button type="submit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
            >
              <rect width="28" height="28" rx="14" fill="#1D4ECC" />
              <path d="M14 6L14 22" stroke="white" stroke-width="2" stroke-linecap="round" />
              <path
                d="M13.6572 6L8.00037 11.6569"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M14 6L19.6569 11.6569"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path d="M14 18L14 22" stroke="white" stroke-width="2" stroke-linecap="round" />
              <path d="M14 18L14 22" stroke="white" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </form>
    </div> -->
  <!-- </div> -->
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Введите значение',
  },
})

const emit = defineEmits(['submit'])

const isVisible = ref(false)
const inputValue = ref('')
// const addFieldRef = ref(null)

// const toggleInputVisibility = () => {
//   isVisible.value = !isVisible.value
//   if (isVisible.value) {
//     nextTick(() => {
//       const input = document.querySelector('.add-field__input')
//       if (input) input.focus()
//     })
//   }
// }

// const closeInputVisibility = (event) => {
//   isVisible.value = false
// }

const submit = () => {
  if (inputValue.value.trim()) {
    emit('submit', inputValue.value.trim())
    inputValue.value = ''
    isVisible.value = false
  }
}
</script>
