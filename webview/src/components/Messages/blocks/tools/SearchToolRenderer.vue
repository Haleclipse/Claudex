<template>
  <div class="search-tool-renderer">
    <div class="search-pattern" v-if="pattern">
      <div class="pattern-label">搜索模式:</div>
      <div class="pattern-content">
        <span class="codicon codicon-regex"></span>
        <code class="pattern-text">{{ pattern }}</code>
      </div>
    </div>
    
    <div v-if="isGrepTool" class="grep-options">
      <div class="options-label">搜索选项:</div>
      <div class="options-grid">
        <div v-if="searchPath" class="option-item">
          <span class="codicon codicon-folder"></span>
          <span class="option-key">路径:</span>
          <span class="option-value">{{ searchPath }}</span>
        </div>
        
        <div v-if="glob" class="option-item">
          <span class="codicon codicon-filter"></span>
          <span class="option-key">文件过滤:</span>
          <span class="option-value">{{ glob }}</span>
        </div>
        
        <div v-if="fileType" class="option-item">
          <span class="codicon codicon-file-code"></span>
          <span class="option-key">文件类型:</span>
          <span class="option-value">{{ fileType }}</span>
        </div>
        
        <div v-if="outputMode" class="option-item">
          <span class="codicon codicon-output"></span>
          <span class="option-key">输出模式:</span>
          <span class="option-value">{{ outputMode }}</span>
        </div>
      </div>
      
      <div v-if="hasFlags" class="search-flags">
        <div class="flags-label">搜索标志:</div>
        <div class="flags-list">
          <span v-if="caseInsensitive" class="flag-item">
            <span class="codicon codicon-case-sensitive"></span>
            忽略大小写
          </span>
          <span v-if="multiline" class="flag-item">
            <span class="codicon codicon-whole-word"></span>
            多行模式
          </span>
          <span v-if="showLineNumbers" class="flag-item">
            <span class="codicon codicon-list-ordered"></span>
            显示行号
          </span>
          <span v-if="contextLines" class="flag-item">
            <span class="codicon codicon-list-tree"></span>
            上下文: {{ contextLines }} 行
          </span>
        </div>
      </div>
    </div>
    
    <div v-if="isWebSearchTool" class="web-search-options">
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
    
    <div v-if="hasLimits" class="search-limits">
      <div class="limits-label">限制条件:</div>
      <div class="limits-grid">
        <div v-if="headLimit" class="limit-item">
          <span class="codicon codicon-arrow-up"></span>
          <span>前 {{ headLimit }} 条结果</span>
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

const isGrepTool = computed(() => {
  return props.toolName.toLowerCase() === 'grep';
});

const isWebSearchTool = computed(() => {
  return props.toolName.toLowerCase() === 'websearch';
});

const pattern = computed(() => {
  return props.input?.pattern;
});

const query = computed(() => {
  return props.input?.query;
});

const searchPath = computed(() => {
  return props.input?.path;
});

const glob = computed(() => {
  return props.input?.glob;
});

const fileType = computed(() => {
  return props.input?.type;
});

const outputMode = computed(() => {
  return props.input?.output_mode;
});

const caseInsensitive = computed(() => {
  return props.input?.['-i'];
});

const multiline = computed(() => {
  return props.input?.multiline;
});

const showLineNumbers = computed(() => {
  return props.input?.['-n'];
});

const contextLines = computed(() => {
  return props.input?.['-A'] || props.input?.['-B'] || props.input?.['-C'];
});

const headLimit = computed(() => {
  return props.input?.head_limit;
});

const allowedDomains = computed(() => {
  return props.input?.allowed_domains;
});

const blockedDomains = computed(() => {
  return props.input?.blocked_domains;
});

const hasFlags = computed(() => {
  return caseInsensitive.value || multiline.value || showLineNumbers.value || contextLines.value;
});

const hasWebOptions = computed(() => {
  return (allowedDomains.value && allowedDomains.value.length) || 
         (blockedDomains.value && blockedDomains.value.length);
});

const hasLimits = computed(() => {
  return headLimit.value;
});
</script>

<style scoped>
.search-tool-renderer {
  font-family: var(--vscode-editor-font-family);
}

.pattern-label,
.options-label,
.flags-label,
.query-label,
.limits-label {
  color: color-mix(in srgb, var(--vscode-foreground) 80%, transparent);
  font-size: 0.9em;
  margin-bottom: 4px;
  font-weight: 500;
}

.pattern-content {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: color-mix(in srgb, var(--vscode-editor-background) 60%, transparent);
  border: 1px solid var(--vscode-input-border);
  border-radius: 4px;
  padding: 6px 8px;
  border-left: 3px solid var(--vscode-charts-purple);
  margin-bottom: 12px;
}

.pattern-text {
  font-family: var(--vscode-editor-font-family);
  color: var(--vscode-charts-purple);
  background-color: transparent;
  font-weight: 500;
}

.grep-options,
.web-search-options {
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

.search-flags {
  margin-top: 8px;
}

.flags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.flag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: color-mix(in srgb, var(--vscode-charts-blue) 15%, transparent);
  color: var(--vscode-charts-blue);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.8em;
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

.search-limits {
  border-top: 1px solid var(--vscode-panel-border);
  padding-top: 8px;
  margin-top: 8px;
}

.limits-grid {
  display: flex;
  gap: 8px;
}

.limit-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: color-mix(in srgb, var(--vscode-charts-orange) 15%, transparent);
  color: var(--vscode-charts-orange);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.8em;
  font-weight: 500;
}
</style>