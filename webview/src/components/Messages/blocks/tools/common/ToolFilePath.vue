<template>
  <button
    class="tool-filepath"
    role="button"
    tabindex="0"
    @click="handleClick"
    :title="fullPath"
  >
    <span class="filepath-name">{{ fileName }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import path from 'path-browserify-esm';

interface Props {
  filePath: string;
}

const props = defineProps<Props>();

const fileName = computed(() => {
  if (!props.filePath) return '';
  return path.basename(props.filePath);
});

const fullPath = computed(() => {
  return props.filePath;
});

function handleClick() {
  // 复制路径到剪贴板
  // navigator.clipboard.writeText(props.filePath).catch(err => {
  //   console.error('复制路径失败:', err);
  // });
}

function handleOpenFile() {
  // TODO: 发送消息给 Extension 打开文件
  console.log('打开文件:', props.filePath);
}
</script>

<style scoped>
.tool-filepath {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 0px 4px;
  border-radius: 4px;
  cursor: pointer;
  font-family: var(--vscode-editor-font-family);
  font-size: 0.9em;
  color: var(--vscode-foreground);
  transition: background-color 0.2s;
}

.tool-filepath:hover {
  background-color: color-mix(in srgb, var(--vscode-list-hoverBackground) 50%, transparent);
}

.filepath-name {
  font-weight: 500;
  color: var(--vscode-textLink-foreground);
}

.filepath-actions {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.open-file-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 4px;
  border-radius: 3px;
  cursor: pointer;
  color: var(--vscode-foreground);
  transition: background-color 0.2s;
}

.open-file-btn:hover {
  background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 80%, transparent);
}

.open-file-btn .codicon {
  font-size: 14px;
}
</style>
