<template>
  <div class="write-tool">
    <div class="file-path" v-if="filePath">
      <div class="path-label">文件路径:</div>
      <div class="path-content">
        <span class="codicon codicon-file"></span>
        <span class="path-text">{{ filePath }}</span>
      </div>
    </div>

    <div v-if="content" class="write-content">
      <div class="content-label">写入内容:</div>
      <pre class="file-content">{{ content }}</pre>
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

const content = computed(() => {
  return props.input?.content;
});
</script>

<style scoped>
.write-tool {
  font-family: var(--vscode-editor-font-family);
}

.file-path {
  margin-bottom: 12px;
}

.path-label,
.content-label {
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

.file-content {
  background-color: color-mix(in srgb, var(--vscode-editor-background) 80%, transparent);
  border: 1px solid var(--vscode-input-border);
  border-radius: 4px;
  padding: 8px;
  margin: 0;
  font-family: var(--vscode-editor-font-family);
  /* font-size: var(--vscode-editor-font-size); */
  color: var(--vscode-editor-foreground);
  overflow-x: auto;
  white-space: pre-wrap;
  border-left: 3px solid var(--vscode-charts-green);
  max-height: 200px;
  overflow-y: auto;
}
</style>
