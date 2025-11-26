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
import { ref } from 'vue'
import Header from '../landing/blocks/Header.vue'
import Footer from '../landing/blocks/Footer.vue'
import arrowUp from '../../assets/icons/rev_strelka.svg'
import arrowDown from '../../assets/icons/strelka.svg'
import '../../assets/scss/faq.scss'

const openedFaqIndex = ref(null)

const faqItems = [
  {
    question: 'Нужно ли ученикам платить за доступ к платформе?',
    answer: 'Нет, для учеников пользование нашим сервисом абсолютно бесплатно'
  },
  {
    question: 'Не создаются задания, почему так?',
    answer: 'Проверьте, правильно ли вы заполнили все обязательные поля. Если проблема persists, обратитесь в техническую поддержку.'
  },
  {
    question: 'Какой часовой пояс выбрать при создании карточки ученика?',
    answer: 'Рекомендуем выбирать часовой пояс, в котором находится ученик. Это поможет корректно отображать время занятий и напоминаний.'
  },
  {
    question: 'Как быть, если ошибся при указании заработка по занятию?',
    answer: 'Вы можете отредактировать информацию о занятии в любое время через раздел "Мои занятия".'
  },
  {
    question: 'Обязательно ли при создании карточки занятия указывать перерыв и напоминание?',
    answer: 'Нет, эти поля не являются обязательными. Вы можете указать их при необходимости.'
  },
  {
    question: 'Как работает система абонементов?',
    answer: 'Система абонементов позволяет ученикам приобретать пакеты занятий со скидкой. Вы можете настроить различные типы абонементов в личном кабинете.'
  },
  {
    question: 'При регистрации нет предмета, который я преподаю. Какой указывать?',
    answer: 'Выберите наиболее близкий предмет из доступных или обратитесь в поддержку для добавления нового предмета.'
  },
  {
    question: 'Сколько хранится домашнее задание, заданное ученику?',
    answer: 'Домашние задания хранятся в системе в течение всего периода обучения ученика.'
  },
  {
    question: 'Что делать если ошибся при создании занятий?',
    answer: 'Вы можете отредактировать или удалить некорректное занятие в разделе "Расписание".'
  },
  {
    question: 'Как подключить уведомления от системы?',
    answer: 'Уведомления можно настроить в разделе "Настройки" -> "Уведомления". Выберите preferred способ получения уведомлений.'
  },
  {
    question: 'После проведения занятия, баланс ученика не изменился',
    answer: 'Проверьте, подтвердили ли вы проведение занятия. Баланс изменяется только после подтверждения занятия.'
  }
]

const toggleFaq = (index) => {
  if (openedFaqIndex.value === index) {
    openedFaqIndex.value = null
  } else {
    openedFaqIndex.value = index
  }
}
</script>

<style scoped>
.faq {
  padding: 40px 20px;
}

.faq-title {
  text-align: center;
  margin-bottom: 40px;
  font-size: 2.5rem;
  color: #333;
}

.faq-container {
  max-width: 800px;
  margin: 0 auto;
}

.faq-page-container {
  margin-bottom: 40px;
}

.faq-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item.active {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

.faq-question {
  width: 100%;
  padding: 20px;
  background: none;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.3s ease;
}

.faq-question:hover {
  background-color: #f8f9fa;
}

.faq-question-text {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  flex: 1;
}

.faq-icon {
  margin-left: 16px;
  transition: transform 0.3s ease;
}

.faq-item.active .faq-icon {
  transform: rotate(180deg);
}

.faq-icon img {
  width: 16px;
  height: 16px;
}

.faq-answer {
  background-color: #f8f9fa;
  padding: 0 20px;
  transition: all 0.3s ease;
}

.faq-answer-content {
  padding: 20px 0;
}

.faq-answer-content p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.ask-question {
  text-align: center;
  padding: 40px 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
}

.sub-title {
  margin-bottom: 20px;
  font-size: 1.5rem;
  color: #333;
}

.container-row {
  display: flex;
  justify-content: center;
  align-items: center;
}

.tg-button {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  background-color: #0088cc;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.tg-button:hover {
  background-color: #0077b3;
}

.tg-button img {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.inter-400 {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
}

.container-col {
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .faq {
    padding: 20px 16px;
  }
  
  .faq-title {
    font-size: 2rem;
    margin-bottom: 30px;
  }
  
  .faq-question {
    padding: 16px;
  }
  
  .faq-question-text {
    font-size: 1rem;
  }
  
  .faq-answer {
    padding: 0 16px;
  }
  
  .tg-button {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}
</style>