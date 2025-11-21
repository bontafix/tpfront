<template>
  <article class="blog-article" itemscope itemtype="https://schema.org/BlogPosting">
    <time class="blog-article__date" :datetime="data.published_at" itemprop="datePublished">
      {{
        new Date(data.published_at).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      }}
    </time>

    <h1 class="blog-article__title" itemprop="headline">{{ data.title }}</h1>
    <h2 class="blog-article__subtitle" itemprop="description">{{ data.preview_text }}</h2>

    <div class="blog-article__keywords" itemprop="keywords">
      <span v-for="keyword in keywords" :key="keyword" class="blog-article__keyword">{{
        keyword
      }}</span>
    </div>

    <img
      class="blog-article__image"
      :src="`${domain}${data.file}`"
      :alt="data.title"
      itemprop="image"
    />

    <div class="blog-article__content" itemprop="articleBody">
      <p v-html="data.text"></p>
    </div>
  </article>
</template>

<script setup>
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
.blog-article {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.blog-article__date {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #344055;
}

.blog-article__title {
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 28px;
  line-height: 36px;
  color: #344055;
  margin: 12px 0;
}

.blog-article__subtitle {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 18px;
  line-height: 28px;
  color: #344055;
}

.blog-article__keywords {
  margin: 32px 0 0 0;
  display: flex;
  gap: 10px;
}

.blog-article__keyword {
  border-radius: 50px;
  background-color: #f4f7ff;
  padding: 11px 18px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 15px;
  line-height: 100%;
  color: #1d4ecc;
}

.blog-article__image {
  width: 100%;
  max-width: 860px;
  object-fit: cover;
  border-radius: 16px;
  max-height: 428px;
  margin: 32px 0 48px 0;
}

.blog-article__content {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 17px;
  line-height: 27px;
  color: #344055;
}

@media screen and (max-width: 1439px) {
  .blog-article__image {
    max-width: 944px;
    max-height: 536px;
    border-radius: 12px;
  }
}

@media screen and (max-width: 1023px) {
  .blog-article__date {
    font-size: 12px;
  }

  .blog-article__title {
    font-size: 17px;
    line-height: 26px;
    margin: 8px 0;
  }

  .blog-article__subtitle {
    font-size: 13px;
    line-height: 20px;
  }

  .blog-article__keywords {
    margin: 20px 0 0 0;
    gap: 6px;
  }

  .blog-article__keyword {
    padding: 8px 16px;
    font-size: 12px;
  }

  .blog-article__image {
    max-width: 688px;
    border-radius: 10px;
    max-height: 407px;
    margin: 20px 0 28px 0;
  }

  .blog-article__content {
    font-size: 13px;
    line-height: 20px;
  }
}

@media screen and (max-width: 767px) {
  .blog-article__keywords {
    flex-wrap: wrap;
    gap: 8px 6px;
  }

  .blog-article__image {
    max-height: 240px;
  }
}
</style>
