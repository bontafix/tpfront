<template>
  <v-base>
    <div class="v-history-operations">
      <div class="container">
        <div class="v-history-operations__container layout">
          <div class="route">
            <router-link :to="{ name: 'finance' }">Финансы</router-link>
            <div>/</div>
            <div>История операций</div>
          </div>

          <div class="v-history-operations__header">
            <h1 class="v-history-operations__title text-title">История операций</h1>

            <nav class="v-history-operations__nav">
              <div
                class="styled-nav"
                :class="{ active: currentState === 'history' }"
                @click="() => changeState('history')"
              >
                История операций
              </div>
              <div
                class="styled-nav"
                :class="{ active: currentState === 'income' }"
                @click="() => changeState('income')"
              >
                Доходы
              </div>
              <div
                class="styled-nav"
                :class="{ active: currentState === 'expenses' }"
                @click="() => changeState('expenses')"
              >
                Расходы
              </div>
            </nav>
          </div>
          <div class="scrolltable">
            <table class="v-history-operations__table styled-table" v-show="columns.length">
              <thead class="styled-table__head">
                <tr>
                  <th><div class="styled-table__head-item">Имя ученика</div></th>
                  <th><div class="styled-table__head-item">Сумма</div></th>
                  <th><div class="styled-table__head-item">Дата</div></th>
                  <th><div class="styled-table__head-item"></div></th>
                </tr>
              </thead>
              <tbody class="styled-table__body">
                <tr class="styled-table__body-row" v-for="operation in columns" :key="operation.id">
                  <td>
                    <div class="styled-table__body-item" v-if="!operation.student_name && !operation.description && !operation.comment && currentState == 'expenses'">Расход</div>
                    <div class="styled-table__body-item" v-else>{{ operation.student_name || operation.description || operation.comment}}</div>
                  </td>
                  <td>
                    <div class="styled-table__body-item">
                      <div
                        class="status"
                        :class="getOpeartionStatusClass(operation)"
                      >
                      {{ operation.amount || operation.sum }} ₽
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="styled-table__body-item">{{formatDate(operation.date || operation.created_at) }}</div>
                  </td>
                  <td>
                    <div class="styled-table__body-item">
                     <!--  <button class="custom-btn white" @click="() => toggleModal('pkoModal')" v-show="currentState === 'income'">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11.6667 1.66675H5.00004C4.55801 1.66675 4.13409 1.84234 3.82153 2.1549C3.50897 2.46746 3.33337 2.89139 3.33337 3.33341V16.6667C3.33337 17.1088 3.50897 17.5327 3.82153 17.8453C4.13409 18.1578 4.55801 18.3334 5.00004 18.3334H15C15.4421 18.3334 15.866 18.1578 16.1786 17.8453C16.4911 17.5327 16.6667 17.1088 16.6667 16.6667V6.66675M11.6667 1.66675L16.6667 6.66675M11.6667 1.66675V6.66675H16.6667M13.3334 10.8334H6.66671M13.3334 14.1667H6.66671M8.33337 7.50008H6.66671"
                            stroke="#717680"
                            stroke-width="1.67"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                        Сформировать ПКО
                      </button> -->
                      <img
                        src="/src/assets/images/trash.svg"
                        alt=""
                        @click="() => showDeleteOperationModal(operation)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul class="v-history-operations__list" v-show="columns.length">
            <li class="v-history-operations__lsit-item history-operation" v-for="operation in columns" :key="operation.id">
              <div class="history-operation__block">
                <div class="history-operation__title" v-if="!operation.student_name && !operation.description && !operation.comment && currentState == 'expenses'">Расход</div>
                <div class="history-operation__title" v-else>{{ operation.student_name || operation.description || operation.comment}}</div>
                <span class="histoty-operation__date caption"> {{ formatDate(operation.date) }} </span>
              </div>
              <div class="history-operation__block">
                <div class="history-operation__price">{{ operation.amount || operation.sum || '0' }} ₽</div>
                <div class="history-operation__buttons">
                 <!--  <button class="custom-btn light-blue"  @click="() => toggleModal('pkoModal')">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.6667 1.66675H5.00004C4.55801 1.66675 4.13409 1.84234 3.82153 2.1549C3.50897 2.46746 3.33337 2.89139 3.33337 3.33341V16.6667C3.33337 17.1088 3.50897 17.5327 3.82153 17.8453C4.13409 18.1578 4.55801 18.3334 5.00004 18.3334H15C15.4421 18.3334 15.866 18.1578 16.1786 17.8453C16.4911 17.5327 16.6667 17.1088 16.6667 16.6667V6.66675M11.6667 1.66675L16.6667 6.66675M11.6667 1.66675V6.66675H16.6667M13.3334 10.8334H6.66671M13.3334 14.1667H6.66671M8.33337 7.50008H6.66671"
                        stroke="#717680"
                        stroke-width="1.67"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    ПКО
                  </button> -->
                  <button
                    class="custom-btn light-red"
                    @click="() => showDeleteOperationModal(operation.id)"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.5 4.99984H4.16667M4.16667 4.99984H17.5M4.16667 4.99984V16.6665C4.16667 17.1085 4.34226 17.5325 4.65482 17.845C4.96738 18.1576 5.39131 18.3332 5.83333 18.3332H14.1667C14.6087 18.3332 15.0326 18.1576 15.3452 17.845C15.6577 17.5325 15.8333 17.1085 15.8333 16.6665V4.99984H4.16667ZM6.66667 4.99984V3.33317C6.66667 2.89114 6.84226 2.46722 7.15482 2.15466C7.46738 1.8421 7.89131 1.6665 8.33333 1.6665H11.6667C12.1087 1.6665 12.5326 1.8421 12.8452 2.15466C13.1577 2.46722 13.3333 2.89114 13.3333 3.33317V4.99984M8.33333 9.1665V14.1665M11.6667 9.1665V14.1665"
                        stroke="#717680"
                        stroke-width="1.66667"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          </ul>

          <div class="null-screen" v-show="!columns.length && !isLoading">
            <h1>Нет операций по счёту</h1>
          </div>
        </div>
      </div>
    </div>
  </v-base>

  <transition name="fade">
    <v-delete-operation
      @delete-operation="deleteOperation"
      v-if="modals.deleteOperation"
      @close="() => toggleModal('deleteOperation')"
    />
  </transition>
  <transition name="fade">
    <v-pko-modal
      v-if="modals.pkoModal"
      @close="() => toggleModal('pkoModal')"
    />
  </transition>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'

import vPkoModal from '../modals/finance/v-pko-modal.vue'
import vDeleteOperation from '../modals/finance/v-delete-operation.vue'

import vBase from '../v-base.vue'
import { useFinanceStore } from '@/stores/financeStore'
import { isLastDayOfMonth } from 'date-fns'
import { formatDate, getStatusClass } from '@/utils'
import { cancelOperation, deleteExpenditure } from '@/api/requests'

const financeStore = useFinanceStore()

const currentOperation = ref()
const currentState = ref('income')

const isLoading = ref(false)

const operations = computed(()=>{
  return financeStore.operations
})

const income = computed(()=>{
  return operations.value.filter((operation)=> parseInt(operation.amount) > 0 && operation.income_id)
})

const expenses = computed(() => {
  return financeStore.expenses/* .filter(expense =>
    Object.prototype.hasOwnProperty.call(expense, 'expenditures_id')
  ) */
})


const modals = ref({
  deleteOperation: false,
  pkoModal: false,
})

const columns = computed(() => {
  if (currentState.value === 'income') {
    return income.value
  } else if(currentState.value === 'expenses') {
    return expenses.value
  }
  return [...income.value, ...expenses.value]
})

const changeState = (state) => {
  currentState.value = state
}

const toggleModal = (modal) => {
  modals.value[modal] = !modals.value[modal]
}

const showDeleteOperationModal = (operation) => {
  toggleModal('deleteOperation')
  currentOperation.value = operation
}

const deleteOperation = async () => {
 /*  if((currentOperation.value.income_id || currentOperation.value.income_id) && !currentOperation.value.payments_id) {
    await cancelOperation(currentOperation.value.id)
  } else if(currentOperation.value.payments_id) */
  // await cancelOperation(currentOperation.value.id)
  await deleteExpenditure(currentOperation.value.id)
}

const getOpeartionStatusClass = (operation) => {
  if(operation.sum || parseInt(operation.amount) < 0) {
    return {red: "true"}
  } if(parseInt(operation.amount) > 0) {
    return {green: 'true'}
  }
}

const loadData = async () => {
  isLoading.value = true
  /* await financeStore.fetchFinanceExpenses()
  await financeStore.fetchFinanceIncome() */
  await financeStore.fetchFinanceOpeartion()
  await financeStore.fetchFinanceExpenses()
  isLoading.value = false
}

onMounted(()=>{
  loadData()
})

</script>
