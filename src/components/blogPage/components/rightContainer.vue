<template>
  <aside class="right" aria-label="Последние статьи">
    <h3 class="right__title">Последние статьи</h3>

    <div class="right__container">
      <div
        v-for="item in blogs"
        :key="item.id"
        class="right__blog"
        itemscope
        itemtype="https://schema.org/BlogPosting"
        @click="() => openBlogPage(item.id)"
      >
        <meta itemprop="mainEntityOfPage" :content="`/blog/${item.id}`" />
        <meta itemprop="datePublished" :content="item.published_at" />
        <meta itemprop="author" content="Teacher Planner" />

        <p class="right__date" itemprop="datePublished">
          {{ new Date(item.published_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }) }}
        </p>

        <h4 class="right__text" itemprop="headline">{{ item.title }}</h4>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { getNews } from '@/api/requests'
import { onMounted, ref } from 'vue'

const blogs = ref([])

function openBlogPage(id: number | string) {
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
.right {
  background-color: #F8F9FB;
  padding: 30px 36px 44px 36px;
  border: 1px solid #E9EAEB;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 455px;
  align-self: flex-start;
}

.right__title {
  font-family: Inter;
  font-weight: 600;
  font-size: 20px;
  line-height: 140%;
  color: #344055;
  padding-bottom: 18px;
  border-bottom: 2px solid #1D4ECC;
}

.right__container {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.right__blog {
  padding-top: 22px;
  border-top: 1px solid #E9EAEB;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
}

.right__blog:first-of-type {
  padding-top: 0;
  border-top: unset;
}

.right__date {
  font-family: Inter;
  font-weight: 300;
  font-size: 14px;
  line-height: 144%;
  color: #344055;
}

.right__text {
  font-family: Inter;
  font-weight: 500;
  font-size: 17px;
  line-height: 140%;
  color: #344055;
}
</style>