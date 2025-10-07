<template>
  <div
    :tabindex="tabIndex"
    :data-message-index="messageIndex"
    class="assistant-message"
  >
    <div class="message-wrapper">
      <div class="message-header">
        <!-- <span class="role-label">Claude</span> -->
      </div>

      <div class="message-content">
        <!-- 只渲染 text 类型的内容块 -->
        <template v-for="(block, index) in textBlocks" :key="index">
          <TextBlock
            :block="block"
            :streaming="streaming && isLastBlock(index)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TextBlock from './blocks/TextBlock.vue';
import { setToolUse } from '../../stores/toolMessageStore';
import type { ChatMessage } from '../../../types/messages';

interface Props {
  message: ChatMessage;
  messageIndex: number;
  tabIndex: number;
  streaming?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  streaming: false
});

// 只获取文本内容块，tool_use 块由 messageBus 处理成独立的 ToolMessage
const textBlocks = computed(() => {
  if (props.message.contentBlocks && props.message.contentBlocks.length > 0) {
    // 处理 tool_use 块，确保存储到状态管理
    props.message.contentBlocks.forEach(block => {
      if (block.type === 'tool_use' && block.id && block.name && block.input) {
        setToolUse({
          id: block.id,
          name: block.name,
          input: block.input
        });
      }
    });

    // 只返回 text 类型的内容块
    return props.message.contentBlocks.filter(block => block.type === 'text');
  }

  return [];
});

// 检查是否为最后一个内容块（用于流式显示）
function isLastBlock(index: number): boolean {
  return index === textBlocks.value.length - 1;
}
</script>

<style scoped>
.assistant-message {
  display: block;
  outline: none;
  padding: 0px 16px 0.4rem;
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
}

.role-label {
  font-weight: 500;
  color: var(--vscode-foreground);
}

.streaming-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--vscode-charts-blue);
  font-size: 0.8em;
}

.message-content {
  padding: 0px 2px;
}

.markdown-root {
  user-select: text;
  font-size: 1em;
  line-height: 1.5;
  color: var(--vscode-foreground);
}

/* Markdown 样式 */
:deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
  color: var(--vscode-foreground);
  margin: 16px 0 8px 0;
  font-weight: 600;
}

:deep(p) {
  margin: 8px 0;
  line-height: 1.6;
}

:deep(ul), :deep(ol) {
  margin: 0px 0px 0px 16px;
  padding: 0px;
}

:deep(li) {
  padding-top: 2px;
  padding-bottom: 2px;
  list-style-type: disc;
}

:deep(pre) {
  background-color: color-mix(in srgb, var(--vscode-editor-background) 50%, transparent);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  padding: 12px;
  margin: 8px 0;
  overflow-x: auto;
}

:deep(code) {
  font-family: "Hack Nerd Font Mono", "SF Mono", Consolas, "Courier New", monospace;
  word-break: break-all;
  cursor: default;
  color: inherit;
}

:deep(pre code) {
  background: none;
  border: none;
  padding: 0;
}

:deep(:not(pre) > code) {
  background-color: color-mix(in srgb, var(--vscode-editor-background) 50%, transparent);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 3px;
  padding: 2px 4px;
  font-size: 0.9em;
}

:deep(blockquote) {
  border-left: 4px solid var(--vscode-textBlockQuote-border);
  background-color: var(--vscode-textBlockQuote-background);
  margin: 8px 0;
  padding: 8px 16px;
}

:deep(a) {
  color: var(--vscode-textLink-foreground);
  text-decoration: none;
}

:deep(a:hover) {
  color: var(--vscode-textLink-activeForeground);
  text-decoration: underline;
}

:deep(table) {
  border-collapse: collapse;
  margin: 16px 0;
  width: 100%;
}

:deep(th), :deep(td) {
  border: 1px solid var(--vscode-panel-border);
  padding: 8px 12px;
  text-align: left;
}

:deep(th) {
  background-color: color-mix(in srgb, var(--vscode-editor-background) 30%, transparent);
  font-weight: 600;
}

.streaming-cursor {
  color: var(--vscode-textPreformat-foreground);
  animation: blink 1s infinite;
  margin-left: 1px;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>