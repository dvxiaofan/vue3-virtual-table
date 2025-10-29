/**
 * 虚拟滚动核心逻辑
 */

import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import type { VirtualScrollConfig, PositionItem, TableRow } from '@/types'

export function useVirtualScroll(
  data: Ref<TableRow[]>,
  config: VirtualScrollConfig = {}
) {
  const {
    itemHeight = 50,
    bufferSize = 5,
    dynamicHeight = false,
    estimatedItemHeight = 50
  } = config

  // 滚动容器高度
  const containerHeight = ref(0)
  // 当前滚动位置
  const scrollTop = ref(0)
  // 位置信息缓存（动态行高使用）
  const positions = ref<PositionItem[]>([])

  /**
   * 初始化位置信息（动态行高模式）
   */
  const initPositions = () => {
    positions.value = data.value.map((_, index) => ({
      index,
      top: index * estimatedItemHeight,
      bottom: (index + 1) * estimatedItemHeight,
      height: estimatedItemHeight
    }))
  }

  /**
   * 更新某一项的高度（动态行高模式）
   */
  const updateItemHeight = (index: number, height: number) => {
    const oldHeight = positions.value[index].height
    const diff = height - oldHeight

    positions.value[index].height = height
    positions.value[index].bottom = positions.value[index].top + height

    // 更新后续所有项的位置
    for (let i = index + 1; i < positions.value.length; i++) {
      positions.value[i].top = positions.value[i - 1].bottom
      positions.value[i].bottom = positions.value[i].top + positions.value[i].height
    }
  }

  /**
   * 获取起始索引（二分查找优化）
   */
  const getStartIndex = computed(() => {
    if (dynamicHeight) {
      // 动态行高：使用二分查找
      let left = 0
      let right = positions.value.length - 1
      let mid = 0

      while (left <= right) {
        mid = Math.floor((left + right) / 2)
        const midBottom = positions.value[mid].bottom

        if (midBottom === scrollTop.value) {
          return mid + 1
        } else if (midBottom < scrollTop.value) {
          left = mid + 1
        } else {
          right = mid - 1
        }
      }

      return left
    } else {
      // 固定行高：直接计算
      return Math.floor(scrollTop.value / itemHeight)
    }
  })

  /**
   * 可见区域数量
   */
  const visibleCount = computed(() => {
    if (dynamicHeight) {
      let count = 0
      let height = 0
      const startIndex = getStartIndex.value

      for (let i = startIndex; i < positions.value.length; i++) {
        height += positions.value[i].height
        count++
        if (height >= containerHeight.value) break
      }

      return count
    } else {
      return Math.ceil(containerHeight.value / itemHeight)
    }
  })

  /**
   * 实际渲染的起始索引（加上缓冲区）
   */
  const renderStart = computed(() => {
    return Math.max(0, getStartIndex.value - bufferSize)
  })

  /**
   * 实际渲染的结束索引（加上缓冲区）
   */
  const renderEnd = computed(() => {
    return Math.min(
      data.value.length,
      getStartIndex.value + visibleCount.value + bufferSize
    )
  })

  /**
   * 实际渲染的数据
   */
  const visibleData = computed(() => {
    return data.value.slice(renderStart.value, renderEnd.value)
  })

  /**
   * 偏移量（撑开容器高度）
   */
  const offsetY = computed(() => {
    if (dynamicHeight && positions.value.length > 0) {
      return positions.value[renderStart.value]?.top || 0
    } else {
      return renderStart.value * itemHeight
    }
  })

  /**
   * 总高度
   */
  const totalHeight = computed(() => {
    if (dynamicHeight && positions.value.length > 0) {
      return positions.value[positions.value.length - 1].bottom
    } else {
      return data.value.length * itemHeight
    }
  })

  /**
   * 滚动事件处理
   */
  const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement
    scrollTop.value = target.scrollTop
  }

  /**
   * 设置容器高度
   */
  const setContainerHeight = (height: number) => {
    containerHeight.value = height
  }

  // 监听数据变化，重新初始化位置信息
  watch(
    () => data.value.length,
    () => {
      if (dynamicHeight) {
        initPositions()
      }
    },
    { immediate: true }
  )

  return {
    // 状态
    scrollTop,
    containerHeight,
    positions,

    // 计算属性
    visibleData,
    renderStart,
    renderEnd,
    offsetY,
    totalHeight,
    visibleCount,

    // 方法
    handleScroll,
    setContainerHeight,
    updateItemHeight
  }
}
