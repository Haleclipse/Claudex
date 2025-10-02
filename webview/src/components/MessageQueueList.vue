<template>
  <div v-if="visible && queuedMessages.length > 0" class="message-queue-section">
    <!-- Message Queue 头部 -->
    <div
      style="display: flex; justify-content: space-between; align-items: center; height: 24px; cursor: pointer;"
      @click="toggleExpanded"
    >
      <div style="display: flex; align-items: center; gap: 4px; flex-grow: 1; padding-left: 4px;">
        <span
          class="codicon"
          :class="expanded ? 'codicon-chevron-down' : 'codicon-chevron-right'"
          style="color: var(--vscode-foreground); opacity: 0.6; font-size: 12px;"
        />
        <div style="font-size: 12px; color: var(--vscode-input-placeholderForeground); opacity: 0.8;">
          <span>{{ queuedMessages.length }} Queued</span>
        </div>
      </div>
    </div>

    <!-- Queue列表 (当展开时) -->
    <div
      v-if="expanded"
      class="queue-item-list"
      style="padding: 4px 0;"
    >
      <div
        v-for="message in queuedMessages"
        :key="message.id"
        class="queue-item"
      >
        <!-- 队列指示器 -->
        <div
          class="queue-item-indicator"
          style="opacity: 0.4; border: 1px solid var(--vscode-foreground);"
        ></div>

        <!-- 消息内容 -->
        <div style="display: flex; flex-direction: column;">
          <div style="max-height: 56px; mask-image: none;">
            <div
              class="aislash-editor-input-readonly"
              contenteditable="false"
              :title="message.content"
            >
              <p><span>{{ message.content }}</span></p>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="queue-item-actions">
          <!-- 删除按钮 -->
          <div
            class="anysphere-icon-button"
            @click="$emit('remove', message.id)"
            title="Remove from queue"
          >
            <span class="codicon codicon-trashcan !text-[12px]"></span>
          </div>
          <!-- 立即发送按钮 -->
          <div
            class="anysphere-icon-button"
            @click="$emit('sendNow', message.id)"
            title="Send immediately (interrupt current conversation)"
          >
            <span class="codicon codicon-arrow-up-two !text-[12px]"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { QueuedMessage } from '../../types/queue'

interface Props {
  queuedMessages?: QueuedMessage[]
  visible?: boolean
  initialExpanded?: boolean
}

interface Emits {
  (e: 'remove', messageId: string): void
  (e: 'sendNow', messageId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  queuedMessages: () => [],
  visible: false,
  initialExpanded: true
})

defineEmits<Emits>()

const expanded = ref(props.initialExpanded)

function toggleExpanded() {
  expanded.value = !expanded.value
}
</script>

<style scoped>

.queue-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 8px 3px 6px;
  border-radius: 4px;
  transition: background-color 0.1s ease;
  cursor: pointer;
}

.queue-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.queue-item-indicator {
  border-radius: 50%;
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  transition: opacity 0.1s;
  color: var(--vscode-foreground);
}

.aislash-editor-input-readonly {
  resize: none;
  grid-area: 1 / 1 / 1 / 1;
  overflow: hidden;
  line-height: 1.5;
  font-family: inherit;
  font-size: 13px;
  color: var(--vscode-input-foreground);
  background-color: transparent;
  display: block;
  outline: none;
  scrollbar-width: none;
  box-sizing: border-box;
  border: none;
  overflow-wrap: break-word;
  word-break: break-word;
  padding: 0px;
  user-select: text;
  white-space: pre-wrap;
}

.aislash-editor-input-readonly p {
  margin: 0;
}

.queue-item-actions {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.anysphere-icon-button {
  background: transparent;
  border: none;
  color: var(--vscode-foreground, var(--vscode-foreground));
  display: flex;
  width: 12px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 2px;
  transition: background-color 0.2s;
  opacity: 0.6;
}

.anysphere-icon-button:hover {
  background: var(--vscode-toolbar-hoverBackground);
  opacity: 1;
}

.anysphere-icon-button span {
  font-size: 12px !important;
}
</style>