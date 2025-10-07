<template>
  <div class="slashcommand-tool">
    <div class="tool-placeholder">
      <span class="codicon codicon-terminal"></span>
      <span>SlashCommand 工具渲染器（待实现）</span>
    </div>

    <!-- TODO: 实现 SlashCommand 工具渲染
    预期参数:
    - command: string

    预期 UI:
    - 命令解析显示
    - 参数高亮
    - 命令帮助信息
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
.slashcommand-tool {
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
