<template>
  <article class="blog-post" itemscope itemtype="https://schema.org/BlogPosting">
    <img :src="`${domain}${blog.file}`" :alt="blog.title" class="blog-post__image" itemprop="image" />
    <div class="blog-post__container">
      <h2 class="blog-post__title" itemprop="headline">{{ blog.title }}</h2>
      <p class="blog-post__text" itemprop="description">{{ blog.preview_text }}...</p>
      <time class="blog-post__date" itemprop="datePublished" :datetime="blog.published_at">
        {{ new Date(blog.published_at).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' }) }}
      </time>
    </div>
  </article>
</template>

<script setup>
import { domain } from '@/utils'

defineProps({
  blog: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.blog-post {
  display: flex;
  flex-direction: column;
  gap: 20px;
  cursor: pointer;
}

.blog-post__image {
  min-height: 266px;
  height: 266px;
  max-height: 266px;
  object-fit: cover;
  border-radius: 16px;
}

.blog-post__container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  gap: 12px;
}

.blog-post__title {
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  color: #344055;
}

.blog-post__text {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #344055;
  opacity: 0.8;
}

.blog-post__date {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #344055;
  opacity: 0.5;
}

@media screen and (max-width: 1023px) {
  .blog-post {
    gap: 14px;
  }

  .blog-post__image {
    min-height: 204px;
    height: 204px;
    max-height: 204px;
    border-radius: 12px;
  }

  .blog-post__container {
    gap: 8px;
  }

  .blog-post__title {
    font-size: 15px;
    line-height: 22px;
  }

  .blog-post__text {
    font-size: 13px;
    line-height: 20px;
  }

  .blog-post__date {
    font-size: 13px;
    line-height: 20px;
  }
}
</style>