<template>
  <v-base>
    <section class="v-finance">
      <div class="container">
        <div class="v-finance__container layout">
          <div class="v-finance__header">
            <h1 class="text-title">Финансы</h1>
            <div class="v-finance__header-buttons">
              <div class="custom-btn white" @click="() => toggleModal('expense')">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.99984 4.16663V15.8333M4.1665 9.99996H15.8332"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>

                Расход
              </div>
              <div class="custom-btn blue" @click="() => toggleModal('income')">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.99984 4.16663V15.8333M4.1665 9.99996H15.8332"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>

                Доход
              </div>
            </div>
          </div>
          <v-finance-cards />
          <div class="v-finance__block">
            <div class="v-finance__left">
              <v-finance-earning />
              <v-finance-analysis />
              <v-finance-student />
            </div>
            <div class="v-finance__right">
              <v-finance-operation />
            </div>
          </div>
        </div>
      </div>
        <div class="v-finance__menu mob-actions" v-click-outside="() => buttonsActive = false">
          <button class="v-finance__plus mob-actions__plus custom-btn blue" @click="buttonsActive = !buttonsActive">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.99984 4.16663V15.8333M4.1665 9.99996H15.8332"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <div class="v-finance__menu-items mob-actions__menu-items" :class="{ active: buttonsActive }">
            <button class="v-finance__menu-item mob-actions__menu-item" @click="() => toggleModal('income')">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.99984 4.16663V15.8333M4.1665 9.99996H15.8332"
                  stroke="#717680"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Доход
            </button>
            <button class="v-finance__menu-item mob-actions__menu-item" @click="() => toggleModal('expense')">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.99984 4.16663V15.8333M4.1665 9.99996H15.8332"
                  stroke="#717680"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Расход
            </button>
          </div>
        </div>

    </section>
    <!--  <div class="loader-container">
      <div class="loader"></div>
    </div> -->
  </v-base>
  <transition name="fade">
    <v-income-modal v-if="modals.income" @close="() => toggleModal('income')" :class="{'modal-open': modals.income}" />
  </transition>
  <transition name="fade">
    <v-expense-modal v-if="modals.expense" @close="() => toggleModal('expense')" :class="{'modal-open': modals.expense}" />
  </transition>
</template>
<script setup>
import { ref } from 'vue'

import vBase from '../v-base.vue'
import vFinanceCards from './v-finance-cards.vue'
import vFinanceEarning from './v-finance-earning.vue'
import vFinanceStudent from './v-finance-student.vue'
import vFinanceAnalysis from './v-finance-analysis.vue'
import vFinanceOperation from './v-finance-operation.vue'

import vIncomeModal from '../modals/finance/v-income-modal.vue'
import vExpenseModal from '../modals/finance/v-expense-modal.vue'

const buttonsActive = ref(false)

const modals = ref({
  income: false,
  expense: false,
})

const toggleModal = (modal) => {
  buttonsActive.value = false
  modals.value[modal] = !modals.value[modal]
}
</script>
