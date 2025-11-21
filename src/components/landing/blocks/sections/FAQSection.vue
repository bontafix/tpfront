<template>
  <section id="faq" class="faq-section">
    <div class="faq-section__content-wrapper">
      <div class="faq-section__sidebar">
        <h2 class="faq-section__title inter-500">Частые вопросы</h2>

        <div class="faq-section__review faq-section__mobile-hidden">
          <h3 class="faq-section__author inter-600">Остались вопросы?</h3>
          <p class="faq-section__review-text inter-400">
            Перейдите на страницу с часто задаваемыми вопросами или задайте свой
          </p>
          <button
            class="primary-button"
            @click="pushToFaq"
            aria-label="Перейти к полному списку вопросов"
          >
            Перейти
          </button>
        </div>
      </div>

      <div
        class="faq-section__container"
        itemscope
        itemtype="https://schema.org/FAQPage"
      >
        <div
          v-for="(item, index) in faqItems"
          :key="index"
          class="faq-section__item"
          :class="{ active: openedFaqIndex === index }"
          itemprop="mainEntity"
          itemscope
          itemtype="https://schema.org/Question"
        >
          <div
            class="faq-section__question"
            @click="toggleFaq(index)"
            role="button"
            :aria-expanded="openedFaqIndex === index ? 'true' : 'false'"
            :aria-controls="`faq-answer-${index}`"
            tabindex="0"
            @keyup.enter="toggleFaq(index)"
          >
            <h3 itemprop="name">{{ item.question }}</h3>
            <div class="faq-section__icon">
              <span v-if="openedFaqIndex === index">
                <img src="@/assets/icons/rev_strelka.svg" alt="Скрыть ответ" />
              </span>
              <span v-else>
                <img src="@/assets/icons/strelka.svg" alt="Показать ответ" />
              </span>
            </div>
          </div>

          <div
            class="faq-section__answer"
            :id="`faq-answer-${index}`"
            :class="{ open: openedFaqIndex === index }"
            itemprop="acceptedAnswer"
            itemscope
            itemtype="https://schema.org/Answer"
          >
            <div class="faq-section__answer-content">
              <p itemprop="text">{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="faq-section__mobile faq-section__container-row">
      <div class="faq-section__review">
        <h3 class="faq-section__author inter-600">Остались вопросы?</h3>
        <p class="faq-section__review-text inter-400">
          Перейдите на страницу с часто задаваемыми вопросами или задайте свой
        </p>
        <button
          class="primary-button"
          @click="pushToFaq"
          aria-label="Перейти на страницу FAQ"
        >
          Перейти
        </button>
      </div>
    </div>

    <meta name="description" content="Часто задаваемые вопросы о Teacher Planner: стоимость, количество учеников, условия использования платформы и ответы на другие популярные вопросы." />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://teacherplanner.ru/#faq" />
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import router from "@/router";

const openedFaqIndex = ref(null);

const faqItems = [
  {
    question: "Нужно ли ученикам платить за доступ к платформе?",
    answer: "Нет, для учеников пользование нашим сервисом абсолютно бесплатно"
  },
  {
    question: "Есть ли ограничения на количество учеников?",
    answer: "Ограничений по количеству учеников нет"
  },
  {
    question: "Сколько стоит сервис?",
    answer:
      "На текущий момент, наш сервис является бесплатным для всех пользователей. Ранние пользователи получают особые условия в будущем."
  },
  {
    question: "Что произойдет, если я не пользуюсь своим аккаунтом?",
    answer:
      "Учетная запись останется активной. При долгой неактивности мы можем уточнить, хотите ли вы продолжать использование сервиса."
  }
];

const toggleFaq = (index) => {
  openedFaqIndex.value = openedFaqIndex.value === index ? null : index;
};

function pushToFaq() {
  router.push({ name: "faq" });
}

onMounted(() => {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.text = JSON.stringify(ld);
  document.head.appendChild(script);
});
</script>