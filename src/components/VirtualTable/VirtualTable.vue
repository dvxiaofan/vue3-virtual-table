<template>
  <div class="virtual-table" :class="{ 'virtual-table--border': border }">
    <!-- 表格容器 -->
    <div class="virtual-table__wrapper">
      <!-- 左侧固定列 -->
      <div
        v-if="leftFixedColumns.length > 0"
        class="virtual-table__fixed virtual-table__fixed--left"
        :class="{ 'is-scrolling': isScrolling }"
        :style="{ width: `${leftFixedWidth}px` }"
      >
        <!-- 左侧固定表头 -->
        <div class="virtual-table__fixed-header">
          <table class="virtual-table__header-table">
            <thead>
              <tr>
                <th
                  v-for="column in leftFixedColumns"
                  :key="column.key"
                  :style="{
                    width: typeof column.width === 'number' ? `${column.width}px` : column.width,
                    textAlign: column.align || 'center'
                  }"
                  class="virtual-table__header-cell"
                  :class="{ 'sortable': column.sortable }"
                  @click="handleSort(column)"
                >
                  <div class="virtual-table__header-content"
                       :style="{ justifyContent: column.align === 'left' ? 'flex-start' : column.align === 'right' ? 'flex-end' : 'center' }">
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
        <!-- 左侧固定表体 -->
        <div class="virtual-table__fixed-body"
             :style="{ height: typeof height === 'number' ? `${height}px` : height }"
             ref="leftBodyRef">
          <div class="virtual-table__phantom" :style="{ height: `${totalHeight}px` }"></div>
          <div class="virtual-table__content" :style="{ transform: `translateY(${offsetY}px)` }">
            <table class="virtual-table__body-table">
              <tbody>
                <tr
                  v-for="(row, index) in visibleData"
                  :key="row[rowKey] || row.id"
                  :data-index="renderStart + index"
                  class="virtual-table__row"
                  :class="{ 'virtual-table__row--stripe': stripe && (renderStart + index) % 2 === 1 }"
                >
                  <td
                    v-for="(column, colIndex) in leftFixedColumns"
                    :key="column.key"
                    :style="{
                      width: typeof column.width === 'number' ? `${column.width}px` : column.width,
                      textAlign: column.align || 'center'
                    }"
                    class="virtual-table__cell"
                  >
                    <div class="virtual-table__cell-content">
                      <component
                        v-if="isTreeData && colIndex === 0"
                        :is="renderTreeCell(row, column, true)"
                      />
                      <component
                        v-else-if="column.render && typeof column.render(row, column, renderStart + index) === 'object'"
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
      </div>

      <!-- 中间滚动区域 -->
      <div class="virtual-table__main">
        <!-- 中间表头 -->
        <div class="virtual-table__header" ref="headerRef" :style="{ paddingRight: `${scrollbarWidth}px` }">
          <table class="virtual-table__header-table">
            <thead>
              <tr>
                <th
                  v-for="column in normalColumns"
                  :key="column.key"
                  :style="{
                    width: typeof column.width === 'number' ? `${column.width}px` : column.width,
                    textAlign: column.align || 'center'
                  }"
                  class="virtual-table__header-cell"
                  :class="{ 'sortable': column.sortable }"
                  @click="handleSort(column)"
                >
                  <div class="virtual-table__header-content"
                       :style="{ justifyContent: column.align === 'left' ? 'flex-start' : column.align === 'right' ? 'flex-end' : 'center' }">
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

        <!-- 中间表体（虚拟滚动） -->
        <div
          class="virtual-table__body"
          :style="{ height: typeof height === 'number' ? `${height}px` : height }"
          @scroll="handleScroll"
          ref="scrollRef"
        >
          <div class="virtual-table__phantom" :style="{ height: `${totalHeight}px` }"></div>
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
                    v-for="(column, colIndex) in normalColumns"
                    :key="column.key"
                    :style="{
                      width: typeof column.width === 'number' ? `${column.width}px` : column.width,
                      textAlign: column.align || 'center'
                    }"
                    class="virtual-table__cell"
                  >
                    <div class="virtual-table__cell-content">
                      <component
                        v-if="isTreeData && leftFixedColumns.length === 0 && colIndex === 0"
                        :is="renderTreeCell(row, column, true)"
                      />
                      <component
                        v-else-if="column.render && typeof column.render(row, column, renderStart + index) === 'object'"
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
      </div>

      <!-- 右侧固定列 -->
      <div
        v-if="rightFixedColumns.length > 0"
        class="virtual-table__fixed virtual-table__fixed--right"
        :class="{ 'is-scrolling': isScrolling }"
        :style="{ width: `${rightFixedWidth}px` }"
      >
        <!-- 右侧固定表头 -->
        <div class="virtual-table__fixed-header">
          <table class="virtual-table__header-table">
            <thead>
              <tr>
                <th
                  v-for="column in rightFixedColumns"
                  :key="column.key"
                  :style="{
                    width: typeof column.width === 'number' ? `${column.width}px` : column.width,
                    textAlign: column.align || 'center'
                  }"
                  class="virtual-table__header-cell"
                  :class="{ 'sortable': column.sortable }"
                  @click="handleSort(column)"
                >
                  <div class="virtual-table__header-content"
                       :style="{ justifyContent: column.align === 'left' ? 'flex-start' : column.align === 'right' ? 'flex-end' : 'center' }">
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
        <!-- 右侧固定表体 -->
        <div class="virtual-table__fixed-body"
             :style="{ height: typeof height === 'number' ? `${height}px` : height }"
             ref="rightBodyRef">
          <div class="virtual-table__phantom" :style="{ height: `${totalHeight}px` }"></div>
          <div class="virtual-table__content" :style="{ transform: `translateY(${offsetY}px)` }">
            <table class="virtual-table__body-table">
              <tbody>
                <tr
                  v-for="(row, index) in visibleData"
                  :key="row[rowKey] || row.id"
                  :data-index="renderStart + index"
                  class="virtual-table__row"
                  :class="{ 'virtual-table__row--stripe': stripe && (renderStart + index) % 2 === 1 }"
                >
                  <td
                    v-for="column in rightFixedColumns"
                    :key="column.key"
                    :style="{
                      width: typeof column.width === 'number' ? `${column.width}px` : column.width,
                      textAlign: column.align || 'center'
                    }"
                    class="virtual-table__cell"
                  >
                    <div class="virtual-table__cell-content">
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
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading || isSorting" class="virtual-table__loading">
      <div class="virtual-table__loading-spinner"></div>
      <span>{{ isSorting ? '排序中...' : '加载中...' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted, computed, h } from 'vue'
import { useVirtualScroll } from '@/hooks/useVirtualScroll'
import { useTreeData } from '@/hooks/useTreeData'
import type { VirtualTableProps, SortConfig, TableRow } from '@/types'
import { throttle } from '@/utils'
import SortWorker from '@/workers/sort.worker?worker'

// Worker 实例
const worker = new SortWorker()

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
  }),
  treeProps: () => ({
    children: 'children',
    indent: 20,
    defaultExpandAll: false,
    showLine: false
  })
})

// Emits
const emit = defineEmits<{
  (e: 'sort', config: SortConfig): void
  (e: 'expand', data: { node: any, expanded: boolean }): void
}>()

// Refs
const scrollRef = ref<HTMLElement>()
const headerRef = ref<HTMLElement>()
const leftBodyRef = ref<HTMLElement>()
const rightBodyRef = ref<HTMLElement>()
const rowRefs = ref<HTMLElement[]>([])

// Data
const sortConfig = ref<SortConfig | null>(null)
// 内部维护的数据（用于排序）
const internalData = ref<TableRow[]>([])
const isSorting = ref(false)

// 初始化内部数据
watch(() => props.data, (newData) => {
  if (newData) {
    internalData.value = [...newData]
  }
}, { immediate: true })

const isScrolling = ref(false)
const scrollbarWidth = ref(0)
let scrollTimer: ReturnType<typeof setTimeout> | null = null

// Worker 消息处理
worker.onmessage = (e) => {
  internalData.value = e.data
  isSorting.value = false
}

// 判断是否为树形数据
const isTreeData = computed(() => {
  if (!props.treeProps || !internalData.value || internalData.value.length === 0) {
    // console.log('Not tree data - missing props or data')
    return false
  }
  // 检查第一个数据项是否有 children 字段
  const childrenKey = props.treeProps?.children || 'children'
  const hasChildren = internalData.value.some((item: any) => item[childrenKey] && item[childrenKey].length > 0)
  // console.log('isTreeData check:', { childrenKey, hasChildren, dataLength: internalData.value.length })
  return hasChildren
})

// 使用树形数据处理 - 只在确实有树形数据时创建
const treeDataHook = ref<ReturnType<typeof useTreeData> | null>(null)

// 监听数据和树形配置变化
watch([() => props.treeProps, internalData], ([newTreeProps, newData]) => {
  // console.log('Watch triggered:', {
  //   hasTreeProps: !!newTreeProps,
  //   dataLength: newData?.length,
  //   firstItem: newData?.[0]
  // })

  // 清理旧的 hook
  if (treeDataHook.value && (!newTreeProps || !newData || newData.length === 0)) {
    // console.log('Clearing treeDataHook')
    treeDataHook.value = null
    return
  }

  if (newTreeProps && newData && newData.length > 0) {
    const childrenKey = newTreeProps?.children || 'children'
    const hasTreeData = newData.some((item: any) => item[childrenKey] && item[childrenKey].length > 0)

    // console.log('Checking tree data:', { childrenKey, hasTreeData })

    if (hasTreeData) {
      // 只在没有 hook 或数据源变化时重新创建
      // 注意：这里我们需要传递 internalData 的 ref
      // 由于 watch 的 newData 是解包后的值，我们需要传 internalData 本身
      // 但 useTreeData 需要 Ref，所以直接传 internalData
      if (!treeDataHook.value) {
        // console.log('Creating new treeDataHook')
        treeDataHook.value = useTreeData(
          internalData as any,
          props.rowKey,
          newTreeProps
        )
        // console.log('TreeDataHook created:', treeDataHook.value)
      }
    } else {
      // console.log('No tree structure found in data')
      treeDataHook.value = null
    }
  }
}, { immediate: true, deep: false })

// 实际用于渲染的数据（树形数据时使用扁平化后的可见节点）
const renderData = computed(() => {
  if (isTreeData.value && treeDataHook.value) {
    // visibleNodes 是一个 computed，直接返回其值
    const nodes = (treeDataHook.value.visibleNodes as any).value || treeDataHook.value.visibleNodes
    // console.log('Tree mode - visible nodes:', nodes)
    return nodes || []
  }
  // console.log('Normal mode - data:', internalData.value)
  return internalData.value || []
})


// 计算列分组
const leftFixedColumns = computed(() => {
  return props.columns.filter(col => col.fixed === 'left')
})

const rightFixedColumns = computed(() => {
  return props.columns.filter(col => col.fixed === 'right')
})

const normalColumns = computed(() => {
  return props.columns.filter(col => !col.fixed)
})

// 计算固定列宽度
const leftFixedWidth = computed(() => {
  return leftFixedColumns.value.reduce((total, col) => {
    const width = typeof col.width === 'number' ? col.width : parseInt(col.width || '100')
    return total + width
  }, 0)
})

const rightFixedWidth = computed(() => {
  return rightFixedColumns.value.reduce((total, col) => {
    const width = typeof col.width === 'number' ? col.width : parseInt(col.width || '100')
    return total + width
  }, 0)
})

// 使用虚拟滚动Hook（使用处理后的数据）
const {
  visibleData,
  renderStart,
  offsetY,
  totalHeight,
  handleScroll: handleVirtualScroll,
  setContainerHeight,
  updateItemHeight
} = useVirtualScroll(renderData as any, props.virtualConfig)

// 节流的滚动处理
const throttledScroll = throttle((e: Event) => {
  handleVirtualScroll(e)

  // 设置滚动状态
  isScrolling.value = true
  if (scrollTimer) clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    isScrolling.value = false
  }, 150)

  // 同步表头横向滚动
  if (headerRef.value && scrollRef.value) {
    headerRef.value.scrollLeft = scrollRef.value.scrollLeft
  }

  // 同步固定列的垂直滚动
  if (leftBodyRef.value && scrollRef.value) {
    leftBodyRef.value.scrollTop = scrollRef.value.scrollTop
  }
  if (rightBodyRef.value && scrollRef.value) {
    rightBodyRef.value.scrollTop = scrollRef.value.scrollTop
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

  if (sortConfig.value && sortConfig.value.key === column.key) {
    // 切换排序方式
    sortConfig.value.order = sortConfig.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    // 新的排序列
    sortConfig.value = {
      key: column.key,
      order: 'asc'
    }
  }

  if (sortConfig.value) {
    // 开启排序 loading
    isSorting.value = true

    // 发送给 Worker 处理
    // 使用 JSON.parse(JSON.stringify()) 深拷贝去除 Proxy 和不可克隆对象，防止 DataCloneError
    worker.postMessage({
      data: JSON.parse(JSON.stringify(internalData.value)),
      key: sortConfig.value.key,
      order: sortConfig.value.order
    })

    // 依然抛出事件，保持兼容性
    emit('sort', sortConfig.value)
  }
}

onUnmounted(() => {
  worker.terminate()
})


// 渲染树形单元格内容
const renderTreeCell = (row: any, column: any, isFirstColumn: boolean) => {
  // 非树形数据或非第一列，直接返回普通内容
  if (!isTreeData.value || !isFirstColumn) {
    if (column.render && typeof column.render(row, column, renderStart.value) === 'object') {
      return column.render(row, column, renderStart.value)
    } else if (column.render) {
      return column.render(row, column, renderStart.value)
    } else {
      return row[column.key]
    }
  }

  // 树形数据的第一列，添加缩进和展开按钮
  const indent = (row._level || 0) * (props.treeProps?.indent || 20)

  return h('div', {
    class: 'tree-cell',
    style: {
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      minHeight: '26px'  // 确保最小高度
    }
  }, [
    // 缩进
    h('span', {
      class: 'tree-indent',
      style: { width: `${indent}px`, display: 'inline-block', flexShrink: 0 }
    }),
    // 展开/折叠按钮
    row._hasChildren ? h('span', {
      class: 'tree-toggle',
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px',
        marginRight: '4px',
        cursor: 'pointer',
        flexShrink: 0,
        userSelect: 'none'
      },
      onClick: (e: MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        console.log('Toggle clicked for:', row._key, row.name)
        handleTreeToggle(row)
      }
    }, [
      h('svg', {
        width: 12,
        height: 12,
        viewBox: '0 0 12 12',
        style: {
          transform: row._expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }
      }, [
        h('path', {
          d: 'M4 2 L8 6 L4 10',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        })
      ])
    ]) : h('span', {
      style: { width: '20px', display: 'inline-block', flexShrink: 0 }
    }),
    // 内容
    h('span', {
      class: 'tree-content'
    }, column.render ? column.render(row, column, renderStart.value) : row[column.key])
  ])
}

// 处理树形节点展开/折叠
const handleTreeToggle = (row: any) => {
  console.log('handleTreeToggle called for:', row._key, row.name)

  if (!treeDataHook.value) {
    console.error('treeDataHook.value is null')
    return
  }

  if (!row._hasChildren) {
    console.log('Node has no children')
    return
  }

  // 切换展开状态
  const wasExpanded = row._expanded
  treeDataHook.value.toggleExpand(row._key)

  console.log(`Node ${row._key} toggled from ${wasExpanded} to ${!wasExpanded}`)

  // 发出事件
  emit('expand', { node: row, expanded: !wasExpanded })
}

// 监听容器大小变化
const resizeObserver = ref<ResizeObserver>()

onMounted(() => {
  nextTick(() => {
    if (scrollRef.value) {
      // 计算滚动条宽度
      const hasVerticalScrollbar = scrollRef.value.scrollHeight > scrollRef.value.clientHeight
      scrollbarWidth.value = hasVerticalScrollbar ? (scrollRef.value.offsetWidth - scrollRef.value.clientWidth) : 0

      // 设置容器高度
      const height = scrollRef.value.clientHeight || 600
      setContainerHeight(height)

      // 监听容器大小变化
      resizeObserver.value = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newHeight = entry.contentRect.height || 600
          setContainerHeight(newHeight)

          // 重新计算滚动条宽度
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
  if (scrollTimer) clearTimeout(scrollTimer)
})

// 监听数据变化，重置滚动位置
watch(internalData, () => {
  if (scrollRef.value) {
    scrollRef.value.scrollTop = 0
  }
  if (leftBodyRef.value) {
    leftBodyRef.value.scrollTop = 0
  }
  if (rightBodyRef.value) {
    rightBodyRef.value.scrollTop = 0
  }

  // 数据变化后重新设置容器高度
  nextTick(() => {
    if (scrollRef.value) {
      const height = scrollRef.value.clientHeight || 600
      setContainerHeight(height)

      // 重新计算滚动条宽度
      const hasScroll = scrollRef.value.scrollHeight > scrollRef.value.clientHeight
      scrollbarWidth.value = hasScroll ? (scrollRef.value.offsetWidth - scrollRef.value.clientWidth) : 0

      // 强制触发一次计算
      handleVirtualScroll({ target: { scrollTop: 0 } } as any)
    }
  })
})

// 监听 props.height 变化
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

/* 表格容器 */
.virtual-table__wrapper {
  position: relative;
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 固定列 */
.virtual-table__fixed {
  position: relative;
  overflow: hidden;
  background: #fff;
  z-index: 3;
}

.virtual-table__fixed--left {
  box-shadow: 2px 0 6px -2px rgba(0, 0, 0, 0.06);
}

.virtual-table__fixed--left.is-scrolling {
  box-shadow: 2px 0 6px -2px rgba(0, 0, 0, 0.12);
}

.virtual-table__fixed--right {
  box-shadow: -2px 0 6px -2px rgba(0, 0, 0, 0.06);
}

.virtual-table__fixed--right.is-scrolling {
  box-shadow: -2px 0 6px -2px rgba(0, 0, 0, 0.12);
}

.virtual-table__fixed-header {
  overflow: hidden;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.virtual-table__fixed-body {
  overflow: hidden;
  position: relative;
}

/* 中间滚动区域 */
.virtual-table__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 表头 */
.virtual-table__header {
  flex-shrink: 0;
  overflow: hidden;
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
  justify-content: center;
  gap: 4px;
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
  color: #333;
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
.virtual-table__body::-webkit-scrollbar,
.virtual-table__fixed-body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.virtual-table__body::-webkit-scrollbar-track,
.virtual-table__fixed-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.virtual-table__body::-webkit-scrollbar-thumb,
.virtual-table__fixed-body::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.virtual-table__body::-webkit-scrollbar-thumb:hover,
.virtual-table__fixed-body::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 隐藏固定列的滚动条 */
.virtual-table__fixed-body::-webkit-scrollbar {
  display: none;
}

.virtual-table__fixed-body {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 树形相关样式 */
.tree-cell {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  line-height: 1.5;
}

.tree-toggle {
  color: #8c8c8c;
  transition: color 0.3s, background 0.3s;
  border-radius: 4px;
}

.tree-toggle:hover {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

.tree-content {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
}

/* 确保单元格内容垂直居中 */
.virtual-table__cell-content {
  display: flex;
  align-items: center;
  height: 100%;
  min-height: 26px;
}
</style>
