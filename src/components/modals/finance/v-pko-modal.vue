<template>
  <v-custom-modal :hide-buttons="true">
    <template #modal>
      <div class="v-pko-modal">
        <h2 class="modal-title">
          Приходный кассовый ордер
        </h2>
        <div class="modal-field col">
          <p class="v-pko-modal__subtitle">Индивидуальный предприниматель ФИО (ИНН)</p>
          <p class="v-pko-modal__subtitle">Адрес осуществления расчета</p>
          <p class="v-pko-modal__subtitle">Патентная система налогооблажения</p>
        </div>
        <div class="modal-field col">
          <p class="v-pko-modal__subtitle">Квитанция № (...) от “...” ... 20... г.</p>
          <p class="v-pko-modal__subtitle">Время расчета ... ч. ... мин.</p>
        </div>

        <div class="v-pko-modal__row">
          <div class="v-pko-modal__row-title">ПРИХОД</div>
          <div class="v-pko-modal__row-block">
            <span class="v-pko-modal__subtitle"> Урок по ... , ... час.</span>
            <span class="v-pko-modal__subtitle"> 5000,00 РУБ </span>
          </div>
        </div>
        <div class="v-pko-modal__row">
          <div class="v-pko-modal__row-title">ОПЛАЧЕНО</div>
          <div class="v-pko-modal__row-block">
            <span class="v-pko-modal__subtitle"> Сумма оплаты </span>
            <span class="v-pko-modal__subtitle"> 5000,00 РУБ </span>
          </div>
        </div>

      </div>
    </template>


  </v-custom-modal>
</template>
<script setup>
import vCustomModal from '@/components/generalComponents/v-custom-modal.vue';
</script>
