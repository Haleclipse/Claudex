<template>
  <div class="glob-tool">
    <div class="glob-pattern" v-if="pattern">
      <div class="pattern-label">匹配模式:</div>
      <div class="pattern-content">
        <span class="codicon codicon-search"></span>
        <code class="pattern-text">{{ pattern }}</code>
      </div>
    </div>

    <div v-if="globPath" class="glob-path">
      <span class="path-key">搜索路径:</span>
      <span class="path-value">{{ globPath }}</span>
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

const pattern = computed(() => {
  return props.input?.pattern;
});

const globPath = computed(() => {
  return props.input?.path;
});
</script>

<style scoped>
.glob-tool {
  font-family: var(--vscode-editor-font-family);
}

.pattern-label {
  color: color-mix(in srgb, var(--vscode-foreground) 80%, transparent);
  font-size: 0.9em;
  margin-bottom: 4px;
  font-weight: 500;
}

.pattern-content {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: color-mix(in srgb, var(--vscode-editor-background) 60%, transparent);
  border: 1px solid var(--vscode-input-border);
  border-radius: 4px;
  padding: 6px 8px;
  border-left: 3px solid var(--vscode-charts-orange);
  margin-bottom: 12px;
}

.pattern-text {
  font-family: var(--vscode-editor-font-family);
  color: var(--vscode-charts-orange);
  background-color: transparent;
  font-weight: 500;
}

.glob-path {
  margin-top: 6px;
  font-size: 0.85em;
}

.path-key {
  color: color-mix(in srgb, var(--vscode-foreground) 70%, transparent);
  font-weight: 500;
}

.path-value {
  color: var(--vscode-foreground);
  font-family: var(--vscode-editor-font-family);
  margin-left: 4px;
}
</style>
