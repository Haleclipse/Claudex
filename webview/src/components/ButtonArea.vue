<template>
  <div class="button-area-container">
    <div class="button-row">
      <!-- Left Section: Dropdowns -->
      <div class="controls-section">
        <!-- Agent Dropdown -->
        <DropdownTrigger
          align="left"
          :close-on-click-outside="true"
          :show-search="true"
          search-placeholder="⌘. to switch modes"
          @open="handleAgentDropdown"
        >
          <template #trigger>
            <div
              class="agent-dropdown"

            >
              <div class="dropdown-content">
                <div class="codicon codicon-infinity dropdown-icon !text-[14px]" />
                <div class="dropdown-text">
                  <span class="dropdown-label">Agent</span>
                  <span class="dropdown-shortcut">⌘I</span>
                </div>
              </div>
              <div class="codicon codicon-chevron-up chevron-icon !text-[12px]" />
            </div>
          </template>

          <template #content="{ close }">
            <DropdownItem
              :item="{
                id: 'agent',
                label: 'Agent',
                icon: 'codicon-infinity',
                checked: true,
                type: 'agent-mode'
              }"
              :index="0"
              @click="(item) => handleAgentModeSelect(item, close)"
            />
            <DropdownItem
              :item="{
                id: 'ask',
                label: 'Ask',
                icon: 'codicon-comment-discussion',
                type: 'chat-mode'
              }"
              :index="1"
              @click="(item) => handleAgentModeSelect(item, close)"
            />
            <DropdownSeparator />
            <DropdownItem
              :item="{
                id: 'add-custom-mode',
                label: 'Add custom mode',
                rightIcon: 'codicon-chevron-right',
                type: 'action'
              }"
              :index="2"
              @click="(item) => handleAgentModeSelect(item, close)"
            />
          </template>
        </DropdownTrigger>

        <!-- Model Dropdown -->
        <DropdownTrigger
          align="center"
          :close-on-click-outside="true"
          :show-search="true"
          search-placeholder="⌘/ to switch models"
          @open="handleModelDropdown"
        >
          <template #trigger>
            <div
              class="model-dropdown"
            >
              <div class="dropdown-content">
                <div class="dropdown-text">
                  <span class="dropdown-label">{{ selectedModelLocal }}</span>
                </div>
              </div>
              <div class="codicon codicon-chevron-up chevron-icon !text-[12px]" />
            </div>
          </template>

          <template #content="{ close }">
            <DropdownItem
              :item="{
                id: 'claude-4-sonnet',
                label: 'claude-4-sonnet',
                checked: selectedModelLocal === 'claude-4-sonnet',
                type: 'model'
              }"
              :is-selected="selectedModelLocal === 'claude-4-sonnet'"
              :index="0"
              @click="(item) => handleModelSelect(item, close)"
            />
            <DropdownItem
              :item="{
                id: 'claude-4.1-opus',
                label: 'claude-4.1-opus',
                checked: selectedModelLocal === 'claude-4.1-opus',
                type: 'model'
              }"
              :is-selected="selectedModelLocal === 'claude-4.1-opus'"
              :index="1"
              @click="(item) => handleModelSelect(item, close)"
            />
            <DropdownSeparator />
            <DropdownItem
              :item="{
                id: 'add-custom-model',
                label: 'Add custom model',
                rightIcon: 'codicon-chevron-right',
                type: 'action'
              }"
              :index="2"
              @click="(item) => handleModelSelect(item, close)"
            />
          </template>
        </DropdownTrigger>
      </div>

      <!-- Right Section: Action Buttons -->
      <div class="actions-section">
        <!-- Image Button -->
        <button
          class="action-button"
          @click="handleImageClick"
          aria-label="Upload Image"
        >
          <span class="codicon codicon-image-two !text-[12px]" />
          <input
            ref="imageInputRef"
            type="file"
            accept="image/*"
            multiple
            style="display: none;"
            @change="handleImageUpload"
          >
        </button>

        <!-- Submit Button -->
        <button
          class="submit-button"
          @click="handleSubmit"
          :disabled="submitVariant === 'disabled'"
          :data-variant="submitVariant"
          :aria-label="submitVariant === 'stop' ? 'Stop Conversation' : 'Send Message'"
        >
          <span
            v-if="submitVariant === 'stop'"
            class="codicon codicon-debug-stop !text-[12px] bg-[var(--vscode-editor-background)] scale-[0.6] rounded-[1px]"
          />
          <span
            v-else
            class="codicon codicon-arrow-up-two !text-[12px]"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DropdownTrigger, DropdownItem, DropdownSeparator, type DropdownItemData } from './Dropdown'

interface Props {
  disabled?: boolean
  loading?: boolean
  selectedModel?: string
  conversationWorking?: boolean
  hasInputContent?: boolean
}

interface Emits {
  (e: 'submit'): void
  (e: 'stop'): void
  (e: 'attach'): void
  (e: 'image', files: FileList): void
  (e: 'agentDropdown'): void
  (e: 'modelDropdown'): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  loading: false,
  selectedModel: 'claude-4-sonnet',
  conversationWorking: false,
  hasInputContent: false
})

const selectedModelLocal = ref(props.selectedModel)

const emit = defineEmits<Emits>()

const imageInputRef = ref<HTMLInputElement>()

const submitVariant = computed(() => {
  // 对话工作中且无输入内容 -> 停止按钮
  if (props.conversationWorking && !props.hasInputContent) {
    return 'stop'
  }

  // 对话未工作且无输入内容 -> 禁用
  if (!props.conversationWorking && !props.hasInputContent) {
    return 'disabled'
  }

  // 有输入内容或其他情况 -> 启用发送
  return 'enabled'
})

function handleSubmit() {
  if (submitVariant.value === 'stop') {
    emit('stop')
  } else if (submitVariant.value === 'enabled') {
    emit('submit')
  }
}

function handleImageClick() {
  imageInputRef.value?.click()
}

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    emit('image', target.files)
  }
}

function handleAgentDropdown() {
  emit('agentDropdown')
}

function handleAgentModeSelect(item: DropdownItemData, close: () => void) {
  console.log('Selected agent mode:', item)
  close()

  // 根据选中的模式执行不同的逻辑
  switch (item.id) {
    case 'agent':
      console.log('Switching to Agent mode')
      break
    case 'ask':
      console.log('Switching to Ask mode')
      break
    case 'add-custom-mode':
      console.log('Opening custom mode dialog')
      break
  }
}

function handleModelDropdown() {
  emit('modelDropdown')
}

function handleModelSelect(item: DropdownItemData, close: () => void) {
  console.log('Selected model:', item)
  selectedModelLocal.value = item.id
  close()

  // 可以在这里添加模型切换的业务逻辑
  switch (item.id) {
    case 'claude-4-sonnet':
      console.log('Switching to Claude 4 Sonnet')
      break
    case 'claude-4.1-opus':
      console.log('Switching to Claude 4.1 Opus')
      break
  }
}
</script>

<style scoped>
.button-area-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
  flex-shrink: 0;
  cursor: auto;
  width: 100%;
}

.button-row {
  display: grid;
  grid-template-columns: 4fr 1fr;
  align-items: center;
  height: 28px;
  padding-right: 2px;
  box-sizing: border-box;
  flex: 1 1 0%;
  justify-content: space-between;
  width: 100%;
}

.controls-section {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 6px;
  flex-shrink: 1;
  flex-grow: 0;
  min-width: 0;
  height: 20px;
  max-width: 100%;
}

/* Agent 按钮 - 匹配参考样式 */
.agent-dropdown {
  display: flex;
  gap: 4px;
  font-size: 12px;
  align-items: center;
  line-height: 24px;
  min-width: 0;
  max-width: 100%;
  padding: 2px 4px 2px 6px;
  border-radius: 24px;
  flex-shrink: 0;
  cursor: pointer;
  border: none;
  background: color-mix(in srgb, var(--vscode-foreground) 20%, transparent);
  transition: background-color 0.2s ease;
  opacity: .8;
}

.agent-dropdown:hover {
  opacity: 1;
}

/* Model 按钮 - 简洁透明样式 */
.model-dropdown {
  display: flex;
  gap: 4px;
  font-size: 12px;
  align-items: center;
  line-height: 24px;
  min-width: 0;
  max-width: 100%;
  padding: 2.5px 6px;
  border-radius: 23px;
  flex-shrink: 1;
  cursor: pointer;
  border: none;
  background: transparent;
  overflow: hidden;
  transition: background-color 0.2s ease;
}

.model-dropdown:hover {
  background-color: var(--vscode-inputOption-hoverBackground);
}

.dropdown-content {
  display: flex;
  align-items: center;
  gap: 3px;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.dropdown-icon {
  font-size: 14px;
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  display: flex !important;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
}

.dropdown-text {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 12px;
  display: flex;
  align-items: baseline;
  gap: 3px;
  height: 13px;
  font-weight: 400;
}

.dropdown-label {
  opacity: 0.8;
  max-width: 120px;
  overflow: hidden;
  height: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.dropdown-shortcut {
  opacity: 0.5;
  font-size: 0.8em;
  font-feature-settings: "cv05";
}

.chevron-icon {
  font-size: 9px;
  flex-shrink: 0;
  opacity: 0.5;
  color: var(--vscode-foreground);
}

.actions-section {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
}

.action-button,
.submit-button {
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease;
  color: var(--vscode-foreground);
  position: relative;
}


.action-button:hover:not(:disabled) {
  background-color: var(--vscode-inputOption-hoverBackground);
  opacity: 1;
}

.action-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.submit-button {
  scale: 1.1;
}

.submit-button[data-variant="enabled"] {
  background-color: color-mix(in srgb, var(--vscode-editor-foreground) 80%, transparent);
  color: var(--vscode-editor-background);
  opacity: 1;
  outline: 1.5px solid color-mix(in srgb, var(--vscode-editor-foreground) 60%, transparent);
  outline-offset: 1px;
}

.submit-button[data-variant="disabled"] {
  background-color: color-mix(in srgb, var(--vscode-editor-foreground) 80%, transparent);
  color: var(--vscode-editor-background);
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-button[data-variant="stop"] {
  background-color: color-mix(in srgb, var(--vscode-editor-foreground) 80%, transparent);
  color: var(--vscode-editor-background);
  opacity: 1;
  outline: 1.5px solid color-mix(in srgb, var(--vscode-editor-foreground) 60%, transparent);
  outline-offset: 1px;
}


.codicon-modifier-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
