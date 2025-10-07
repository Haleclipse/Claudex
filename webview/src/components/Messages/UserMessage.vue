<template>
  <div
    :tabindex="tabIndex"
    :data-message-index="messageIndex"
    class="user-message"
    :class="{ 'is-sticky': sticky }"
  >
    <div class="message-wrapper">
      <div
        ref="containerRef"
        class="message-content"
        :class="{ 'editing': isEditing }"
      >
      <!-- 普通显示模式 -->
      <div
        v-if="!isEditing"
        class="message-view"
        role="button"
        tabindex="0"
        @click.stop="startEditing"
        @keydown.enter.prevent="startEditing"
        @keydown.space.prevent="startEditing"
      >
        <div class="message-text">
          <div>{{ message.content }}</div>
          <button class="restore-button" @click.stop="handleRestore" title="Restore checkpoint">
            <span class="codicon codicon-restore"></span>
          </button>
        </div>
      </div>

      <!-- 编辑模式 -->
      <div v-else class="edit-mode">
        <ChatInputBox
          :show-progress="false"
          :selected-model="'claude-4-sonnet'"
          :conversation-working="false"
          ref="chatInputRef"
          @submit="handleSaveEdit"
          @stop="cancelEdit"
        />
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import type { ChatMessage } from '../../../types/messages';
import ChatInputBox from '../ChatInputBox.vue';

interface Props {
  message: ChatMessage;
  messageIndex: number;
  tabIndex: number;
  isEditing: boolean;
  sticky?: boolean;
}

interface Emits {
  (e: 'request-edit'): void;
  (e: 'cancel-edit'): void;
  (e: 'save-edit', content: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  sticky: false
});
const emit = defineEmits<Emits>();

const chatInputRef = ref<InstanceType<typeof ChatInputBox>>();
const editedContent = ref('');
const containerRef = ref<HTMLElement>();

async function startEditing() {
  // 请求开始编辑
  emit('request-edit');

  // 等待DOM更新后设置输入框内容和焦点
  await nextTick();
  if (chatInputRef.value) {
    chatInputRef.value.setContent?.(props.message.content || '');
    chatInputRef.value.focus?.();
  }
}

function cancelEdit() {
  emit('cancel-edit');
  editedContent.value = '';
}

function handleSaveEdit(content?: string) {
  const finalContent = content || editedContent.value || props.message.content;

  if (finalContent.trim() && finalContent !== props.message.content) {
    emit('save-edit', finalContent.trim());
  }

  cancelEdit();
  editedContent.value = '';
}

function handleRestore() {
  // TODO: 实现restore checkpoint逻辑
  console.log('Restore checkpoint clicked - logic to be implemented');
}

// 监听键盘事件
function handleKeydown(event: KeyboardEvent) {
  if (props.isEditing && event.key === 'Escape') {
    event.preventDefault();
    cancelEdit();
  }
}

// 监听点击外部取消编辑
function handleClickOutside(event: MouseEvent) {
  if (!props.isEditing) return;

  const target = event.target as HTMLElement;

  // 检查是否点击了组件内部
  if (containerRef.value?.contains(target)) return;

  // 点击外部，取消编辑
  cancelEdit();
}

// 生命周期管理
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.user-message {
  display: block;
  outline: none;
  padding: 1px 12px 8px;
  background-color: var(--vscode-sideBar-background);
  opacity: 1;
  /* 吸顶时的阴影效果 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-message.is-sticky {
  position: sticky;
  top: 0;
  z-index: 100;
}

.message-wrapper {
  background-color: transparent;
}

/* 消息内容容器 - 负责背景色和圆角 */
.message-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  background-color: color-mix(in srgb, var(--vscode-sideBar-background) 60%, transparent);
  outline: none;
  border: 1px solid var(--vscode-editorWidget-border);
  border-radius: 6px;
  position: relative;
  transition: all 0.2s ease;
}

.message-content.editing {
  z-index: 200;
  border: none;
  background-color: transparent;
}

/* 普通显示模式 */
.message-view {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.message-view .message-text {
  cursor: pointer;
  background-color: color-mix(in srgb, var(--vscode-input-background) 60%, transparent);
  outline: none;
  border-radius: 6px;
  width: 100%;
  padding: 6px 8px;
  box-sizing: border-box;
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.message-text > div:first-child {
  min-width: 0;
  height: min-content;
  max-height: 72px;
  overflow: hidden;
  line-height: 1.5;
  font-family: inherit;
  font-size: 13px;
  color: var(--vscode-input-foreground);
  background-color: transparent;
  outline: none;
  border: none;
  overflow-wrap: break-word;
  word-break: break-word;
  padding: 0;
  user-select: text;
  white-space: pre-wrap;
  flex: 1;
}

/* restore checkpoint按钮 */
.restore-button {
  background: transparent;
  border: none;
  color: var(--vscode-foreground);
  display: flex;
  width: 20px;
  align-items: center;
  justify-content: center;
  line-height: 17px;
  padding: 0 6px;
  height: 26px;
  box-sizing: border-box;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 3px;
  transition: background-color 0.1s ease;
}

.restore-button:hover {
  background-color: color-mix(in srgb, var(--vscode-foreground) 10%, transparent);
}

.restore-button .codicon {
  font-size: 12px;
  color: var(--vscode-foreground);
}

/* 编辑模式 */
.edit-mode {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

/* 编辑模式下的特定样式覆盖 */
.edit-mode :deep(.full-input-box) {
  background: var(--vscode-input-background);
}

.edit-mode :deep(.full-input-box:focus-within) {
  box-shadow: 0 0 8px 2px color-mix(in srgb, var(--vscode-input-background) 30%, transparent);
}
</style>
