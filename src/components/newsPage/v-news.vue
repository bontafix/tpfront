<template>
  <v-base>
    <section class="v-news white-page">
      <div class="container">
        <div class="v-news__container layout">
          <h1 class="v-news__title text-section-title">Корпоративные новости</h1>

          <a href="https://t.me/teachandplan" target="_blank" rel="noopener noreferrer" class="v-news__banner-link">
            <div class="v-news__banner">
              <!-- При необходимости можно вернуть содержимое баннера -->
            </div>
          </a>

          <ul class="v-news__list">
            <li class="v-news__list-item news">
              <article class="news__content">
                <figure class="news__image">
                  <img src="/src/assets/images/pupil.jpg" alt="Ученики на уроке" />
                </figure>

                <div class="news__info">
                  <header class="news__info-block">
                    <time class="news__date" datetime="2025-06-01">1 июня 2025</time>
                    <h2 class="news__title">Как не остаться без денег летом?</h2>
                  </header>

                  <p class="news__desc">
                    Если Вы не будете планировать заранее вашу деятельность, то в скором времени
                    обнаружите, что летом учеников и заработка совсем нет. Так ли это? Конечно нет.
                    <br /><br />
                    Чтобы такого не было, начинайте предпринимать шаги для снижения зависимости от
                    сезонности уже сейчас. Приглашаем вас на вебинар 1 мая. Зарегистрироваться можно
                    по кнопке ниже.
                  </p>

                  <a href="#registration" class="news__button custom-btn light-blue" role="button">
                    Зарегистрироваться
                  </a>
                </div>
              </article>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </v-base>
</template>

<script setup>
import vBase from '../v-base.vue'
</script>