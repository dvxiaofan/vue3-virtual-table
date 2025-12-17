<template>
  <div class="login">
    <div class="card">
      <h2 class="title">
        权限演示登录
      </h2>

      <div class="grid">
        <label class="field">
          <span class="field__label">账号</span>
          <select
            v-model="username"
            class="field__control"
          >
            <option value="admin">admin（全权限）</option>
            <option value="operator">operator（用户+报表）</option>
            <option value="auditor">auditor（审计）</option>
          </select>
        </label>

        <label class="field">
          <span class="field__label">密码</span>
          <input
            v-model="password"
            class="field__control"
            type="password"
          >
        </label>

        <label class="field">
          <span class="field__label">租户</span>
          <select
            v-model="tenantId"
            class="field__control"
            :disabled="tenants.length === 0"
          >
            <option
              v-for="t in tenants"
              :key="t.id"
              :value="t.id"
            >{{ t.name }}</option>
          </select>
        </label>
      </div>

      <button
        class="btn"
        :disabled="loading"
        @click="handleLogin"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <div
        v-if="error"
        class="error"
      >
        {{ error }}
      </div>

      <div class="hint">
        <div>演示账号：admin / operator / auditor</div>
        <div>密码与账号一致</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/permission-demo/auth'

const auth = useAuth()
const router = useRouter()
const route = useRoute()

const username = ref('admin')
const password = ref('admin')
const tenantId = ref('')
const loading = ref(false)
const error = ref('')

const tenants = computed(() => auth.tenants.value)

onMounted(async () => {
  const list = await auth.ensureTenantsLoaded()
  const persisted = auth.tenantId.value
  tenantId.value = persisted || list[0]?.id || ''
})

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login({
      username: username.value,
      password: password.value,
      tenantId: tenantId.value
    })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login {
  min-height: calc(100vh - 56px);
  display: grid;
  place-items: center;
}

.card {
  width: min(520px, 100%);
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  background: #ffffff;
}

.title {
  font-size: 18px;
  color: #111827;
  margin-bottom: 12px;
}

.grid {
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
  height: 38px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0 10px;
  outline: none;
}

.btn {
  margin-top: 14px;
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: #1890ff;
  color: #ffffff;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin-top: 10px;
  color: #dc2626;
  font-size: 12px;
}

.hint {
  margin-top: 14px;
  color: #6b7280;
  font-size: 12px;
  display: grid;
  gap: 4px;
}
</style>

