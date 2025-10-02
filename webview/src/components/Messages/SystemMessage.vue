<template>
  <div
    :tabindex="tabIndex"
    :data-message-index="messageIndex"
    class="system-message"
  >
    <div class="message-wrapper">
      <div class="message-header">
        <span class="codicon codicon-info"></span>
        <!-- <span class="message-role">系统</span>
        <span class="message-time">{{ formattedTime }}</span> -->
        <span v-if="messageType" class="message-type">{{ messageType }}</span>
      </div>

      <div class="message-content">
        <div class="system-content">{{ message.content }}</div>
      </div>
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
  background-color: transparent;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.9em;
  color: color-mix(in srgb, var(--vscode-foreground) 70%, transparent);
}

.message-header .codicon {
  color: var(--vscode-charts-yellow);
}

.message-role {
  font-weight: 500;
  color: var(--vscode-charts-yellow);
}

.message-time {
  font-size: 0.8em;
}

.message-type {
  background-color: color-mix(in srgb, var(--vscode-charts-yellow) 20%, transparent);
  color: var(--vscode-charts-yellow);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.7em;
  font-weight: 500;
}

.message-content {
  margin-left: 0;
}

.system-content {
  color: color-mix(in srgb, var(--vscode-foreground) 80%, transparent);
  font-style: italic;
  font-size: 0.9em;
}
</style>