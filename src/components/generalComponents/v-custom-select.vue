<template>
  <div class="v-custom-select">
    <div class="v-custom-select__block" @click="isMenuOpen = !isMenuOpen">
      <input type="text" v-model="selected" readonly />
      <div v-if="!isMenuOpen">
        <img src="../../assets/images/arrow-down-night.svg" class="night-el" alt="" />
        <img src="../../assets/images/arrow-down.svg" class="day-el" alt="" />
      </div>
      <div v-else>
        <img src="../../assets/images/arrow-up-night.svg" class="night-el" alt="" />
        <img src="../../assets/images/arrow-up.svg" class="day-el" alt="" />
      </div>
    </div>
    <ul class="v-custom-select__list scroll-container" v-if="isMenuOpen">
      <li
        class="v-custom-select__list-item"
        v-for="option in options"
        :key="option.id"
        @click="setOption(option)"
      >
        {{ option.student_name }}
      </li>
    </ul>
  </div>
</template>
<script setup>
import { ref } from 'vue'

const props = defineProps({
  options: Object,
})
const isMenuOpen = ref(false)
const emit = defineEmits(['valueSelected'])

const setOption = (option) => {
  selected.value = option.student_name
  isMenuOpen.value = false
  emit('valueSelected', option)
}
const selected = ref(props.options.default)
</script>
