<template>
  <main>
    <Header />

    <div class="content-container">
      <Blogs />
      <Footer />
    </div>
  </main>
</template>

<script setup lang="ts">
import Header from '../landing/blocks/Header.vue'
import Footer from '../landing/blocks/Footer.vue'
import Blogs from './components/blogs.vue';
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
