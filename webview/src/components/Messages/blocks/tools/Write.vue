<template>
  <ToolMessageWrapper
    tool-icon="codicon-new-file"
    :tool-result="toolResult"
    :permission-state="permissionState"
    :default-expanded="shouldExpand"
    :class="{ 'has-content-view': hasContentView }"
    @allow="$emit('allow')"
    @deny="$emit('deny')"
  >
    <template #main>
      <span class="tool-label">Write</span>
      <ToolFilePath v-if="filePath" :file-path="filePath" />
      <span v-if="contentStats" class="content-stats">
        <span class="stat-lines">{{ contentStats.lines }} Lines </span>
        <span class="stat-chars">{{ contentStats.chars }} Chars </span>
      </span>
    </template>

    <template #expandable>
      <!-- 文件内容视图 -->
      <div v-if="content && !toolResult?.is_error" class="write-view">
        <!-- 文件标题栏 -->
        <div v-if="filePath" class="write-file-header">
          <FileIcon :file-name="filePath" :size="16" class="file-icon" />
          <span class="file-name">{{ fileName }}</span>
        </div>

        <!-- 内容显示 -->
        <div class="write-scroll-container">
          <!-- 左侧行号列 -->
          <div ref="lineNumbersRef" class="write-line-numbers">
            <div
              v-for="n in lineCount"
              :key="n"
              class="line-number-item"
            >
              {{ n }}
            </div>
          </div>

          <!-- 右侧内容列 -->
          <div ref="contentRef" class="write-content" @scroll="handleContentScroll">
            <pre class="content-text">{{ content }}</pre>
          </div>
        </div>
      </div>

      <!-- 错误内容 -->
      <ToolError :tool-result="toolResult" />
    </template>
  </ToolMessageWrapper>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import path from 'path-browserify-esm';
import ToolMessageWrapper from './common/ToolMessageWrapper.vue';
import ToolError from './common/ToolError.vue';
import ToolFilePath from './common/ToolFilePath.vue';
import FileIcon from '@/components/FileIcon.vue';

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

// 文件路径
const filePath = computed(() => {
  return props.toolUse?.input?.file_path || props.toolUseResult?.file_path;
});

const fileName = computed(() => {
  if (!filePath.value) return '';
  return path.basename(filePath.value);
});

// 文件内容
const content = computed(() => {
  // 优先使用 toolUseResult (会话加载)
  if (props.toolUseResult?.content) {
    return props.toolUseResult.content;
  }

  // 实时对话
  if (props.toolUse?.input?.content) {
    return props.toolUse.input.content;
  }

  return '';
});

// 内容统计
const contentStats = computed(() => {
  if (!content.value) return null;

  const lines = content.value.split('\n').length;
  const chars = content.value.length;

  return { lines, chars };
});

// 行数
const lineCount = computed(() => {
  if (!content.value) return 0;
  return content.value.split('\n').length;
});

// 是否有内容视图
const hasContentView = computed(() => {
  return content.value && !props.toolResult?.is_error;
});

// 是否自动展开
const shouldExpand = computed(() => {
  // 权限请求阶段展开
  if (props.permissionState === 'pending') return true;

  // 有错误时展开
  if (props.toolResult?.is_error) return true;

  return false;
});

// DOM 引用
const lineNumbersRef = ref<HTMLElement>();
const contentRef = ref<HTMLElement>();

// 同步行号列和内容列的垂直滚动
function handleContentScroll() {
  if (lineNumbersRef.value && contentRef.value) {
    lineNumbersRef.value.scrollTop = contentRef.value.scrollTop;
  }
}
</script>

<style scoped>
/* 有内容视图时移除左侧边框和边距，error 保留默认样式 */
.has-content-view :deep(.expandable-content) {
  border-left: none;
  padding: 0;
  margin-left: 0;
}

.tool-label {
  font-weight: 500;
  color: var(--vscode-foreground);
  font-size: 0.9em;
}

.content-stats {
  display: flex;
  gap: 8px;
  margin-left: 8px;
  font-size: 0.8em;
  color: color-mix(in srgb, var(--vscode-foreground) 70%, transparent);
}

.stat-lines,
.stat-chars {
  font-family: var(--vscode-editor-font-family);
}

.write-view {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-family: var(--vscode-editor-font-family);
  font-size: 0.85em;
  border: 0.5px solid var(--vscode-widget-border);
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  overflow: hidden;
}

.write-file-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background-color: color-mix(in srgb, var(--vscode-editor-background) 80%, transparent);
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.write-file-header :deep(.mdi),
.write-file-header :deep(.codicon) {
  flex-shrink: 0;
}

.write-file-header .file-name {
  color: var(--vscode-foreground);
  font-family: var(--vscode-editor-font-family);
}

.write-scroll-container {
  display: flex;
  max-height: 400px;
  background-color: var(--vscode-editor-background);
}

/* 左侧行号列 */
.write-line-numbers {
  width: 50px;
  flex-shrink: 0;
  overflow: hidden;
  background-color: color-mix(in srgb, var(--vscode-editor-background) 95%, transparent);
  border-right: 1px solid var(--vscode-panel-border);
}

.line-number-item {
  height: 22px;
  line-height: 22px;
  padding: 0 8px;
  text-align: right;
  font-family: var(--vscode-editor-font-family);
  font-size: 0.85em;
  color: var(--vscode-editorLineNumber-foreground);
  user-select: none;
}

/* 右侧内容列 */
.write-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

/* Monaco 风格滚动条 */
.write-content::-webkit-scrollbar {
  width: 14px;
  height: 14px;
}

.write-content::-webkit-scrollbar-track {
  background: transparent;
}

.write-content::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 9px;
  border: 4px solid transparent;
  background-clip: content-box;
}

.write-content:hover::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--vscode-scrollbarSlider-background) 60%, transparent);
}

.write-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--vscode-scrollbarSlider-hoverBackground);
}

.write-content::-webkit-scrollbar-thumb:active {
  background-color: var(--vscode-scrollbarSlider-activeBackground);
}

.write-content::-webkit-scrollbar-corner {
  background: transparent;
}

.content-text {
  margin: 0;
  padding: 0;
  font-family: var(--vscode-editor-font-family);
  line-height: 22px;
  color: var(--vscode-editor-foreground);
  background-color: var(--vscode-editor-background);
  white-space: pre;
  width: fit-content;
  min-width: 100%;
}
</style>