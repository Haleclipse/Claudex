<template>
  <ToolMessageWrapper
    tool-icon="codicon-grep"
    :tool-result="toolResult"
    :permission-state="permissionState"
    @allow="$emit('allow')"
    @deny="$emit('deny')"
  >
    <template #main>
      <span class="tool-label">Grep</span>
      <code v-if="pattern" class="pattern-text">{{ pattern }}</code>
    </template>

    <!-- 展开内容：显示搜索选项和结果 -->
    <template #expandable>
      <!-- 搜索选项 -->
      <div v-if="hasSearchOptions" class="options-section">
        <div class="options-grid">
          <div v-if="searchPath" class="option-item">
            <span class="codicon codicon-folder"></span>
            <span class="option-text">路径: {{ searchPath }}</span>
          </div>
          <div v-if="glob" class="option-item">
            <span class="codicon codicon-filter"></span>
            <span class="option-text">过滤: {{ glob }}</span>
          </div>
          <div v-if="fileType" class="option-item">
            <span class="codicon codicon-file-code"></span>
            <span class="option-text">类型: {{ fileType }}</span>
          </div>
          <div v-if="outputMode" class="option-item">
            <span class="codicon codicon-output"></span>
            <span class="option-text">模式: {{ outputMode }}</span>
          </div>
        </div>
      </div>

      <!-- 搜索标志 -->
      <div v-if="hasFlags" class="flags-section">
        <div class="detail-label">标志:</div>
        <div class="flags-list">
          <span v-if="caseInsensitive" class="flag-tag">
            <span class="codicon codicon-case-sensitive"></span>
            忽略大小写
          </span>
          <span v-if="multiline" class="flag-tag">
            <span class="codicon codicon-whole-word"></span>
            多行模式
          </span>
          <span v-if="showLineNumbers" class="flag-tag">
            <span class="codicon codicon-list-ordered"></span>
            显示行号
          </span>
          <span v-if="contextLines" class="flag-tag">
            <span class="codicon codicon-list-tree"></span>
            上下文: {{ contextLines }} 行
          </span>
          <span v-if="headLimit" class="flag-tag">
            <span class="codicon codicon-arrow-up"></span>
            限制: {{ headLimit }} 条
          </span>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-if="resultFiles.length > 0" class="results-section">
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

// 搜索模式
const pattern = computed(() => props.toolUse?.input?.pattern);

// 搜索选项
const searchPath = computed(() => props.toolUse?.input?.path);
const glob = computed(() => props.toolUse?.input?.glob);
const fileType = computed(() => props.toolUse?.input?.type);
const outputMode = computed(() => props.toolUse?.input?.output_mode);

// 搜索标志
const caseInsensitive = computed(() => props.toolUse?.input?.['-i']);
const multiline = computed(() => props.toolUse?.input?.multiline);
const showLineNumbers = computed(() => props.toolUse?.input?.['-n']);
const contextLines = computed(() => {
  return props.toolUse?.input?.['-A'] || props.toolUse?.input?.['-B'] || props.toolUse?.input?.['-C'];
});
const headLimit = computed(() => props.toolUse?.input?.head_limit);

// 判断是否有选项或标志
const hasSearchOptions = computed(() => {
  return searchPath.value || glob.value || fileType.value || outputMode.value;
});

const hasFlags = computed(() => {
  return caseInsensitive.value || multiline.value || showLineNumbers.value || contextLines.value || headLimit.value;
});

// 解析搜索结果
const resultFiles = computed(() => {
  if (!props.toolResult?.content) return [];

  const content = props.toolResult.content;

  // 如果是字符串，解析文件列表
  if (typeof content === 'string') {
    const lines = content.split('\n').filter(line => line.trim());
    // 过滤掉 "Found X files" 这样的统计行
    return lines.filter(line => !line.match(/^Found \d+ files?$/i));
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
  color: var(--vscode-charts-purple);
  background-color: color-mix(in srgb, var(--vscode-charts-purple) 15%, transparent);
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
  font-size: 0.9em;
}

.options-section,
.flags-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 0.85em;
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 0;
  font-size: 0.85em;
}

.detail-label {
  color: color-mix(in srgb, var(--vscode-foreground) 70%, transparent);
  font-weight: 500;
}

.options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--vscode-foreground);
}

.option-item .codicon {
  font-size: 12px;
  color: color-mix(in srgb, var(--vscode-foreground) 70%, transparent);
}

.option-text {
  font-family: var(--vscode-editor-font-family);
}

.flags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.flag-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: color-mix(in srgb, var(--vscode-charts-blue) 15%, transparent);
  color: var(--vscode-charts-blue);
  padding: 3px 8px;
  border-radius: 3px;
  font-weight: 500;
}

.flag-tag .codicon {
  font-size: 12px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
