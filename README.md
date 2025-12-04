# 🚀 Vue3 Virtual Table

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5+-brightgreen" alt="Vue Version">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue" alt="TypeScript Version">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

> 高性能 Vue3 虚拟滚动表格组件 - 支持10万+数据流畅滚动

## ✨ 特性

- 🎯 **虚拟滚动** - 仅渲染可视区域数据，极大提升性能
- ⚡ **高性能** - 支持10万+数据流畅滚动，60fps稳定渲染
- 📏 **动态行高** - 支持不同高度的行，自动计算和缓存
- 🔒 **列固定** - 支持左右列固定，滚动时保持可见
- 🌲 **树形数据** - 支持树形结构数据展示，可展开/折叠
- 🔧 **灵活配置** - 丰富的配置选项，满足各种场景需求
- 🎨 **自定义渲染** - 支持自定义单元格内容渲染
- 📱 **响应式** - 自适应容器大小变化
- 🔍 **排序功能** - 支持多列排序
- 💪 **TypeScript** - 完整的类型定义

## 📦 安装

```bash
npm install
```

## 🚀 快速开始

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 预览
npm run preview
```

## 📖 使用示例

### 基础使用

```vue
<template>
  <VirtualTable
    :data="tableData"
    :columns="columns"
    :height="600"
    :virtual-config="{
      itemHeight: 50,
      bufferSize: 5,
      dynamicHeight: false
    }"
    @sort="handleSort"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VirtualTable from '@/components/VirtualTable'
import type { TableColumn, TableRow } from '@/types'

const tableData = ref<TableRow[]>([
  { id: 1, name: '张三', age: 28 },
  // ... 更多数据
])

const columns: TableColumn[] = [
  { key: 'id', title: 'ID', width: 80, fixed: 'left' },
  { key: 'name', title: '姓名', width: 120, fixed: 'left' },
  { key: 'age', title: '年龄', width: 80, sortable: true },
  { key: 'actions', title: '操作', width: 100, fixed: 'right' }
]

const handleSort = (config) => {
  console.log('排序配置:', config)
}
</script>
```

### 树形数据使用

```vue
<template>
  <VirtualTable
    :data="treeData"
    :columns="columns"
    :height="600"
    :tree-props="{
      children: 'children',
      indent: 20,
      defaultExpandAll: false
    }"
    @expand="handleExpand"
  />
</template>

<script setup lang="ts">
const treeData = ref([
  {
    id: 1,
    name: '总部',
    children: [
      { id: 11, name: '技术部' },
      { id: 12, name: '市场部' }
    ]
  }
])

const handleExpand = ({ node, expanded }) => {
  console.log('节点展开/折叠:', node, expanded)
}
</script>
```

## 🔧 API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|-----|------|-----|--------|
| data | 表格数据 | `TableRow[] \| TreeTableRow[]` | `[]` |
| columns | 列配置 | `TableColumn[]` | `[]` |
| height | 表格高度 | `number \| string` | `600` |
| stripe | 是否显示斑马纹 | `boolean` | `false` |
| border | 是否显示边框 | `boolean` | `false` |
| loading | 加载状态 | `boolean` | `false` |
| rowKey | 行数据的key | `string` | `'id'` |
| virtualConfig | 虚拟滚动配置 | `VirtualScrollConfig` | 见下表 |
| treeProps | 树形数据配置 | `TreeProps` | 见下表 |

### VirtualScrollConfig

| 参数 | 说明 | 类型 | 默认值 |
|-----|------|-----|--------|
| itemHeight | 固定行高 | `number` | `50` |
| bufferSize | 缓冲区大小 | `number` | `5` |
| dynamicHeight | 是否启用动态行高 | `boolean` | `false` |
| estimatedItemHeight | 预估行高(动态高度模式) | `number` | `50` |

### TreeProps

| 参数 | 说明 | 类型 | 默认值 |
|-----|------|-----|--------|
| children | 子节点字段名 | `string` | `'children'` |
| indent | 缩进宽度 | `number` | `20` |
| defaultExpandAll | 默认展开所有节点 | `boolean` | `false` |
| defaultExpandedKeys | 默认展开的节点key数组 | `string[]` | `[]` |
| showLine | 是否显示连接线 | `boolean` | `false` |

### TableColumn

| 参数 | 说明 | 类型 | 默认值 |
|-----|------|-----|--------|
| key | 列字段名 | `string` | - |
| title | 列标题 | `string` | - |
| width | 列宽度 | `number \| string` | - |
| align | 对齐方式 | `'left' \| 'center' \| 'right'` | `'center'` |
| fixed | 固定列 | `'left' \| 'right'` | - |
| sortable | 是否可排序 | `boolean` | `false` |
| render | 自定义渲染函数 | `Function` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|-------|------|---------|
| sort | 排序时触发 | `(config: SortConfig) => void` |
| expand | 树形节点展开/折叠时触发 | `({ node, expanded }) => void` |

## 🎯 性能优化原理

### 虚拟滚动核心思想

虚拟滚动的核心是只渲染可视区域的数据，通过计算滚动位置动态更新渲染内容：

1. **可视区域计算** - 根据容器高度和行高计算可见行数
2. **缓冲区设置** - 上下各渲染额外的行，避免快速滚动时的空白
3. **位置计算** - 通过 transform 精确定位渲染内容
4. **滚动优化** - 使用 throttle 限制滚动事件频率

### 关键实现

```typescript
// 计算可见数据
const visibleData = computed(() => {
  const start = Math.floor(scrollTop.value / itemHeight)
  const end = start + visibleCount.value
  return data.value.slice(start, end)
})

// 计算偏移量
const offsetY = computed(() => {
  return renderStart.value * itemHeight
})
```

### 动态行高处理

动态行高模式下，组件会：
1. 维护每行的位置信息缓存
2. 使用二分查找快速定位起始索引
3. 监听DOM变化更新行高信息
4. 自动重新计算位置

### Web Worker 异步排序

为了避免大数据排序阻塞主线程，组件采用了 Web Worker 技术：
1. **主线程解耦** - 将排序计算任务移至后台线程
2. **流畅交互** - 即使对10万条数据排序，UI依然保持响应
3. **数据通信** - 优化了主线程与 Worker 间的数据传递机制

## 📊 性能测试

| 数据量 | 初始渲染 | 滚动FPS | 内存占用 |
|--------|---------|---------|---------|
| 1,000 | < 50ms | 60fps | ~15MB |
| 10,000 | < 100ms | 60fps | ~25MB |
| 100,000 | < 200ms | 58-60fps | ~80MB |

*测试环境: MacBook Pro M1, Chrome 120*

## 🗺️ 开发计划

### Phase 1 - 基础功能 ✅
- [x] 虚拟滚动核心实现
- [x] 固定行高模式
- [x] 基础表格功能
- [x] 排序功能

### Phase 2 - 进阶功能 ✅
- [x] 动态行高支持
- [x] 列固定（左/右）
- [x] 树形数据展示
- [x] 自定义单元格渲染
- [x] 详情弹窗展示

### Phase 3 - 性能优化 📝
- [x] Web Worker 数据处理
- [x] 虚拟滚动算法优化
- [ ] 内存占用优化
- [ ] 懒加载数据

### Phase 4 - 功能增强 📝
- [ ] 单元格编辑
- [ ] 行选择
- [ ] 列拖拽排序
- [ ] 导出Excel

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT

## 🙏 致谢

- Vue.js Team - 优秀的框架
- Vite - 极速的构建工具
- 社区贡献者们

---

<p align="center">
  Made with ❤️ by devxiaofan
</p>
