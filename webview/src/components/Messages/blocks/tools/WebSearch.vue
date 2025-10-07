<template>
  <div class="websearch-tool">
    <div class="query-content" v-if="query">
      <div class="query-label">搜索查询:</div>
      <div class="query-text">{{ query }}</div>
    </div>

    <div v-if="hasWebOptions" class="web-options">
      <div class="options-label">网络搜索选项:</div>
      <div class="options-grid">
        <div v-if="allowedDomains && allowedDomains.length" class="option-item">
          <span class="codicon codicon-verified"></span>
          <span class="option-key">允许域名:</span>
          <span class="option-value">{{ allowedDomains.join(', ') }}</span>
        </div>

        <div v-if="blockedDomains && blockedDomains.length" class="option-item">
          <span class="codicon codicon-error"></span>
          <span class="option-key">屏蔽域名:</span>
          <span class="option-value">{{ blockedDomains.join(', ') }}</span>
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

const query = computed(() => {
  return props.input?.query;
});

const allowedDomains = computed(() => {
  return props.input?.allowed_domains;
});

const blockedDomains = computed(() => {
  return props.input?.blocked_domains;
});

const hasWebOptions = computed(() => {
  return (allowedDomains.value && allowedDomains.value.length) ||
         (blockedDomains.value && blockedDomains.value.length);
});
</script>

<style scoped>
.websearch-tool {
  font-family: var(--vscode-editor-font-family);
}

.query-label,
.options-label {
  color: color-mix(in srgb, var(--vscode-foreground) 80%, transparent);
  font-size: 0.9em;
  margin-bottom: 4px;
  font-weight: 500;
}

.query-content {
  margin-bottom: 8px;
}

.query-text {
  background-color: color-mix(in srgb, var(--vscode-editor-background) 60%, transparent);
  border: 1px solid var(--vscode-input-border);
  border-radius: 4px;
  padding: 6px 8px;
  font-family: var(--vscode-editor-font-family);
  color: var(--vscode-foreground);
  border-left: 3px solid var(--vscode-charts-blue);
}

.web-options {
  border-top: 1px solid var(--vscode-panel-border);
  padding-top: 8px;
  margin-top: 8px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  margin-bottom: 8px;
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
  word-break: break-all;
}
</style>
