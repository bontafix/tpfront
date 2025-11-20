<template>
  <section class="tarifs-section" id="tarifs" itemscope itemtype="https://schema.org/Product">
    <meta itemprop="category" content="Тарифы" />
    <meta itemprop="name" content="Тарифы Teacher Planner — выберите подходящий план" />
    <meta itemprop="description" content="Подберите тариф по количеству учеников и увеличивайте их число вместе с Teacher Planner" />

    <div class="tarifs-section__badge" itemprop="category">Тарифы</div>
    <h2 class="section-title inter-500 tarifs-section__title" itemprop="name">
      Подберите тариф по количеству учеников и увеличивайте их число вместе с ТР
    </h2>

    <div class="tarifs-section__container">
      <div class="tarifs-section__tarifs" :class="{ 'tarifs-section__tarifs--blurred': showFreeServiceOverlay }">

        <div class="tarifs-section__tarif" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          <meta itemprop="name" content="Базовый тариф" />
          <meta itemprop="price" content="0" />
          <meta itemprop="priceCurrency" content="RUB" />
          <meta itemprop="image" content="@/assets/icons/checkbox2.svg" />
          <div class="rounded-as-icon">
            <img src="@/assets/icons/checkbox2.svg" alt="Базовый тариф" itemprop="image"/>
          </div>
          <p class="tarifs-section__tariftitle" itemprop="name">Базовый</p>
          <h3 class="tarifs-section__func-title" itemprop="price">Бесплатно</h3>

          <div class="tarifs-section__tarif-features">
            <CheckboxItem description="До 5 учеников" />
            <CheckboxItem description="Личный кабинет ученика" />
            <CheckboxItem description="Финансовая аналитика" />
            <CheckboxItem description="Аналитика занятий" />
          </div>

          <button class="primary-button" @click="pushToRegister">Начать работу</button>
        </div>

        <div class="tarifs-section__tarif tarifs-section__tarif--featured" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          <meta itemprop="name" content="Продвинутый тариф" />
          <meta itemprop="price" content="399" />
          <meta itemprop="priceCurrency" content="RUB" />
          <meta itemprop="image" content="@/assets/icons/checkbox2.svg" />
          <div class="rounded-as-icon">
            <img src="@/assets/icons/checkbox2.svg" alt="Продвинутый тариф" itemprop="image"/>
          </div>
          <p class="tarifs-section__tariftitle" itemprop="name">Продвинутый</p>
          <h3 class="tarifs-section__func-title" itemprop="price">399 ₽ / месяц</h3>

          <div class="tarifs-section__tarif-features">
            <CheckboxItem description="До 12 учеников" />
            <CheckboxItem description="Личный кабинет ученика" />
            <CheckboxItem description="Финансовая аналитика" />
            <CheckboxItem description="Аналитика занятий" />
            <CheckboxItem description="Методическая аналитика" />
          </div>

          <button class="secondary-button" @click="openFreeServiceOverlay">Выбрать</button>
        </div>

        <div class="tarifs-section__tarif" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          <meta itemprop="name" content="Эксперт тариф" />
          <meta itemprop="price" content="599" />
          <meta itemprop="priceCurrency" content="RUB" />
          <meta itemprop="image" content="@/assets/icons/checkbox2.svg" />
          <div class="rounded-as-icon">
            <img src="@/assets/icons/checkbox2.svg" alt="Эксперт тариф" itemprop="image"/>
          </div>
          <p class="tarifs-section__tariftitle" itemprop="name">Эксперт</p>
          <h3 class="tarifs-section__func-title" itemprop="price">599 ₽ / месяц</h3>

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

        <div class="tarifs-section__tarif" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          <meta itemprop="name" content="Школа тариф" />
          <meta itemprop="price" content="0" />
          <meta itemprop="priceCurrency" content="RUB" />
          <meta itemprop="image" content="@/assets/icons/checkbox2.svg" />
          <div class="rounded-as-icon">
            <img src="@/assets/icons/checkbox2.svg" alt="Школа тариф" itemprop="image"/>
          </div>
          <p class="tarifs-section__tariftitle" itemprop="name">Школа</p>
          <h3 class="tarifs-section__func-title" itemprop="price">Рассчитывается индивидуально</h3>

          <div class="tarifs-section__tarif-features">
            <CheckboxItem description="Бизнес аккаунт" />
            <CheckboxItem description="Все функции платформы" />
            <CheckboxItem description="Подключение сотрудников" />
            <CheckboxItem description="Количество учеников неограничено" />
          </div>

          <button class="primary-button" @click="openFreeServiceOverlay">Выбрать</button>
        </div>

      </div>

      <div
        v-if="showFreeServiceOverlay"
        class="tarifs-section__free-service-overlay"
        @click="closeFreeServiceOverlay"
      >
        <div class="tarifs-section__free-service-content" @click.stop>
          <h2 class="section-title" itemprop="description">
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