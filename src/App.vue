<template>
  <div class="demo-container">
    <header class="demo-header">
      <h1>🚀 Vue3 Virtual Table</h1>
      <p class="demo-subtitle">高性能虚拟滚动表格组件 - 支持10万+数据流畅滚动</p>
    </header>

    <div class="demo-controls">
      <div class="control-group">
        <label>数据量：</label>
        <div class="control-buttons">
          <button
            v-for="count in dataCounts"
            :key="count"
            @click="changeDataCount(count)"
            :class="{ active: currentCount === count }"
            class="control-button"
          >
            {{ count.toLocaleString() }} 条
          </button>
        </div>
      </div>

      <div class="control-group">
        <label>行高模式：</label>
        <div class="control-buttons">
          <button
            @click="toggleHeightMode"
            class="control-button"
            :class="{ active: dynamicHeight }"
          >
            {{ dynamicHeight ? '动态行高' : '固定行高' }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <label>表格样式：</label>
        <div class="control-buttons">
          <button
            @click="stripe = !stripe"
            class="control-button"
            :class="{ active: stripe }"
          >
            斑马纹
          </button>
          <button
            @click="border = !border"
            class="control-button"
            :class="{ active: border }"
          >
            边框
          </button>
        </div>
      </div>

      <div class="control-group">
        <label>性能监控：</label>
        <div class="stats">
          <span class="stat-item">渲染数量: <strong>{{ renderCount }}</strong></span>
          <span class="stat-item">FPS: <strong>{{ fps }}</strong></span>
          <span class="stat-item">内存: <strong>{{ memory }}</strong></span>
        </div>
      </div>
    </div>

    <div class="demo-table">
      <VirtualTable
        :data="tableData"
        :columns="columns"
        :height="600"
        :stripe="stripe"
        :border="border"
        :loading="loading"
        :virtual-config="{
          itemHeight: 50,
          bufferSize: 5,
          dynamicHeight: dynamicHeight,
          estimatedItemHeight: 50
        }"
        @sort="handleSort"
      />
    </div>

    <div class="demo-info">
      <h3>✨ 特性</h3>
      <ul>
        <li>🎯 虚拟滚动：仅渲染可视区域数据</li>
        <li>⚡ 高性能：支持10万+数据流畅滚动</li>
        <li>📏 动态行高：支持不同高度的行</li>
        <li>🔧 灵活配置：丰富的配置选项</li>
        <li>🎨 自定义渲染：支持自定义单元格内容</li>
        <li>📱 响应式：自适应容器大小变化</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import VirtualTable from './components/VirtualTable'
import { generateMockData } from './utils'
import type { TableColumn, TableRow } from './types'

// 数据量选项
const dataCounts = [100, 1000, 10000, 50000, 100000]
const currentCount = ref(10000)

// 表格数据
const tableData = ref<TableRow[]>([])
const loading = ref(false)

// 表格样式
const stripe = ref(true)
const border = ref(false)
const dynamicHeight = ref(false)

// 性能监控
const renderCount = ref(0)
const fps = ref(60)
const memory = ref('0 MB')

// 列配置
const columns = computed<TableColumn[]>(() => [
  {
    key: 'id',
    title: 'ID',
    width: 80,
    align: 'center',
    fixed: 'left'
  },
  {
    key: 'name',
    title: '姓名',
    width: 120,
    sortable: true
  },
  {
    key: 'age',
    title: '年龄',
    width: 80,
    align: 'center',
    sortable: true
  },
  {
    key: 'department',
    title: '部门',
    width: 120
  },
  {
    key: 'position',
    title: '职位',
    width: 120
  },
  {
    key: 'salary',
    title: '薪资',
    width: 120,
    align: 'right',
    sortable: true,
    render: (row: TableRow) => {
      return `¥${row.salary.toLocaleString()}`
    }
  },
  {
    key: 'email',
    title: '邮箱',
    width: 200
  },
  {
    key: 'phone',
    title: '电话',
    width: 140
  },
  {
    key: 'address',
    title: '地址',
    width: dynamicHeight.value ? 300 : 200,
    render: (row: TableRow) => {
      // 动态行高模式下，随机返回不同长度的内容
      if (dynamicHeight.value) {
        const lines = Math.floor(Math.random() * 3) + 1
        return Array(lines).fill(row.address).join('\n')
      }
      return row.address
    }
  },
  {
    key: 'joinDate',
    title: '入职日期',
    width: 120
  }
])

// 切换数据量
const changeDataCount = (count: number) => {
  loading.value = true
  currentCount.value = count

  setTimeout(() => {
    tableData.value = generateMockData(count)
    loading.value = false
    updateRenderCount()
  }, 300)
}

// 切换行高模式
const toggleHeightMode = () => {
  dynamicHeight.value = !dynamicHeight.value
  // 重新生成数据以触发更新
  changeDataCount(currentCount.value)
}

// 处理排序
const handleSort = (config: any) => {
  const { key, order } = config

  loading.value = true
  setTimeout(() => {
    tableData.value = [...tableData.value].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal)
      const bStr = String(bVal)
      return order === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
    loading.value = false
  }, 100)
}

// 更新渲染数量
const updateRenderCount = () => {
  // 模拟计算实际渲染的行数（固定行高模式下约为视口高度/行高）
  const viewportRows = Math.ceil(600 / 50) // 600是表格高度，50是行高
  const bufferRows = 10 // 上下缓冲区各5行
  renderCount.value = Math.min(viewportRows + bufferRows, tableData.value.length)
}

// FPS监控
let frameCount = 0
let lastTime = performance.now()
const measureFPS = () => {
  frameCount++
  const currentTime = performance.now()

  if (currentTime >= lastTime + 1000) {
    fps.value = Math.round((frameCount * 1000) / (currentTime - lastTime))
    frameCount = 0
    lastTime = currentTime
  }

  requestAnimationFrame(measureFPS)
}

// 内存监控
const measureMemory = () => {
  if ('memory' in performance) {
    const mem = (performance as any).memory
    const usedMB = Math.round(mem.usedJSHeapSize / 1048576)
    memory.value = `${usedMB} MB`
  }
}

let memoryInterval: ReturnType<typeof setInterval>

onMounted(() => {
  // 初始化数据
  changeDataCount(currentCount.value)

  // 启动FPS监控
  measureFPS()

  // 启动内存监控
  measureMemory()
  memoryInterval = setInterval(measureMemory, 1000)
})

onUnmounted(() => {
  clearInterval(memoryInterval)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  padding: 20px;
}
</style>

<style scoped>
.demo-container {
  max-width: 1400px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.demo-header h1 {
  font-size: 48px;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.demo-subtitle {
  font-size: 18px;
  opacity: 0.95;
}

.demo-controls {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.control-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-group label {
  width: 100px;
  font-weight: 600;
  color: #333;
}

.control-buttons {
  display: flex;
  gap: 10px;
}

.control-button {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.control-button:hover {
  border-color: #667eea;
  color: #667eea;
}

.control-button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  color: #666;
}

.stat-item strong {
  color: #667eea;
  font-size: 16px;
  margin-left: 5px;
}

.demo-table {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.demo-info {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.demo-info h3 {
  color: #333;
  margin-bottom: 15px;
}

.demo-info ul {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 10px;
}

.demo-info li {
  color: #666;
  padding: 5px 0;
}
</style>