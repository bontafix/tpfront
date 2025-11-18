<template>
    <div class="right">
        <h3 class="right__title">Последние статьи</h3>

        <div class="right__container">
            <div v-for="item in blogs" :key="item.id" class="right__blog" @click="() => openBlogPage(item.id)">
                <p class="right__date">{{ new Date(item.published_at).toLocaleDateString('ru-RU') }}</p>
                <h4 class="right__text">{{ item.title }}</h4>
            </div>
        </div>
    </div>
</template>

<script setup>
import { getNews } from '@/api/requests'
import { onMounted, ref } from 'vue'

const blogs = ref([])

function openBlogPage(id) {
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
    font-style: Semi Bold;
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
    font-style: Light;
    font-size: 14px;
    line-height: 144%;
    color: #344055;
}

.right__text {
    font-family: Inter;
    font-weight: 500;
    font-style: Medium;
    font-size: 17px;
    line-height: 140%;
    color: #344055;
}
</style>