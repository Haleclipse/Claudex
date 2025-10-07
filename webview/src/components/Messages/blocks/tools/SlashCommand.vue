<template>
  <ToolMessageWrapper
    tool-icon="codicon-symbol-event"
    :tool-result="toolResult"
    :permission-state="permissionState"
    @allow="$emit('allow')"
    @deny="$emit('deny')"
  >
    <template #main>
      <span class="command-text">{{ command }}</span>
    </template>

    <template #expandable>
      <ToolError v-if="toolResult?.is_error" :tool-result="toolResult" />
    </template>
  </ToolMessageWrapper>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ToolMessageWrapper from './common/ToolMessageWrapper.vue';
import ToolError from './common/ToolError.vue';

interface Props {
  toolUse?: any;
  toolResult?: any;
  toolUseResult?: any;
  permissionState?: string;
}

const props = defineProps<Props>();

defineEmits<{
  allow: [];
  deny: [];
}>();

// 命令内容
const command = computed(() => {
  // toolUseResult 可能是字符串或对象，优先使用 toolUse.input
  if (props.toolUse?.input?.command) {
    return props.toolUse.input.command;
  }
  // toolUseResult 如果是对象才取 command 属性
  if (props.toolUseResult && typeof props.toolUseResult === 'object' && props.toolUseResult.command) {
    return props.toolUseResult.command;
  }
  return '';
});
</script>

<style scoped>
.command-text {
  font-family: var(--vscode-editor-font-family);
  font-size: 0.9em;
  color: var(--vscode-foreground);
  font-weight: 500;
}
</style>
