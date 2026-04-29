<template>
  <div
    class="virtual-table"
    :class="{ 'virtual-table--border': border }"
  >
    <!-- 表头 -->
    <div
      ref="headerRef"
      class="virtual-table__header"
    >
      <table class="virtual-table__header-table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :style="{
                width: typeof column.width === 'number' ? `${column.width}px` : column.width,
                textAlign: column.align || 'center'
              }"
              class="virtual-table__header-cell"
              :class="{ 'sortable': column.sortable }"
              @click="handleSort(column)"
            >
              <div
                class="virtual-table__header-content"
                :style="{ justifyContent: column.align === 'left' ? 'flex-start' : column.align === 'right' ? 'flex-end' : 'center' }"
              >
                <span>{{ column.title }}</span>
                <span
                  v-if="column.sortable"
                  class="virtual-table__sort-icon"
                >
                  <svg
                    v-if="sortConfig?.key === column.key && sortConfig.order === 'asc'"
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill="currentColor"
                      d="M8 4l4 8H4z"
                    />
                  </svg>
                  <svg
                    v-else-if="sortConfig?.key === column.key && sortConfig.order === 'desc'"
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill="currentColor"
                      d="M8 12l-4-8h8z"
                    />
                  </svg>
                  <svg
                    v-else
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill="currentColor"
                      opacity="0.3"
                      d="M8 4l4 8H4z"
                    />
                  </svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>
      </table>
    </div>

    <!-- 表体（虚拟滚动） -->
    <div
      ref="scrollRef"
      class="virtual-table__body"
      @scroll="handleScroll"
    >
      <div
        class="virtual-table__phantom"
        :style="{ height: `${totalHeight}px` }"
      />
      <div
        class="virtual-table__content"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <table class="virtual-table__body-table">
          <tbody>
            <tr
              v-for="(row, index) in visibleData"
              :key="row[rowKey] || row.id"
              ref="rowRefs"
              :data-index="renderStart + index"
              class="virtual-table__row"
              :class="{ 'virtual-table__row--stripe': stripe && (renderStart + index) % 2 === 1 }"
            >
              <td
                v-for="column in columns"
                :key="column.key"
                :style="{
                  width: typeof column.width === 'number' ? `${column.width}px` : column.width,
                  textAlign: column.align || 'center'
                }"
                class="virtual-table__cell"
              >
                <component
                  :is="column.render(row, column, renderStart + index)"
                  v-if="column.render && typeof column.render(row, column, renderStart + index) === 'object'"
                />
                <span v-else-if="column.render">
                  {{ column.render(row, column, renderStart + index) }}
                </span>
                <span v-else>{{ row[column.key] }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="loading || isSorting"
      class="virtual-table__loading"
    >
      <div class="virtual-table__loading-spinner" />
      <span>{{ isSorting ? '排序中...' : '加载中...' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useVirtualScroll } from '@/hooks/useVirtualScroll'
import type { VirtualTableProps, SortConfig, TableRow } from '@/types'
import { throttle } from '@/utils'
import SortWorker from '@/workers/sort.worker?worker'

const worker = new SortWorker()

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
  }),
  treeProps: () => ({
    children: 'children',
    indent: 20,
    defaultExpandAll: false,
    showLine: false
  })
})

const emit = defineEmits<{
  (e: 'sort', config: SortConfig): void
  (e: 'expand', data: { node: any, expanded: boolean }): void
}>()

const scrollRef = ref<HTMLElement>()
const headerRef = ref<HTMLElement>()
const rowRefs = ref<HTMLElement[]>([])

const sortConfig = ref<SortConfig | null>(null)
const internalData = ref<TableRow[]>([])
const isSorting = ref(false)

watch(() => props.data, (newData) => {
  if (newData) {
    internalData.value = [...newData]
  }
}, { immediate: true })

const scrollbarWidth = ref(0)

worker.onmessage = (e) => {
  internalData.value = e.data
  isSorting.value = false
}

const {
  visibleData,
  renderStart,
  offsetY,
  totalHeight,
  handleScroll: handleVirtualScroll,
  setContainerHeight,
  batchUpdateItemHeights
} = useVirtualScroll(internalData as any, props.virtualConfig)

const throttledScroll = throttle((e: Event) => {
  handleVirtualScroll(e)

  if (headerRef.value && scrollRef.value) {
    headerRef.value.scrollLeft = scrollRef.value.scrollLeft
  }

  if (props.virtualConfig?.dynamicHeight) {
    updateRowHeights()
  }
}, 16)

const handleScroll = (e: Event) => {
  throttledScroll(e)
}

const updateRowHeights = async () => {
  await nextTick()

  const updates: { index: number; height: number }[] = []

  rowRefs.value.forEach((rowEl) => {
    if (!rowEl) return

    const index = parseInt(rowEl.dataset.index || '0')
    const height = rowEl.getBoundingClientRect().height

    updates.push({ index, height })
  })

  if (updates.length > 0) {
    batchUpdateItemHeights(updates)
  }
}

const handleSort = (column: any) => {
  if (!column.sortable) return

  if (sortConfig.value && sortConfig.value.key === column.key) {
    sortConfig.value.order = sortConfig.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value = {
      key: column.key,
      order: 'asc'
    }
  }

  if (sortConfig.value) {
    isSorting.value = true
    worker.postMessage({
      data: JSON.parse(JSON.stringify(internalData.value)),
      key: sortConfig.value.key,
      order: sortConfig.value.order
    })
    emit('sort', sortConfig.value)
  }
}

onUnmounted(() => {
  worker.terminate()
})

const resizeObserver = ref<ResizeObserver>()

onMounted(() => {
  nextTick(() => {
    if (scrollRef.value) {
      const hasVerticalScrollbar = scrollRef.value.scrollHeight > scrollRef.value.clientHeight
      scrollbarWidth.value = hasVerticalScrollbar ? (scrollRef.value.offsetWidth - scrollRef.value.clientWidth) : 0

      const height = scrollRef.value.clientHeight || 600
      setContainerHeight(height)

      resizeObserver.value = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newHeight = entry.contentRect.height || 600
          setContainerHeight(newHeight)

          if (scrollRef.value) {
            const hasScroll = scrollRef.value.scrollHeight > scrollRef.value.clientHeight
            scrollbarWidth.value = hasScroll ? (scrollRef.value.offsetWidth - scrollRef.value.clientWidth) : 0
          }
        }
      })
      resizeObserver.value.observe(scrollRef.value)
    }
  })
})

onUnmounted(() => {
  resizeObserver.value?.disconnect()
})

watch(internalData, () => {
  if (scrollRef.value) {
    scrollRef.value.scrollTop = 0
  }

  nextTick(() => {
    if (scrollRef.value) {
      const height = scrollRef.value.clientHeight || 600
      setContainerHeight(height)
    }
  })
})

watch(() => props.height, () => {
  nextTick(() => {
    if (scrollRef.value) {
      const height = scrollRef.value.clientHeight || 600
      setContainerHeight(height)
    }
  })
})
</script>

<style scoped>
.virtual-table {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  font-size: 14px;
  color: #333;
}

.virtual-table--border {
  border: 1px solid #e8e8e8;
}

.virtual-table__header {
  flex-shrink: 0;
  overflow: hidden;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.virtual-table__header-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
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
  justify-content: center;
  gap: 4px;
}

.virtual-table__sort-icon {
  margin-left: 4px;
  display: inline-flex;
  align-items: center;
}

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
  visibility: hidden;
  pointer-events: none;
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
  border-collapse: collapse;
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
  color: #333;
}

.virtual-table__cell:last-child {
  border-right: none;
}

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
