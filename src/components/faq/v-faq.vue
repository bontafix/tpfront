<template>
  <main itemscope itemtype="https://schema.org/FAQPage">
    <Header />

    <section class="faq content">
      <h1 class="faq-title" itemprop="name">FAQ</h1>

      <div class="faq-container container-col">
        <div class="faq-page-container">
          <div
            v-for="(item, index) in faqItems"
            :key="index"
            class="faq-item"
            :class="{ 'active': openedFaqIndex === index }"
          >
            <button
              class="faq-question"
              @click="toggleFaq(index)"
              :aria-expanded="openedFaqIndex === index"
              :aria-controls="'faq-answer-' + index"
            >
              <h3 class="faq-question-text" itemprop="mainEntity" itemscope itemtype="https://schema.org/Question">
                <span itemprop="name">{{ item.question }}</span>
              </h3>
              <span class="faq-icon">
                <img :src="openedFaqIndex === index ? arrowUp : arrowDown" alt="" />
              </span>
            </button>

            <div
              :id="'faq-answer-' + index"
              class="faq-answer"
              v-show="openedFaqIndex === index"
              itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer"
            >
              <div class="faq-answer-content">
                <p class="inter-400" itemprop="text">{{ item.answer }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="ask-question">
          <h4 class="sub-title">Остались вопросы?</h4>
          <div class="container-row">
            <a
              href="https://t.me/teacherplanner"
              class="tg-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="../../assets/images/telegram.svg" alt="Telegram" />
              Написать в поддержку
            </a>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </main>
</template>

<script setup>
import '../../assets/scss/faq.scss'
import Header from '../landing/blocks/Header.vue'
import Footer from '../landing/blocks/Footer.vue'
import { ref } from 'vue'

const openedFaqIndex = ref(null)

const faqItems = [
  {
    question: 'Нужно ли ученикам платить за доступ к платформе?',
    answer: 'Нет, для учеников пользование нашим сервисом абсолютно бесплатно'
  },
  {
    question: 'Не создаются задания, почему так?',
    answer: 'Нет, для учеников пользование нашим сервисом абсолютно бесплатно'
  },
  {
    question: 'Какой часовой пояс выбрать при создании карточки ученика?',
    answer: 'Ограничений по количеству учеников нет'
  },
  {
    question: 'Как быть, если ошибся при указании заработка по занятию?',
    answer: 'На текущий момент сервис бесплатен для всех пользователей. Статус первого пользователя гарантирует специальные условия в будущем.'
  },
  {
    question: 'Обязательно ли при создании карточки занятия указывать перерыв и напоминание?',
    answer: 'Если вы не используете сервис, учетная запись останется активной и можно вернуться в любое время без потери данных.'
  },
  {
    question: 'Как работает система абонементов?',
    answer: 'Если вы не используете сервис, учетная запись останется активной и можно вернуться в любое время без потери данных.'
  },
  {
    question: 'При регистрации нет предмета, который я преподаю. Какой указывать?',
    answer: 'Если вы не используете сервис, учетная запись останется активной и можно вернуться в любое время без потери данных.'
  },
  {
    question: 'Сколько хранится домашнее задание, заданное ученику?',
    answer: 'Если вы не используете сервис, учетная запись останется активной и можно вернуться в любое время без потери данных.'
  },
  {
    question: 'Что делать если ошибся при создании занятий?',
    answer: 'Если вы не используете сервис, учетная запись останется активной и можно вернуться в любое время без потери данных.'
  },
  {
    question: 'Как подключить уведомления от системы?',
    answer: 'Если вы не используете сервис, учетная запись останется активной и можно вернуться в любое время без потери данных.'
  },
  {
    question: 'После проведения занятия, баланс ученика не изменился',
    answer: 'Если вы не используете сервис, учетная запись останется активной и можно вернуться в любое время без потери данных.'
  }
]

const toggleFaq = (index) => {
  openedFaqIndex.value = openedFaqIndex.value === index ? null : index
}

const arrowUp = require('@/assets/icons/rev_strelka.svg')
const arrowDown = require('@/assets/icons/strelka.svg')
</script>