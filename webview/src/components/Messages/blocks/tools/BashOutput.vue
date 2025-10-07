<template>
  <ToolMessageWrapper
    tool-icon="codicon-terminal-two"
    :tool-result="toolResult"
    :permission-state="permissionState"
    :default-expanded="shouldExpand"
    @allow="$emit('allow')"
    @deny="$emit('deny')"
  >
    <template #main>
      <span class="tool-label">BashOutput</span>
      <span v-if="bashId" class="bash-id">Shell {{ bashId }}</span>
      <span v-if="status === 'running'" class="status-badge running">
        <span class="codicon codicon-loading codicon-modifier-spin"></span>
        running
      </span>
      <span v-else-if="exitCode !== null && exitCode !== undefined" class="status-badge" :class="exitCode === 0 ? 'success' : 'error'">
        exit {{ exitCode }}
      </span>
      <span v-if="hasFilter" class="filter-badge">
        <span class="codicon codicon-filter"></span>
        filtered
      </span>
    </template>

    <template #expandable>
      <!-- 输出内容 -->
      <div v-if="hasOutput" class="bash-output">
        <pre class="output-content">{{ outputContent }}</pre>
      </div>

      <!-- 无输出提示 -->
      <div v-else-if="!toolResult?.is_error" class="no-output">
        <span class="codicon codicon-info"></span>
        No new output
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

const bashId = computed(() => {
  return props.toolUse?.input?.bash_id || props.toolUseResult?.shellId || '';
});

const filter = computed(() => {
  return props.toolUse?.input?.filter || '';
});

const hasFilter = computed(() => {
  return !!filter.value;
});

const status = computed(() => {
  return props.toolUseResult?.status || '';
});

const command = computed(() => {
  return props.toolUseResult?.command || '';
});

const exitCode = computed(() => {
  return props.toolUseResult?.exitCode;
});

const outputContent = computed(() => {
  // 优先使用 toolUseResult (会话加载时)
  if (props.toolUseResult) {
    const stdout = props.toolUseResult.stdout || '';
    const stderr = props.toolUseResult.stderr || '';

    if (stdout && stderr) {
      return `${stdout}\n\n[stderr]\n${stderr}`;
    }
    if (stdout) {
      return stdout;
    }
    if (stderr) {
      return `[stderr]\n${stderr}`;
    }
  }

  // 实时对话: 从 toolResult.content 获取
  if (typeof props.toolResult?.content === 'string') {
    // 解析 XML 格式的输出
    const content = props.toolResult.content;

    // 提取 stdout
    const stdoutMatch = content.match(/<stdout>([\s\S]*?)<\/stdout>/);
    const stderrMatch = content.match(/<stderr>([\s\S]*?)<\/stderr>/);

    const stdout = stdoutMatch ? stdoutMatch[1].trim() : '';
    const stderr = stderrMatch ? stderrMatch[1].trim() : '';

    if (stdout && stderr) {
      return `${stdout}\n\n[stderr]\n${stderr}`;
    }
    if (stdout) {
      return stdout;
    }
    if (stderr) {
      return `[stderr]\n${stderr}`;
    }

    // 如果没有匹配到,返回原始内容
    return content;
  }

  return '';
});

const hasOutput = computed(() => {
  return !!outputContent.value && !props.toolResult?.is_error;
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

.bash-id {
  color: color-mix(in srgb, var(--vscode-foreground) 70%, transparent);
  font-size: 0.85em;
  font-family: var(--vscode-editor-font-family);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75em;
  font-weight: 500;
}

.status-badge.running {
  background-color: color-mix(in srgb, var(--vscode-charts-blue) 20%, transparent);
  color: var(--vscode-charts-blue);
}

.status-badge.success {
  background-color: color-mix(in srgb, var(--vscode-charts-green) 20%, transparent);
  color: var(--vscode-charts-green);
}

.status-badge.error {
  background-color: color-mix(in srgb, var(--vscode-charts-red) 20%, transparent);
  color: var(--vscode-charts-red);
}

.status-badge .codicon {
  font-size: 10px;
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: color-mix(in srgb, var(--vscode-charts-orange) 20%, transparent);
  color: var(--vscode-charts-orange);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75em;
  font-weight: 500;
}

.filter-badge .codicon {
  font-size: 10px;
}

.bash-output {
  margin-top: 4px;
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

.no-output {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  color: color-mix(in srgb, var(--vscode-foreground) 60%, transparent);
  font-size: 0.85em;
  font-style: italic;
}

.no-output .codicon {
  font-size: 14px;
  opacity: 0.7;
}
</style>
