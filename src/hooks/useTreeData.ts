/**
 * 树形数据处理 Hook
 * 负责树形数据的扁平化、展开/折叠状态管理
 */

import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'

// 树形节点接口
export interface TreeNode {
  [key: string]: any
  children?: TreeNode[]
}

// 扁平化后的节点
export interface FlattenedNode extends TreeNode {
  _key: string                  // 唯一标识
  _level: number                // 层级深度（0开始）
  _expanded: boolean            // 是否展开
  _visible: boolean             // 是否可见
  _hasChildren: boolean         // 是否有子节点
  _parentKey?: string          // 父节点key
  _isLastChild: boolean        // 是否是同级最后一个节点
  _path: string[]              // 节点路径
}

// 树形配置
export interface TreeProps {
  children?: string             // 子节点字段名，默认 'children'
  hasChildren?: string          // 是否有子节点字段名
  indent?: number              // 缩进宽度，默认 20
  expandedKeys?: string[]      // 受控的展开节点
  defaultExpandAll?: boolean   // 默认展开所有
  defaultExpandedKeys?: string[] // 默认展开的节点
  showLine?: boolean           // 是否显示连接线
}

export function useTreeData(
  data: Ref<TreeNode[]>,
  rowKey: string = 'id',
  treeProps: TreeProps = {}
) {
  const {
    children = 'children',
    defaultExpandAll = false,
    defaultExpandedKeys = [],
    expandedKeys: controlledExpandedKeys
  } = treeProps

  // 展开的节点集合
  const expandedKeysSet = ref<Set<string>>(new Set(
    controlledExpandedKeys || defaultExpandedKeys || []
  ))

  // 扁平化的所有节点
  const flattenedData = ref<FlattenedNode[]>([])

  /**
   * 获取节点的唯一key
   */
  const getNodeKey = (node: TreeNode, parentKey?: string, index?: number): string => {
    if (node[rowKey] !== undefined) {
      return String(node[rowKey])
    }
    // 如果没有rowKey，使用父key和索引生成
    return parentKey ? `${parentKey}-${index}` : String(index)
  }

  /**
   * 递归扁平化树形数据
   */
  const flattenTree = (
    nodes: TreeNode[],
    level: number = 0,
    parentKey?: string,
    parentPath: string[] = []
  ): FlattenedNode[] => {
    const result: FlattenedNode[] = []

    nodes.forEach((node, index) => {
      const nodeKey = getNodeKey(node, parentKey, index)
      const nodePath = [...parentPath, nodeKey]
      const nodeChildren = node[children] as TreeNode[] | undefined
      const hasChildren = !!(nodeChildren && nodeChildren.length > 0)
      const isLastChild = index === nodes.length - 1

      // 判断是否展开
      const expanded = defaultExpandAll || expandedKeysSet.value.has(nodeKey)

      // 创建扁平化节点
      const flatNode: FlattenedNode = {
        ...node,
        _key: nodeKey,
        _level: level,
        _expanded: expanded,
        _visible: true, // 根节点始终可见
        _hasChildren: hasChildren,
        _parentKey: parentKey,
        _isLastChild: isLastChild,
        _path: nodePath
      }

      result.push(flatNode)

      // 递归处理子节点
      if (hasChildren && nodeChildren) {
        const childrenFlat = flattenTree(
          nodeChildren,
          level + 1,
          nodeKey,
          nodePath
        )
        result.push(...childrenFlat)
      }
    })

    return result
  }

  /**
   * 更新节点的可见性
   */
  const updateVisibility = (nodes: FlattenedNode[]) => {
    const visibleParents = new Set<string>()

    nodes.forEach(node => {
      if (!node._parentKey) {
        // 根节点始终可见
        node._visible = true
        if (node._expanded) {
          visibleParents.add(node._key)
        }
      } else {
        // 子节点的可见性取决于所有父节点是否展开
        const allParentsExpanded = node._path.slice(0, -1).every(parentKey =>
          expandedKeysSet.value.has(parentKey)
        )
        node._visible = allParentsExpanded

        if (node._visible && node._expanded) {
          visibleParents.add(node._key)
        }
      }
    })
  }

  /**
   * 获取可见的节点（用于虚拟滚动）
   */
  const visibleNodes = computed(() => {
    return flattenedData.value.filter(node => node._visible)
  })

  /**
   * 切换节点展开/折叠
   */
  const toggleExpand = (nodeKey: string, expanded?: boolean) => {
    const node = flattenedData.value.find(n => n._key === nodeKey)
    if (!node || !node._hasChildren) return

    if (expanded === undefined) {
      // 切换状态
      if (expandedKeysSet.value.has(nodeKey)) {
        expandedKeysSet.value.delete(nodeKey)
        node._expanded = false
      } else {
        expandedKeysSet.value.add(nodeKey)
        node._expanded = true
      }
    } else {
      // 设置指定状态
      if (expanded) {
        expandedKeysSet.value.add(nodeKey)
        node._expanded = true
      } else {
        expandedKeysSet.value.delete(nodeKey)
        node._expanded = false
      }
    }

    // 更新可见性
    updateVisibility(flattenedData.value)
  }

  /**
   * 展开所有节点
   */
  const expandAll = () => {
    flattenedData.value.forEach(node => {
      if (node._hasChildren) {
        expandedKeysSet.value.add(node._key)
        node._expanded = true
      }
    })
    updateVisibility(flattenedData.value)
  }

  /**
   * 折叠所有节点
   */
  const collapseAll = () => {
    expandedKeysSet.value.clear()
    flattenedData.value.forEach(node => {
      node._expanded = false
    })
    updateVisibility(flattenedData.value)
  }

  /**
   * 展开到指定层级
   */
  const expandToLevel = (level: number) => {
    flattenedData.value.forEach(node => {
      if (node._hasChildren && node._level < level) {
        expandedKeysSet.value.add(node._key)
        node._expanded = true
      } else if (node._level >= level) {
        expandedKeysSet.value.delete(node._key)
        node._expanded = false
      }
    })
    updateVisibility(flattenedData.value)
  }

  // 监听数据变化，重新扁平化
  watch(data, (newData) => {
    if (!newData || newData.length === 0) {
      flattenedData.value = []
      return
    }

    // 扁平化数据
    flattenedData.value = flattenTree(newData)

    // 初始化展开状态
    if (defaultExpandAll) {
      expandAll()
    } else {
      updateVisibility(flattenedData.value)
    }
  }, { immediate: true, deep: false })

  // 监听受控的展开keys
  watch(() => controlledExpandedKeys, (newKeys) => {
    if (newKeys) {
      expandedKeysSet.value = new Set(newKeys)
      flattenedData.value.forEach(node => {
        node._expanded = expandedKeysSet.value.has(node._key)
      })
      updateVisibility(flattenedData.value)
    }
  }, { deep: true })

  return {
    // 状态
    flattenedData,
    visibleNodes,
    expandedKeysSet,

    // 方法
    toggleExpand,
    expandAll,
    collapseAll,
    expandToLevel,

    // 工具函数
    getNodeKey
  }
}