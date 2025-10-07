<template>
  <ToolMessageWrapper
    tool-icon="codicon-eye-two"
    :tool-result="toolResult"
    :permission-state="permissionState"
    @allow="$emit('allow')"
    @deny="$emit('deny')"
  >
    <template #main>
      <span class="tool-label">{{ lineRangeLabel }}</span>
      <ToolFilePath v-if="filePath" :file-path="filePath" />
    </template>

    <!-- 动态展开内容：仅在有错误时显示 -->
    <template v-if="toolResult?.is_error" #expandable>
      <ToolError :tool-result="toolResult" />
    </template>
  </ToolMessageWrapper>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ToolMessageWrapper from './common/ToolMessageWrapper.vue';
import ToolFilePath from './common/ToolFilePath.vue';
import ToolError from './common/ToolError.vue';

interface Props {
  toolUse?: any;
  toolResult?: any;
  permissionState?: string;
}

const props = defineProps<Props>();

defineEmits<{
  allow: [];
  deny: [];
}>();

const filePath = computed(() => {
  return props.toolUse?.input?.file_path || props.toolUse?.input?.notebook_path || '';
});

const offset = computed(() => {
  return props.toolUse?.input?.offset;
});

const limit = computed(() => {
  return props.toolUse?.input?.limit;
});

const lineRangeLabel = computed(() => {
  if (offset.value !== undefined && limit.value !== undefined) {
    const startLine = offset.value;
    const endLine = offset.value + limit.value;
    return `Read lines ${startLine}-${endLine}`;
  } else if (offset.value !== undefined) {
    return `Read from line ${offset.value}`;
  } else if (limit.value !== undefined) {
    return `Read lines 1-${limit.value}`;
  } else {
    return 'Read';
  }
});
</script>

<style scoped>
.tool-label {
  font-weight: 500;
  color: var(--vscode-foreground);
  font-size: 0.9em;
}
</style>
