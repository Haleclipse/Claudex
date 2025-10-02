<template>
  <div class="messages-container">
    <div v-for="(message, index) in messages" :key="message.id || index" class="message-item">
      <!-- 用户消息 -->
      <UserMessage
        v-if="message.role === 'user'"
        :message="message"
        :message-index="index"
        :tab-index="index"
        :is-editing="editingIndex === index"
        @request-edit="handleRequestEdit(index)"
        @cancel-edit="handleCancelEdit"
        @save-edit="handleSaveEdit(index, $event)"
      />
      
      <!-- 工具消息 -->
      <ToolMessage
        v-else-if="message.role === 'assistant' && message.type === 'tool_use'"
        :tool-use-id="getToolUseId(message)"
        :message-index="index"
        :tab-index="index"
      />
      
      <!-- 助手消息 -->
      <AssistantMessage
        v-else-if="message.role === 'assistant'"
        :message="message"
        :message-index="index"
        :tab-index="index"
        :streaming="message.streaming"
      />

      <!-- 错误消息 -->
      <ErrorMessage
        v-else-if="message.role === 'error'"
        :message="message"
        :message-index="index"
        :tab-index="index"
      />
      
      <!-- 系统消息 -->
      <SystemMessage
        v-else-if="message.role === 'system'"
        :message="message"
        :message-index="index"
        :tab-index="index"
      />
      
      <!-- 未知类型消息：原样输出 -->
      <div 
        v-else
        :tabindex="index"
        :data-message-index="index"
        class="raw-message"
      >
        <div class="message-header">
          <span class="codicon codicon-question"></span>
          <span class="message-role">未知消息类型</span>
        </div>
        <pre>{{ JSON.stringify(message, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserMessage from './UserMessage.vue';
import AssistantMessage from './AssistantMessage.vue';
import SystemMessage from './SystemMessage.vue';
import ErrorMessage from './ErrorMessage.vue';
import ToolMessage from './ToolMessage.vue';
import type { ChatMessage } from '../../../types/messages';

const props = defineProps<{
  messages: ChatMessage[];
}>();

interface Emits {
  (e: 'saveEditMessage', index: number, content: string): void;
}

const emit = defineEmits<Emits>();

// 当前正在编辑的消息索引（用于控制单例编辑）
const editingIndex = ref<number | null>(null);

// 从工具消息中提取 tool_use_id
function getToolUseId(message: ChatMessage): string {
  if (message.contentBlocks && message.contentBlocks.length > 0) {
    for (const block of message.contentBlocks) {
      if (block.type === 'tool_use' && block.id) {
        return block.id;
      }
    }
  }
  // 如果找不到，返回消息ID作为备用
  return message.id;
}

// 处理编辑请求：更新正在编辑的索引
function handleRequestEdit(requestIndex: number) {
  editingIndex.value = requestIndex;
}

// 取消编辑
function handleCancelEdit() {
  editingIndex.value = null;
}

// 保存编辑
function handleSaveEdit(index: number, content: string) {
  emit('saveEditMessage', index, content);
  editingIndex.value = null;
}
</script>

<style scoped>
.messages-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
}

.message-item {
  width: 100%;
}

.raw-message {
  display: block;
  outline: none;
  padding: 0px 16px 0.4rem;
  background-color: var(--vscode-sideBar-background);
  opacity: 1;
  z-index: 100;
}

.raw-message .message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.9em;
  color: color-mix(in srgb, var(--vscode-foreground) 70%, transparent);
}

.raw-message .codicon {
  color: var(--vscode-charts-orange);
}

.raw-message .message-role {
  font-weight: 500;
  color: var(--vscode-charts-orange);
}

.raw-message pre {
  background-color: color-mix(in srgb, var(--vscode-editor-background) 50%, transparent);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  padding: 12px;
  margin: 8px 0;
  overflow-x: auto;
  font-family: var(--vscode-editor-font-family);
  /* font-size: var(--vscode-editor-font-size); */
  color: var(--vscode-textPreformat-foreground);
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
