<template>
  <div class="home">
    <h2 class="title">
      权限演示首页
    </h2>

    <div
      v-if="session"
      class="panel"
    >
      <div class="panel__title">
        当前会话
      </div>
      <div class="grid">
        <div class="kv">
          <span class="k">账号</span><span class="v">{{ session.username }}</span>
        </div>
        <div class="kv">
          <span class="k">租户</span><span class="v">{{ session.tenantId }}</span>
        </div>
        <div class="kv">
          <span class="k">数据范围</span><span class="v">{{ session.dataScope }}</span>
        </div>
        <div class="kv">
          <span class="k">角色</span><span class="v">{{ session.roles.join(', ') }}</span>
        </div>
      </div>

      <div class="panel__title">
        权限列表
      </div>
      <div class="tags">
        <span
          v-for="p in session.permissions"
          :key="p"
          class="tag"
        >{{ p }}</span>
      </div>

      <div class="panel__title">
        按钮级权限示例
      </div>
      <div class="actions">
        <button
          v-permission="'user:write'"
          class="btn"
        >
          新增用户（需要 user:write）
        </button>
        <button
          v-permission="'audit:read'"
          class="btn btn--ghost"
        >
          查看审计（需要 audit:read）
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/permission-demo/auth'

const auth = useAuth()
const session = computed(() => auth.session.value)
</script>

<style scoped>
.home {
  display: grid;
  gap: 14px;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.panel {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 14px;
}

.panel__title {
  margin-top: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 14px;
  margin-top: 8px;
}

.kv {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
}

.k {
  color: #6b7280;
}

.v {
  color: #111827;
  font-weight: 600;
}

.tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(24, 144, 255, 0.12);
  color: #1890ff;
}

.actions {
  margin-top: 8px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>

