<template>
  <section class="student-cabinet-section" id="student" itemscope itemtype="https://schema.org/Product">
    <h2 class="section-title inter-500 student-cabinet-section__title" itemprop="name">Кабинет ученика</h2>
    <p class="desc inter-400 student-cabinet-section__desc" itemprop="description">
      Единое пространство для ученика, где хранятся домашние задания, расписание занятий и отчеты для родителей
    </p>

    <div class="student-cabinet-section__container">
      <div class="student-cabinet-section__container-item" itemprop="feature" itemscope itemtype="https://schema.org/Service">
        <div class="student-cabinet-section__primary-item">
          <img src="../../../../assets/images/cabinet-section-demo.jpg" class="student-cabinet-section__primary-image" itemprop="image" alt="Задавайте домашнее задание">
          <h3 class="inter-500 student-cabinet-section__title-h3" itemprop="name">Задавайте домашнее задание</h3>
          <p class="item-desc inter-400 student-cabinet-section__desc-p" itemprop="description">
            Разгрузите ваши мессенджеры и сделайте задачу домашнего задания быстрой и удобной для вас и ваших учеников.
          </p>
        </div>
      </div>

      <div class="student-cabinet-section__container-item">
        <div class="student-cabinet-section__feature-item feature-item" itemprop="feature" itemscope itemtype="https://schema.org/Service">
          <img class="notifications-image student-cabinet-section__secondary-image" src="../../../../assets/images/not_demo.png" itemprop="image" alt="Гибкая система напоминаний">
          <h3 class="inter-500 student-cabinet-section__title-h3" itemprop="name">Гибкая система напоминаний для ученика и учителя</h3>
          <p class="item-desc inter-400 student-cabinet-section__desc-p" itemprop="description">
            Проведите урок и задайте домашнее задание, а мы бережно напомним ученику о необходимости оплатить занятие и сдать домашнее задание на проверку.
          </p>
        </div>

        <div class="student-cabinet-section__feature-item feature-item" itemprop="feature" itemscope itemtype="https://schema.org/Service">
          <img class="teacher-demo-image student-cabinet-section__secondary-image" src="../../../../assets/images/ts_demo.png" itemprop="image" alt="Отправляйте отчеты родителям">
          <h3 class="inter-500 student-cabinet-section__title-h3" itemprop="name">Отправляйте отчеты родителям</h3>
          <p class="item-desc inter-400 student-cabinet-section__desc-p" itemprop="description">
            Ведите записи по каждому занятию, а родителю они будут автоматически доступны в кабинете ученика.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>