<template>
  <div
    class="modal-overlay"
    @click="close"
    :class="{ unActive: isSecondOrMoreModal && index + 1 == store.modals_count }"
  >
    <div @click.stop class="modal-inner">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useModalsStore } from '@/stores/modalsStore'

const store = useModalsStore()

const index = store.modals_count

const props = defineProps({
  show: {
    type: Boolean,
    default: null,
  },
  id: {
    type: String,
  },
})

const emit = defineEmits(['close', 'submit'])

// Вычисляем, является ли эта модалка второй или последующей
const isSecondOrMoreModal = computed(() => store.modals_count > 1)

const close = () => {
  emit('close', props.id)
  store.decrement()
}

const submitForm = () => {
  emit('submit')
}

defineExpose({
  close,
})

onMounted(() => {
  store.increment()
})
</script>

<style scoped>
.modal-overlay.unActive {
  background: transparent;
}

.modal-overlay:has(.top) {
  align-items: start;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
