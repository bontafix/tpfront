<template>
  <div :class="['function-item', reverse ? 'function-item--reversed' : '']">
    <div class="function-item__mobile-image-container--mobile">
      <img loading="lazy" class="function-item__media function-item__media--mobile" :src="getImageUrl(mobilePath)" alt="Demo Mobile" />
    </div>
    <img loading="lazy" class="function-item__media function-item__media--tablet" :src="getImageUrl(imagePath)" alt="Demo Tablet" />
    <img v-if="reverse" loading="lazy" class="function-item__media function-item__media--main-reversed" :src="getImageUrl(imagePath)" alt="Demo Main" />
    <div :class="['function-item__info', reverse ? 'function-item__info--reversed' : '']">
      <div class="function-item__icon">
        <img loading="lazy" class="icon" :src="getIconUrl(iconPath)" alt="C" />
      </div>
      <div class="function-item__content">
        <h2 class="function-item__title inter-500">{{ title }}</h2>
        <div class="function-item__desc-block">
            <p class="function-item__desc inter-400" v-html="description"></p>
          <div class="function-item__checkboxes">
            <div v-for="(item, index) in checkboxes" :key="index">
              <CheckboxItem :description="String(item)" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <img v-if="!reverse" loading="lazy" class="function-item__media function-item__media--main" :src="getImageUrl(imagePath)" alt="Demo Main" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CheckboxItem from './CheckboxItem.vue'

const props = defineProps({
  title: String,
  description: String,
  iconPath: String,
  imagePath: String,
  mobilePath: String,
  reverse: Boolean,
  checkboxes: Array
})

function getIconUrl(name: string) {
  // @ts-ignore
  return new URL(`../../../assets/icons/${name}`, import.meta.url).href
}

function getImageUrl(name: string) {
  // @ts-ignore
  return new URL(`../../../assets/images/${name}`, import.meta.url).href
}
</script>

