<template>
  <ToolMessageWrapper
    tool-icon="codicon-tools"
    :tool-result="toolResult"
    :permission-state="permissionState"
    :default-expanded="shouldExpand"
    @allow="$emit('allow')"
    @deny="$emit('deny')"
  >
    <template #main>
      <span class="tool-label">{{ toolName }}</span>
    </template>

    <template #expandable>
      <!-- 参数列表 -->
      <div v-if="hasParams" class="params-list">
        <div v-for="(value, key) in flatParams" :key="key" class="param-row">
          <span class="param-key">{{ key }}:</span>
          <span class="param-value" :class="getValueClass(value)">{{ formatValue(value) }}</span>
        </div>
      </div>

      <!-- 空参数提示 -->
      <div v-if="!hasParams" class="empty-params">
        <span class="codicon codicon-info"></span>
        无参数
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

// 工具名称
const toolName = computed(() => {
  return props.toolUse?.name || 'Unknown Tool';
});

// 获取输入参数
const input = computed(() => {
  // 优先使用 toolUseResult (会话加载)
  if (props.toolUseResult?.input) {
    return props.toolUseResult.input;
  }

  // 实时对话
  if (props.toolUse?.input) {
    return props.toolUse.input;
  }

  return null;
});

// 扁平化所有参数
const flatParams = computed(() => {
  if (!input.value || typeof input.value !== 'object') {
    return {};
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(input.value)) {
    result[key] = value;
  }

  return result;
});

const hasParams = computed(() => {
  return Object.keys(flatParams.value).length > 0;
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
  if (isPermissionRequest.value && hasParams.value) return true;

  // 有错误时展开
  if (props.toolResult?.is_error) return true;

  return false;
});

function formatValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

function getValueClass(value: any): string {
  if (typeof value === 'boolean') return 'value-boolean';
  if (typeof value === 'number') return 'value-number';
  if (typeof value === 'object') return 'value-object';
  if (typeof value === 'string') {
    if (value.startsWith('/') || value.includes('\\')) return 'value-path';
    if (value.includes('http')) return 'value-url';
  }
  return 'value-string';
}
</script>

<style scoped>
.tool-label {
  font-weight: 500;
  color: var(--vscode-foreground);
  font-size: 0.9em;
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85em;
}

.param-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.param-key {
  color: color-mix(in srgb, var(--vscode-foreground) 70%, transparent);
  font-weight: 500;
  font-family: var(--vscode-editor-font-family);
  flex-shrink: 0;
  min-width: fit-content;
}

.param-value {
  color: var(--vscode-foreground);
  font-family: var(--vscode-editor-font-family);
  flex: 1;
  word-break: break-word;
  white-space: pre-wrap;
}

.value-boolean {
  color: var(--vscode-charts-orange);
  font-weight: 500;
}

.value-number {
  color: var(--vscode-charts-blue);
  font-weight: 500;
}

.value-path {
  color: var(--vscode-charts-green);
  font-style: italic;
}

.value-url {
  color: var(--vscode-charts-purple);
  text-decoration: underline;
}

.value-object {
  color: var(--vscode-foreground);
  opacity: 0.9;
}

.empty-params {
  display: flex;
  align-items: center;
  gap: 6px;
  color: color-mix(in srgb, var(--vscode-foreground) 60%, transparent);
  font-style: italic;
  font-size: 0.85em;
  padding: 8px;
  background-color: color-mix(in srgb, var(--vscode-editor-background) 30%, transparent);
  border-radius: 4px;
  border: 1px dashed var(--vscode-panel-border);
}
</style>