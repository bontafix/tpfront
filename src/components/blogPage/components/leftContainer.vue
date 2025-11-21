<template>
  <div class="left">
    <p class="left__date">
      {{
        new Date(data.published_at).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      }}
      <!-- | Автор: -->
    </p>
    <h1 class="left__title">{{ data.title }}</h1>
    <h2 class="left__subtitle">{{ data.preview_text }}</h2>

    <div class="left__keywords">
      <span v-for="keyword in keywords" :key="keyword" class="left__keyword">{{ keyword }}</span>
    </div>

    <img class="left__image" :src="`${domain}${data.file}`" alt="Изображение новости" />

    <p class="left__text">{{ data.text }}</p>
  </div>
</template>

<script setup>
import { domain } from '@/utils'
import { computed } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const keywords = computed(() => props.data.keywords.split(', '))
</script>

<style scoped>
.left {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.left__date {
  font-family: Inter;
  font-weight: 400;
  font-style: Regular;
  font-size: 16px;
  line-height: 24px;
  color: #344055;
}

.left__title {
  font-family: Inter;
  font-weight: 600;
  font-style: Semi Bold;
  font-size: 28px;
  line-height: 36px;
  color: #344055;
  margin: 12px 0;
}

.left__subtitle {
  font-family: Inter;
  font-weight: 400;
  font-style: Regular;
  font-size: 18px;
  line-height: 28px;
  color: #344055;
}

.left__keywords {
  margin: 32px 0 0 0;
  display: flex;
  gap: 10px;
}
*
.left__keyword {
  border-radius: 50px;
  background-color: #f4f7ff;
  padding: 11px 18px;
  font-family: Inter;
  font-weight: 400;
  font-style: Regular;
  font-size: 15px;
  line-height: 100%;
  color: #1d4ecc;
}

.left__image {
  width: 860px;
  object-fit: cover;
  border-radius: 16px;
  max-height: 428px;
  margin: 32px 0 48px 0;
}

.left__text {
  font-family: Inter;
  font-weight: 400;
  font-style: Regular;
  font-size: 17px;
  line-height: 27px;
  color: #344055;
}
</style>