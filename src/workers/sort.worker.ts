/// <reference lib="webworker" />

/**
 * 排序 Worker
 * 负责在后台线程处理大数据排序，避免阻塞主线程
 */

self.onmessage = (e: MessageEvent) => {
  // 1. 接收主线程传来的“订单”：数据、排序字段、排序顺序
  const { data, key, order } = e.data

  // 如果没有数据或没有key，直接把原数据退回去
  if (!data || !Array.isArray(data) || !key) {
    self.postMessage(data)
    return
  }

  // 模拟耗时操作（可选，为了演示效果，实际生产环境不需要）
  // const start = performance.now()
  // while (performance.now() - start < 500) {}

  // 2. 执行排序（切土豆）
  // 注意：sort 会改变原数组，但在 Worker 里改的是副本，没关系
  // 为了稳妥，还是浅拷贝一份
  const sortedData = [...data].sort((a, b) => {
    const valA = a[key]
    const valB = b[key]

    // 处理 null/undefined 情况
    if (valA === valB) return 0
    if (valA === null || valA === undefined) return 1
    if (valB === null || valB === undefined) return -1

    const compareResult = valA > valB ? 1 : -1

    return order === 'asc' ? compareResult : -compareResult
  })

  // 3. 把处理好的数据发回给主线程（上菜）
  self.postMessage(sortedData)
}
