<template>
  <section class="functions-section" id="functions" itemscope itemtype="https://schema.org/ItemList">
    <meta itemprop="name" content="Функции TeacherPlanner" />

    <div class="functions-section__head">
      <div class="functions-section__badge">Функции</div>
      <h2 class="functions-section__title section-title inter-500">
        Чистое рабочее место – первый шаг навстречу новой жизни репетитора
      </h2>
      <p class="functions-section__desc desc inter-400">
        Выбери порядок и четкую структуру вместо хаоса и бесконечного потока таблиц и блокнотов
      </p>
    </div>

    <div class="functions-section__list">
      <div itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <meta itemprop="position" content="1" />
        <FunctionItem
          class="function-item"
          title="Календарь, созданный специально для репетитора"
          description="Создавайте карточки учеников, пробные уроки и формируйте расписание за 3 клика"
          iconPath="calendar.svg"
          imagePath="calendar.gif"
          mobilePath="calendar_mobile.png"
        />
      </div>

      <div itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <meta itemprop="position" content="2" />
        <FunctionItem
          class="function-item"
          title="Быстрый доступ к текущим занятиям"
          description="Заменяет блокнот и находит всю нужную информацию с прошлого урока."
          iconPath="rocket.svg"
          imagePath="current_lesson.gif"
          :reverse="true"
          mobilePath="cl_mobile.png"
        />
      </div>

      <div itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <meta itemprop="position" content="3" />
        <FunctionItem
          class="function-item"
          title="Аналитика занятий"
          description="Наблюдать за успехами каждого ученика стало еще проще."
          iconPath="analytics.svg"
          imagePath="analytics.gif"
          mobilePath="analytics_mobile.png"
          :checkboxes="[
            'Повышайте качество своих уроков',
            'Сохраняйте индивидуальный подход даже при работе с большим количеством учеников'
          ]"
        />
      </div>

      <div itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <meta itemprop="position" content="4" />
        <FunctionItem
          class="function-item"
          title="Финансовая аналитика"
          description="Не нужно держать все в голове — учет финансов предоставьте TeacherPlanner"
          iconPath="finance.svg"
          imagePath="finance.gif"
          :reverse="true"
          mobilePath="finance_mobile.png"
          :checkboxes="[
            'Учет оплаченных занятий',
            'Подробная финансовая статистика'
          ]"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import FunctionItem from '../FunctionItem.vue';
</script>

<style lang="scss" scoped>
@use '../../../../assets/scss/landing.scss' as *;
</style>