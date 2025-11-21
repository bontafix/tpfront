<template>
  <main itemscope itemtype="https://schema.org/Article">
    <Header />

    <div class="content-container">
      <section class="blog">
        <nav class="blogs__bread-crumbs" aria-label="Хлебные крошки">
          <a href="/" class="blogs__bread-crumb-title">Главная</a>
          <img src="/src/assets/icons/strelka.svg" alt="Стрелка" class="blogs__strelka" />
          <a href="/blogs" class="blogs__bread-crumb-title">Блог</a>
          <img src="/src/assets/icons/strelka.svg" alt="Стрелка" class="blogs__strelka" />
          <p class="blogs__bread-crumb-title" itemprop="headline">{{ data?.title }}</p>
        </nav>

        <div class="blog__center-container" v-if="data?.id">
          <LeftContainer :data="data" />
          <RightContainer />
        </div>
      </section>

      <Footer />
    </div>
  </main>
</template>

<script setup>
import Header from '../landing/blocks/Header.vue'
import Footer from '../landing/blocks/Footer.vue'
import LeftContainer from './components/leftContainer.vue'
import RightContainer from './components/rightContainer.vue'
import { ref, onMounted } from 'vue'
import { getNewsById } from '@/api/requests'
import { useRoute } from 'vue-router'

const route = useRoute()
const data = ref(null)

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
