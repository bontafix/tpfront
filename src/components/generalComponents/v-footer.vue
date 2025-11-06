<template>
  <footer class="v-footer base-footer">
    <div class="container flex items-center justify-between">
      <a href="/" class="logo">
        <img class="night-el v-footer__logo" src="../../assets/images/black.svg" alt="Night Logo" />
        <img class="day-el v-footer__logo" src="../../assets/images/day.svg" alt="Day Logo" />
      </a>

      <div class="v-footer__block">
        <div class="v-footer__container">
          <div class="v-footer__content">
            <a href="#">Управление подпиской</a>
            <a href="../../assets/documentation/confi.docx" target="_blank" download
              >Политика конфиденциальности</a
            >
            <a href="../../assets/documentation/agreement.docx" download
              >Пользовательское соглашение</a
            >
            <a href="/faq">FAQ</a>
          </div>
        </div>
        <div class="v-footer__contacts">
          <a href="https://t.me/teacherplanner" class="flex gap-2">
            <img src="../../assets/images/chat-icon.svg" alt="" />
            Чат поддержки
          </a>
          <div>
            <a href="https://t.me/teachandplan" class="flex gap-2" target="_blank">
              <img src="../../assets/images/tg-icon-gray.svg" alt="" />
              @teachandplan
            </a>
          </div>
          <a href="mailto:info@teacherplanner.ru" class="flex gap-2">
            <img src="../../assets/images/gmail-icon.svg" alt="" />
            info@teacherplanner.ru
          </a>
        </div>
      </div>
    </div>
    <div class="v-footer__bottom">
      <div class="container">© 2025 Teacher Planner. Все права защищены.</div>
    </div>
  </footer>
</template>
<script setup></script>
