<template>
  <div class="page">
    <div class="head">
      <h2 class="title">
        用户管理
      </h2>
      <div class="head__actions">
        <button
          v-permission="'user:write'"
          class="btn"
          @click="createMock"
        >
          新增用户
        </button>
        <button
          class="btn btn--ghost"
          @click="load"
        >
          刷新
        </button>
      </div>
    </div>

    <div
      v-if="requestMeta"
      class="meta"
    >
      <div class="meta__title">
        请求注入（示例）
      </div>
      <div
        v-for="(v, k) in requestMeta.headers"
        :key="k"
        class="meta__kv"
      >
        <span class="meta__k">{{ k }}</span>
        <span class="meta__v">{{ v }}</span>
      </div>
    </div>

    <div class="card">
      <div
        v-if="loading"
        class="hint"
      >
        加载中...
      </div>
      <div
        v-else-if="error"
        class="error"
      >
        {{ error }}
      </div>
      <table
        v-else
        class="table"
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>部门</th>
            <th>租户</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="u in list"
            :key="u.id"
          >
            <td>{{ u.id }}</td>
            <td>{{ u.name }}</td>
            <td>{{ u.dept }}</td>
            <td>{{ u.tenantId }}</td>
            <td>
              <button
                v-permission="'user:write'"
                class="link"
                @click="removeMock(u.id)"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuth } from '@/permission-demo/auth'
import { getUserList } from '@/permission-demo/mock/api'
import { buildRequestMeta, type RequestMeta } from '@/permission-demo/request'

const auth = useAuth()
const session = computed(() => auth.session.value)

type UserRow = { id: string; name: string; dept: string; tenantId: string }

const list = ref<UserRow[]>([])
const loading = ref(false)
const error = ref('')
const requestMeta = ref<RequestMeta | null>(null)

onMounted(load)

async function load() {
  error.value = ''
  loading.value = true
  try {
    const s = session.value
    if (!s) return
    requestMeta.value = buildRequestMeta(s)
    list.value = await getUserList(s)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function createMock() {
  const nextId = String(Math.max(0, ...list.value.map(x => Number(x.id))) + 1)
  list.value = [
    {
      id: nextId,
      name: `新用户${nextId}`,
      dept: '研发',
      tenantId: session.value?.tenantId || '-'
    },
    ...list.value
  ]
}

function removeMock(id: string) {
  list.value = list.value.filter(x => x.id !== id)
}
</script>

<style scoped>
.page {
  display: grid;
  gap: 12px;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.head__actions {
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
}

.btn--ghost {
  background: rgba(17, 24, 39, 0.08);
  color: #111827;
}

.meta {
  border: 1px dashed rgba(24, 144, 255, 0.35);
  border-radius: 12px;
  padding: 12px;
}

.meta__title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.meta__kv {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 10px;
  font-size: 12px;
  padding: 4px 0;
}

.meta__k {
  color: #6b7280;
}

.meta__v {
  color: #111827;
  word-break: break-all;
}

.card {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 12px;
}

.hint {
  color: #6b7280;
  font-size: 13px;
}

.error {
  color: #dc2626;
  font-size: 13px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.table th,
.table td {
  border-bottom: 1px solid #f0f0f0;
  padding: 10px 8px;
  text-align: left;
}

.link {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #dc2626;
}

@media (max-width: 720px) {
  .meta__kv {
    grid-template-columns: 1fr;
  }
}
</style>

