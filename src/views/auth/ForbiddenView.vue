<template>
  <div class="wrap">
    <div class="card">
      <div class="title">
        403
      </div>
      <div class="desc">
        当前账号没有访问权限
      </div>
      <div class="actions">
        <button
          class="btn"
          @click="goHome"
        >
          回到首页
        </button>
        <button
          class="btn btn--ghost"
          @click="goLogin"
        >
          去登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}

function goLogin() {
  router.push('/login')
}
</script>

<style scoped>
.wrap {
  min-height: calc(100vh - 56px);
  display: grid;
  place-items: center;
}

.card {
  width: min(520px, 100%);
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 22px;
  background: #ffffff;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
}

.desc {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
}

.actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
}

.btn {
  height: 36px;
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
</style>

