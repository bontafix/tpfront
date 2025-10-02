<template>
  <div class="v-home-earnings">
    <v-home-right-sec-base>
      <template #title>Заработок за день</template>
      <template #container>
        <div class="v-home-earnings__progress progress-bar">
          <div
            class="progress-bar__completed"
            :style="{
              width: getWidth,
            }"
          ></div>
        </div>
        <div class="caption">
          {{ earningsData.actual_earning }}р/{{ earningsData.potential_earning }}р заработано
        </div>
      </template>
    </v-home-right-sec-base>
  </div>
</template>
<script setup>
import { onMounted, computed, ref } from 'vue'
import { getEarningsForDay } from '@/api/requests'

import vHomeRightSecBase from './v-home-right-sec-base.vue'

const earningsData = ref({})

const getWidth = computed(() => {
  if (!parseFloat(earningsData.value.actual_earning)) {
    return 0
  }
  return `${(earningsData.value.actual_earning / parseInt(earningsData.value.potential_earning)) * 100}%`
})
const loadData = async () => {
  earningsData.value = await getEarningsForDay()
}

onMounted(() => {
  loadData()
})
</script>
