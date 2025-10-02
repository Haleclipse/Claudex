<template>
  <div :id="item.id || `item-${index}`">
    <div 
      class="dropdown-menu-item rounded"
      :class="{ 
        'selected': isSelected
      }"
      :data-is-selected="isSelected"
      @click="handleClick"
      @mouseenter="handleMouseEnter"
    >
      <div class="menu-item-main-content">
        <div class="menu-item-left-section">
          <!-- 图标区域 - 只在有图标时显示 -->
          <span v-if="hasIcon" class="menu-item-icon-span">
            <!-- 自定义图标内容（通过slot） -->
            <slot name="icon" :item="item">
              <!-- 默认图标渲染 -->
              <i v-if="item.icon" :class="`codicon ${item.icon}`"></i>
            </slot>
          </span>
          
          <!-- 文本区域 -->
          <div class="menu-item-text-section">
            <!-- 主要内容显示 -->
            <div class="file-info-container">
              <span class="monaco-highlighted-label">{{ item.label || item.name }}</span>
            </div>
            <!-- 辅助信息显示（如文件路径、描述等） -->
            <span v-if="item.detail" class="file-path-container">
              <span class="monaco-highlighted-label file-path-text">{{ item.detail }}</span>
            </span>
          </div>
        </div>
        
        <!-- 右侧状态区域 -->
        <div v-if="item.rightIcon || item.checked" class="menu-item-right-section">
          <span v-if="item.checked" class="check-icon codicon codicon-check"></span>
          <span v-else-if="item.rightIcon" class="submenu-arrow-icon codicon" :class="item.rightIcon"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { DropdownItemData } from '../../../types/dropdown'

interface Props {
  item: DropdownItemData
  isSelected?: boolean
  index: number
}

interface Emits {
  (e: 'click', item: DropdownItemData): void
  (e: 'mouseenter', index: number): void
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false
})

const emit = defineEmits<Emits>()
const slots = useSlots()

// 检查是否有图标
const hasIcon = computed(() => {
  return !!props.item.icon || !!slots.icon
})

function handleClick() {
  if (!props.item.disabled) {
    emit('click', props.item)
  }
}

function handleMouseEnter() {
  if (!props.item.disabled) {
    emit('mouseenter', props.index)
  }
}
</script>

<style scoped>
.dropdown-menu-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.125rem 0.375rem;
  min-width: 0;
  cursor: pointer;
  color: var(--vscode-foreground);
}

.dropdown-menu-item:hover {
  background-color: color-mix(in srgb, var(--vscode-foreground) 20%, transparent);
  color: var(--vscode-list-hoverForeground);
  outline: 1px dotted var(--vscode-contrastActiveBorder);
}

.dropdown-menu-item:hover .file-info-container,
.dropdown-menu-item:hover .option-info-container,
.dropdown-menu-item:hover .file-path-container {
  color: var(--vscode-panelTitle-activeForeground);
}


.menu-item-main-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
  width: 100%;
}

.menu-item-left-section {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
  height: 16px;
}

.menu-item-icon-span {
  flex-shrink: 0;
  width: 13px;
  color: var(--vscode-foreground);
  display: flex !important;
  align-items: center;
  justify-content: flex-start;
  font-size: 12px !important;
}

.dropdown-menu-item:hover .menu-item-icon-span {
  color: var(--vscode-list-activeSelectionForeground);
}

.menu-item-text-section {
  display: flex;
  width: 100%;
  align-items: center;
  min-width: 0;
  gap: 0.25rem;
  height: 17px;
}

.file-info-container,
.option-info-container {
  max-width: 100%;
  color: var(--vscode-panelTitle-activeForeground);
  flex-shrink: 0;
}


.monaco-highlighted-label {
  color: inherit;
  font-size: 12px;
  line-height: 17px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: block;
  width: 100%;
}

.file-path-container {
  direction: rtl;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: var(--vscode-panelTitle-activeForeground);
  flex-shrink: 1;
  opacity: 0.6;
}


.file-path-text {
  font-size: 9px;
  line-height: 17px;
  unicode-bidi: embed;
}

.menu-item-right-section {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-left: 0.25rem;
}

.submenu-arrow-icon {
  color: var(--vscode-foreground);
  margin-right: 0 !important;
  font-size: 8px !important;
  flex-shrink: 0;
  opacity: 0.6;
}

.dropdown-menu-item:hover .submenu-arrow-icon {
  color: var(--vscode-list-activeSelectionForeground);
  opacity: 1;
}

.check-icon {
  color: var(--vscode-foreground);
  margin-right: 0 !important;
  font-size: 8px !important;
  flex-shrink: 0;
}

.dropdown-menu-item:hover .check-icon {
  color: var(--vscode-list-activeSelectionForeground);
}

.highlight {
  color: var(--vscode-list-highlightForeground);
  font-weight: 700;
}


.codicon:not(.bg-codicon-icon) {
  font-size: 12px !important;
}
</style>