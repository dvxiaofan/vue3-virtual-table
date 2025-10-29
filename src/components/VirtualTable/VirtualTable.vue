<template>
  <div class="virtual-table" :class="{ 'virtual-table--border': border }">
    <!-- 表头 -->
    <div class="virtual-table__header" ref="headerRef">
      <table class="virtual-table__header-table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :style="{
                width: typeof column.width === 'number' ? `${column.width}px` : column.width,
                textAlign: column.align || 'left'
              }"
              class="virtual-table__header-cell"
              :class="{ 'sortable': column.sortable }"
              @click="handleSort(column)"
            >
              <div class="virtual-table__header-content">
                <span>{{ column.title }}</span>
                <span v-if="column.sortable" class="virtual-table__sort-icon">
                  <svg v-if="sortConfig?.key === column.key && sortConfig.order === 'asc'"
                       width="12" height="12" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M8 4l4 8H4z"/>
                  </svg>
                  <svg v-else-if="sortConfig?.key === column.key && sortConfig.order === 'desc'"
                       width="12" height="12" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M8 12l-4-8h8z"/>
                  </svg>
                  <svg v-else width="12" height="12" viewBox="0 0 16 16">
                    <path fill="currentColor" opacity="0.3" d="M8 4l4 8H4z"/>
                  </svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>
      </table>
    </div>

    <!-- 虚拟滚动内容区 -->
    <div
      class="virtual-table__body"
      :style="{ height: typeof height === 'number' ? `${height}px` : height }"
      @scroll="handleScroll"
      ref="scrollRef"
    >
      <!-- 占位元素，撑开滚动条 -->
      <div class="virtual-table__phantom" :style="{ height: `${totalHeight}px` }"></div>

      <!-- 实际渲染的内容 -->
      <div
        class="virtual-table__content"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <table class="virtual-table__body-table">
          <tbody>
            <tr
              v-for="(row, index) in visibleData"
              :key="row[rowKey] || row.id"
              :data-index="renderStart + index"
              class="virtual-table__row"
              :class="{ 'virtual-table__row--stripe': stripe && (renderStart + index) % 2 === 1 }"
              ref="rowRefs"
            >
              <td
                v-for="column in columns"
                :key="column.key"
                :style="{
                  width: typeof column.width === 'number' ? `${column.width}px` : column.width,
                  textAlign: column.align || 'left'
                }"
                class="virtual-table__cell"
              >
                <div class="virtual-table__cell-content">
                  <!-- 支持自定义渲染函数 -->
                  <component
                    v-if="column.render && typeof column.render(row, column, renderStart + index) === 'object'"
                    :is="column.render(row, column, renderStart + index)"
                  />
                  <span v-else-if="column.render">
                    {{ column.render(row, column, renderStart + index) }}
                  </span>
                  <span v-else>{{ row[column.key] }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="virtual-table__loading">
      <div class="virtual-table__loading-spinner"></div>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useVirtualScroll } from '@/hooks/useVirtualScroll'
import type { VirtualTableProps, SortConfig } from '@/types'
import { throttle } from '@/utils'

// Props
const props = withDefaults(defineProps<VirtualTableProps>(), {
  height: 600,
  stripe: false,
  border: false,
  loading: false,
  rowKey: 'id',
  virtualConfig: () => ({
    itemHeight: 50,
    bufferSize: 5,
    dynamicHeight: false,
    estimatedItemHeight: 50
  })
})

// Emits
const emit = defineEmits<{
  sort: [config: SortConfig]
}>()

// Refs
const scrollRef = ref<HTMLElement>()
const headerRef = ref<HTMLElement>()
const rowRefs = ref<HTMLElement[]>([])

// Data
const sortConfig = ref<SortConfig | null>(null)
const dataRef = toRef(props, 'data')

// 使用虚拟滚动Hook
const {
  visibleData,
  renderStart,
  renderEnd,
  offsetY,
  totalHeight,
  handleScroll: handleVirtualScroll,
  setContainerHeight,
  updateItemHeight
} = useVirtualScroll(dataRef, props.virtualConfig)

// 节流的滚动处理
const throttledScroll = throttle((e: Event) => {
  handleVirtualScroll(e)

  // 同步表头横向滚动
  if (headerRef.value && scrollRef.value) {
    headerRef.value.scrollLeft = scrollRef.value.scrollLeft
  }

  // 动态行高模式：更新行高
  if (props.virtualConfig?.dynamicHeight) {
    updateRowHeights()
  }
}, 16) // 约60fps

// 处理滚动事件
const handleScroll = (e: Event) => {
  throttledScroll(e)
}

// 更新行高（动态行高模式）
const updateRowHeights = async () => {
  await nextTick()

  rowRefs.value.forEach((rowEl) => {
    if (!rowEl) return

    const index = parseInt(rowEl.dataset.index || '0')
    const height = rowEl.getBoundingClientRect().height

    updateItemHeight(index, height)
  })
}

// 处理排序
const handleSort = (column: any) => {
  if (!column.sortable) return

  if (sortConfig.value?.key === column.key) {
    // 切换排序方式
    sortConfig.value.order = sortConfig.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    // 新的排序列
    sortConfig.value = {
      key: column.key,
      order: 'asc'
    }
  }

  emit('sort', sortConfig.value)
}

// 监听容器大小变化
const resizeObserver = ref<ResizeObserver>()

onMounted(() => {
  if (scrollRef.value) {
    // 设置容器高度
    setContainerHeight(scrollRef.value.clientHeight)

    // 监听容器大小变化
    resizeObserver.value = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })
    resizeObserver.value.observe(scrollRef.value)
  }
})

onUnmounted(() => {
  resizeObserver.value?.disconnect()
})

// 监听数据变化，重置滚动位置
watch(dataRef, () => {
  if (scrollRef.value) {
    scrollRef.value.scrollTop = 0
  }
})
</script>

<style scoped>
.virtual-table {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #fff;
  font-size: 14px;
}

.virtual-table--border {
  border: 1px solid #e8e8e8;
}

/* 表头 */
.virtual-table__header {
  flex-shrink: 0;
  overflow-x: hidden;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.virtual-table__header-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
}

.virtual-table__header-cell {
  padding: 12px 16px;
  font-weight: 500;
  color: #262626;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
  border-right: 1px solid #f0f0f0;
  transition: background 0.3s;
}

.virtual-table__header-cell:last-child {
  border-right: none;
}

.virtual-table__header-cell.sortable {
  cursor: pointer;
}

.virtual-table__header-cell.sortable:hover {
  background: #f0f0f0;
}

.virtual-table__header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.virtual-table__sort-icon {
  margin-left: 4px;
  display: inline-flex;
  align-items: center;
}

/* 表体 */
.virtual-table__body {
  flex: 1;
  position: relative;
  overflow: auto;
}

.virtual-table__phantom {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: -1;
}

.virtual-table__content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.virtual-table__body-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
}

.virtual-table__row {
  transition: background 0.3s;
}

.virtual-table__row:hover {
  background: #fafafa;
}

.virtual-table__row--stripe {
  background: #fafafa;
}

.virtual-table__cell {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.virtual-table__cell:last-child {
  border-right: none;
}

.virtual-table__cell-content {
  display: inline-block;
  width: 100%;
}

/* 加载状态 */
.virtual-table__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
}

.virtual-table__loading-spinner {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 滚动条样式 */
.virtual-table__body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.virtual-table__body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.virtual-table__body::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.virtual-table__body::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>