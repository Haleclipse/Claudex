<template>
  <ToolMessageWrapper
    tool-icon="codicon-globe"
    :tool-result="toolResult"
    :permission-state="permissionState"
    :default-expanded="shouldExpand"
    @allow="$emit('allow')"
    @deny="$emit('deny')"
  >
    <template #main>
      <span class="tool-label">Search</span>
      <span v-if="query" class="query-text">{{ query }}</span>
    </template>

    <!-- 展开内容：显示域名过滤选项 -->
    <template v-if="hasExpandableContent" #expandable>
      <!-- 允许的域名 -->
      <div v-if="allowedDomains && allowedDomains.length" class="detail-item">
        <div class="detail-label">
          <span class="codicon codicon-verified"></span>
          <span>允许域名:</span>
        </div>
        <div class="domain-list">
          <span v-for="domain in allowedDomains" :key="domain" class="domain-tag allowed">
            {{ domain }}
          </span>
        </div>
      </div>

      <!-- 屏蔽的域名 -->
      <div v-if="blockedDomains && blockedDomains.length" class="detail-item">
        <div class="detail-label">
          <span class="codicon codicon-error"></span>
          <span>屏蔽域名:</span>
        </div>
        <div class="domain-list">
          <span v-for="domain in blockedDomains" :key="domain" class="domain-tag blocked">
            {{ domain }}
          </span>
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

const query = computed(() => {
  return props.toolUse?.input?.query;
});

const allowedDomains = computed(() => {
  return props.toolUse?.input?.allowed_domains;
});

const blockedDomains = computed(() => {
  return props.toolUse?.input?.blocked_domains;
});

// 只有在有域名过滤信息或有错误时才有可展开内容
const hasExpandableContent = computed(() => {
  // 有错误时可展开
  if (props.toolResult?.is_error) return true;

  // 有域名过滤信息时可展开
  const hasFilters = (allowedDomains.value && allowedDomains.value.length > 0) ||
                     (blockedDomains.value && blockedDomains.value.length > 0);

  return hasFilters;
});

// 判断是否为权限请求阶段
const isPermissionRequest = computed(() => {
  // 如果有 toolUseResult,说明已经执行完成(会话加载)
  const hasToolUseResult = !!props.toolUseResult;

  // 如果有 toolResult 且不是错误,说明已经执行完成(实时对话)
  const hasToolResult = !!props.toolResult && !props.toolResult.is_error;

  // 如果都没有,说明是权限请求阶段
  return !hasToolUseResult && !hasToolResult;
});

// 只在权限请求阶段且有域名过滤信息时默认展开,执行完成后不展开
const shouldExpand = computed(() => {
  return hasExpandableContent.value && isPermissionRequest.value;
});
</script>

<style scoped>
.tool-label {
  font-weight: 500;
  color: var(--vscode-foreground);
  font-size: 0.9em;
}

.query-text {
  font-family: var(--vscode-editor-font-family);
  color: var(--vscode-charts-blue);
  background-color: color-mix(in srgb, var(--vscode-charts-blue) 15%, transparent);
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
  font-size: 0.9em;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85em;
  padding: 6px 0;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: color-mix(in srgb, var(--vscode-foreground) 70%, transparent);
  font-weight: 500;
}

.domain-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.domain-tag {
  font-family: var(--vscode-editor-font-family);
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 0.9em;
}

.domain-tag.allowed {
  color: var(--vscode-charts-green);
  background-color: color-mix(in srgb, var(--vscode-charts-green) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--vscode-charts-green) 30%, transparent);
}

.domain-tag.blocked {
  color: var(--vscode-charts-red);
  background-color: color-mix(in srgb, var(--vscode-charts-red) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--vscode-charts-red) 30%, transparent);
}
</style>
