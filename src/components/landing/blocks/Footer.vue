<template>
  <footer>
    <div class="footer-row first">
      <img src="../../../assets/icons/white_icon.svg" class="logo" alt="logo" />
      <p class="footer-text mobile-hidden">
        Для сотрудничества напишите нам на почту: info@teacherplanner.ru
      </p>
    </div>

    <div class="footer-row">
      <a href="#functions" class="footer-button">Функции</a>
      <a href="#tarifs" class="footer-button">Тарифы</a>
      <a href="#reviews" class="footer-button">Отзывы</a>
      <a href="#faq" class="footer-button">FAQ</a>
      <a href="#" class="footer-button">Поддержка</a>
    </div>

    <div class="footer-row">
      <div class="footer-row">
        <img src="@/assets/images/telegram.svg" alt="Telegram" />
        <a href="https://t.me/teachandplan"><p class="footer-text">@teachandplan</p></a>
      </div>
      <div class="footer-row">
        <img src="@/assets/images/instagram.svg" alt="i" />
        <a href="https://www.instagram.com/teacherplanner.ru?igsh=cnVoY2NyazZ6c2Yy&utm_source=qr"
          ><p class="footer-text">teacherplanner.ru*</p></a
        >
      </div>
    </div>

    <div class="footer-row">
      <p class="footer-meta">*Meta признана экстремистской организацией и запрещена в России</p>
    </div>

    <div class="footer-row line first">
      <p class="footer-subtext">© 2025 Teacher Planner все права защищены</p>
      <div class="footer-row low-gap">
        <a
          class="footer-subtext"
          href="/Политика обработки ПДН.pdf"
          target="_blank"
          >Политика конфиденциальности</a
        >
        <a
          class="footer-subtext"
          href="/Пользовательское соглашение.pdf"
          target="_blank"
          >Пользовательское соглашение</a
        >
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
footer {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 490.5;
  background: #252525;
  padding-top: 64px;
  padding-right: 60px;
  padding-bottom: 48px;
  padding-left: 60px;
  gap: 48px;
  overflow: hidden;
  overscroll-behavior: contain; // Prevents scroll chaining
  touch-action: none; // Disables touch scrolling on mobile

  margin-bottom: 0;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    padding-right: 20px;
    padding-left: 20px;
    padding-top: 32px;
    padding-bottom: 32px;
  }
}

.footer-row {
  display: flex;
  flex-direction: row;
  justify-items: center;
  align-items: center;
  margin-right: 20px;

  @media (max-width: 768px) {
    margin-right: 10px;
  }
}

.low-gap {
  gap: 32px;
}

.footer-button {
  margin-right: 20px;
  color: #ffffff;

  @media (max-width: 768px) {
    margin-right: 10px;
  }
}

.footer-text {
  color: #ffffff;
  margin-left: 5px;
}

.footer-subtext {
  color: #fff;
  opacity: 0.4;

  @media (max-width: 768px) {
    font-family: Inter;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0%;
  }
}

.footer-meta {
  font-family: Inter;
  font-weight: 500;
  font-size: 9px;
  line-height: 18px;
  letter-spacing: 0%;
  color: #ffffff;
  opacity: 0.4;
  margin-top: -25px;
}

.first {
  justify-content: space-between;
}

.line {
  border-top: #6e6e6e solid 1px;
  width: 100%;
  gap: 64px;
  padding-top: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}
</style>
