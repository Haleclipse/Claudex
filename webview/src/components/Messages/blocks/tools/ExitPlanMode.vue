<template>
  <div class="exitplanmode-tool">
    <div class="tool-placeholder">
      <span class="codicon codicon-play"></span>
      <span>ExitPlanMode 工具渲染器（待实现）</span>
    </div>

    <!-- TODO: 实现 ExitPlanMode 工具渲染
    预期参数:
    - plan: string (markdown 格式)

    预期 UI:
    - 计划内容 markdown 渲染
    - 计划批准状态显示
    - 执行/取消按钮状态
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
.exitplanmode-tool {
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
