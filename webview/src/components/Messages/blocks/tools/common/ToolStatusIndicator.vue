<template>
  <div
    class="tool-status-indicator"
    :class="`status-${state}`"
    :title="statusText"
  >
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7.5" cy="7.5" r="5" fill="currentColor" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  state: 'success' | 'error' | 'pending';
}

const props = defineProps<Props>();

const statusText = computed(() => {
  switch (props.state) {
    case 'success':
      return '执行成功';
    case 'error':
      return '执行失败';
    case 'pending':
      return '等待确认';
    default:
      return '';
  }
});
</script>

<style scoped>
.tool-status-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tool-status-indicator svg {
  display: block;
}

/* 成功状态 - 绿色 */
.status-success {
  color: var(--vscode-charts-green);
}

/* 失败状态 - 红色 */
.status-error {
  color: var(--vscode-charts-red);
}

/* 等待确认 - 橙色 */
.status-pending {
  color: var(--vscode-charts-orange);
}
</style>
