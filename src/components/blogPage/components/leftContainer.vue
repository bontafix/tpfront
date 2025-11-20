<template>
  <article class="left" itemscope itemtype="https://schema.org/BlogPosting">
    <meta itemprop="mainEntityOfPage" :content="`/blog/${data.id}`" />
    <meta itemprop="datePublished" :content="data.published_at" />
    <meta itemprop="dateModified" :content="data.updated_at || data.published_at" />
    <meta itemprop="author" content="Teacher Planner" />

    <p class="left__date" itemprop="datePublished">
      {{
        new Date(data.published_at).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      }}
    </p>

    <h1 class="left__title" itemprop="headline">{{ data.title }}</h1>
    <h2 class="left__subtitle">{{ data.preview_text }}</h2>

    <div class="left__keywords">
      <span
        v-for="keyword in keywords"
        :key="keyword"
        class="left__keyword"
        itemprop="keywords"
      >
        {{ keyword }}
      </span>
    </div>

    <img
      class="left__image"
      :src="`${domain}${data.file}`"
      :alt="`Изображение к новости: ${data.title}`"
      itemprop="image"
    />

    <div class="left__text" itemprop="articleBody">
      <p v-html="data.text"></p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { domain } from '@/utils'
import { computed } from 'vue'

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
  font-size: 16px;
  line-height: 24px;
  color: #344055;
}

.left__title {
  font-family: Inter;
  font-weight: 600;
  font-size: 28px;
  line-height: 36px;
  color: #344055;
  margin: 12px 0;
}

.left__subtitle {
  font-family: Inter;
  font-weight: 400;
  font-size: 18px;
  line-height: 28px;
  color: #344055;
}

.left__keywords {
  margin: 32px 0 0 0;
  display: flex;
  gap: 10px;
}

.left__keyword {
  border-radius: 50px;
  background-color: #f4f7ff;
  padding: 11px 18px;
  font-family: Inter;
  font-weight: 400;
  font-size: 15px;
  line-height: 100%;
  color: #1d4ecc;
}

.left__image {
  width: 100%;
  max-width: 860px;
  object-fit: cover;
  border-radius: 16px;
  max-height: 428px;
  margin: 32px 0 48px 0;
}

.left__text {
  font-family: Inter;
  font-weight: 400;
  font-size: 17px;
  line-height: 27px;
  color: #344055;
}
</style>
