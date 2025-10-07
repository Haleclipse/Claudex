<template>
  <div
    :tabindex="tabIndex"
    :data-message-index="messageIndex"
    class="system-message"
  >
    <div class="message-wrapper">
      <span class="codicon codicon-info"></span>
      <span v-if="messageType" class="message-type">{{ messageType }}</span>
      <span class="system-content">{{ message.content }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ChatMessage } from '../../../types/messages';
import { isSDKSystemMessage, isSDKCompactBoundaryMessage } from '../../utils/messageUtils';

interface Props {
  message: ChatMessage;
  messageIndex: number;
  tabIndex: number;
}

const props = defineProps<Props>();

const messageType = computed(() => {
  if (!props.message.sdkMessage) {
    return '';
  }

  if (isSDKSystemMessage(props.message.sdkMessage)) {
    return '初始化';
  }

  if (isSDKCompactBoundaryMessage(props.message.sdkMessage)) {
    return '压缩边界';
  }

  return '';
});

</script>

<style scoped>
.system-message {
  display: block;
  outline: none;
  padding: 1px 2px 8px 12px;
  background-color: var(--vscode-sideBar-background);
  opacity: 1;
  position: relative;
}

.message-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: transparent;
  font-size: 0.9em;
}

.message-wrapper .codicon {
  color: var(--vscode-charts-yellow);
  flex-shrink: 0;
}

.message-type {
  background-color: color-mix(in srgb, var(--vscode-charts-yellow) 20%, transparent);
  color: var(--vscode-charts-yellow);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.7em;
  font-weight: 500;
  flex-shrink: 0;
}

.system-content {
  color: color-mix(in srgb, var(--vscode-foreground) 80%, transparent);
  font-style: italic;
  flex: 1;
}
</style>