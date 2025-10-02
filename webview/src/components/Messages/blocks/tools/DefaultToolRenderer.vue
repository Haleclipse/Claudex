<template>
  <div class="default-tool-renderer">
    <div class="tool-params">
      <div class="params-label">参数:</div>
      
      <!-- 简单参数展示 -->
      <div v-if="hasSimpleParams" class="simple-params">
        <div v-for="(value, key) in simpleParams" :key="key" class="param-item">
          <span class="param-key">{{ key }}:</span>
          <span class="param-value" :class="getValueClass(value)">{{ formatValue(value) }}</span>
        </div>
      </div>
      
      <!-- 复杂参数展示 -->
      <div v-if="hasComplexParams" class="complex-params">
        <details class="complex-details" :open="autoExpand">
          <summary class="details-summary">
            <span class="codicon codicon-chevron-right"></span>
            复杂参数 ({{ complexParamCount }} 项)
          </summary>
          <pre class="complex-content">{{ formattedComplexParams }}</pre>
        </details>
      </div>
      
      <!-- 空参数提示 -->
      <div v-if="!hasSimpleParams && !hasComplexParams" class="empty-params">
        <span class="codicon codicon-info"></span>
        无参数
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  input: any;
  toolName: string;
}

const props = defineProps<Props>();

const simpleParams = computed(() => {
  if (!props.input || typeof props.input !== 'object') {
    return {};
  }
  
  const simple: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(props.input)) {
    if (isSimpleValue(value)) {
      simple[key] = value;
    }
  }
  
  return simple;
});

const complexParams = computed(() => {
  if (!props.input || typeof props.input !== 'object') {
    return {};
  }
  
  const complex: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(props.input)) {
    if (!isSimpleValue(value)) {
      complex[key] = value;
    }
  }
  
  return complex;
});

const hasSimpleParams = computed(() => {
  return Object.keys(simpleParams.value).length > 0;
});

const hasComplexParams = computed(() => {
  return Object.keys(complexParams.value).length > 0;
});

const complexParamCount = computed(() => {
  return Object.keys(complexParams.value).length;
});

const formattedComplexParams = computed(() => {
  return JSON.stringify(complexParams.value, null, 2);
});

const autoExpand = computed(() => {
  // 如果复杂参数较少且内容不长，自动展开
  return complexParamCount.value <= 2 && formattedComplexParams.value.length <= 200;
});

function isSimpleValue(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return typeof value !== 'string' || value.length <= 100;
  }
  return false;
}

function formatValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string') return value;
  return String(value);
}

function getValueClass(value: any): string {
  if (typeof value === 'boolean') return 'value-boolean';
  if (typeof value === 'number') return 'value-number';
  if (typeof value === 'string') {
    if (value.startsWith('/') || value.includes('\\')) return 'value-path';
    if (value.includes('http')) return 'value-url';
  }
  return 'value-string';
}
</script>

<style scoped>
.default-tool-renderer {
  font-family: var(--vscode-editor-font-family);
}

.params-label {
  color: color-mix(in srgb, var(--vscode-foreground) 80%, transparent);
  font-size: 0.9em;
  margin-bottom: 6px;
  font-weight: 500;
}

.simple-params {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  margin-bottom: 8px;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85em;
  padding: 4px 6px;
  background-color: color-mix(in srgb, var(--vscode-editor-background) 50%, transparent);
  border-radius: 3px;
  border: 1px solid var(--vscode-input-border);
}

.param-key {
  color: color-mix(in srgb, var(--vscode-foreground) 70%, transparent);
  font-weight: 500;
  min-width: 0;
  flex-shrink: 0;
}

.param-value {
  color: var(--vscode-foreground);
  font-family: var(--vscode-editor-font-family);
  min-width: 0;
  word-break: break-all;
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

.complex-params {
  margin-top: 8px;
}

.complex-details {
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  overflow: hidden;
}

.details-summary {
  padding: 6px 8px;
  background-color: color-mix(in srgb, var(--vscode-editor-background) 30%, transparent);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85em;
  color: color-mix(in srgb, var(--vscode-foreground) 80%, transparent);
  user-select: none;
}

.details-summary:hover {
  background-color: color-mix(in srgb, var(--vscode-editor-background) 50%, transparent);
}

.details-summary .codicon {
  transition: transform 0.2s ease;
}

.complex-details[open] .details-summary .codicon {
  transform: rotate(90deg);
}

.complex-content {
  background-color: color-mix(in srgb, var(--vscode-editor-background) 80%, transparent);
  border-top: 1px solid var(--vscode-panel-border);
  padding: 8px;
  margin: 0;
  font-family: var(--vscode-editor-font-family);
  /* font-size: var(--vscode-editor-font-size); */
  color: var(--vscode-editor-foreground);
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
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