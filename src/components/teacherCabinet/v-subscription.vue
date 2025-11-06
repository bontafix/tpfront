<template>
  <div class="v-subscription">
    <ul class="v-subscription__list">
      <template v-for="rate in rates" :key="rate.id">
        <li class="subscription-card" v-if="!rate.hidden" :class="{chosen: chosenRate === rate.id && rate.id > 1}" @click="() => choseRate(rate.id)">
          <div class="subscription-card__header">
            <div class="subscription-card__header-block">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="20" fill="#F4F7FF"/>
              <g clip-path="url(#clip0_8983_31706)">
              <path d="M28.3334 19.2335V20.0002C28.3323 21.7972 27.7504 23.5458 26.6745 24.9851C25.5985 26.4244 24.0861 27.4773 22.3628 27.9868C20.6395 28.4963 18.7977 28.4351 17.1121 27.8124C15.4264 27.1896 13.9872 26.0386 13.0092 24.5311C12.0311 23.0236 11.5665 21.2403 11.6848 19.4471C11.803 17.654 12.4977 15.9472 13.6653 14.5811C14.8328 13.2151 16.4107 12.263 18.1635 11.867C19.9163 11.471 21.7502 11.6522 23.3917 12.3835M28.3334 13.3335L20 21.6752L17.5 19.1752" stroke="#1D4ECC" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
              </g>
              <defs>
              <clipPath id="clip0_8983_31706">
              <rect width="20" height="20" fill="white" transform="translate(10 10)"/>
              </clipPath>
              </defs>
              </svg>
              <div class="subscription-card__header-subtitle">
                {{ rate.title }}
              </div>
            </div>
            <div class="subscription-card__header-title">
              {{ rate.cost }}
            </div>
          </div>

          <div class="subscription-card__advantages">
            <div class="subscription-card__advantage" v-for="(advantage, index) in rate.advantages" :key="index">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="12" fill="#F4F7FF"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M17.0964 7.39016L9.93641 14.3002L8.03641 12.2702C7.68641 11.9402 7.13641 11.9202 6.73641 12.2002C6.34641 12.4902 6.23641 13.0002 6.47641 13.4102L8.72641 17.0702C8.94641 17.4102 9.32641 17.6202 9.75641 17.6202C10.1664 17.6202 10.5564 17.4102 10.7764 17.0702C11.1364 16.6002 18.0064 8.41016 18.0064 8.41016C18.9064 7.49016 17.8164 6.68016 17.0964 7.38016V7.39016Z" fill="#1D4ECC"/>
              </svg>

              <p>{{ advantage }}</p>
            </div>
          </div>

          <div class="subscription-card__button custom-btn" :class="{'light-blue': chosenRate === rate.id, 'blue': chosenRate !== rate.id}" v-if="rate.id !== chosenRate || rate.id === 1">
            <template v-if="chosenRate === rate.id && rate.id === 1">
              Ваш тариф
            </template>
            <template v-else>
              Выбрать
            </template>
          </div>

          <div class="subscription-card__more" v-if="chosenRate === rate.id && rate.id > 1">
            <div class="subscription-card__row">
              <p>Ближайший платёж</p>
              <p class="subscription-card__row-block">01.04.2025</p>
            </div>
            <div class="subscription-card__row">
              <p>Способ оплаты</p>

              <div class="flex flex-col gap-2 subscription-card__row-block">
                <div class="subscription-card__more-input">
                  <img src="/src/assets/images/mastercard.svg" alt="">
                  <input class="custom-input readonly" type="text" value="**** **** **** 7032" readonly>
                </div>

                <div class="contact-link text-right">Изменить способ оплаты</div>
              </div>
            </div>
            <div class="subscription-card__row subscription-card__prom">
              <input type="text" class="custom-input w-60" placeholder="Введите промокод">
              <button class="custom-btn light-blue">Применить</button>
            </div>
            <div class="subscription-card__cancel contact-link" @click.stop="cancelSubscription">
              Отменить подписку
            </div>
          </div>
        </li>
      </template>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const rates = ref([{
  id: 1,
  title: 'Базовый',
  cost: 'Бесплатно',
  hidden: false,
  advantages: [
    'До 5 учеников',
    'Личный кабинет ученика',
    'Финансовая аналитика',
    'Анализ занятия'
  ]
},
{
  id: 2,
  title: 'Продвинутый',
  cost: '399 ₽ / месяц',
  hidden: false,
  advantages: [
    'До 12 учеников',
    'Личный кабинет ученика',
    'Финансовая аналитика',
    'Анализ занятия',
    'Методическая аналитика',
  ]
},
{
  id: 3,
  title: 'Эксперт',
  cost: '399 ₽ / месяц',
  hidden: false,
  advantages: [
    'Количество учеников неограничено',
    'Личный кабинет ученика',
    'Финансовая аналитика',
    'Анализ занятия',
    'Методическая аналитика',
    'Подключение двух сотрудников',
  ]
},
{
  id: 4,
  title: 'Школа',
  cost: 'Расчитывается индивидуально',
  hidden: false,
  advantages: [
    'Бизнес-аккаунт',
    'Подключение сотрудников',
    'Количество учеников неограничено',
    'Все функции платформы',
  ]
},
])

const chosenRate = ref(1)

const cancelSubscription = () => {
  // Исправление: вместо установки chosenRate в 0, устанавливаем его в 1 (базовый тариф)
  chosenRate.value = 1

  // Сбрасываем скрытость тарифов
  rates.value.forEach((rate) => {
    rate.hidden = false
  })
}

const choseRate = (rate_id) => {
  chosenRate.value = rate_id
  rates.value.forEach((rate) => {
    if (rate.id < rate_id) {
      rate.hidden = true
    }
  })
}
</script>
