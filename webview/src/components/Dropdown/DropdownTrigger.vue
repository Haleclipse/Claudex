<template>
  <div class="dropdown-trigger-container" ref="containerRef">
    <!-- 触发器按钮 -->
    <div
      ref="triggerRef"
      :class="triggerClass"
      :style="triggerStyle"
      @click="toggleDropdown"
      v-bind="triggerProps"
    >
      <!-- 触发器内容通过slot定制 -->
      <slot name="trigger" :isOpen="isVisible" :toggle="toggleDropdown">
        <!-- 默认触发器样式 -->
        <span class="codicon codicon-chevron-down"></span>
      </slot>
    </div>

    <!-- 下拉菜单 -->
    <div
      v-if="isVisible"
      ref="dropdownRef"
      class="dropdown-trigger-popover"
      :style="{ ...dropdownStyle, ...popoverStyle }"
      @click.stop
    >
      <div
        tabindex="0"
        class="dropdown-trigger-container-inner"
        :style="containerStyle"
        @keydown.escape="closeDropdown"
      >
        <!-- 搜索框（可选） -->
        <div v-if="showSearch" class="search-input-section">
          <input
            ref="searchInput"
            v-model="searchTerm"
            class="context-search-input"
            :placeholder="searchPlaceholder"
            @input="onSearchInput"
          />
        </div>

        <!-- 顶部区域 slot -->
        <slot name="header" />

        <!-- 中部可滚动区域（自适应高度 + 最大高度限制） -->
        <ScrollableElement>
          <div class="menu-content">
            <slot
              name="content"
              :search-term="searchTerm"
              :close="closeDropdown"
            />
          </div>
        </ScrollableElement>

        <!-- 底部区域 slot -->
        <slot name="footer" />
      </div>
    </div>

  </div>

  <!-- 点击外部关闭的遮罩 -->
  <div
    v-if="isVisible && closeOnClickOutside"
    class="dropdown-trigger-backdrop"
    @click="closeDropdown"
  ></div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import ScrollableElement from '../ScrollableElement.vue'

interface Props {
  // 触发器相关
  triggerClass?: string
  triggerStyle?: Record<string, any>
  triggerProps?: Record<string, any>

  // 下拉菜单相关
  width?: number
  contentHeight?: number
  containerStyle?: Record<string, any>
  popoverStyle?: Record<string, any>

  // 功能配置
  showSearch?: boolean
  searchPlaceholder?: string
  shouldAutoFocus?: boolean
  closeOnClickOutside?: boolean
  align?: 'left' | 'right' | 'center'

  // 行为控制
  disabled?: boolean
}

interface Emits {
  (e: 'open'): void
  (e: 'close'): void
  (e: 'search', term: string): void
  (e: 'toggle', isOpen: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  containerStyle: () => ({}),
  popoverStyle: () => ({}),
  triggerClass: '',
  showSearch: false,
  searchPlaceholder: 'Search...',
  shouldAutoFocus: true,
  closeOnClickOutside: true,
  align: 'left',
  disabled: false
})

const emit = defineEmits<Emits>()

// DOM 引用
const containerRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const searchInput = ref<HTMLInputElement>()

// 状态
const isVisible = ref(false)
const searchTerm = ref('')

// 智能定位计算
const dropdownStyle = computed(() => {
  const style: any = {
    position: 'absolute',
    minWidth: '140px',
    maxWidth: '240px',
    width: props.width ? `${props.width}px` : 'auto',
    zIndex: 2548
  }

  if (!triggerRef.value) return style

  const viewportHeight = window.innerHeight
  const triggerRect = triggerRef.value.getBoundingClientRect()

  // 计算dropdown的总高度
  const searchHeight = props.showSearch ? 32 : 0
  const footerHeight = 25
  const dropdownTotalHeight = searchHeight + 240 + footerHeight // 使用最大高度240px

  // 计算可用空间
  const spaceAbove = triggerRect.top
  const spaceBelow = viewportHeight - triggerRect.bottom

  // 智能选择显示位置
  const showBelow = spaceBelow >= dropdownTotalHeight || spaceBelow > spaceAbove

  // 垂直定位 - 相对于触发器
  if (showBelow) {
    style.top = '100%'
    style.marginTop = '4px'
  } else {
    style.bottom = '100%'
    style.top = 'auto'
    style.marginBottom = '4px'
  }

  // 水平定位 - 相对于触发器
  switch (props.align) {
    case 'right':
      style.right = '0'
      style.left = 'auto'
      break
    case 'center':
      style.left = '50%'
      style.transform = 'translateX(-50%)'
      break
    case 'left':
    default:
      style.left = '0'
      break
  }

  return style
})

// 方法
function toggleDropdown() {
  if (props.disabled) return

  if (isVisible.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

function openDropdown() {
  if (props.disabled) return

  isVisible.value = true
  emit('open')
  emit('toggle', true)

  if (props.shouldAutoFocus && props.showSearch) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
}

function closeDropdown() {
  isVisible.value = false
  searchTerm.value = ''
  emit('close')
  emit('toggle', false)
}

function onSearchInput() {
  emit('search', searchTerm.value)
}

// 键盘事件处理
function handleKeydown(event: KeyboardEvent) {
  if (!isVisible.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    closeDropdown()
  }
}

// 点击外部关闭
function handleClickOutside(event: MouseEvent) {
  if (!isVisible.value || !props.closeOnClickOutside) return

  const target = event.target as HTMLElement

  // 检查是否点击了组件内部
  if (containerRef.value?.contains(target)) return

  closeDropdown()
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})

// 暴露方法
defineExpose({
  open: openDropdown,
  close: closeDropdown,
  toggle: toggleDropdown,
  isOpen: computed(() => isVisible.value)
})
</script>

<style scoped>
.dropdown-trigger-container {
  position: relative;
  display: inline-block;
}

.dropdown-trigger-popover {
  box-sizing: border-box;
  padding: 0;
  border-radius: 6px;
  background-color: var(--vscode-dropdown-background);
  border: 1px solid var(--vscode-commandCenter-inactiveBorder, var(--vscode-widget-border));
  align-items: stretch;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 0 8px 2px color-mix(in srgb, var(--vscode-widget-shadow) 30%, transparent);
  contain: paint;
  outline: none;
  min-width: 140px;
  max-width: 240px;
  width: auto;
}

.dropdown-trigger-container-inner {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  outline: none;
  width: 100%;
  height: 100%;
}

.dropdown-trigger-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2547;
  background: transparent;
}

.search-input-section {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 0 6px;
  border: none;
  box-sizing: border-box;
  outline: none;
  margin: 2px;
}

.context-search-input {
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

.context-search-input::placeholder {
  opacity: 0.5;
}

.menu-content {
  padding: 0.125rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
</style>
