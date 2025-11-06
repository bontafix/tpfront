<template>
  <section id="faq" class="faq-section">
    <div class="faq-section__content-wrapper">
      <div class="faq-section__sidebar">
        <h2 class="faq-section__title inter-500">Частые вопросы</h2>
        <div class="faq-section__review faq-section__mobile-hidden">
          <h3 class="faq-section__author inter-600">Остались вопросы?</h3>
          <p class="faq-section__review-text inter-400">Перейдите на страницу с часто задаваемыми вопросами или задайте свой</p>
          <button class="primary-button" @click="pushToFaq">Перейти</button>
        </div>
      </div>
      <div class="faq-section__container">
        <div v-for="(item, index) in faqItems" :key="index" class="faq-section__item" :class="{ 'active': openedFaqIndex === index }">
          <div class="faq-section__question" @click="toggleFaq(index)">
            <h3>{{ item.question }}</h3>
            <div class="faq-section__icon">
              <span v-if="openedFaqIndex === index"><img src="@/assets/icons/rev_strelka.svg"></span>
              <span v-else><img src="@/assets/icons/strelka.svg"></span>
            </div>
          </div>
          <div class="faq-section__answer" :class="{ 'open': openedFaqIndex === index }">
            <div class="faq-section__answer-content">
              <p>{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="faq-section__mobile faq-section__container-row">
      <div class="faq-section__review">
        <h3 class="faq-section__author inter-600">Остались вопросы?</h3>
        <p class="faq-section__review-text inter-400">Перейдите на страницу с часто задаваемыми вопросами или задайте свой</p>
        <button class="primary-button" @click="pushToFaq">Перейти</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import router from '@/router'

const openedFaqIndex = ref(null);
const faqItems = [
  {
    question: 'Нужно ли ученикам платить за доступ к платформе?',
    answer: 'Нет, для учеников пользование нашим сервисом абсолютно бесплатно'
  },
  {
    question: 'Есть ли ограничения на количество учеников?',
    answer: 'Ограничений по количеству учеников нет'
  },
  {
    question: 'Сколько стоит сервис?',
    answer: 'На текущий момент, наш сервис является бесплатным для всех пользователей. Успейте присоединиться и получить статус первого пользователя сервиса, в дальнейшем это гарантирует наличие специальных условий для Вас на пользование сервисом'
  },
  {
    question: 'Что произойдет, если я не пользуюсь своим аккаунтом?',
    answer: 'Если вы не будете использовать сервис, ваша учетная запись останется активной, и вы сможете вернуться в любое время без потери данных. Однако, если ваша учетная запись неактивна в течение длительного времени, мы можем связаться с вами для уточнения, желаете ли вы продолжить использование платформы'
  },
];

const toggleFaq = (index) => {
  if (openedFaqIndex.value === index) {
    openedFaqIndex.value = null;
  } else {
    openedFaqIndex.value = index;
  }
};

function pushToFaq() {
  router.push({
    name: 'faq',
  })
}
</script>
