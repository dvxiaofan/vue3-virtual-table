<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar__inner">
        <div class="brand">
          toptop
        </div>
        <nav class="nav">
          <RouterLink
            class="nav__link"
            to="/table"
          >
            虚拟表格
          </RouterLink>
          <RouterLink
            class="nav__link"
            to="/"
          >
            权限演示
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

body {
  min-height: 100vh;
}

.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  background: #ffffff;
}

.topbar__inner {
  width: min(1200px, calc(100% - 32px));
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.brand {
  font-weight: 700;
  font-size: 16px;
  color: #111827;
}

.nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav__link {
  text-decoration: none;
  font-size: 14px;
  color: #374151;
  padding: 6px 10px;
  border-radius: 8px;
}

.nav__link.router-link-active {
  background: rgba(24, 144, 255, 0.12);
  color: #1890ff;
}

.main {
  flex: 1;
  width: min(1200px, calc(100% - 32px));
  margin: 0 auto;
  padding: 16px 0;
}
</style>
