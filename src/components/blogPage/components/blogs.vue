<template>
  <section class="blogs" itemscope itemtype="https://schema.org/Blog">
    <nav class="blogs__bread-crumbs" aria-label="breadcrumb">
      <a href="/" class="blogs__bread-crumb-title" itemprop="url">Главная</a>
      <img src="/src/assets/icons/strelka.svg" alt="Стрелка" class="blogs__strelka" />
      <span class="blogs__bread-crumb-title" aria-current="page">Блог</span>
    </nav>

    <header class="blogs__header">
      <h1 class="blogs__title" itemprop="headline">Наши эксперты делятся</h1>
      <a
        href="https://t.me/teacherplanner"
        target="_blank"
        rel="noopener noreferrer"
        class="blogs__title-link"
        itemprop="sameAs"
      >
        Хотите написать статью?
      </a>
    </header>

    <section class="blogs__items-container">
      <Blog
        v-for="blog in currentBlogs"
        :key="blog.id"
        :blog="blog"
        @click="() => openBlogPage(blog.id)"
        itemprop="blogPost"
        itemscope
        itemtype="https://schema.org/BlogPosting"
      />
    </section>

    <nav class="blogs__pagination" aria-label="Pagination">
      <button
        class="blogs__pagination-button"
        v-if="currentPage !== 1"
        @click="goToPage(currentPage - 1)"
        aria-label="Предыдущая страница"
      >
        <img
          src="/src/assets/icons/strelka.svg"
          alt="Стрелка назад"
          class="blogs__pagination-icon-left"
        />
      </button>

      <span
        v-for="page in pages"
        :key="page"
        class="blogs__pagination-page"
        :class="{ blogs__pagination-page_active: currentPage === page }"
        @click="goToPage(page)"
        :aria-current="currentPage === page ? 'page' : null"
      >
        {{ page }}
      </span>

      <button
        class="blogs__pagination-button"
        v-if="currentPage !== pages && pages > 0"
        @click="goToPage(currentPage + 1)"
        aria-label="Следующая страница"
      >
        <img
          src="/src/assets/icons/strelka.svg"
          alt="Стрелка вперед"
          class="blogs__pagination-icon-right"
        />
      </button>
    </nav>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import Blog from './blog.vue'
import { getNews } from '@/api/requests'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const blogs = ref<any[]>([])
const pages = ref(1)
const currentPage = ref(1)

const currentBlogs = computed(() => {
  return blogs.value[currentPage.value - 1] || []
})

function openBlogPage(id: number | string) {
  router.push({ path: `/blog/${id}` })
}

function goToPage(page: number) {
  if (page < 1 || page > pages.value) return

  currentPage.value = page
  router.push({ path: `/blogs`, query: { page } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
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
      router.replace({ path: '/blogs', query: { page: 1 } })
    }
  } else {
    currentPage.value = 1
    router.replace({ path: '/blogs', query: { page: 1 } })
  }
}

function chunkBlogs(array: any[]) {
  blogs.value = []
  for (let i = 0; i < array.length; i += 12) {
    blogs.value.push(array.slice(i, i + 12))
  }
}

onMounted(async () => {
  await getBlogs()
})
</script>

<style scoped>
.blogs {
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
  text-decoration: none;
}

.blogs__strelka {
  transform: rotate(-90deg);
  width: 20px;
  height: 20px;
}

.blogs__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.blogs__title {
  font-family: Inter;
  font-weight: 600;
  font-size: 28px;
  line-height: 36px;
  color: #344055;
}

.blogs__title-link {
  font-family: Inter;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-decoration: underline;
  color: #1d4ecc;
}

.blogs__items-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 56px 24px;
}

.blogs__pagination {
  display: flex;
  gap: 4px;
  margin-top: 32px;
}

.blogs__pagination-button {
  width: 36px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}

.blogs__pagination-button:hover {
  background-color: #f3f4f6;
  transition: 0.3s ease-in-out;
}

.blogs__pagination-icon-left {
  transform: rotate(90deg);
}

.blogs__pagination-icon-right {
  transform: rotate(-90deg);
}

.blogs__pagination-page {
  width: 56px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  font-family: Inter;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  opacity: 0.5;
}

.blogs__pagination-page:hover {
  background-color: #f3f4f6;
  transition: 0.3s ease-in-out;
}

.blogs__pagination-page_active {
  background-color: #f3f4f6;
  color: #344055;
}

@media screen and (max-width: 1439px) {
  .blogs {
    max-width: 1024px;
    padding: 0 40px;
    margin: 42px auto 80px auto;
  }

  .blogs__items-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 1023px) {
  .blogs {
    max-width: 768px;
    margin: 26px auto 56px auto;
    gap: 20px;
  }

  .blogs__bread-crumbs {
    gap: 6px;
  }

  .blogs__bread-crumb-title {
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
    letter-spacing: 0;
  }

  .blogs__header {
    margin-top: 6px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .blogs__title {
    font-size: 17px;
    line-height: 26px;
  }

  .blogs__title-link {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
  }

  .blogs__items-container {
    gap: 40px 20px;
  }

  .blogs__pagination {
    margin-top: 16px;
  }

  .blogs__pagination-button {
    width: 36px;
    height: 40px;
  }

  .blogs__pagination-page {
    width: 44px;
    height: 40px;
  }
}

@media screen and (max-width: 767px) {
  .blogs {
    max-width: 100%;
    margin: 20px auto 56px auto;
  }

  .blogs__strelka {
    width: 16px;
    height: 16px;
  }

  .blogs__items-container {
    grid-template-columns: 1fr;
    gap: 36px;
  }
}
</style>