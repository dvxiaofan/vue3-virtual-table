<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="sidebar__title">
        RBAC / 多租户
      </div>

      <div
        v-if="session"
        class="meta"
      >
        <div class="meta__row">
          账号：<strong>{{ session.username }}</strong>
        </div>
        <div class="meta__row">
          租户：<strong>{{ session.tenantId }}</strong>
        </div>
        <div class="meta__row">
          数据范围：<strong>{{ session.dataScope }}</strong>
        </div>
        <div class="meta__row">
          角色：<strong>{{ session.roles.join(', ') }}</strong>
        </div>
      </div>

      <div
        v-if="session"
        class="controls"
      >
        <label class="field">
          <span class="field__label">切换租户</span>
          <select
            v-model="selectedTenantId"
            class="field__control"
            @change="handleSwitchTenant"
          >
            <option
              v-for="t in tenants"
              :key="t.id"
              :value="t.id"
            >{{ t.name }}</option>
          </select>
        </label>

        <div class="btns">
          <button
            class="btn btn--ghost"
            @click="refresh"
          >
            刷新权限
          </button>
          <button
            class="btn"
            @click="logout"
          >
            退出
          </button>
        </div>
      </div>

      <div
        v-if="navItems.length > 0"
        class="nav"
      >
        <RouterLink
          class="nav__item"
          to="/"
        >
          首页
        </RouterLink>
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          class="nav__item"
          :to="item.path"
        >
          {{ item.title }}
        </RouterLink>
      </div>
    </aside>

    <section class="content">
      <RouterView />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuth } from '@/permission-demo/auth'
import { listPermissionNav, type PermissionNavItem } from '@/permission-demo/routes'

const router = useRouter()
const auth = useAuth()

const session = computed(() => auth.session.value)
const tenants = computed(() => auth.tenants.value)
const selectedTenantId = ref(auth.tenantId.value || '')

const navItems = ref<PermissionNavItem[]>([])

watch(
  () => auth.session.value,
  async () => {
    await auth.ensureTenantsLoaded()
    selectedTenantId.value = auth.tenantId.value || tenants.value[0]?.id || ''
    navItems.value = listPermissionNav(router)
  },
  { immediate: true }
)

async function handleSwitchTenant() {
  if (!selectedTenantId.value) return
  await auth.switchTenant(selectedTenantId.value)
  navItems.value = listPermissionNav(router)
  await router.replace('/')
}

async function refresh() {
  await auth.ensureSessionLoaded(true)
  navItems.value = listPermissionNav(router)
  await router.replace('/')
}

function logout() {
  auth.logout()
  router.replace('/login')
}
</script>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 16px;
  min-height: calc(100vh - 56px - 32px);
}

.sidebar {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 14px;
  background: #ffffff;
}

.sidebar__title {
  font-weight: 700;
  color: #111827;
  margin-bottom: 10px;
}

.meta {
  display: grid;
  gap: 6px;
  color: #374151;
  font-size: 13px;
}

.meta__row strong {
  color: #111827;
}

.controls {
  margin-top: 12px;
  display: grid;
  gap: 12px;
}

.field {
  display: grid;
  gap: 6px;
}

.field__label {
  font-size: 12px;
  color: #6b7280;
}

.field__control {
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0 10px;
}

.btns {
  display: flex;
  gap: 10px;
}

.btn {
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background: #1890ff;
  color: #ffffff;
  flex: 1;
}

.btn--ghost {
  background: rgba(17, 24, 39, 0.08);
  color: #111827;
}

.nav {
  margin-top: 14px;
  display: grid;
  gap: 8px;
}

.nav__item {
  text-decoration: none;
  color: #374151;
  font-size: 14px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
}

.nav__item.router-link-active {
  background: rgba(24, 144, 255, 0.12);
  color: #1890ff;
  border-color: rgba(24, 144, 255, 0.24);
}

.content {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 14px;
  background: #ffffff;
}

@media (max-width: 960px) {
  .shell {
    grid-template-columns: 1fr;
  }
}
</style>
