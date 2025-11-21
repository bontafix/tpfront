<template>
  <section class="blogs-section" itemscope itemtype="https://schema.org/Blog">
    <nav class="blogs-section__bread-crumbs" aria-label="Навигация по сайту">
      <a href="/" class="blogs-section__bread-crumb-title">Главная</a>
      <img src="/src/assets/icons/strelka.svg" alt="Стрелка" class="blogs-section__strelka" />
      <span class="blogs-section__bread-crumb-title" aria-current="page">Блог</span>
    </nav>

    <header class="blogs-section__header">
      <h1 class="blogs-section__title" itemprop="headline">Наши эксперты делятся</h1>
      <a href="https://t.me/teacherplanner" target="_blank" class="blogs-section__title-link">
        Хотите написать статью?
      </a>
    </header>

    <div class="blogs-section__items" itemprop="blogPost">
      <Blog v-for="blog in currentBlogs" :key="blog.id" :blog="blog" @click="() => openBlogPage(blog.id)" />
    </div>

    <nav class="blogs-section__pagination" aria-label="Пагинация">
      <button
        class="blogs-section__pagination-button"
        v-if="currentPage !== 1"
        @click="goToPage(currentPage - 1)"
      >
        <img src="/src/assets/icons/strelka.svg" alt="Предыдущая страница" class="blogs-section__pagination-icon-left" />
      </button>

      <span
        v-for="page in pages"
        :key="page"
        class="blogs-section__pagination-page"
        :class="[currentPage === page && 'blogs-section__pagination-page_active']"
        @click="goToPage(page)"
        :aria-current="currentPage === page ? 'page' : null"
      >
        {{ page }}
      </span>

      <button
        class="blogs-section__pagination-button"
        v-if="currentPage !== pages && pages > 0"
        @click="goToPage(currentPage + 1)"
      >
        <img src="/src/assets/icons/strelka.svg" alt="Следующая страница" class="blogs-section__pagination-icon-right" />
      </button>
    </nav>
  </section>
</template>

<script setup>
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
  router.push(`/blog/${id.toString()}`)
}

function goToPage(page) {
  if (page < 1 || page > pages.value) return
  currentPage.value = page
  router.push(`/blogs?page=${page.toString()}`)
  window.scrollTo(0, 0)
}

async function getBlogs() {
  const result = await getNews()
  chunkBlogs(result)
  pages.value = blogs.value.length
  if (route.query.page) {
    const pageFromUrl = Number(route.query.page)
    if (pageFromUrl >= 1 && pageFromUrl <= pages.value) {
      currentPage.value = pageFromUrl
    } else {
      currentPage.value = 1
      router.replace(`/blogs?page=1`)
    }
  } else {
    currentPage.value = 1
    router.replace(`/blogs?page=1`)
  }
}

function chunkBlogs(array) {
  for (let i = 0; i < array.length; i += 12) {
    blogs.value.push(array.slice(i, i + 12))
  }
}

onMounted(getBlogs)
</script>

<style scoped>
.blogs-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1516px;
  margin: 42px auto 120px auto;
  padding: 0 60px;
}

.blogs-section__bread-crumbs {
  display: flex;
  gap: 12px;
  align-items: center;
}

.blogs-section__bread-crumb-title {
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 32px;
  color: #344055;
}

.blogs-section__strelka {
  transform: rotate(-90deg);
  width: 20px;
  height: 20px;
}

.blogs-section__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.blogs-section__title {
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 28px;
  line-height: 36px;
  color: #344055;
}

.blogs-section__title-link {
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-decoration: underline;
  color: #1d4ecc;
}

.blogs-section__items {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 56px 24px;
}

.blogs-section__pagination {
  display: flex;
  gap: 4px;
  margin-top: 32px;
}

.blogs-section__pagination-button {
  width: 36px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}

.blogs-section__pagination-button:hover {
  background-color: #f3f4f6;
  transition: 0.3s ease-in-out;
}

.blogs-section__pagination-icon-left {
  transform: rotate(90deg);
}

.blogs-section__pagination-icon-right {
  transform: rotate(-90deg);
}

.blogs-section__pagination-page {
  width: 56px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  opacity: 0.5;
}

.blogs-section__pagination-page:hover {
  background-color: #f3f4f6;
  transition: 0.3s ease-in-out;
}

.blogs-section__pagination-page_active {
  background-color: #f3f4f6;
  color: #344055;
}

@media screen and (max-width: 1439px) {
  .blogs-section {
    max-width: 1024px;
    padding: 0 40px;
    margin: 42px auto 80px auto;
  }
  .blogs-section__items {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 1023px) {
  .blogs-section {
    max-width: 768px;
    margin: 26px auto 56px auto;
    gap: 20px;
  }
  .blogs-section__bread-crumbs {
    gap: 6px;
  }
  .blogs-section__bread-crumb-title {
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
  }
  .blogs-section__header {
    margin-top: 6px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .blogs-section__title {
    font-size: 17px;
    line-height: 26px;
  }
  .blogs-section__title-link {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
  }
  .blogs-section__items {
    gap: 40px 20px;
  }
  .blogs-section__pagination {
    margin-top: 16px;
  }
  .blogs-section__pagination-button {
    width: 36px;
    height: 40px;
  }
  .blogs-section__pagination-page {
    width: 44px;
    height: 40px;
  }
}

@media screen and (max-width: 767px) {
  .blogs-section {
    max-width: 100%;
    margin: 20px auto 56px auto;
  }
  .blogs-section__strelka {
    width: 16px;
    height: 16px;
  }
  .blogs-section__items {
    grid-template-columns: 1fr;
    gap: 36px;
  }
}
</style>
