<template>
  <footer>
    <div class="footer-row first">
      <img src="../../../assets/icons/white_icon.svg" class="logo" alt="Teacher Planner логотип" />
      <p class="footer-text mobile-hidden">
        Для сотрудничества напишите нам на почту: <a href="mailto:info@teacherplanner.ru">info@teacherplanner.ru</a>
      </p>
    </div>

    <nav class="footer-row" aria-label="Навигация по сайту">
      <a href="#functions" class="footer-button">Функции</a>
      <a href="#tarifs" class="footer-button">Тарифы</a>
      <a href="#reviews" class="footer-button">Отзывы</a>
      <a href="#faq" class="footer-button">FAQ</a>
      <a href="#" class="footer-button">Поддержка</a>
    </nav>

    <div class="footer-row" aria-label="Социальные сети">
      <div class="footer-row">
        <a href="https://t.me/teachandplan" target="_blank" rel="noopener">
          <img src="@/assets/images/telegram.svg" alt="Telegram">
          <span class="footer-text">@teachandplan</span>
        </a>
      </div>
      <div class="footer-row">
        <a href="https://www.instagram.com/teacherplanner.ru" target="_blank" rel="noopener">
          <img src="@/assets/images/instagram.svg" alt="Instagram">
          <span class="footer-text">teacherplanner.ru*</span>
        </a>
      </div>
    </div>

    <p class="footer-meta">*Meta признана экстремистской организацией и запрещена в России</p>

    <div class="footer-row line first">
      <p class="footer-subtext">© 2025 Teacher Planner. Все права защищены</p>
      <div class="footer-row low-gap">
        <a class="footer-subtext" href="/Политика обработки ПДН.pdf" target="_blank" rel="noopener">Политика конфиденциальности</a>
        <a class="footer-subtext" href="/Пользовательское соглашение.pdf" target="_blank" rel="noopener">Пользовательское соглашение</a>
      </div>
    </div>
  </footer>
</template>