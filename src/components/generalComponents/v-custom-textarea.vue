<template>
  <textarea
    ref="textarea"
    class="custom-textarea"
    :value="modelValue"
    :placeholder="placeholder"
    @input="updateValue"
    maxlength="1000"
  ></textarea>
</template>

<script setup>
import { ref, watch, nextTick, defineProps, defineEmits, onMounted } from 'vue'

const props = defineProps({
  modelValue: String,
  placeholder: String,
})

const emit = defineEmits(['update:modelValue'])

const textarea = ref(null)

const updateValue = (event) => {
  emit('update:modelValue', event.target.value)
  adjustHeight()
}

const adjustHeight = () => {
  nextTick(() => {
    if (textarea.value) {
      textarea.value.style.height = 'auto'
      textarea.value.style.height = `${textarea.value.scrollHeight}px`
    }
  })
}

watch(() => props.modelValue, adjustHeight)

onMounted(adjustHeight)
</script>

<style scoped></style>
