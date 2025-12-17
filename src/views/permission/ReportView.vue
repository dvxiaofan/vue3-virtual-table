<template>
  <div class="page">
    <div class="head">
      <h2 class="title">
        报表
      </h2>
      <button
        class="btn btn--ghost"
        @click="load"
      >
        刷新
      </button>
    </div>

    <div
      v-if="session"
      class="tips"
    >
      当前数据范围：<strong>{{ session.dataScope }}</strong>
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
            <th>名称</th>
            <th>范围</th>
            <th>租户</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in list"
            :key="r.id"
          >
            <td>{{ r.id }}</td>
            <td>{{ r.name }}</td>
            <td>{{ r.scope }}</td>
            <td>{{ r.tenantId }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuth } from '@/permission-demo/auth'
import { getReport } from '@/permission-demo/mock/api'

const auth = useAuth()
const session = computed(() => auth.session.value)

type ReportRow = { id: string; name: string; scope: string; tenantId: string }
const list = ref<ReportRow[]>([])
const loading = ref(false)
const error = ref('')

onMounted(load)

async function load() {
  error.value = ''
  loading.value = true
  try {
    const s = session.value
    if (!s) return
    list.value = await getReport(s)
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

.tips {
  color: #374151;
  font-size: 13px;
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

