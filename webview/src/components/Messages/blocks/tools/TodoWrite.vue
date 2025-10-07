<template>
  <div class="todowrite-tool">
    <div class="tool-placeholder">
      <span class="codicon codicon-checklist"></span>
      <span>TodoWrite 工具渲染器（待实现）</span>
    </div>

    <!-- TODO: 实现 TodoWrite 工具渲染
    预期参数:
    - todos: Array<{ content: string, status: string, activeForm: string }>

    预期 UI:
    - 显示 todo 列表
    - 状态徽章 (pending/in_progress/completed)
    - 进度条
    -->
  </div>
</template>

<script setup lang="ts">
interface Props {
  input: any;
  toolName: string;
}

const props = defineProps<Props>();
</script>

<style scoped>
.todowrite-tool {
  font-family: var(--vscode-editor-font-family);
  padding: 12px;
}

.tool-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background-color: color-mix(in srgb, var(--vscode-editor-background) 30%, transparent);
  border: 1px dashed var(--vscode-panel-border);
  border-radius: 4px;
  color: color-mix(in srgb, var(--vscode-foreground) 60%, transparent);
  font-style: italic;
  font-size: 0.9em;
}

.tool-placeholder .codicon {
  font-size: 1.2em;
}
</style>
