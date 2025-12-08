<template>
  <div class="blog-section">
    <link rel="canonical" href="https://teacherplanner.ru/blogs" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content="Блог Teacher Planner — статьи для репетиторов и онлайн-преподавателей" />
    <meta property="og:description" content="Экспертные материалы, советы репетиторам и полезные статьи по онлайн-обучению." />
    <meta property="og:url" content="https://teacherplanner.ru/blogs" />
    <meta property="og:image" content="https://dev-teacherplanner.ru/og-image.jpg" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Блог Teacher Planner — эксперты делятся опытом" />
    <meta name="twitter:description" content="Статьи, советы и разборы для репетиторов и онлайн-учителей." />
    <meta name="twitter:image" content="https://dev-teacherplanner.ru/og-image.jpg" />

    <div class="blog-section__header">
      <div class="blog-section__header-container">
        <h1 class="blog-section__title section-title" itemprop="headline">
          Наши эксперты делятся опытом в сфере репетиторства и онлайн-обучения
        </h1>

        <a
          href="https://t.me/teacherplanner"
          target="_blank"
          rel="noopener noreferrer"
          class="desktop-only"
        >
          <div class="blog-section__button blog-section__mobile-hidden">
            Хотите опубликовать экспертную статью?
          </div>
        </a>
      </div>

      <button class="primary-button blog-section__header-button" @click="openBlogsPage">
        Перейти в блог
      </button>
    </div>

    <div class="blog-section__posts" role="list" itemscope itemtype="https://schema.org/ItemList">
      <meta itemprop="name" content="Список статей Teacher Planner" />
      <meta itemprop="description" content="Последние статьи по репетиторству и онлайн-обучению" />

      <div
        v-for="(item, key) in news"
        :key="item.id"
        :role="'listitem'"
        itemscope
        itemtype="https://schema.org/BlogPosting"
        :class="[
          key === 0 && 'blog-section__lead-post blog-section__lead-post_mobile',
          key !== 0 && 'blog-section__classic-post'
        ]"
        @click="openBlogPage(item.id, item.slug)"
      >
        <meta itemprop="mainEntityOfPage" :content="`https://teacherplanner.ru/blog/${item.id}`" />
        <meta itemprop="author" content="Teacher Planner" />
        <meta itemprop="publisher" content="Teacher Planner" />
        <meta itemprop="articleSection" content="Онлайн-обучение" />

        <template v-if="key === 0">
          <img
            decoding="async"
            :src="`${domain}${item.file}`"
            :alt="`${item.title} — статья для репетиторов Teacher Planner`"
            :title="item.title"
            width="600"
            height="350"
            itemprop="image"
            class="blog-section__featured-image blog-section__featured-image_mobile"
          />

          <div class="blog-section__image-text blog-section__mobile-container">
            <p class="blog-section__post-date blog-section__post-date_mobile">
              <time :datetime="item.published_at.replace(' ', 'T')" itemprop="datePublished">
                {{
                  new Date(item.published_at).toLocaleDateString("ru", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })
                }}
              </time>
            </p>

            <h2 class="blog-section__post-title blog-section__post-title_mobile" itemprop="headline">
              <router-link :to="`/blog/${item.id}`" itemprop="url">
                {{ item.title }}
              </router-link>
            </h2>

            <p class="blog-section__post-preview blog-section__post-preview_mobile" itemprop="description">
              {{ (item.preview_text || '').slice(0, 160).trim() }}…
            </p>
          </div>
        </template>

        <template v-else>
          <img
            loading="lazy"
            :src="`${domain}${item.file}`"
            :alt="`${item.title} — полезная статья для преподавателей и репетиторов`"
            :title="item.title"
            width="600"
            height="350"
            itemprop="image"
            class="blog-section__classic-image"
          />

          <div class="blog-section__post-data">
            <p class="blog-section__post-date">
              <time :datetime="item.published_at.replace(' ', 'T')" itemprop="datePublished">
                {{
                  new Date(item.published_at).toLocaleDateString("ru", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })
                }}
              </time>
            </p>

            <h3 class="blog-section__post-title" itemprop="headline">
              <router-link :to="`/blog/${item.id}`" itemprop="url">
                {{ item.title }}
              </router-link>
            </h3>

            <p class="blog-section__post-preview" itemprop="description">
              {{ (item.preview_text || "").replace(/<\/?[^>]+(>|$)/g, "") }}…
            </p>
          </div>
        </template>
      </div>
    </div>

    <div class="blog-section__footer blog-section__mobile blog-section__footer-mobile">
      <a
        href="https://t.me/teacherplanner?utm_source=site&utm_medium=blog_block"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="blog-section__button">Хотите написать статью?</div>
      </a>

      <button
        class="primary-button blog-section__footer-button-mobile"
        @click="openBlogsPage"
      >
        Перейти в блог
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getNews } from "@/api/lessons";
import { useRouter } from "vue-router";
import { domain } from "@/utils";

const router = useRouter();
const news = ref([]);

function openBlogPage(id, slug) {
  router.push(`/blog/${id.toString()}/${slug.toString()}`);
}

function openBlogsPage() {
  router.push({ name: "blogs" });
}

onMounted(async () => {
  const response = await getNews();
  news.value = response
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .slice(0, 5);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Блог Teacher Planner",
    "description": "Статьи для репетиторов, советы по онлайн-обучению",
    "url": "https://teacherplanner.ru/blogs",
    "publisher": {
      "@type": "Organization",
      "name": "Teacher Planner",
      "logo": {
        "@type": "ImageObject",
        "url": "https://dev-teacherplanner.ru/og-image.jpg"
      }
    },
    "inLanguage": "ru-RU"
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.text = JSON.stringify(ld);
  document.head.appendChild(script);
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