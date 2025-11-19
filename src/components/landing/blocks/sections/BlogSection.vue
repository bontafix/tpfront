<template>
  <div class="blog-section">
    <div class="blog-section__header">
      <div class="blog-section__header-container">
        <h2 class="blog-section__title section-title">Наши эксперты делятся опытом в сфере репетиторства и онлайн-обучения</h2>
        <a
          href="https://t.me/teacherplanner"
          target="_blank"
          class="desktop-only"
        >
          <div class="blog-section__button blog-section__mobile-hidden">
            Хотите опубликовать экспертную статью?
          </div>
        </a>
      </div>

      <button
        class="primary-button blog-section__header-button"
        @click="openBlogsPage"
      >
        Перейти в блог
      </button>
    </div>
    <div class="blog-section__posts" role="list">
      <div
        v-for="(item, key) in news"
        :role="'listitem'"
        :key="item.id"
        :class="[
          key === 0 && 'blog-section__lead-post blog-section__lead-post_mobile',
          key !== 0 && 'blog-section__classic-post',
        ]"
        @click="openBlogPage(item.id)"
      >
        <template v-if="key === 0">
          <img
            :decoding="'async'"
            :src="`${domain}${item.file}`"
            :alt="`${item.title} — статья в блоге Teacher Planner`"
            width="600"
            height="350"
            class="blog-section__featured-image blog-section__featured-image_mobile"
          />
          <div class="blog-section__image-text blog-section__mobile-container">
            <p class="blog-section__post-date blog-section__post-date_mobile">
                <time :datetime="item.published_at.replace(' ', 'T')">
                {{
                    new Date(item.published_at).toLocaleDateString("ru", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    })
                }}
                </time>
            </p>
            <h4
              class="blog-section__post-title blog-section__post-title_mobile"
            >
              <router-link 
              :to="`/blog/${item.id}`"
              :aria-label="`Читать статью: ${item.title}`"
              >
              {{ item.title }}
            </router-link>
            </h4>
            <p
              class="blog-section__post-preview blog-section__post-preview_mobile"
            >
              {{ (item.preview_text || '').slice(0, 160).trim() }}…
            </p>
          </div>
        </template>
        <template v-else>
          <img
            :loading="'lazy'"
            :src="`${domain}${item.file}`"
            :alt="`${item.title} — полезный материал для репетиторов`"
            width="600"
            height="350"
            class="blog-section__classic-image"
          />
          <div class="blog-section__post-data">
            <p class="blog-section__post-date">
                <time :datetime="item.published_at.replace(' ', 'T')">
                {{
                    new Date(item.published_at).toLocaleDateString("ru", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    })
                }}
                </time>
            </p>
            <h4 class="blog-section__post-title"><router-link
            :to="`/blog/${item.id}`"
            :title="`Читать статью: ${item.title}`"
            >
            {{ item.title }}
            </router-link></h4>
            <p class="blog-section__post-preview">{{ (item.preview_text || "").replace(/<\/?[^>]+(>|$)/g, "") }}…</p>
          </div>
        </template>
      </div>
    </div>

    <div
      class="blog-section__footer blog-section__mobile blog-section__footer-mobile"
    >
      <a href="https://t.me/teacherplanner?utm_source=site&utm_medium=blog_block"
       target="_blank"
       rel="noopener noreferrer"
       >
        <div class="blog-section__button">Хотите написать статью?</div>
      </a>

      <button
        class="primary-button blog-section__footer-button-mobile"
        aria-label="Открыть блог Teacher Planner с полезными статьями для репетиторов"
        @click="openBlogsPage"
      >
        Перейти в блог
      </button>
    </div>
  </div>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "Блог Teacher Planner",
  "description": "Статьи для репетиторов, советы по онлайн-обучению и ведению занятий",
  "url": "https://teacherplanner.ru/blog",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://teacherplanner.ru/blog"
  }
}
</script>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getNews } from "@/api/requests";
import { useRouter } from "vue-router";
import { domain } from "@/utils";

const router = useRouter();

const news = ref();

function openBlogPage(id) {
  router.push(`/blog/${id.toString()}`);
}

function openBlogsPage() {
  router.push({ name: "blogs" });
}

onMounted(async () => {
  const response = await getNews();
  const filteredValue = response.sort((a, b) => {
    return new Date(b.published_at) - new Date(a.published_at);
  });
  news.value = filteredValue.slice(0, 5);
});
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