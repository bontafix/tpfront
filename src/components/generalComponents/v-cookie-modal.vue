<template>
  <Teleport to="body" v-if="isModalVisible">
    <div class="cookie">
      <div class="cookie__text-container">
        <p class="cookie__title">Мы собираем и используем файлы Cookie для лучшей работы сайта</p>
        <p class="cookie__text">
          Оставаясь на этом сайте, вы подтверждаете свое
          <a
            class="cookie__text-link"
            href="/Согласие_на_обработку_персональных_данных.pdf"
            target="_blank"
            >согласие</a
          >
          на использование cookie
        </p>
      </div>

      <button class="cookie__button" @click="closeCookieModal">Подтверждаю</button>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const isModalVisible = ref(false)

function closeCookieModal() {
  isModalVisible.value = false
  localStorage.setItem('isCookieModalVisible', 'false')
}

onMounted(() => {
  console.log('localStorage', localStorage.getItem('isCookieModalVisible'))
  if (localStorage.getItem('isCookieModalVisible') !== 'false') {
    isModalVisible.value = true
  }
})
</script>

<style scoped>
.cookie {
  position: fixed;
  bottom: 24px;
  right: 54px;
  z-index: 100;
  padding: 20px 16px 16px 16px;
  border-radius: 12px;
  border: 1px solid #e9eaeb;
  box-shadow: 0 12px 16px -4px #0a0d1229;
  display: flex;
  flex-direction: column;
  gap: 22px;
  background-color: #ffffff;
}

.cookie__text-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.cookie__title {
  font-family: Inter;
  font-weight: 600;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  color: #344055;
  max-width: 376px;
}

.cookie__text {
  font-family: Inter;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  color: #344055;
  max-width: 414px;
}

.cookie__text-link {
  text-decoration: underline;
  cursor: pointer;
}

.cookie__button {
  width: 448px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1d4ecc;
  border: 1px solid #1d4ecc;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(10, 13, 18, 0.05);
  padding: 10px 0;
  font-family: Inter;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: #ffffff;
  transition: background-color 0.2s;
}

.cookie__button:hover {
  background-color: #1543b7;
}

@media screen and (max-width: 768px) {
  .cookie {
    bottom: 18px;
    right: 12px;
    left: 12px;
  }

  .cookie__title {
    font-size: 15px;
    line-height: 22px;
    max-width: 304px;
  }

  .cookie__text {
    font-size: 13px;
    max-width: 304px;
  }

  .cookie__button {
    width: unset;
    padding: 8px 0;
    font-size: 14px;
  }
}
</style>
