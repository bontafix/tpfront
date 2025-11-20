<template>
  <main itemscope itemtype="https://schema.org/Blog">
    <Header />

    <div class="content-container">
      <section class="blogs">
        <div class="blogs__bread-crumbs" aria-label="Хлебные крошки">
          <a href="/" class="blogs__bread-crumb-title">Главная</a>
          <img src="/src/assets/icons/strelka.svg" alt="Стрелка" class="blogs__strelka" />
          <p class="blogs__bread-crumb-title">Блог</p>
        </div>

        <div class="blogs__header">
          <h1 class="blogs__title" itemprop="name">Наши эксперты делятся</h1>
          <a href="https://t.me/teacherplanner" target="_blank" class="blogs__title-link">
            Хотите написать статью?
          </a>
        </div>

        <div class="blogs__items-container">
          <Blog
            v-for="blog in currentBlogs"
            :key="blog.id"
            :blog="blog"
            @click="() => openBlogPage(blog.id)"
            itemprop="blogPost"
            itemscope
            itemtype="https://schema.org/BlogPosting"
          />
        </div>

        <div class="blogs__pagination">
          <button
            class="blogs__pagination-button"
            v-if="currentPage !== 1"
            @click="goToPage(currentPage - 1)"
          >
            <img
              src="/src/assets/icons/strelka.svg"
              alt="Стрелка"
              class="blogs__pagination-icon-left"
            />
          </button>

          <span
            v-for="page in pages"
            :key="page"
            class="blogs__pagination-page"
            :class="[currentPage === page && 'blogs__pagination-page_active']"
            @click="goToPage(page)"
          >
            {{ page }}
          </span>

          <button
            class="blogs__pagination-button"
            v-if="currentPage !== pages && pages > 0"
            @click="goToPage(currentPage + 1)"
          >
            <img
              src="/src/assets/icons/strelka.svg"
              alt="Стрелка"
              class="blogs__pagination-icon-right"
            />
          </button>
        </div>

        <script type="application/ld+json">
          {{
            JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              "name": "Блог Teacher Planner",
              "url": window.location.href,
              "description": "Читать статьи наших экспертов по обучению и организации учебного процесса",
              "publisher": {
                "@type": "Organization",
                "name": "Teacher Planner",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://teacherplanner.ru/logo.png"
                }
              },
              "blogPost": currentBlogs.map(b => ({
                "@type": "BlogPosting",
                "headline": b.title,
                "image": b.file ? `https://teacherplanner.ru${b.file}` : "",
                "author": {
                  "@type": "Person",
                  "name": "Teacher Planner"
                },
                "datePublished": b.published_at,
                "dateModified": b.updated_at || b.published_at,
                "mainEntityOfPage": `/blog/${b.id}`,
                "keywords": b.keywords
              }))
            })
          }}
        </script>

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Блог Teacher Planner" />
        <meta property="og:description" content="Читать статьи наших экспертов по обучению и организации учебного процесса" />
        <meta property="og:image" content="https://teacherplanner.ru/logo.png" />
        <meta property="og:url" content="https://teacherplanner.ru/blogs" />
        <meta property="og:site_name" content="Teacher Planner" />
      </section>

      <Footer />
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import Blog from './blog.vue'
import { getNews } from '@/api/requests'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const blogs = ref([])
const pages = ref(1)
const currentPage = ref(1)

const currentBlogs = computed(() => blogs.value[currentPage.value - 1] || [])

function openBlogPage(id) {
  router.push(`/blog/${id}`)
}

function goToPage(page: number) {
  if (page < 1 || page > pages.value) return
  currentPage.value = page
  router.push(`/blogs?page=${page}`)
  window.scrollTo(0, 0)
}

function chunkBlogs(array: any[]) {
  blogs.value = []
  for (let i = 0; i < array.length; i += 12) {
    blogs.value.push(array.slice(i, i + 12))
  }
}

async function getBlogs() {
  const result = await getNews()
  chunkBlogs(result)
  pages.value = blogs.value.length
  const pageFromUrl = Number(route.query.page)
  if (pageFromUrl >= 1 && pageFromUrl <= pages.value) {
    currentPage.value = pageFromUrl
  } else {
    currentPage.value = 1
    router.replace(`/blogs?page=1`)
  }
}

onMounted(async () => {
  await getBlogs()
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
</style>
