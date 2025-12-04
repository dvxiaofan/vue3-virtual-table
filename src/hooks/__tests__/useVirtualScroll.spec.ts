import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useVirtualScroll } from '../useVirtualScroll'
import type { TableRow } from '@/types'

describe('useVirtualScroll', () => {
  // 1. 准备测试数据
  const createData = (count: number): TableRow[] => {
    return Array.from({ length: count }, (_, index) => ({
      id: index,
      name: `Item ${index}`
    }))
  }

  it('应该正确计算初始渲染范围', () => {
    // 准备 100 条数据
    const data = ref(createData(100))

    // 初始化 Hook
    // itemHeight: 50, bufferSize: 5 (默认配置)
    // containerHeight 默认为 600
    const { visibleData, renderStart, renderEnd } = useVirtualScroll(data, {
      itemHeight: 50,
      bufferSize: 5
    })

    // 计算预期：
    // 可视区域能放下 600 / 50 = 12 条
    // 缓冲区 5 条
    // 初始 renderStart = 0
    // 初始 renderEnd = 0 + 12 + 5 = 17

    expect(renderStart.value).toBe(0)
    expect(renderEnd.value).toBe(17)
    expect(visibleData.value.length).toBe(17)
    expect(visibleData.value[0]!.id).toBe(0)
    expect(visibleData.value[visibleData.value.length - 1]!.id).toBe(16)
  })

  it('滚动后应该更新渲染范围', async () => {
    const data = ref(createData(100))
    const { visibleData, handleScroll, renderStart } = useVirtualScroll(data, {
      itemHeight: 50,
      bufferSize: 5
    })

    // 模拟滚动到 1000px 的位置 (相当于滚动了 20 条数据的高度)
    // 50 * 20 = 1000
    const mockEvent = {
      target: {
        scrollTop: 1000
      }
    } as unknown as Event

    handleScroll(mockEvent)

    // 等待 Vue 响应式更新 (虽然 computed 是同步的，但为了稳妥，但为了稳妥)
    // 在 setup 外部使用 computed 也是同步更新的

    // 计算预期：
    // startIndex = 1000 / 50 = 20
    // renderStart = 20 - 5 = 15
    // visibleCount = 12
    // renderEnd = 20 + 12 + 5 = 37

    expect(renderStart.value).toBe(15)
    expect(visibleData.value.length).toBe(37 - 15) // 22 条
    expect(visibleData.value[0]!.id).toBe(15) // 第一条应该是 id 15
  })

  it('数据变化时应该重置状态', () => {
    const data = ref(createData(10))
    const { visibleData } = useVirtualScroll(data)

    expect(visibleData.value.length).toBe(10)

    // 更新数据
    data.value = createData(5)
    expect(visibleData.value.length).toBe(5)
  })
})
