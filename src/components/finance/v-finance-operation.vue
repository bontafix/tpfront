<template>
  <div class="v-finance-operations styled-section">
    <div class="v-finance-operations__container">
      <div class="v-finance-operations__header">
        <h2 class="v-finance-operaions-title text-section-title">Последние операции</h2>
        <router-link
          :to="{ name: 'history_operations' }"
          class="v-finance-operations__link contact-link mob"
        >
          Открыть историю
          <img src="/src/assets/images/arrow-up-right.svg" alt="" />
        </router-link>
      </div>
      <ul class="v-finance-operations__list">
        <li class="v-finance-operations__list-item finance-operation" v-for="operation in operations" :key="operation.id">
          <div class="finance-operation__block">
            <div class="finance-operation__title">{{ operation.student_name || operation.description }}</div>
            <div class="status" :class="getStatusClass(parseInt(operation.amount))">{{ operation.amount }} ₽</div>
          </div>
          <span class="finance-operation__date caption"> {{ formatDate(operation.date) }} </span>
        </li>
      </ul>

      <div class="subtitle" v-show="!operations.length">
        У вас нет операций по счёту
      </div>

      <router-link
        v-show="operations && operations.length"
        :to="{ name: 'history_operations' }"
        class="v-finance-operations__link contact-link"
      >
        Открыть историю
        <img src="/src/assets/images/arrow-up-right.svg" alt="" />
      </router-link>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'

import { formatDate, getStatusClass } from '@/utils';
import { useFinanceStore } from '@/stores/financeStore';

const financeStore = useFinanceStore()

const operations = computed(()=>{
  return financeStore.operations.filter((operation)=> operation.amount != 0 && (operation.income_id || operation.expenditure_id)).slice(0,5)
})


onMounted(()=>{
  financeStore.fetchFinanceOpeartion()
})
</script>
