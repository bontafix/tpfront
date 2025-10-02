<template>
  <section class="reviews-section" id="reviews">
    <div class="reviews-section__container-row">
      <h2 class="section-title inter-500">Отзывы преподавателей о Teacher Planner</h2>
      <button class="primary-button reviews-section__leave-button" @click="openModal">Оставить отзыв</button>
    </div>

    <div class="reviews-section__list">
      <div class="reviews-section__item">
        <h3 class="reviews-section__author inter-600">Любовь Сергеевна</h3>
        <p class="reviews-section__teacher inter-400">Репетитор по химии и физике</p>
        <p class="reviews-section__text inter-400">
          Я была приятно удивлена, насколько простым и удобным оказался этот сервис. Больше не нужно
          вести свой учет на бумаге или в Excel.
        </p>
      </div>

      <div class="reviews-section__item">
        <h3 class="reviews-section__author inter-600">Мария Дмитриевна</h3>
        <p class="reviews-section__teacher inter-400">Репетитор по математике</p>
        <p class="reviews-section__text inter-400">
          Я ценю возможность легко управлять своими учениками и планировать занятия. Платформа
          действительно помогает экономить время, и я могу уделить больше внимания.
        </p>
      </div>

      <div class="reviews-section__item">
        <h3 class="reviews-section__author inter-600">Николай Алексеевич</h3>
        <p class="reviews-section__teacher inter-400">Репетитор по английскому языку</p>
        <p class="reviews-section__text inter-400">
          Работаю на этом сервисе уже несколько месяцев, и могу сказать, что это лучший выбор для
          репетитора! Удобный интерфейс и отличные инструменты для планирования занятий.
        </p>
      </div>
    </div>

    <Teleport to="body">
      <vReview v-if="showModal" @close="closeModal" />
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import vReview from '@/components/modals/landing/v-review.vue'

const showModal = ref(false)

function openModal() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

watch(showModal, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>
