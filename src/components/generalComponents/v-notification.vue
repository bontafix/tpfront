<template>
  <transition name="fade">
    <div v-if="show" class="notification" :class="type">{{ message }}</div>
  </transition>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import emitter from '@/eventBus'

const show = ref(false)
const message = ref('')
const type = ref('success')

onMounted(() => {
  emitter.on('notify', ({ type: t, message: m }) => {
    type.value = t
    message.value = m
    show.value = true

    console.log('Уведомление пришло')

    setTimeout(() => {
      show.value = false
    }, 3000)
  })
})
</script>

<style scoped>
.notification {
  position: fixed;
  top: 40px;
  right: 50%;
  transform: translate(50%, 0);
  padding: 20px 20px;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  z-index: 9999;
  transition: opacity 0.3s;
  border-radius: 16px;
  opacity: .7;
}
.notification.success {
  background: #E7FFEB;
  color: #258D50;
  border: 1px solid #258D50;
}
.notification.error {
  background: #FFF3F0;
  color: #FF3A3A;
  border: 1px solid #FF3A3A;

}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fade-enter-to, .fade-leave-from {
  opacity: 1;
}

</style>
