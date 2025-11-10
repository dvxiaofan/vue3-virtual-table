<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3>详情信息</h3>
            <button class="modal-close" @click="handleClose">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="rowData" class="detail-content">
              <div v-for="column in columns" :key="column.key" class="detail-item">
                <label class="detail-label">{{ column.title }}：</label>
                <div class="detail-value">
                  <span v-if="column.render">
                    {{ typeof column.render === 'function' ? column.render(rowData, column, 0) : rowData[column.key] }}
                  </span>
                  <span v-else>{{ rowData[column.key] }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="modal-button modal-button--primary" @click="handleClose">
              确定
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { TableColumn, TableRow } from '@/types'

interface DetailModalProps {
  visible: boolean
  rowData: TableRow | null
  columns: TableColumn[]
}

const props = defineProps<DetailModalProps>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
/* 遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 弹窗容器 */
.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease;
}

/* 弹窗头部 */
.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c8c8c;
  transition: all 0.3s;
  border-radius: 4px;
}

.modal-close:hover {
  background: #f0f0f0;
  color: #262626;
}

/* 弹窗主体 */
.modal-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  flex-shrink: 0;
  width: 100px;
  font-weight: 500;
  color: #8c8c8c;
  margin-right: 20px;
  font-size: 14px;
}

.detail-value {
  flex: 1;
  color: #262626;
  word-break: break-all;
  line-height: 1.4;
  font-size: 14px;
}

/* 弹窗底部 */
.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-button {
  padding: 8px 24px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #d9d9d9;
  background: white;
  color: #262626;
}

.modal-button:hover {
  border-color: #667eea;
  color: #667eea;
}

.modal-button--primary {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.modal-button--primary:hover {
  background: #5a67d8;
  border-color: #5a67d8;
  color: white;
}

/* 动画效果 */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Vue transition classes */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container {
  transform: scale(0.9);
}

.modal-leave-to .modal-container {
  transform: scale(0.9);
}

/* 滚动条样式 */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>