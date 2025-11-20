<template>
  <section class="blogs">
    <div class="blogs__bread-crumbs">
      <a href="/" class="blogs__bread-crumb-title">Главная</a>
      <img src="/src/assets/icons/strelka.svg" alt="Стрелка" class="blogs__strelka" />
      <p class="blogs__bread-crumb-title">Блог</p>
    </div>

    <div class="blogs__header">
      <h1 class="blogs__title">Наши эксперты делятся</h1>
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
      />
    </div>

    <div class="blogs__pagination">
      <button
        class="blogs__pagination-button"
        v-if="currentPage !== 1"
        @click="goToPage(currentPage - 1)"
      >
        <img src="/src/assets/icons/strelka.svg" alt="Стрелка" class="blogs__pagination-icon-left" />
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
        <img src="/src/assets/icons/strelka.svg" alt="Стрелка" class="blogs__pagination-icon-right" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useHead } from '@unhead/vue'
import Blog from '@/components/blogPage/components/blog.vue'
import { getNews } from '@/api/requests'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const blogs = ref([])
const pages = ref(1)
const currentPage = ref(1)

const currentBlogs = computed(() => {
  return blogs.value[currentPage.value - 1] || []
})

function openBlogPage(id) {
  router.push(`/blog/${id}`)
}

function goToPage(page) {
  if (page < 1 || page > pages.value) return
  currentPage.value = page
  router.push(`/blogs?page=${page}`)
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
  const chunkSize = 12
  const chunks = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  blogs.value = chunks
}

onMounted(async () => {
  await getBlogs()
})

useHead({
  title: 'Блог TeacherPlanner — статьи для преподавателей и репетиторов',
  meta: [
    { name: 'description', content: 'Материалы и статьи для репетиторов и преподавателей: методики, аналитика, организация занятий, развитие учеников, повышение эффективности обучения.' },
    { name: 'keywords', content: 'блог для репетиторов, статьи для преподавателей, методики обучения, советы репетиторам, TeacherPlanner блог' },

    { property: 'og:title', content: 'Блог TeacherPlanner' },
    { property: 'og:description', content: 'Полезные статьи и материалы для учителей, репетиторов и онлайн-преподавателей.' },
    { property: 'og:url', content: 'https://teacherplanner.ru/blogs' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: 'https://teacherplanner.ru/meta/blog-cover.jpg' },

    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Блог TeacherPlanner' },
    { name: 'twitter:description', content: 'Статьи по методикам обучения и инструментам для преподавателей.' },
    { name: 'twitter:image', content: 'https://teacherplanner.ru/meta/blog-cover.jpg' }
  ],
  link: [
    { rel: 'canonical', href: 'https://teacherplanner.ru/blogs' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        "headline": "Блог TeacherPlanner",
        "description": "Статьи для репетиторов и преподавателей по методике, аналитике и организации обучения.",
        "url": "https://teacherplanner.ru/blogs",
        "publisher": {
          "@type": "Organization",
          "name": "TeacherPlanner",
          "url": "https://teacherplanner.ru"
        }
      })
    }
  ]
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
  color: #344055;
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
  font-size: 16px;
  opacity: 0.5;
}

.blogs__pagination-page:hover {
  background-color: #f3f4f6;
  transition: 0.3s;
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

  .blogs__bread-crumb-title {
    font-size: 13px;
  }

  .blogs__header {
    margin-top: 6px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .blogs__title {
    font-size: 17px;
  }

  .blogs__title-link {
    font-size: 14px;
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

  .blogs__items-container {
    grid-template-columns: 1fr;
    gap: 36px;
  }
}
</style>