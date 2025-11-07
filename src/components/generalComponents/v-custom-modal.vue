<template>
  <div
    ref="observerTarget"
    class="modal-overlay custom"
    @click="close"
    :class="{ unActive: !isFirstModal }"
  >
    <div @click.stop class="modal-inner" @keyup.esc="close">
      <div>
        <slot name="modal"></slot>

        <div class="flex gap-3 mt-6" v-show="!hideButtons">
          <slot name="cancelButton">
            <button class="custom-btn white" @click="close">Отменить</button>
          </slot>

          <slot name="button">
            <button
              class="custom-btn blue"
              :class="isSaveButtonDisabled && 'button-disabled-modal'"
              @click="submitForm"
              :disabled="isSaveButtonDisabled"
            >
              Сохранить
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useModalsStore } from '@/stores/modalsStore'

const store = useModalsStore()
const observerTarget = ref(null)
let observer = null
let wasVisible = false

const props = defineProps({
  id: {
    type: String,
    required: false,
  },
  hideButtons: {
    type: Boolean,
    default: false,
  },
  isSaveButtonDisabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'submit'])

const isFirstModal = computed(() => store.isFirstModal(props.id))

const close = () => {
  emit('close', props.id)
  store.decrement(props.id)
  console.log('Закрыли', props.id, store.modals)
}

const submitForm = () => {
  emit('submit')
}

defineExpose({
  close,
  submitForm,
})

const observeVisibility = (entries) => {
  entries.forEach((entry) => {
    const isVisible = entry.isIntersecting

    if (isVisible && !wasVisible) {
      store.increment(props.id)
      console.log('Открыли', props.id, store.modals)
      wasVisible = true
    } else if (!isVisible && wasVisible) {
      store.decrement(props.id)
      console.log('Закрыли', props.id, store.modals)
      wasVisible = false
    }
  })
}

onMounted(() => {
  observer = new IntersectionObserver(observeVisibility, { threshold: 0.1 })
  if (observerTarget.value) {
    observer.observe(observerTarget.value)
  }
})

onUnmounted(() => {
  if (observerTarget.value && observer) {
    observer.unobserve(observerTarget.value)
  }
  store.decrement(props.id) // защита от внезапного размонтирования
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

.button-disabled-modal {
  opacity: 0.4;
  cursor: auto;
}
</style>
