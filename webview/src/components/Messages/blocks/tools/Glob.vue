<template>
  <ToolMessageWrapper
    tool-icon="codicon-search"
    :tool-result="toolResult"
    :permission-state="permissionState"
    @allow="$emit('allow')"
    @deny="$emit('deny')"
  >
    <template #main>
      <span class="tool-label">Glob</span>
      <code v-if="pattern" class="pattern-text">{{ pattern }}</code>
    </template>

    <!-- 展开内容：显示详细信息 -->
    <template #expandable>
      <!-- 搜索路径 -->
      <div v-if="globPath" class="detail-item">
        <span class="detail-label">搜索路径:</span>
        <span class="detail-value">{{ globPath }}</span>
      </div>

      <!-- 搜索结果列表 -->
      <div v-if="resultFiles.length > 0" class="detail-item">
        <div class="detail-label">
          <span>找到 {{ fileCount }} 个文件:</span>
        </div>
        <div class="file-list">
          <ToolFilePath
            v-for="(file, index) in resultFiles"
            :key="index"
            :file-path="file"
            class="file-item"
          />
        </div>
      </div>

      <!-- 错误内容 -->
      <ToolError :tool-result="toolResult" />
    </template>
  </ToolMessageWrapper>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ToolMessageWrapper from './common/ToolMessageWrapper.vue';
import ToolError from './common/ToolError.vue';
import ToolFilePath from './common/ToolFilePath.vue';

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

const pattern = computed(() => {
  return props.toolUse?.input?.pattern;
});

const globPath = computed(() => {
  return props.toolUse?.input?.path || '.';
});

const resultFiles = computed(() => {
  if (!props.toolResult?.content) return [];

  const content = props.toolResult.content;

  // 如果是数组，直接返回
  if (Array.isArray(content)) {
    return content;
  }

  // 如果是字符串，按行分割
  if (typeof content === 'string') {
    return content.split('\n').filter(line => line.trim());
  }

  return [];
});

const fileCount = computed(() => resultFiles.value.length);
</script>

<style scoped>
.tool-label {
  font-weight: 500;
  color: var(--vscode-foreground);
  font-size: 0.9em;
}

.pattern-text {
  font-family: var(--vscode-editor-font-family);
  color: var(--vscode-charts-orange);
  background-color: color-mix(in srgb, var(--vscode-charts-orange) 15%, transparent);
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
  font-size: 0.9em;
}

.detail-item {
  display: flex;
  gap: 8px;
  font-size: 0.85em;
  padding: 4px 0;
}

.detail-label {
  color: color-mix(in srgb, var(--vscode-foreground) 70%, transparent);
  font-weight: 500;
  min-width: 80px;
}

.detail-value {
  color: var(--vscode-foreground);
  font-family: var(--vscode-editor-font-family);
  word-break: break-all;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-item {
  /* background-color: color-mix(in srgb, var(--vscode-foreground) 5%, transparent); */
  font-size: 0.9em;
}
</style>
