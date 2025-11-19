<template>
  <!-- 输入框 - 三行布局结构 -->
  <div class="full-input-box">

    <!-- 第一行：Add Context + Context标签 + 进度指示器 -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <!-- Add Context Dropdown Trigger -->
        <DropdownTrigger
          :show-search="true"
          search-placeholder="Search files, folders, docs..."
          align="left"
          @open="handleAddContext"
          @search="handleSearch"
        >
          <!-- 自定义触发器按钮 -->
          <template #trigger>
            <div
              class="premium-pill premium-pill-default"
              style="cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 2px; height: 20px; width: auto; box-sizing: border-box; border-radius: 4px; border: 1px solid var(--vscode-input-border); outline: none; flex-shrink: 0;"
            >
              <span class="codicon codicon-at-sign" style="font-size: 11px; color: color-mix(in srgb, var(--vscode-foreground) 60%, transparent); padding-left: 2px;"></span>
              <span style="color: color-mix(in srgb, var(--vscode-foreground) 68%, transparent); font-size: 12px; margin-inline: 2px;">Add Context</span>
            </div>
          </template>

          <!-- 下拉内容 -->
          <template #content="{ close }">
            <template v-for="(item, index) in addContextItems" :key="item.id">
              <DropdownSeparator v-if="item.type === 'separator'" />
              <div v-else-if="item.type === 'section-header'" class="section-header">{{ item.text }}</div>
              <DropdownItem
                v-else
                :item="item"
                :index="index"
                :is-selected="'checked' in item ? item.checked || false : false"
                @click="(item) => handleContextOption(item, close)"
              >
                <!-- 自定义文件图标 -->
                <template #icon="{ item }" v-if="item.type === 'file'">
                  <FileIcon :file-name="item.name || ''" />
                </template>
              </DropdownItem>
            </template>
          </template>

          <!-- 底部信息 -->
          <template #footer>
            <div class="context-usage-footer">
              <div style="display: flex; align-items: center; gap: 4px;">
                <div style="width: 12px; height: 12px; position: relative;">
                  <svg width="12" height="12">
                    <circle fill="none" opacity="0.25" cx="6" cy="6" r="4.25" stroke="var(--vscode-foreground)" stroke-width="1.5"></circle>
                    <circle fill="none" stroke-linecap="round" opacity="0.9" cx="6" cy="6" r="4.25" stroke="var(--vscode-foreground)" stroke-width="1.5" stroke-dasharray="26.7" stroke-dashoffset="13.6" transform="rotate(-90 6 6)"></circle>
                  </svg>
                </div>
                <span>49% of context used</span>
              </div>
            </div>
          </template>
        </DropdownTrigger>

        <!-- 这里可以动态添加 Context 标签 -->
      </div>

      <!-- 进度指示器 -->
      <div
        v-if="showProgress"
        style="display: flex; align-items: center; gap: 4px; padding: 2px 6px; background-color: var(--vscode-input-background); border-radius: 4px; box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px;"
      >
        <span style="font-size: 12px; color: color-mix(in srgb, var(--vscode-foreground) 48%, transparent);">{{ progressPercentage }}%</span>
        <div class="progress-circle">
          <svg width="14" height="14">
            <circle fill="none" opacity="0.25" cx="7" cy="7" r="5.25" stroke="var(--vscode-foreground)" stroke-width="1.5"></circle>
            <circle fill="none" stroke-linecap="round" opacity="0.9" cx="7" cy="7" r="5.25" stroke="var(--vscode-foreground)" stroke-width="1.5" :stroke-dasharray="circumference" :stroke-dashoffset="strokeOffset" transform="rotate(-90 7 7)"></circle>
          </svg>
        </div>
      </div>
    </div>

    <!-- 第二行：输入框区域 -->
    <div
      ref="textareaRef"
      contenteditable="true"
      class="aislash-editor-input custom-scroll-container"
      :data-placeholder="placeholder"
      style="min-height: 34px; max-height: 240px; resize: none; overflow-y: hidden; word-wrap: break-word; white-space: pre-wrap; width: 100%; height: 34px;"
      @input="handleInput"
      @keydown="handleKeydown"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
    />

    <!-- 第三行：使用 ButtonArea 组件 -->
    <ButtonArea
      :disabled="isSubmitDisabled"
      :loading="isLoading"
      :selected-model="selectedModelLocal"
      :conversation-working="conversationWorking"
      :has-input-content="!!content.trim()"
      @submit="handleSubmit"
      @stop="handleStop"
      @image="handleImage"
      @agent-dropdown="handleAgentDropdown"
      @model-dropdown="handleModelDropdown"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import FileIcon from './FileIcon.vue'
import ButtonArea from './ButtonArea.vue'
import { DropdownTrigger, DropdownItem, DropdownSeparator, type DropdownItemData } from './Dropdown'
import type { DropdownItemType } from '../../types/dropdown'

interface Props {
  showProgress?: boolean
  progressPercentage?: number
  placeholder?: string
  readonly?: boolean
  showSearch?: boolean
  selectedModel?: string
  conversationWorking?: boolean
}

interface Emits {
  (e: 'submit', content: string): void
  (e: 'queueMessage', content: string): void
  (e: 'stop'): void
  (e: 'input', content: string): void
  (e: 'attach'): void
  (e: 'image'): void
  (e: 'search', query: string): void
  (e: 'addContext'): void
  (e: 'agentDropdown'): void
  (e: 'modelDropdown'): void
}

const props = withDefaults(defineProps<Props>(), {
  showProgress: true,
  progressPercentage: 48.7,
  placeholder: 'Write, @ for context, / for commands...',
  readonly: false,
  showSearch: false,
  selectedModel: 'claude-4-sonnet',
  conversationWorking: false
})

const emit = defineEmits<Emits>()

const content = ref('')
const isLoading = ref(false)
const selectedModelLocal = ref(props.selectedModel)
const textareaRef = ref<HTMLDivElement>()
// 检查输入法的状态
const isComposing = ref(false)

// 定义Add Context菜单的业务数据
const addContextItems: DropdownItemType[] = [
  // 文件类型项目
  {
    id: 'main-ts',
    label: 'main.ts',
    name: 'main.ts',
    detail: 'packages/backend/src',
    type: 'file',
    data: { path: 'packages/backend/src/main.ts' }
  },
  {
    id: 'tailwind-config',
    label: 'tailwind.config.ts',
    name: 'tailwind.config.ts',
    detail: 'packages/frontend',
    type: 'file',
    data: { path: 'packages/frontend/tailwind.config.ts' }
  },
  {
    id: 'uv-lock',
    label: 'uv.lock',
    name: 'uv.lock',
    detail: '/Users/haleclipse/WorkSpace/claude-code-proxy',
    type: 'file',
    data: { path: '/Users/haleclipse/WorkSpace/claude-code-proxy/uv.lock' }
  },

  // 分隔符
  { id: 'separator-1', type: 'separator' },

  // 分组标题
  { id: 'section-added', type: 'section-header', text: 'Added' },

  // 已选中的项目
  {
    id: 'active-tabs-added',
    label: 'Active Tabs',
    icon: 'codicon-files',
    checked: true,
    type: 'context-source',
    data: { sourceType: 'active-tabs' }
  },

  { id: 'separator-2', type: 'separator' },

  // 带子菜单的选项
  {
    id: 'files-folders',
    label: 'Files & Folders',
    icon: 'codicon-files',
    rightIcon: 'codicon-chevron-right',
    type: 'context-category',
    data: { category: 'files' }
  },
  {
    id: 'code',
    label: 'Code',
    icon: 'codicon-code',
    rightIcon: 'codicon-chevron-right',
    type: 'context-category',
    data: { category: 'code' }
  },
  {
    id: 'docs',
    label: 'Docs',
    icon: 'codicon-book',
    rightIcon: 'codicon-chevron-right',
    type: 'context-category',
    data: { category: 'docs' }
  },
  {
    id: 'git',
    label: 'Git',
    icon: 'codicon-git-merge',
    rightIcon: 'codicon-chevron-right',
    type: 'context-category',
    data: { category: 'git' }
  },
  {
    id: 'past-chats',
    label: 'Past Chats',
    icon: 'codicon-notebook',
    rightIcon: 'codicon-chevron-right',
    type: 'context-category',
    data: { category: 'chats' }
  },
  {
    id: 'rules',
    label: 'Rules',
    icon: 'codicon-symbol-ruler',
    rightIcon: 'codicon-chevron-right',
    type: 'context-category',
    data: { category: 'rules' }
  },
  {
    id: 'terminals',
    label: 'Terminals',
    icon: 'codicon-terminal',
    rightIcon: 'codicon-chevron-right',
    type: 'context-category',
    data: { category: 'terminals' }
  },

  // 直接选项（无子菜单）
  {
    id: 'active-tabs-option',
    label: 'Active Tabs',
    icon: 'codicon-file-two',
    type: 'context-source',
    data: { sourceType: 'active-tabs-list' }
  },
  {
    id: 'linter-errors-two',
    label: 'Linter Errors',
    icon: 'codicon-warning',
    type: 'context-source',
    data: { sourceType: 'linter' }
  },
  {
    id: 'web',
    label: 'Web',
    icon: 'codicon-globe',
    type: 'context-source',
    data: { sourceType: 'web' }
  },
  {
    id: 'recent-changes',
    label: 'Recent Changes',
    icon: 'codicon-diff-multiple',
    type: 'context-source',
    data: { sourceType: 'git-changes' }
  }
]

const isSubmitDisabled = computed(() => {
  return !content.value.trim() || isLoading.value
})

// Progress circle calculations
const circumference = computed(() => {
  const radius = 5.25
  return 2 * Math.PI * radius
})

const strokeOffset = computed(() => {
  const progress = Math.max(0, Math.min(100, props.progressPercentage))
  return circumference.value - (progress / 100) * circumference.value
})

function handleInput(event: Event) {
  const target = event.target as HTMLDivElement
  const textContent = target.textContent || ''

  // 只有在完全没有内容时才清理 div
  if (textContent.length === 0) {
    target.innerHTML = ''
  }

  content.value = textContent
  emit('input', textContent)

  // 自适应高度
  autoResizeTextarea()
}

function autoResizeTextarea() {
  if (!textareaRef.value) return

  nextTick(() => {
    const divElement = textareaRef.value!

    // 重置高度以获取准确的 scrollHeight
    divElement.style.height = '20px'

    // 计算所需高度
    const scrollHeight = divElement.scrollHeight
    const minHeight = 20
    const maxHeight = 240

    if (scrollHeight <= maxHeight) {
      // 内容未超出最大高度，调整高度并隐藏滚动条
      divElement.style.height = Math.max(scrollHeight, minHeight) + 'px'
      divElement.style.overflowY = 'hidden'
    } else {
      // 内容超出最大高度，设置最大高度并显示滚动条
      divElement.style.height = maxHeight + 'px'
      divElement.style.overflowY = 'auto'
    }
  })
}

function handleKeydown(event: KeyboardEvent) {
   // 如果正在输入法组合中（也就是正在拼音输入），则不处理回车键
   if (event.key === "Enter" && !event.shiftKey && !isComposing.value) {
    event.preventDefault();
    handleSubmit();
  }

  // 延迟检查内容是否为空（在按键处理后）
  if (event.key === 'Backspace' || event.key === 'Delete') {
    setTimeout(() => {
      const target = event.target as HTMLDivElement
      const textContent = target.textContent || ''
      if (textContent.length === 0) {
        target.innerHTML = ''
        content.value = ''
      }
    }, 0)
  }
}

function handleCompositionStart() {
  isComposing.value = true;
}

function handleCompositionEnd() {
  isComposing.value = false;
}

function handleSubmit() {
  if (!content.value.trim()) return

  if (props.conversationWorking) {
    // 对话工作中，添加到队列
    emit('queueMessage', content.value)
  } else {
    // 对话未工作，直接发送
    emit('submit', content.value)
  }

  // 清空输入框
  content.value = ''
  if (textareaRef.value) {
    textareaRef.value.textContent = ''
  }
}

function handleStop() {
  emit('stop')
}


function handleImage() {
  emit('image')
}

function handleSearch(query: string) {
  emit('search', query)
}

function handleAddContext() {
  emit('addContext')
}

function handleAgentDropdown() {
  emit('agentDropdown')
}

function handleModelDropdown() {
  emit('modelDropdown')
}


function handleContextOption(item: DropdownItemData, close: () => void) {
  console.log('Selected context option:', item)
  close() // 关闭下拉菜单

  // 根据item.type和item.data执行不同的业务逻辑
  switch (item.type) {
    case 'file':
      console.log('Adding file to context:', item.label, 'Path:', item.data?.path)
      // TODO: 实现添加文件到上下文的逻辑
      break

    case 'context-source':
      console.log('Adding context source:', item.label, 'Source type:', item.data?.sourceType)
      // TODO: 实现添加上下文源的逻辑
      break

    case 'context-category':
      console.log('Opening category:', item.label, 'Category:', item.data?.category)
      // TODO: 实现打开分类子菜单的逻辑
      break

    default:
      console.log('Unknown option type:', item.type, item)
  }
}

// 暴露方法：供父组件设置内容与聚焦
defineExpose({
  /** 设置输入框内容并同步内部状态 */
  setContent(text: string) {
    content.value = text || ''
    if (textareaRef.value) {
      textareaRef.value.textContent = content.value
    }
    autoResizeTextarea()
  },
  /** 聚焦到输入框 */
  focus() {
    nextTick(() => textareaRef.value?.focus())
  }
})

</script>

<style scoped>
/* 使用全局CSS类，只保留必要的样式覆盖 */
.progress-circle {
  width: 14px;
  height: 14px;
  position: relative;
}

.progress-circle svg {
  width: 14px;
  height: 14px;
}

/* 移除输入框聚焦时的边框 */
.aislash-editor-input:focus {
  outline: none !important;
  border: none !important;
}

/* 移除父容器聚焦时的边框 */
.full-input-box:focus-within {
  border-color: var(--vscode-input-border) !important;
  outline: none !important;
}

/* Placeholder 样式 */
.aislash-editor-input:empty::before {
  content: attr(data-placeholder);
  color: var(--vscode-input-placeholderForeground);
  pointer-events: none;
  position: absolute;
}

.aislash-editor-input:focus:empty::before {
  content: attr(data-placeholder);
  color: var(--vscode-input-placeholderForeground);
  pointer-events: none;
}

</style>
