<template>
  <div class="file-tool-renderer">
    <div class="file-path" v-if="filePath">
      <div class="path-label">文件路径:</div>
      <div class="path-content">
        <span class="codicon codicon-file"></span>
        <span class="path-text">{{ filePath }}</span>
      </div>
    </div>
    
    <div v-if="isEditTool" class="edit-details">
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
    
    <div v-if="isWriteTool && content" class="write-content">
      <div class="content-label">写入内容:</div>
      <pre class="file-content">{{ content }}</pre>
    </div>
    
    <div v-if="isReadTool && hasReadOptions" class="read-options">
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
    
    <div v-if="isGlobTool" class="glob-pattern">
      <div class="pattern-label">匹配模式:</div>
      <div class="pattern-content">
        <span class="codicon codicon-search"></span>
        <code class="pattern-text">{{ pattern }}</code>
      </div>
      <div v-if="globPath" class="glob-path">
        <span class="path-key">搜索路径:</span>
        <span class="path-value">{{ globPath }}</span>
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

const isEditTool = computed(() => {
  return ['edit', 'multiedit'].includes(props.toolName.toLowerCase());
});

const isWriteTool = computed(() => {
  return props.toolName.toLowerCase() === 'write';
});

const isReadTool = computed(() => {
  return props.toolName.toLowerCase() === 'read';
});

const isGlobTool = computed(() => {
  return props.toolName.toLowerCase() === 'glob';
});

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

const content = computed(() => {
  return props.input?.content;
});

const offset = computed(() => {
  return props.input?.offset;
});

const limit = computed(() => {
  return props.input?.limit;
});

const pattern = computed(() => {
  return props.input?.pattern;
});

const globPath = computed(() => {
  return props.input?.path;
});

const hasReadOptions = computed(() => {
  return offset.value || limit.value;
});
</script>

<style scoped>
.file-tool-renderer {
  font-family: var(--vscode-editor-font-family);
}

.file-path {
  margin-bottom: 12px;
}

.path-label,
.section-label,
.content-label,
.options-label,
.pattern-label {
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

.pattern-content {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: color-mix(in srgb, var(--vscode-editor-background) 60%, transparent);
  border: 1px solid var(--vscode-input-border);
  border-radius: 4px;
  padding: 6px 8px;
  border-left: 3px solid var(--vscode-charts-orange);
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