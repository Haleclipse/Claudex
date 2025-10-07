<template>
  <ToolMessageWrapper
    tool-icon="codicon-terminal"
    :tool-result="toolResult"
    :permission-state="permissionState"
    :default-expanded="shouldExpand"
    @allow="$emit('allow')"
    @deny="$emit('deny')"
  >
    <template #main>
      <span class="tool-label">Bash</span>
      <span v-if="description" class="tool-description">{{ description }}</span>
      <span v-if="runInBackground" class="bg-badge">background</span>
    </template>

    <template #expandable>
      <!-- 命令内容 -->
      <div class="bash-command">
        <pre class="command-content">{{ command }}</pre>
      </div>

      <!-- 输出内容 (如果有) -->
      <div v-if="hasOutput" class="bash-output">
        <div class="output-header">Output</div>
        <pre class="output-content">{{ outputContent }}</pre>
      </div>

      <!-- 错误内容 -->
      <ToolError :tool-result="toolResult" />
    </template>
  </ToolMessageWrapper>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ToolMessageWrapper from './common/ToolMessageWrapper.vue';
import ToolError from './common/ToolError.vue';

interface Props {
  toolUse?: any;
  toolResult?: any;
  toolUseResult?: any;
  permissionState?: string;
}

const props = defineProps<Props>();

defineEmits<{
  allow: [];
  deny: [];
}>();

const command = computed(() => {
  return props.toolUse?.input?.command || '';
});

const description = computed(() => {
  return props.toolUse?.input?.description || '';
});

const runInBackground = computed(() => {
  return props.toolUse?.input?.run_in_background || false;
});

const outputContent = computed(() => {
  // 从 toolResult.content 获取输出
  if (typeof props.toolResult?.content === 'string') {
    return props.toolResult.content;
  }
  return '';
});

const hasOutput = computed(() => {
  return outputContent.value && !props.toolResult?.is_error;
});

// 默认展开条件: 有输出或有错误
const shouldExpand = computed(() => {
  return hasOutput.value || !!props.toolResult?.is_error;
});
</script>

<style scoped>
.tool-label {
  font-weight: 500;
  color: var(--vscode-foreground);
  font-size: 0.9em;
}

.tool-description {
  color: color-mix(in srgb, var(--vscode-foreground) 70%, transparent);
  font-size: 0.85em;
  font-style: italic;
}

.bg-badge {
  background-color: color-mix(in srgb, var(--vscode-charts-blue) 20%, transparent);
  color: var(--vscode-charts-blue);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75em;
  font-weight: 500;
}

.bash-command {
  margin-bottom: 8px;
}

.command-content {
  background-color: color-mix(in srgb, var(--vscode-terminal-background, var(--vscode-editor-background)) 80%, transparent);
  border: 1px solid var(--vscode-terminal-border, var(--vscode-panel-border));
  border-radius: 4px;
  padding: 8px 12px;
  color: var(--vscode-terminal-foreground, var(--vscode-editor-foreground));
  font-family: var(--vscode-editor-font-family);
  font-size: 0.9em;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
}

.bash-output {
  margin-top: 8px;
}

.output-header {
  color: color-mix(in srgb, var(--vscode-foreground) 80%, transparent);
  font-size: 0.85em;
  margin-bottom: 4px;
  font-weight: 500;
}

.output-content {
  background-color: color-mix(in srgb, var(--vscode-terminal-background, var(--vscode-editor-background)) 90%, transparent);
  border: 1px solid var(--vscode-terminal-border, var(--vscode-panel-border));
  border-radius: 4px;
  padding: 8px 12px;
  color: var(--vscode-terminal-foreground, var(--vscode-editor-foreground));
  font-family: var(--vscode-editor-font-family);
  font-size: 0.85em;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  max-height: 400px;
  overflow-y: auto;
}
</style>