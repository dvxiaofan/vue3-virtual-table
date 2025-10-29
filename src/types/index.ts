/**
 * 虚拟滚动表格类型定义
 */

// 表格列配置
export interface TableColumn {
  key: string
  title: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  sortable?: boolean
  render?: (row: any, column: TableColumn, index: number) => any
}

// 表格行数据
export interface TableRow {
  id: string | number
  [key: string]: any
}

// 虚拟滚动配置
export interface VirtualScrollConfig {
  // 每行高度（固定高度模式）
  itemHeight?: number
  // 缓冲区数量（上下各渲染多少条额外数据）
  bufferSize?: number
  // 是否启用动态行高
  dynamicHeight?: boolean
  // 预估行高（动态高度模式使用）
  estimatedItemHeight?: number
}

// 位置信息（用于动态行高）
export interface PositionItem {
  index: number
  top: number
  bottom: number
  height: number
}

// 排序配置
export interface SortConfig {
  key: string
  order: 'asc' | 'desc'
}

// 虚拟表格属性
export interface VirtualTableProps {
  // 数据源
  data: TableRow[]
  // 列配置
  columns: TableColumn[]
  // 虚拟滚动配置
  virtualConfig?: VirtualScrollConfig
  // 表格高度
  height: number | string
  // 斑马纹
  stripe?: boolean
  // 边框
  border?: boolean
  // 加载状态
  loading?: boolean
  // 行key字段
  rowKey?: string
}
