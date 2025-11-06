<script setup lang="ts">
import CheckboxItem from '../CheckboxItem.vue'
import router from '@/router'
import { ref, onMounted } from 'vue'

const showFreeServiceOverlay = ref(true)

function pushToRegister() {
  router.push({
    name: 'register',
    query: {
      from: 'landing-tarifs',
    },
  })
}

function openFreeServiceOverlay() {
  showFreeServiceOverlay.value = true
}

function closeFreeServiceOverlay() {
  showFreeServiceOverlay.value = true
}

onMounted(() => {
  showFreeServiceOverlay.value = true;
})
</script>

<template>
  <section class="tarifs-section" id="tarifs">
    <div class="tarifs-section__badge">Тарифы</div>
    <h2 class="section-title inter-500 tarifs-section__title">
      Подберите тариф по количеству учеников и увеличивайте их число вместе с ТР
    </h2>

    <div class="tarifs-section__container">
      <div class="tarifs-section__tarifs" :class="{ 'tarifs-section__tarifs--blurred': showFreeServiceOverlay }">
        <div class="tarifs-section__tarif">
          <div class="rounded-as-icon">
            <img src="@/assets/icons/checkbox2.svg" alt="Free" />
          </div>
          <p class="tarifs-section__tariftitle">Базовый</p>
          <h3 class="tarifs-section__func-title">Бесплатно</h3>

          <div class="tarifs-section__tarif-features">
            <CheckboxItem description="До 5 учеников" />
            <CheckboxItem description="Личный кабинет ученика" />
            <CheckboxItem description="Финансовая аналитика" />
            <CheckboxItem description="Аналитика занятий" />
          </div>

          <button class="primary-button" @click="pushToRegister">Начать работу</button>
        </div>

        <div class="tarifs-section__tarif tarifs-section__tarif--featured">
          <div class="rounded-as-icon">
            <img src="@/assets/icons/checkbox2.svg" alt="Free" />
          </div>
          <p class="tarifs-section__tariftitle">Продвинутый</p>
          <h3 class="tarifs-section__func-title">399 ₽ / месяц</h3>

          <div class="tarifs-section__tarif-features">
            <CheckboxItem description="До 12 учеников" />
            <CheckboxItem description="Личный кабинет ученика" />
            <CheckboxItem description="Финансовая аналитика" />
            <CheckboxItem description="Аналитика занятий" />
            <CheckboxItem description="Методическая аналитика" />
          </div>

          <button class="secondary-button" @click="openFreeServiceOverlay">Выбрать</button>
        </div>

        <div class="tarifs-section__tarif">
          <div class="rounded-as-icon">
            <img src="@/assets/icons/checkbox2.svg" alt="Free" />
          </div>
          <p class="tarifs-section__tariftitle">Эксперт</p>
          <h3 class="tarifs-section__func-title">599 ₽ / месяц</h3>

          <div class="tarifs-section__tarif-features">
            <CheckboxItem description="Количество учеников неограничено" />
            <CheckboxItem description="Личный кабинет ученика" />
            <CheckboxItem description="Финансовая аналитика" />
            <CheckboxItem description="Аналитика занятий" />
            <CheckboxItem description="Методическая аналитика" />
            <CheckboxItem description="Подключение двух сотрудников" />
          </div>

          <button class="primary-button" @click="openFreeServiceOverlay">Выбрать</button>
        </div>

        <div class="tarifs-section__tarif">
          <div class="rounded-as-icon">
            <img src="@/assets/icons/checkbox2.svg" alt="Free" />
          </div>
          <p class="tarifs-section__tariftitle">Школа</p>
          <h3 class="tarifs-section__func-title">Расчитывается индивидуально</h3>

          <div class="tarifs-section__tarif-features">
            <CheckboxItem description="Бизнес аккаунт" />
            <CheckboxItem description="Все функции платформы" />
            <CheckboxItem description="Подключение сотрудников" />
            <CheckboxItem description="Количество учеников неограничено" />
          </div>

          <button class="primary-button" @click="openFreeServiceOverlay">Выбрать</button>
        </div>
      </div>

      <!-- Оверлей с информацией о бесплатном сервисе -->
      <div
        v-if="showFreeServiceOverlay"
        class="tarifs-section__free-service-overlay"
        @click="closeFreeServiceOverlay"
      >
        <div class="tarifs-section__free-service-content" @click.stop>
          <h2 class="section-title">
            На текущий момент, наш сервис является бесплатным для всех пользователей
          </h2>
          <p class="desc inter-400">
            Успейте присоединиться и получить статус первого пользователя сервиса, в дальнейшем это
            гарантирует наличие специальных условий для Вас на пользование сервисом*
          </p>
          <div class="tarifs-section__caption">
            *Специальные условия остаются на усмотрение лицензиара и действуют ограниченный период
            времени
          </div>

          <div class="tarifs-section__overlay-buttons">
            <button class="primary-button" @click="pushToRegister">Начать работу</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<!-- <style lang="scss" scoped>
// Стили перенесены в landing.scss по БЭМ. Этот блок можно удалить.
</style> -->
