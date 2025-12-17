<template>
  <div class="page">
    <div class="head">
      <h2 class="title">
        审计日志
      </h2>
      <button
        class="btn btn--ghost"
        @click="load"
      >
        刷新
      </button>
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
            <th>动作</th>
            <th>操作者</th>
            <th>租户</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="l in list"
            :key="l.id"
          >
            <td>{{ l.id }}</td>
            <td>{{ l.action }}</td>
            <td>{{ l.actor }}</td>
            <td>{{ l.tenantId }}</td>
            <td>{{ l.at }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuth } from '@/permission-demo/auth'
import { getAuditLogs } from '@/permission-demo/mock/api'

const auth = useAuth()
const session = computed(() => auth.session.value)

type LogRow = { id: string; action: string; actor: string; tenantId: string; at: string }
const list = ref<LogRow[]>([])
const loading = ref(false)
const error = ref('')

onMounted(load)

async function load() {
  error.value = ''
  loading.value = true
  try {
    const s = session.value
    if (!s) return
    list.value = await getAuditLogs(s)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
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
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.btn {
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background: rgba(17, 24, 39, 0.08);
  color: #111827;
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
</style>

