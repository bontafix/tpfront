<template>
  <main itemscope itemtype="https://schema.org/Blog">
    <Header />

    <div class="content-container">
      <section class="blog">
        <div class="blogs__bread-crumbs" aria-label="Хлебные крошки">
          <a href="/" class="blogs__bread-crumb-title">Главная</a>
          <img src="/src/assets/icons/strelka.svg" alt="Стрелка" class="blogs__strelka" />
          <a href="/blogs" class="blogs__bread-crumb-title">Блог</a>
          <img src="/src/assets/icons/strelka.svg" alt="Стрелка" class="blogs__strelka" />
          <p class="blogs__bread-crumb-title" v-if="data" itemprop="name">{{ data.title }}</p>
        </div>

        <div class="blog__center-container" v-if="data?.id">
          <LeftContainer :data="data" />
          <RightContainer />
        </div>

        <script type="application/ld+json">
          {{
            JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              "name": data?.title || "",
              "url": currentUrl,
              "description": data?.preview_text || "",
              "publisher": {
                "@type": "Organization",
                "name": "Teacher Planner",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://teacherplanner.ru/logo.png"
                }
              },
              "blogPost": data
                ? [
                    {
                      "@type": "BlogPosting",
                      "headline": data.title,
                      "image": data.file ? `https://teacherplanner.ru${data.file}` : "",
                      "author": {
                        "@type": "Person",
                        "name": "Teacher Planner"
                      },
                      "datePublished": data.published_at,
                      "dateModified": data.updated_at || data.published_at,
                      "mainEntityOfPage": currentUrl,
                      "keywords": data.keywords
                    }
                  ]
                : []
            })
          }}
        </script>

        <meta property="og:type" content="article" />
        <meta property="og:title" :content="data?.title" />
        <meta property="og:description" :content="data?.preview_text" />
        <meta property="og:image" :content="data?.file ? `https://teacherplanner.ru${data.file}` : ''" />
        <meta property="og:url" :content="currentUrl" />
        <meta property="og:site_name" content="Teacher Planner" />
      </section>

      <Footer />
    </div>
  </main>
</template>

<script setup lang="ts">
import Header from '../landing/blocks/Header.vue'
import Footer from '../landing/blocks/Footer.vue'
import LeftContainer from './components/leftContainer.vue'
import RightContainer from './components/rightContainer.vue'
import { onMounted, ref, computed } from 'vue'
import { getNewsById } from '@/api/requests'
import { useRoute } from 'vue-router'

const route = useRoute()
const data = ref<any>(null)

const currentUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.href
  }
  return `https://teacherplanner.ru${route.path}`
})

onMounted(async () => {
  data.value = await getNewsById(route.params.id)
})
</script>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  z-index: 2;
  background-color: #fff;
  transform: translateZ(0);
  margin-top: 75px;
}

.blog {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1516px;
  margin: 42px auto 120px auto;
  padding: 0 60px;
}

.blogs__bread-crumbs {
  display: flex;
  gap: 12px;
  align-items: center;
}

.blogs__bread-crumb-title {
  font-family: Inter;
  font-weight: 500;
  font-size: 16px;
  line-height: 32px;
  letter-spacing: -2%;
  color: #344055;
}

.blogs__strelka {
  transform: rotate(-90deg);
  width: 20px;
  height: 20px;
}

.blog__center-container {
  display: flex;
  gap: 81px;
}
</style>