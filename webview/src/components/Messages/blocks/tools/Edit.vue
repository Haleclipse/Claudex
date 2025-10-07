<template>
  <div class="edit-tool">
    <div class="file-path" v-if="filePath">
      <div class="path-label">文件路径:</div>
      <div class="path-content">
        <span class="codicon codicon-file"></span>
        <span class="path-text">{{ filePath }}</span>
      </div>
    </div>

    <div class="edit-details">
      <div v-if="oldString" class="edit-section">
        <div class="section-label">替换内容:</div>
        <pre class="edit-content old-content">{{ oldString }}</pre>
      </div>

      <div v-if="newString" class="edit-section">
        <div class="section-label">新内容:</div>
        <pre class="edit-content new-content">{{ newString }}</pre>
      </div>

      <div v-if="replaceAll" class="edit-option">
        <span class="codicon codicon-replace-all"></span>
        <span>全部替换</span>
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

const oldString = computed(() => {
  return props.input?.old_string;
});

const newString = computed(() => {
  return props.input?.new_string;
});

const replaceAll = computed(() => {
  return props.input?.replace_all;
});
</script>

<style scoped>
.edit-tool {
  font-family: var(--vscode-editor-font-family);
}

.file-path {
  margin-bottom: 12px;
}

.path-label,
.section-label {
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

.edit-details {
  border-top: 1px solid var(--vscode-panel-border);
  padding-top: 8px;
  margin-top: 8px;
}

.edit-section {
  margin-bottom: 8px;
}

.edit-content {
  background-color: color-mix(in srgb, var(--vscode-editor-background) 80%, transparent);
  border: 1px solid var(--vscode-input-border);
  border-radius: 4px;
  padding: 8px;
  margin: 0;
  font-family: var(--vscode-editor-font-family);
  /* font-size: var(--vscode-editor-font-size); */
  overflow-x: auto;
  white-space: pre-wrap;
}

.old-content {
  border-left: 3px solid var(--vscode-charts-red);
  background-color: color-mix(in srgb, var(--vscode-charts-red) 10%, transparent);
}

.new-content {
  border-left: 3px solid var(--vscode-charts-green);
  background-color: color-mix(in srgb, var(--vscode-charts-green) 10%, transparent);
}

.edit-option {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--vscode-charts-orange);
  font-size: 0.85em;
  font-weight: 500;
  margin-top: 6px;
}
</style>
