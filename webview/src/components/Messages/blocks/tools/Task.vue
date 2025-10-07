<template>
  <div class="task-tool">
    <div class="tool-placeholder">
      <span class="codicon codicon-organization"></span>
      <span>Task 工具渲染器（待实现）</span>
    </div>

    <!-- TODO: 实现 Task 工具渲染
    预期参数:
    - subagent_type: string
    - description: string
    - prompt: string

    预期 UI:
    - Agent 类型图标
    - 任务描述展开/折叠
    - prompt 内容显示
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
.task-tool {
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
