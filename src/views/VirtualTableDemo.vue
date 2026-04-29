<template>
  <div class="demo-container">
    <header class="demo-header">
      <h1>Vue3 Virtual Table</h1>
      <span class="demo-subtitle">高性能虚拟滚动表格组件 - 支持10万+数据流畅滚动</span>
    </header>

    <div class="demo-controls">
      <div class="control-row">
        <div class="control-group">
          <label>数据量：</label>
          <div class="control-buttons">
            <button
              v-for="count in dataCounts"
              :key="count"
              :class="{ active: currentCount === count }"
              class="control-button"
              @click="changeDataCount(count)"
            >
              {{ count.toLocaleString() }}
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>数据模式：</label>
          <div class="control-buttons">
            <button
              class="control-button"
              :class="{ active: isTreeMode }"
              @click="toggleDataMode"
            >
              {{ isTreeMode ? '树形数据' : '普通数据' }}
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>行高模式：</label>
          <div class="control-buttons">
            <button
              class="control-button"
              :class="{ active: dynamicHeight }"
              @click="toggleHeightMode"
            >
              {{ dynamicHeight ? '动态行高' : '固定行高' }}
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>表格样式：</label>
          <div class="control-buttons">
            <button
              class="control-button"
              :class="{ active: stripe }"
              @click="stripe = !stripe"
            >
              斑马纹
            </button>
            <button
              class="control-button"
              :class="{ active: border }"
              @click="border = !border"
            >
              边框
            </button>
          </div>
        </div>

        <div class="control-group stats-group">
          <span class="stat-item">渲染: <strong>{{ renderCount }}</strong></span>
          <span class="stat-item">FPS: <strong>{{ fps }}</strong></span>
          <span class="stat-item">内存: <strong>{{ memory }}</strong></span>
        </div>
      </div>
    </div>

    <div class="demo-table-wrapper">
      <div class="demo-table">
        <VirtualTable
          :data="tableData"
          :columns="columns"
          :height="500"
          :stripe="stripe"
          :border="border"
          :loading="loading"
          :virtual-config="{
            itemHeight: 50,
            bufferSize: 5,
            dynamicHeight: dynamicHeight,
            estimatedItemHeight: 50
          }"
          :tree-props="isTreeMode ? {
            children: 'children',
            indent: 20,
            defaultExpandAll: false,
            showLine: false
          } : undefined"
          @expand="handleTreeExpand"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <DetailModal
      v-model:visible="showDetailModal"
      :row-data="currentDetailRow"
      :columns="columns.filter(col => col.key !== 'actions')"
    />

    <div class="demo-footer">
      特性：虚拟滚动 · 10万+数据流畅滚动 · 动态行高 · 固定列
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import VirtualTable from '../components/VirtualTable'
import DetailModal from '../components/DetailModal.vue'
import { generateMockData, generateTreeMockData } from '../utils'
import type { TableColumn, TableRow, TreeTableRow } from '../types'

// 数据量选项
const dataCounts = [100, 1000, 10000, 50000, 100000]
const currentCount = ref(100)

// 表格数据
const tableData = ref<TableRow[] | TreeTableRow[]>([])
const loading = ref(false)

// 表格样式
const stripe = ref(true)
const border = ref(false)
const dynamicHeight = ref(false)
const isTreeMode = ref(false)

// 性能监控
const renderCount = ref(0)
const fps = ref(60)
const memory = ref('0 MB')

// 弹窗控制
const showDetailModal = ref(false)
const currentDetailRow = ref<TableRow | null>(null)

// 列配置
const columns = computed<TableColumn[]>(() => {
  if (isTreeMode.value) {
    return [
      { key: 'name', title: '组织名称', width: 300, align: 'left', fixed: 'left' },
      { key: 'type', title: '类型', width: 100 },
      { key: 'manager', title: '负责人', width: 120 },
      { key: 'employees', title: '员工数', width: 100, sortable: true },
      {
        key: 'budget',
        title: '预算',
        width: 150,
        align: 'right',
        sortable: true,
        render: (row: TreeTableRow) => `¥${row.budget?.toLocaleString() || 0}`
      },
      { key: 'status', title: '状态', width: 100 },
      { key: 'createDate', title: '创建日期', width: 120 },
      {
        key: 'actions',
        title: '操作',
        width: 100,
        fixed: 'right',
        render: (row: TreeTableRow) => h('button', {
          class: 'action-button',
          onClick: (e: Event) => {
            e.stopPropagation()
            handleShowDetail(row)
          }
        }, '详情')
      }
    ]
  }

  return [
    { key: 'id', title: 'ID', width: 80, fixed: 'left', sortable: true },
    { key: 'name', title: '姓名', width: 120, fixed: 'left', sortable: true },
    { key: 'age', title: '年龄', width: 80, sortable: true },
    { key: 'department', title: '部门', width: 120 },
    { key: 'position', title: '职位', width: 120 },
    {
      key: 'salary',
      title: '薪资',
      width: 120,
      align: 'right',
      sortable: true,
      render: (row: TableRow) => `¥${row.salary.toLocaleString()}`
    },
    { key: 'email', title: '邮箱', width: 200, align: 'left' },
    { key: 'phone', title: '电话', width: 140 },
    {
      key: 'address',
      title: '地址',
      width: dynamicHeight.value ? 300 : 200,
      align: 'left',
      render: (row: TableRow) => {
        if (dynamicHeight.value) {
          const lines = Math.floor(Math.random() * 3) + 1
          return Array(lines).fill(row.address).join('\n')
        }
        return row.address
      }
    },
    { key: 'joinDate', title: '入职日期', width: 120 },
    {
      key: 'actions',
      title: '操作',
      width: 100,
      fixed: 'right',
      render: (row: TableRow) => h('button', {
        class: 'action-button',
        onClick: (e: Event) => {
          e.stopPropagation()
          handleShowDetail(row)
        }
      }, '详情')
    }
  ]
})

// 切换数据量
const changeDataCount = (count: number) => {
  loading.value = true
  currentCount.value = count

  setTimeout(() => {
    if (isTreeMode.value) {
      const levels = 3
      const childrenPerNode = Math.max(2, Math.min(5, Math.floor(count / 20)))
      tableData.value = generateTreeMockData(levels, childrenPerNode)
    } else {
      tableData.value = generateMockData(count)
    }
    loading.value = false
    updateRenderCount()
  }, 300)
}

// 切换数据模式（普通/树形）
const toggleDataMode = () => {
  isTreeMode.value = !isTreeMode.value
  changeDataCount(isTreeMode.value ? 100 : currentCount.value)
}

// 切换行高模式
const toggleHeightMode = () => {
  dynamicHeight.value = !dynamicHeight.value
  changeDataCount(currentCount.value)
}

// 显示详情弹窗
const handleShowDetail = (row: TableRow) => {
  currentDetailRow.value = row
  showDetailModal.value = true
}

// 处理树形展开/折叠
const handleTreeExpand = (data: { node: any, expanded: boolean }) => {
  console.log('树形节点展开/折叠:', data.node.name, data.expanded)
}

// 更新渲染数量
const updateRenderCount = () => {
  const viewportRows = Math.ceil(600 / 50)
  const bufferRows = 10
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
  changeDataCount(currentCount.value)
  measureFPS()
  measureMemory()
  memoryInterval = setInterval(measureMemory, 1000)
})

onUnmounted(() => {
  clearInterval(memoryInterval)
})
</script>

<style scoped>
.demo-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f5f5;
}

.demo-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.demo-header h1 {
  font-size: 20px;
  margin: 0;
}

.demo-subtitle {
  font-size: 13px;
  opacity: 0.9;
}

.demo-controls {
  flex-shrink: 0;
  background: white;
  padding: 10px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.control-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  font-weight: 500;
  color: #333;
  font-size: 13px;
}

.control-buttons {
  display: flex;
  gap: 6px;
}

.control-button {
  padding: 4px 10px;
  border: 1px solid #d9d9d9;
  background: white;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  white-space: nowrap;
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

.stats-group {
  margin-left: auto;
  gap: 16px;
}

.stat-item {
  color: #666;
  font-size: 12px;
}

.stat-item strong {
  color: #667eea;
  margin-left: 4px;
}

.demo-table-wrapper {
  flex: 1;
  padding: 12px 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.demo-table {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.demo-footer {
  flex-shrink: 0;
  color: #666;
  font-size: 12px;
  text-align: center;
  padding: 8px 20px;
  background: white;
  border-top: 1px solid #f0f0f0;
}

/* 操作按钮样式 */
:deep(.action-button) {
  padding: 4px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

:deep(.action-button:hover) {
  background: #5a67d8;
}

:deep(.action-button:active) {
  transform: translateY(0);
}
</style>
