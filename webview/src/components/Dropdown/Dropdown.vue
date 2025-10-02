<template>
  <div
    v-if="isVisible"
    class="dropdown-popover fade-in-fast"
    :style="{ ...dropdownStyle, ...popoverStyle }"
  >
    <div
      tabindex="0"
      class="dropdown-container"
      :style="containerStyle"
      @keydown.escape="close"
    >
      <!-- 内置搜索框（可选） -->
      <div v-if="showSearch" class="search-input-section">
        <input
          ref="searchInput"
          v-model="searchTerm"
          class="context-search-input"
          :placeholder="searchPlaceholder"
          @input="onSearchInput"
        />
      </div>

      <!-- 顶部区域 slot（完全可选） -->
      <slot name="header" />

      <!-- 中部可滚动区域 - 使用 ScrollableElement -->
      <ScrollableElement>
        <div class="menu-content">
          <slot
            name="content"
            :search-term="searchTerm"
            :selected-index="selectedIndex"
          />
        </div>
      </ScrollableElement>

      <!-- 底部区域 slot -->
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import ScrollableElement from '../ScrollableElement.vue'

export interface DropdownItem {
  id: string
  type: string
  [key: string]: any
}

interface Props {
  isVisible: boolean
  position: { top: number; left: number; width?: number; height?: number }
  width?: number
  contentHeight?: number
  containerStyle?: Record<string, any>
  popoverStyle?: Record<string, any>
  contentStyle?: Record<string, any>
  showSearch?: boolean
  searchPlaceholder?: string
  shouldAutoFocus?: boolean
  closeOnClickOutside?: boolean
  closeSelectors?: string[]
  align?: 'left' | 'right' | 'center'
}

interface Emits {
  (e: 'close'): void
  (e: 'select', item: DropdownItem): void
  (e: 'search', term: string): void
}

const props = withDefaults(defineProps<Props>(), {
  containerStyle: () => ({}),
  popoverStyle: () => ({}),
  contentStyle: () => ({}),
  showSearch: false,
  searchPlaceholder: 'Search...',
  shouldAutoFocus: true,
  closeOnClickOutside: true,
  closeSelectors: () => [],
  align: 'left'
})

const emit = defineEmits<Emits>()

const searchInput = ref<HTMLInputElement>()
const searchTerm = ref('')
const selectedIndex = ref(0)

// 计算属性
const dropdownStyle = computed(() => {
  const style: any = {
    position: 'fixed',
    minWidth: '140px',
    maxWidth: '240px',
    width: props.width ? `${props.width}px` : 'auto',
    zIndex: 2548
  }

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const triggerRect = props.position

  // 计算dropdown的总高度
  const searchHeight = props.showSearch ? 32 : 0  // 搜索框高度
  const footerHeight = 25 // 底部footer高度
  const dropdownTotalHeight = searchHeight + 240 + footerHeight // 使用最大高度240px

  // 计算上方和下方的可用空间
  const spaceAbove = triggerRect.top
  const spaceBelow = viewportHeight - triggerRect.top - (triggerRect.height || 0)

  // 智能选择显示位置：优先下方，空间不足时选择上方
  const showBelow = spaceBelow >= dropdownTotalHeight || spaceBelow > spaceAbove

  // 垂直定位
  if (showBelow) {
    // 显示在触发器下方
    style.top = `${triggerRect.top + (triggerRect.height || 0) + 4}px`
  } else {
    // 显示在触发器上方
    style.bottom = `${viewportHeight - triggerRect.top + 4}px`
  }

  // 水平定位 - 支持左对齐、右对齐、居中
  const triggerWidth = triggerRect.width || 0
  // 使用传入的宽度或默认最大宽度240px进行计算
  const dropdownWidth = props.width || 240

  switch (props.align) {
    case 'right':
      // 右对齐：dropdown右边缘与触发器右边缘对齐
      style.left = `${triggerRect.left + triggerWidth - dropdownWidth}px`
      break
    case 'center':
      // 居中对齐：dropdown中心与触发器中心对齐
      style.left = `${triggerRect.left + triggerWidth / 2 - dropdownWidth / 2}px`
      break
    case 'left':
    default:
      // 左对齐：dropdown左边缘与触发器左边缘对齐
      style.left = `${triggerRect.left}px`
      break
  }

  // 确保不超出屏幕边界
  const leftBoundary = 8  // 最小左边距
  const rightBoundary = viewportWidth - 8 // 最大右边距

  if (style.left < leftBoundary) {
    style.left = `${leftBoundary}px`
  } else if (parseInt(style.left) + dropdownWidth > rightBoundary) {
    style.left = `${rightBoundary - dropdownWidth}px`
  }

  return style
})

// 方法
function close() {
  emit('close')
}

function onSearchInput() {
  emit('search', searchTerm.value)
}

// 键盘导航
function handleKeydown(event: KeyboardEvent) {
  if (!props.isVisible) return

  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      close()
      break
  }
}

// 点击外部关闭
function handleClickOutside(event: MouseEvent) {
  if (!props.isVisible || !props.closeOnClickOutside) return

  const target = event.target as HTMLElement

  // 检查是否点击了下拉菜单内部
  if (target.closest('.dropdown-popover')) return

  // 检查是否点击了触发器元素
  const excludeSelectors = [
    '.premium-pill',
    '.dropdown-trigger',
    ...props.closeSelectors
  ]

  for (const selector of excludeSelectors) {
    if (target.closest(selector)) return
  }

  close()
}

// 生命周期
watch(() => props.isVisible, (visible) => {
  if (visible && props.shouldAutoFocus) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})

// 暴露方法给父组件
defineExpose({
  focusSearch: () => searchInput.value?.focus(),
  setSearchTerm: (term: string) => { searchTerm.value = term },
  getSearchTerm: () => searchTerm.value
})
</script>

<style scoped>
.dropdown-popover {
  box-sizing: border-box;
  padding: 0;
  border-radius: 6px;
  background: transparent;
  border: none;
  align-items: stretch;
  font-size: 10px;
  display: flex;
  flex-direction: column;
  gap: 0;
  visibility: visible;
  transform-origin: left top;
  box-shadow: 0 0 8px 2px color-mix(in srgb, var(--vscode-widget-shadow) 30%, transparent);
  min-width: 140px;
  max-width: 240px;
  width: auto;
}

.dropdown-container {
  box-sizing: border-box;
  border-radius: 6px;
  background-color: var(--vscode-dropdown-background);
  border: 1px solid var(--vscode-commandCenter-inactiveBorder, var(--vscode-widget-border));
  align-items: stretch;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0;
  contain: paint;
  outline: none;
  pointer-events: auto;
}

.search-input-container {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 0 6px;
  border: none;
  box-sizing: border-box;
  outline: none;
  margin: 2px;
}

.search-input {
  font-size: 12px;
  line-height: 15px;
  border-radius: 3px;
  background: transparent;
  color: var(--vscode-input-foreground);
  padding: 3px 0;
  flex: 1;
  min-width: 0;
  border: none !important;
  outline: none !important;
  box-sizing: border-box;
}

.search-input::placeholder {
  opacity: 0.5;
}

.menu-content {
  padding: 0.125rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.menu-sections {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 2px;
}

.dropdown-footer {
  flex-shrink: 0;
  background-color: var(--vscode-dropdown-background);
  border-top: 1px solid var(--vscode-commandCenter-inactiveBorder, var(--vscode-widget-border));
}

/* 淡入动画 */
.fade-in-fast {
  animation: fadein 0.1s linear;
}

@keyframes fadein {
  0% {
    opacity: 0;
    visibility: visible;
  }
  to {
    opacity: 1;
  }
}
</style>
