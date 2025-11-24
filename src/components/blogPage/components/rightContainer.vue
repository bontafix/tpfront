<template>
  <aside class="sidebar-latest-blogs" itemscope itemtype="https://schema.org/ItemList">
    <h3 class="sidebar-latest-blogs__title">Последние статьи</h3>

    <div class="sidebar-latest-blogs__container">
      <div
        v-for="(item, index) in blogs"
        :key="item.id"
        class="sidebar-latest-blogs__item"
        @click="() => openBlogPage(item.id, item.slug)"
        :itemprop="'itemListElement'"
        itemscope
        itemtype="https://schema.org/BlogPosting"
      >
        <div class="sidebar-latest-blogs__text-container">
          <meta itemprop="position" :content="index + 1" />
          <time
            class="sidebar-latest-blogs__date"
            :datetime="item.published_at"
            itemprop="datePublished"
          >
            {{ new Date(item.published_at).toLocaleDateString('ru-RU') }}
          </time>
          <h4 class="sidebar-latest-blogs__text" itemprop="headline">{{ item.title }}</h4>
        </div>

        <button class="sidebar-latest-blogs__button" @click="() => openBlogPageTablet(item.id)">
          Перейти к статье
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { getNews } from '@/api/requests'
import { ref, onMounted } from 'vue'

const blogs = ref([])

function openBlogPage(id, slug) {
  if (window.innerWidth > 1439 || window.innerWidth < 768) {
    window.location.href = `/blog/${id.toString()}/${slug.toString()}`
  }
}

function openBlogPageTablet(id) {
  window.location.href = `/blog/${id}`
}

async function getBlogs() {
  const result = await getNews()
  blogs.value = result.slice(0, 5)
}

onMounted(async () => {
  await getBlogs()
})
</script>

<style scoped>
.sidebar-latest-blogs {
  background-color: #f8f9fb;
  padding: 30px 36px 44px 36px;
  border: 1px solid #e9eaeb;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 455px;
  align-self: flex-start;
}

.sidebar-latest-blogs__title {
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 20px;
  line-height: 140%;
  color: #344055;
  padding-bottom: 18px;
  border-bottom: 2px solid #1d4ecc;
}

.sidebar-latest-blogs__container {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.sidebar-latest-blogs__item {
  padding-top: 22px;
  border-top: 1px solid #e9eaeb;
  cursor: pointer;
}

.sidebar-latest-blogs__item:first-of-type {
  padding-top: 0;
  border-top: unset;
}

.sidebar-latest-blogs__text-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-latest-blogs__date {
  font-family: Inter, sans-serif;
  font-weight: 300;
  font-size: 14px;
  line-height: 144%;
  color: #344055;
}

.sidebar-latest-blogs__text {
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 17px;
  line-height: 140%;
  color: #344055;
}

.sidebar-latest-blogs__button {
  display: none;
}

@media screen and (max-width: 1439px) {
  .sidebar-latest-blogs {
    max-width: unset;
  }

  .sidebar-latest-blogs__container {
    gap: 24px;
  }

  .sidebar-latest-blogs__item {
    padding-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 22px;
    cursor: unset;
  }

  .sidebar-latest-blogs__button {
    display: flex;
    border-radius: 8px;
    border: 1px solid #e9eaeb;
    color: #344055;
    justify-content: center;
    align-items: center;
    box-shadow: 0px 1px 2px rgba(10, 13, 18, 0.05);
    padding: 12px 24px;
    font-family: Inter;
    font-weight: 600;
    font-style: Semi Bold;
    font-size: 14px;
    line-height: 24px;
    background-color: #ffffff;
  }
}

@media screen and (max-width: 1023px) {
  .sidebar-latest-blogs {
    padding: 26px 20px 44px 20px;
    border-radius: 10px;
  }

  .sidebar-latest-blogs__title {
    font-size: 16px;
  }

  .sidebar-latest-blogs__container {
    gap: 20px;
  }

  .sidebar-latest-blogs__item {
    padding-top: 20px;
    cursor: pointer;
  }

  .sidebar-latest-blogs__date {
    font-size: 12px;
  }

  .sidebar-latest-blogs__text {
    font-size: 14px;
  }

  .sidebar-latest-blogs__button {
    padding: 10px 24px;
  }
}

@media screen and (max-width: 767px) {
  .sidebar-latest-blogs__button {
    display: none;
  }
}
</style>
