<template>
  <div
    :tabindex="tabIndex"
    :data-message-index="messageIndex"
    class="error-message"
  >
    <div class="message-wrapper">
      <span class="codicon codicon-error"></span>
      <span class="error-text">{{ message.content }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '../../../types/messages';

interface Props {
  message: ChatMessage;
  messageIndex: number;
  tabIndex: number;
}

defineProps<Props>();
</script>

<style scoped>
.error-message {
  display: block;
  outline: none;
  padding: 1px 12px 8px;
  background-color: var(--vscode-sideBar-background);
  opacity: 1;
  position: relative;
}

.message-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: color-mix(in srgb, var(--vscode-charts-red) 10%, transparent);
  border-left: 3px solid var(--vscode-charts-red);
  color: var(--vscode-charts-red);
  font-size: 0.9em;
}

.codicon {
  color: var(--vscode-charts-red);
  flex-shrink: 0;
}

.error-text {
  font-weight: 500;
}
</style>