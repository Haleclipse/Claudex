<template>
  <div class="read-tool">
    <div class="file-path" v-if="filePath">
      <div class="path-label">文件路径:</div>
      <div class="path-content">
        <span class="codicon codicon-file"></span>
        <span class="path-text">{{ filePath }}</span>
      </div>
    </div>

    <div v-if="hasReadOptions" class="read-options">
      <div class="options-label">读取选项:</div>
      <div class="options-grid">
        <div v-if="offset" class="option-item">
          <span class="option-key">起始行:</span>
          <span class="option-value">{{ offset }}</span>
        </div>
        <div v-if="limit" class="option-item">
          <span class="option-key">限制行数:</span>
          <span class="option-value">{{ limit }}</span>
        </div>
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

const filePath = computed(() => {
  return props.input?.file_path || props.input?.notebook_path;
});

const offset = computed(() => {
  return props.input?.offset;
});

const limit = computed(() => {
  return props.input?.limit;
});

const hasReadOptions = computed(() => {
  return offset.value || limit.value;
});
</script>

<style scoped>
.read-tool {
  font-family: var(--vscode-editor-font-family);
}

.file-path {
  margin-bottom: 12px;
}

.path-label,
.options-label {
  color: color-mix(in srgb, var(--vscode-foreground) 80%, transparent);
  font-size: 0.9em;
  margin-bottom: 4px;
  font-weight: 500;
}

.path-content {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: color-mix(in srgb, var(--vscode-editor-background) 60%, transparent);
  border: 1px solid var(--vscode-input-border);
  border-radius: 4px;
  padding: 6px 8px;
  border-left: 3px solid var(--vscode-charts-blue);
}

.path-text {
  font-family: var(--vscode-editor-font-family);
  color: var(--vscode-foreground);
  word-break: break-all;
}

.read-options {
  border-top: 1px solid var(--vscode-panel-border);
  padding-top: 8px;
  margin-top: 8px;
}

.options-grid {
  display: flex;
  gap: 16px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85em;
}

.option-key {
  color: color-mix(in srgb, var(--vscode-foreground) 70%, transparent);
  font-weight: 500;
}

.option-value {
  color: var(--vscode-foreground);
  font-family: var(--vscode-editor-font-family);
}
</style>
