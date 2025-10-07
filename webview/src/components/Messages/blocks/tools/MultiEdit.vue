<template>
  <ToolMessageWrapper
    tool-icon="codicon-edit"
    :tool-result="toolResult"
    :permission-state="permissionState"
    :default-expanded="shouldExpand"
    :class="{ 'has-diff-view': hasDiffView }"
    @allow="$emit('allow')"
    @deny="$emit('deny')"
  >
    <template #main>
      <span class="tool-label">MultiEdit</span>
      <ToolFilePath v-if="filePath" :file-path="filePath" />
      <span v-if="diffStats" class="diff-stats">
        <span v-if="diffStats.added > 0" class="stat-add">+{{ diffStats.added }}</span>
        <span v-if="diffStats.removed > 0" class="stat-remove">-{{ diffStats.removed }}</span>
      </span>
    </template>

    <!-- 展开内容：显示 diff 视图 -->
    <template #expandable>
      <!-- 替换选项 -->
      <div v-if="replaceAll" class="replace-option">
        <span class="codicon codicon-replace-all"></span>
        <span>全部替换</span>
      </div>

      <!-- Diff 视图 -->
      <div v-if="structuredPatch && structuredPatch.length > 0" class="diff-view">
        <!-- 文件标题栏 -->
        <div v-if="filePath" class="diff-file-header">
          <FileIcon :file-name="filePath" :size="16" />
          <span class="file-name">{{ fileName }}</span>
        </div>
        <!-- Diff 双列布局:行号 + 内容 -->
        <div class="diff-scroll-container">
          <!-- 左侧:行号列 -->
          <div ref="lineNumbersRef" class="diff-line-numbers">
            <div v-for="(patch, index) in structuredPatch" :key="index">
              <div
                v-for="(line, lineIndex) in patch.lines"
                :key="lineIndex"
                class="line-number-item"
                :class="getDiffLineClass(line)"
              >
                {{ getLineNumber(patch, lineIndex) }}
              </div>
            </div>
          </div>

          <!-- 右侧:内容列(可滚动) -->
          <div ref="contentRef" class="diff-content" @scroll="handleContentScroll">
            <div v-for="(patch, index) in structuredPatch" :key="index" class="diff-block">
              <div class="diff-lines">
                <div
                  v-for="(line, lineIndex) in patch.lines"
                  :key="lineIndex"
                  class="diff-line"
                  :class="getDiffLineClass(line)"
                >
                  <span class="line-prefix">{{ getLinePrefix(line) }}</span>
                  <span class="line-content">{{ getLineContent(line) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误内容 -->
      <ToolError :tool-result="toolResult" />
    </template>
  </ToolMessageWrapper>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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

const filePath = computed(() => {
  return props.toolUse?.input?.file_path || props.toolUse?.input?.notebook_path;
});

const fileName = computed(() => {
  if (!filePath.value) return '';
  return path.basename(filePath.value);
});

const replaceAll = computed(() => {
  return props.toolUse?.input?.replace_all;
});

// 使用 ref 存储 structuredPatch,通过 watch 更新
const structuredPatch = ref<any>(null);

// 监听 props 变化,更新 structuredPatch
watch(
  () => [props.toolUseResult, props.toolUse, props.toolResult],
  () => {
    // 如果有错误,不显示 diff
    if (props.toolResult?.is_error) {
      structuredPatch.value = null;
      return;
    }

    // 优先使用 toolUseResult 中的 structuredPatch (执行后返回的真实 diff)
    if (props.toolUseResult?.structuredPatch) {
      structuredPatch.value = props.toolUseResult.structuredPatch;
    }
    // 如果有 input,生成临时 diff(权限请求阶段或实时对话执行完成后保留)
    else if (props.toolUse?.input?.old_string && props.toolUse?.input?.new_string) {
      structuredPatch.value = generatePatchFromInput(
        props.toolUse.input.old_string,
        props.toolUse.input.new_string
      );
    }
  },
  { immediate: true, deep: true }
);

const hasDiffView = computed(() => {
  return structuredPatch.value && structuredPatch.value.length > 0;
});

// 判断是否为权限请求阶段(临时 diff from input)
const isPermissionRequest = computed(() => {
  return !props.toolUseResult && props.toolUse?.input?.old_string && props.toolUse?.input?.new_string;
});

// 只在权限请求阶段默认展开,执行完成后不展开
const shouldExpand = computed(() => {
  return hasDiffView.value && isPermissionRequest.value;
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

// 从 old_string 和 new_string 生成简单的 patch
function generatePatchFromInput(oldStr: string, newStr: string): any[] {
  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');

  const lines: string[] = [];

  // 添加删除的行
  oldLines.forEach(line => {
    lines.push('-' + line);
  });

  // 添加新增的行
  newLines.forEach(line => {
    lines.push('+' + line);
  });

  return [{
    oldStart: 1,
    oldLines: oldLines.length,
    newStart: 1,
    newLines: newLines.length,
    lines
  }];
}

// 计算 diff 统计
const diffStats = computed(() => {
  if (!structuredPatch.value) return null;

  let added = 0;
  let removed = 0;

  structuredPatch.value.forEach((patch: any) => {
    patch.lines.forEach((line: string) => {
      if (line.startsWith('+')) added++;
      if (line.startsWith('-')) removed++;
    });
  });

  return { added, removed };
});

// 获取 diff 行的类型类名
function getDiffLineClass(line: string): string {
  if (line.startsWith('-')) return 'diff-line-delete';
  if (line.startsWith('+')) return 'diff-line-add';
  return 'diff-line-context';
}

// 获取行前缀
function getLinePrefix(line: string): string {
  if (line.startsWith('-') || line.startsWith('+')) {
    return line[0];
  }
  return ' ';
}

// 获取行内容（去除前缀）
function getLineContent(line: string): string {
  if (line.startsWith('-') || line.startsWith('+')) {
    return line.substring(1);
  }
  return line;
}

// 计算行号（删除行显示旧行号，添加行显示新行号）
function getLineNumber(patch: any, lineIndex: number): string {
  const currentLine = patch.lines[lineIndex];

  if (currentLine.startsWith('-')) {
    // 删除行：显示旧行号
    let oldLine = patch.oldStart;
    for (let i = 0; i < lineIndex; i++) {
      const line = patch.lines[i];
      if (!line.startsWith('+')) {
        oldLine++;
      }
    }
    return String(oldLine);
  } else if (currentLine.startsWith('+')) {
    // 添加行：显示新行号
    let newLine = patch.newStart;
    for (let i = 0; i < lineIndex; i++) {
      const line = patch.lines[i];
      if (!line.startsWith('-')) {
        newLine++;
      }
    }
    return String(newLine);
  } else {
    // 上下文行：显示新行号
    let newLine = patch.newStart;
    for (let i = 0; i < lineIndex; i++) {
      const line = patch.lines[i];
      if (!line.startsWith('-')) {
        newLine++;
      }
    }
    return String(newLine);
  }
}
</script>

<style scoped>
/* 有 diff 视图时移除左侧边框和边距，error 保留默认样式 */
.has-diff-view :deep(.expandable-content) {
  border-left: none;
  padding: 0;
  margin-left: 0;
}


.tool-label {
  font-weight: 500;
  color: var(--vscode-foreground);
  font-size: 0.9em;
}

.diff-stats {
  display: flex;
  gap: 4px;
  margin-left: 8px;
  font-size: 0.85em;
  font-weight: 500;
}

.stat-add {
  color: var(--vscode-gitDecoration-addedResourceForeground);
}

.stat-remove {
  color: var(--vscode-gitDecoration-deletedResourceForeground);
}

.diff-view {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-family: var(--vscode-editor-font-family);
  font-size: 0.85em;
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  overflow: hidden;
}

.diff-file-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: color-mix(in srgb, var(--vscode-editor-background) 80%, transparent);
  border-bottom: 1px solid var(--vscode-panel-border);
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.diff-file-header :deep(.mdi),
.diff-file-header :deep(.codicon) {
  flex-shrink: 0;
}

.diff-file-header .file-name {
  color: var(--vscode-foreground);
  font-family: var(--vscode-editor-font-family);
}

.diff-scroll-container {
  display: flex;
  max-height: 400px;
  background-color: var(--vscode-editor-background);
}

/* 左侧行号列 */
.diff-line-numbers {
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
.diff-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

/* Monaco 风格滚动条(仅应用于内容列) */
.diff-content::-webkit-scrollbar {
  width: 14px;
  height: 14px;
}

.diff-content::-webkit-scrollbar-track {
  background: transparent;
}

.diff-content::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 9px;
  border: 4px solid transparent;
  background-clip: content-box;
}

.diff-content:hover::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--vscode-scrollbarSlider-background) 60%, transparent);
}

.diff-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--vscode-scrollbarSlider-hoverBackground);
}

.diff-content::-webkit-scrollbar-thumb:active {
  background-color: var(--vscode-scrollbarSlider-activeBackground);
}

.diff-content::-webkit-scrollbar-corner {
  background: transparent;
}

.diff-block {
  width: 100%;
  padding-right: 14px;
}

.diff-lines {
  background-color: var(--vscode-editor-background);
  width: fit-content;
  min-width: 100%;
}

.diff-line {
  display: flex;
  font-family: var(--vscode-editor-font-family);
  white-space: nowrap;
  height: 22px;
  line-height: 22px;
}

.line-prefix {
  display: inline-block;
  width: 20px;
  text-align: center;
  padding: 0 4px;
  flex-shrink: 0;
  user-select: none;
}

.line-content {
  flex: 1;
  padding: 0 8px 0 4px;
  white-space: pre;
}

.diff-line-delete {
  background-color: color-mix(in srgb, var(--vscode-gitDecoration-deletedResourceForeground) 20%, transparent);
}

.diff-line-delete .line-prefix {
  color: var(--vscode-gitDecoration-deletedResourceForeground);
  background-color: color-mix(in srgb, var(--vscode-gitDecoration-deletedResourceForeground) 25%, transparent);
}

.diff-line-delete .line-content {
  color: var(--vscode-gitDecoration-deletedResourceForeground);
}

.diff-line-add {
  background-color: color-mix(in srgb, var(--vscode-gitDecoration-addedResourceForeground) 20%, transparent);
}

.diff-line-add .line-prefix {
  color: var(--vscode-gitDecoration-addedResourceForeground);
  background-color: color-mix(in srgb, var(--vscode-gitDecoration-addedResourceForeground) 25%, transparent);
}

.diff-line-add .line-content {
  color: var(--vscode-gitDecoration-addedResourceForeground);
}

.diff-line-context {
  background-color: var(--vscode-editor-background);
}

.diff-line-context .line-prefix {
  color: color-mix(in srgb, var(--vscode-foreground) 40%, transparent);
}

.diff-line-context .line-content {
  color: var(--vscode-editor-foreground);
}

.replace-option {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--vscode-charts-orange);
  font-size: 0.85em;
  font-weight: 500;
  padding: 4px 0;
}

.replace-option .codicon {
  font-size: 12px;
}
</style>
