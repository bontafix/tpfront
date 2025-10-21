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
      <Blog v-for="blog in blogs[currentPage]" :key="blog.id" :blog="blog" />
    </div>

    <div class="blogs__pagination">
      <button class="blogs__pagination-button" v-if="currentPage !== 1">
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
        >{{ page }}</span
      >

      <button class="blogs__pagination-button" v-if="currentPage !== pages" @click="handleNextPage">
        <img
          src="/src/assets/icons/strelka.svg"
          alt="Стрелка"
          class="blogs__pagination-icon-right"
        />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Blog from './blog.vue'
import { getNews } from '@/api/requests'
import { useRoute } from 'vue-router'

const route = useRoute()

const blogs = ref([])
const pages = ref(1)
const currentPage = ref(1)

function handleNextPage() {
  // TODO: остановился на переключении на следующую страницу
}

async function getBlogs() {
  const result = await getNews()
  chunkBlogs(result)
  pages.value = blogs.value.length
  console.log('pages', pages.value)
  if (route.params.page) {
    currentPage.value = +route.params.page
  } else {
    currentPage.value = 1
  }
}

function chunkBlogs(array) {
  for (let i = 0; i < array.length; i += 12) {
    blogs.value.push(array.slice(i, i + 12))
  }
  console.log('blogs', blogs.value)
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
  font-style: Medium;
  font-size: 16px;
  line-height: 24px;
  text-decoration: underline;
  text-decoration-style: solid;
  text-decoration-thickness: 4.5%;
  color: #1d4ecc;
}

.blogs__items-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 56px 24px;
}

.blogs__pagination {
  display: flex;
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
  font-style: Regular;
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

@media screen and (max-width: 1515px) {
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
    font-style: Regular;
    font-size: 14px;
    line-height: 20px;
  }

  .blogs__items-container {
    gap: 40px 20px;
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
