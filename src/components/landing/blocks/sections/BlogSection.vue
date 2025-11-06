<template>
  <div class="blog-section">
    <div class="blog-section__header">
      <div class="blog-section__header-container">
        <h2 class="blog-section__title section-title">Наши эксперты делятся</h2>
        <a href="https://t.me/teacherplanner" target="_blank" class="desktop-only">
          <div class="blog-section__button blog-section__mobile-hidden">
            Хотите написать статью?
          </div>
        </a>
      </div>

      <button class="primary-button blog-section__header-button" @click="openBlogPage">
        Перейти в блог
      </button>
    </div>
    <div class="blog-section__posts">
      <div
        v-for="(item, key) in news"
        :key="item.id"
        :class="[
          key === 0 && 'blog-section__lead-post blog-section__lead-post_mobile',
          key !== 0 && 'blog-section__classic-post',
        ]"
      >
        <template v-if="key === 0">
          <img
            loading="lazy"
            :src="`${domain}${item.file}`"
            alt="Lead Post"
            class="blog-section__featured-image blog-section__featured-image_mobile"
          />
          <div class="blog-section__image-text blog-section__mobile-container">
            <p class="blog-section__post-date blog-section__post-date_mobile">
              {{
                new Date(item.published_at).toLocaleDateString('ru', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              }}
            </p>
            <h4 class="blog-section__post-title blog-section__post-title_mobile">
              {{ item.title }}
            </h4>
            <p class="blog-section__post-preview blog-section__post-preview_mobile">
              {{ item.preview_text }}...
            </p>
          </div>
        </template>
        <template v-else>
          <img
            loading="lazy"
            :src="`${domain}${item.file}`"
            alt="First Post Mobile"
            class="blog-section__classic-image"
          />
          <div class="blog-section__post-data">
            <p class="blog-section__post-date">
              {{
                new Date(item.published_at).toLocaleDateString('ru', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              }}
            </p>
            <h4 class="blog-section__post-title">{{ item.title }}</h4>
            <p class="blog-section__post-preview">{{ item.preview_text }}...</p>
          </div>
        </template>
      </div>
    </div>

    <div class="blog-section__footer blog-section__mobile blog-section__footer-mobile">
      <a href="https://t.me/teacherplanner" target="_blank">
        <div class="blog-section__button">Хотите написать статью?</div>
      </a>

      <button class="primary-button blog-section__footer-button-mobile" @click="openBlogPage">
        Перейти в блог
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getNews } from '@/api/requests'
import { useRouter } from 'vue-router'
import { domain } from '@/utils'

const router = useRouter()

const news = ref()

function openBlogPage() {
  console.log('blog')
  router.push({ name: 'blog' })
}

onMounted(async () => {
  const response = await getNews()
  const filteredValue = response.sort((a, b) => {
    return new Date(b.published_at) - new Date(a.published_at)
  })
  news.value = filteredValue.slice(0, 5)
})
</script>

<style scoped>
.blog-section__header-container {
  display: flex;
  gap: 25px;
}

.blog-section__header-container > a {
  margin-top: 16px;
}

.blog-section__footer-button-mobile {
  display: none;
}

@media screen and (max-width: 768px) {
  .blog-section__header-button {
    display: none;
  }

  .blog-section__lead-post_mobile {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .blog-section__featured-image_mobile {
    border-radius: 16px;
  }

  .blog-section__mobile-container {
    position: relative;
    background: inherit;
    border-right: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
    border-left: 1px solid #e5e7eb;
  }

  .blog-section__post-date_mobile {
    color: #344055 !important;
    font-family: Inter, sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    opacity: 0.72;
  }

  .blog-section__post-title_mobile {
    color: #344055 !important;
  }

  .blog-section__post-preview_mobile {
    color: #344055 !important;
    font-family: Inter, sans-serif;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    opacity: 0.8;
  }

  .blog-section__footer-mobile {
    justify-content: space-between;
    align-items: center;
  }

  .blog-section__footer-button-mobile {
    display: flex;
  }
}

@media screen and (max-width: 420px) {
  .blog-section__footer-mobile {
    gap: 20px;
    flex-direction: column;
  }
}
</style>
