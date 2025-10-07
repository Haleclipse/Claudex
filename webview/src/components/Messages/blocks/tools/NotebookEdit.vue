<template>
  <ToolMessageWrapper
    tool-icon="codicon-notebook"
    :tool-result="toolResult"
    :permission-state="permissionState"
    :default-expanded="shouldExpand"
    @allow="$emit('allow')"
    @deny="$emit('deny')"
  >
    <template #main>
      <span class="tool-label">NotebookEdit</span>
      <ToolFilePath v-if="notebookPath" :file-path="notebookPath" />
      <span v-if="editMode" class="mode-badge" :class="`mode-${editMode}`">{{ editMode }}</span>
    </template>

    <template #expandable>
      <!-- Cell ID -->
      <div v-if="cellId" class="info-row">
        <span class="info-label">cell_id:</span>
        <span class="info-value">{{ cellId }}</span>
      </div>

      <!-- New Source Content -->
      <div v-if="newSource" class="source-section">
        <div class="section-label">new_source</div>
        <pre class="source-content">{{ newSource }}</pre>
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
import ToolFilePath from './common/ToolFilePath.vue';

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

// Notebook路径
const notebookPath = computed(() => {
  return props.toolUse?.input?.notebook_path || props.toolUseResult?.notebook_path;
});

// Cell ID
const cellId = computed(() => {
  return props.toolUse?.input?.cell_id || props.toolUseResult?.cell_id;
});

// Edit Mode
const editMode = computed(() => {
  return props.toolUse?.input?.edit_mode || props.toolUseResult?.edit_mode;
});

// New Source
const newSource = computed(() => {
  return props.toolUse?.input?.new_source || props.toolUseResult?.new_source;
});

// 判断是否为权限请求阶段
const isPermissionRequest = computed(() => {
  const hasToolUseResult = !!props.toolUseResult;
  const hasToolResult = !!props.toolResult && !props.toolResult.is_error;
  return !hasToolUseResult && !hasToolResult;
});

// 权限请求阶段默认展开,执行完成后不展开
const shouldExpand = computed(() => {
  // 权限请求阶段展开
  if (isPermissionRequest.value) return true;

  // 有错误时展开
  if (props.toolResult?.is_error) return true;

  return false;
});
</script>

<style scoped>
.tool-label {
  font-weight: 500;
  color: var(--vscode-foreground);
  font-size: 0.9em;
}

.mode-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75em;
  font-weight: 600;
  font-family: var(--vscode-editor-font-family);
}

.mode-replace {
  background-color: color-mix(in srgb, var(--vscode-charts-orange) 20%, transparent);
  color: var(--vscode-charts-orange);
}

.mode-insert {
  background-color: color-mix(in srgb, var(--vscode-charts-green) 20%, transparent);
  color: var(--vscode-charts-green);
}

.mode-delete {
  background-color: color-mix(in srgb, var(--vscode-charts-red) 20%, transparent);
  color: var(--vscode-charts-red);
}

.info-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 0.85em;
  margin-bottom: 6px;
}

.info-label {
  color: color-mix(in srgb, var(--vscode-foreground) 70%, transparent);
  font-weight: 500;
  font-family: var(--vscode-editor-font-family);
  flex-shrink: 0;
}

.info-value {
  color: var(--vscode-foreground);
  font-family: var(--vscode-editor-font-family);
  flex: 1;
  word-break: break-word;
}

.source-section {
  margin-top: 8px;
}

.section-label {
  font-size: 0.85em;
  font-weight: 600;
  color: color-mix(in srgb, var(--vscode-foreground) 80%, transparent);
  margin-bottom: 6px;
}

.source-content {
  background-color: color-mix(in srgb, var(--vscode-editor-background) 80%, transparent);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  padding: 8px;
  margin: 0;
  font-family: var(--vscode-editor-font-family);
  color: var(--vscode-editor-foreground);
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
  font-size: 0.85em;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
