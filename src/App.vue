<template>
  <div class="app-layout">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

html,
body {
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
}

.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
