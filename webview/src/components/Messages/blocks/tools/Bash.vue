<template>
  <div class="bash-tool">
    <div class="bash-command">
      <div class="command-label">命令:</div>
      <pre class="command-content">{{ command }}</pre>
    </div>

    <div v-if="hasOptions" class="bash-options">
      <div class="options-label">选项:</div>
      <div class="options-grid">
        <div v-if="timeout" class="option-item">
          <span class="option-key">超时:</span>
          <span class="option-value">{{ timeout }}ms</span>
        </div>
        <div v-if="description" class="option-item">
          <span class="option-key">描述:</span>
          <span class="option-value">{{ description }}</span>
        </div>
        <div v-if="runInBackground" class="option-item">
          <span class="option-key">后台运行:</span>
          <span class="option-value option-boolean">是</span>
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

const command = computed(() => {
  return props.input?.command || '';
});

const timeout = computed(() => {
  return props.input?.timeout;
});

const description = computed(() => {
  return props.input?.description;
});

const runInBackground = computed(() => {
  return props.input?.run_in_background;
});

const hasOptions = computed(() => {
  return timeout.value || description.value || runInBackground.value;
});
</script>

<style scoped>
.bash-tool {
  font-family: var(--vscode-editor-font-family);
}

.bash-command {
  margin-bottom: 12px;
}

.command-label {
  color: color-mix(in srgb, var(--vscode-foreground) 80%, transparent);
  font-size: 0.9em;
  margin-bottom: 4px;
  font-weight: 500;
}

.command-content {
  background-color: color-mix(in srgb, var(--vscode-terminal-background, var(--vscode-editor-background)) 80%, transparent);
  border: 1px solid var(--vscode-terminal-border, var(--vscode-panel-border));
  border-radius: 4px;
  padding: 8px 12px;
  color: var(--vscode-terminal-foreground, var(--vscode-editor-foreground));
  font-family: var(--vscode-editor-font-family);
  /* font-size: var(--vscode-editor-font-size); */
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  border-left: 3px solid var(--vscode-charts-green);
}

.bash-options {
  border-top: 1px solid var(--vscode-panel-border);
  padding-top: 8px;
}

.options-label {
  color: color-mix(in srgb, var(--vscode-foreground) 80%, transparent);
  font-size: 0.9em;
  margin-bottom: 6px;
  font-weight: 500;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 6px;
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

.option-boolean {
  background-color: color-mix(in srgb, var(--vscode-charts-green) 20%, transparent);
  color: var(--vscode-charts-green);
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 0.8em;
  font-weight: 500;
}
</style>
