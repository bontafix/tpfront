<template>
  <div class="wrapper">
    <v-header-top />
    <aside>
      <v-pages-menu />
    </aside>
    <main class="main">
      <slot> </slot>
    </main>
    <!--  <v-footer /> -->
  </div>
</template>
<script setup>
import vFooter from './generalComponents/v-footer.vue'
import vPagesMenu from './generalComponents/v-pages-menu.vue'
import vHeaderTop from './generalComponents/v-header-top.vue'
</script>
