<template>
  <div class="home-right-sec">
    <div class="home-right-sec__header" :class="{ clicked: !isContent }" @click="toggleContent">
      <h2 class="subtitle"><slot name="title"></slot></h2>
      <img :class="{ 'rotate-180': !isContent }" src="/src/assets/images/arrow-slim.svg" alt="" />
    </div>
    <transition name="fade">
      <div class="home-right-sec__container" v-if="isContent">
        <slot name="container"></slot>
      </div>
    </transition>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const isContent = ref(true)

const toggleContent = () => {
  isContent.value = !isContent.value
}
</script>
