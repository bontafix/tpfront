<template>
  <article class="blog" itemscope itemtype="https://schema.org/BlogPosting">
    <figure class="blog__figure">
      <img
        :src="`${domain}${blog.file}`"
        :alt="`Изображение к статье: ${blog.title}`"
        :title="blog.title"
        class="blog__image"
        itemprop="image"
      />
    </figure>

    <div class="blog__container">
      <div class="blog__text-container">
        <h3 class="blog__title" itemprop="headline">{{ blog.title }}</h3>
        <p class="blog__text" itemprop="description">{{ blog.preview_text }}...</p>
      </div>

      <time
        class="blog__date"
        :datetime="new Date(blog.published_at).toISOString()"
        itemprop="datePublished"
      >
        {{
          new Date(blog.published_at).toLocaleDateString('ru', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        }}
      </time>

      <meta itemprop="author" :content="blog.author || 'Teacher Planner'" />
      <meta itemprop="url" :content="`${domain}/blog/${blog.id}`" />
      <meta itemprop="mainEntityOfPage" :content="`${domain}/blog/${blog.id}`" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { domain } from '@/utils'

const props = defineProps({
  blog: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.blog {
  display: flex;
  flex-direction: column;
  gap: 20px;
  cursor: pointer;
}

.blog__figure {
  margin: 0;
}

.blog__image {
  min-height: 266px;
  height: 266px;
  max-height: 266px;
  object-fit: cover;
  border-radius: 16px;
}

.blog__container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  gap: 12px;
}

.blog__text-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 4px;
}

.blog__title {
  font-family: Inter;
  font-weight: 600;
  font-style: normal;
  font-size: 20px;
  line-height: 28px;
  color: #344055;
}

.blog__text {
  font-family: Inter;
  font-weight: 400;
  font-style: normal;
  font-size: 16px;
  line-height: 24px;
  color: #344055;
  opacity: 0.85;
}

.blog__date {
  font-family: Inter;
  font-weight: 400;
  font-style: normal;
  font-size: 16px;
  line-height: 24px;
  color: #344055;
  opacity: 0.5;
  margin: 0 4px;
}

@media screen and (max-width: 1023px) {
  .blog {
    gap: 14px;
  }

  .blog__image {
    min-height: 204px;
    height: 204px;
    max-height: 204px;
    border-radius: 12px;
  }

  .blog__container {
    gap: 8px;
  }

  .blog__text-container {
    gap: 4px;
    margin: 0 8px;
  }

  .blog__title {
    font-size: 15px;
    line-height: 22px;
  }

  .blog__text {
    font-size: 13px;
    line-height: 20px;
  }

  .blog__date {
    font-size: 13px;
    line-height: 20px;
    margin: 0 8px;
  }
}
</style>