<template>
  <div class="webfetch-tool">
    <div class="tool-placeholder">
      <span class="codicon codicon-cloud-download"></span>
      <span>WebFetch 工具渲染器（待实现）</span>
    </div>

    <!-- TODO: 实现 WebFetch 工具渲染
    预期参数:
    - url: string
    - prompt: string

    预期 UI:
    - URL 链接显示（可点击）
    - prompt 内容预览
    - 抓取状态显示
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
.webfetch-tool {
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
