<template>
  <div class="v-finance__cards">
    <ul class="v-finance__cards-list">
      <li class="v-finance__cards-list-item finance-card styled-section">
        <div class="finance-card__top">
          <div class="finance-card__subtitle">Доход</div>
          <VueDatePicker
            v-model="date"
            :locale="'ru-RU'"
            :clearable="true"
            :format="formatDateRange"
            :action-buttons="['cancel', 'submit']"
            cancel-text="Отмена"
            select-text="Выбрать"
            class="range custom-datepicker"
            range
            @update:model-value="onPeriodChange"
          >
            <template #clear-icon="{ clear }"> </template>
          </VueDatePicker>
        </div>
        <div class="finance-card__bottom" v-if="periodData">
          <div class="finance-card__value">{{ prettyPrice(periodData.total_earnings) }} ₽</div>
          <span
            class="status"
            :class="getStatusClass(periodData.percentage_change_earnings)"
            v-if="periodData.percentage_change_earnings"
          >
            {{ periodData.percentage_change_earnings }}
          </span>
        </div>
      </li>

      <li class="v-finance__cards-list-item finance-card styled-section">
        <div class="finance-card__top">
          <div class="finance-card__subtitle">Средний чек</div>
        </div>
        <div class="finance-card__bottom" v-if="periodData">
          <div class="finance-card__value">{{ prettyPrice(periodData.average_earnings_per_hour) }} ₽</div>
          <span
            class="status"
            :class="getStatusClass(periodData.percentage_change_average_earnings)"
            v-if="periodData.percentage_change_average_earnings"
          >
            {{ periodData.percentage_change_average_earnings }}
          </span>
        </div>
      </li>

      <li class="v-finance__cards-list-item finance-card styled-section">
        <div class="finance-card__top">
          <div class="finance-card__subtitle">Рабочих часов</div>
        </div>
        <div class="finance-card__bottom" v-if="periodData">
          <div class="finance-card__value">{{ periodData.total_hours }}</div>
          <span class="status" :class="getStatusClass(periodData.percentage_change_hours)">
            {{ periodData.percentage_change_hours }}
          </span>
        </div>
      </li>

      <li class="v-finance__cards-list-item finance-card styled-section">
        <div class="finance-card__top">
          <div class="finance-card__subtitle">Расходы</div>
        </div>
        <div class="finance-card__bottom" v-if="periodData">
          <div class="finance-card__value">{{ prettyPrice(periodData.total_expenditures) }} ₽</div>
          <span class="status" :class="getStatusClass(periodData.total_expenditures)">
            {{ periodData.total_expenditures }} %
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

import '@vuepic/vue-datepicker/dist/main.css';
import VueDatePicker from '@vuepic/vue-datepicker';
import { useFinanceStore } from '@/stores/financeStore';
import { getEarningsForPeriod, getStudentsEarnings } from '@/api/requests';
import { prettyPrice, formatDateRange, getCurrentMonthDates, getStatusClass } from '@/utils';

const financeStore = useFinanceStore()

const date = ref(null);
const periodData = ref();
const studentEarnings = ref()

const onPeriodChange = (period) => {
  const startDate = formatDateToLocal(period[0]);
  const endDate = formatDateToLocal(period[1]);

  console.log(startDate, endDate, period);
  date.value = period;
  financeStore.currentRange = [startDate, endDate];
  loadEraningsForPeriod(startDate, endDate);
};

const formatDateToLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentMonthEarnings = () => {
  const currentMonthDates = getCurrentMonthDates();
  date.value = currentMonthDates;

  const startFormatted = formatDateToLocal(currentMonthDates[0]);
  const endFormatted = formatDateToLocal(currentMonthDates[1]);

  financeStore.currentRange = [startFormatted, endFormatted];
  loadEraningsForPeriod(startFormatted, endFormatted);
};


const loadData = async () => {
  studentEarnings.value = await getStudentsEarnings()
}

const loadEraningsForPeriod = async (startDate, endDate) => {
  periodData.value = await getEarningsForPeriod(startDate, endDate);
};

/* const getCurrentMonthEarnings = () => {

  const currentMonthDates = getCurrentMonthDates()
  date.value = currentMonthDates
  const startFormatted = currentMonthDates[0].toISOString().slice(0, 10);
  const endFormatted = currentMonthDates[1].toISOString().slice(0, 10);


  financeStore.currentRange = [startFormatted, endFormatted]

  loadEraningsForPeriod(startFormatted, endFormatted);
};
 */
onMounted(() => {
  loadData()
  getCurrentMonthEarnings();
});
</script>
