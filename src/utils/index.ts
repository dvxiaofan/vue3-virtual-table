/**
 * 工具函数
 */

import type { TableRow, TreeTableRow } from '@/types'

/**
 * 生成模拟数据
 */
export function generateMockData(count: number): TableRow[] {
  const data: TableRow[] = []
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
  const departments = ['技术部', '产品部', '运营部', '市场部', '人事部']
  const positions = ['工程师', '经理', '主管', '总监', '专员']

  for (let i = 0; i < count; i++) {
    data.push({
      id: i + 1,
      name: `${names[i % names.length]}${i + 1}`,
      age: 20 + Math.floor(Math.random() * 40),
      department: departments[Math.floor(Math.random() * departments.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      salary: 8000 + Math.floor(Math.random() * 20000),
      email: `user${i + 1}@example.com`,
      phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      address: `北京市朝阳区某某街道${i + 1}号`,
      joinDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString()
    })
  }

  return data
}

/**
 * 生成树形模拟数据
 */
export function generateTreeMockData(levels: number = 3, childrenPerNode: number = 3): TreeTableRow[] {
  let idCounter = 1

  const generateNode = (level: number, parentName: string = ''): TreeTableRow => {
    const id = idCounter++
    const name = parentName ? `${parentName}-${id}` : `节点${id}`

    const node: TreeTableRow = {
      id: id,
      name: name,
      type: level === 1 ? '总部' : level === 2 ? '分公司' : level === 3 ? '部门' : '小组',
      manager: `${['张', '李', '王', '赵'][id % 4]}${['经理', '总监', '主管'][level - 1] || '组长'}`,
      employees: Math.floor(Math.random() * 50) + 10,
      budget: Math.floor(Math.random() * 1000000) + 100000,
      status: ['运营中', '筹备中', '整改中'][id % 3],
      createDate: `202${id % 5}/${(id % 12) + 1}/${(id % 28) + 1}`
    }

    if (level < levels) {
      node.children = Array.from({ length: childrenPerNode }, () =>
        generateNode(level + 1, name)
      )
    }

    return node
  }

  // 生成多个根节点
  return Array.from({ length: 3 }, () => generateNode(1))
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    const context = this

    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let previous = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    const remaining = wait - (now - previous)
    const context = this

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(context, args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now()
        timeout = null
        func.apply(context, args)
      }, remaining)
    }
  }
}
