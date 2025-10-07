<template>
  <div
    :tabindex="tabIndex"
    :data-message-index="messageIndex"
    class="tool-message"
    :class="statusClass"
  >
    <div class="message-wrapper">
    <!-- 工具头部 -->
    <div class="tool-header">
      <span class="codicon" :class="toolIcon"></span>
      <span class="tool-name">{{ toolName }}</span>
      <span class="tool-id" v-if="toolUseId">{{ toolUseId }}</span>
      <span class="tool-status" :class="statusClass">{{ statusText }}</span>
    </div>

    <!-- 工具参数显示（来自 tool_use） -->
    <div class="tool-params" v-if="toolUse">
      <component
        :is="getToolRenderer()"
        :input="toolUse.input"
        :tool-name="toolUse.name"
      />
    </div>

    <!-- 权限请求（实时对话时显示） -->
    <div class="permission-request" v-if="showPermissionButtons">
      <div class="permission-message">
        <span class="codicon codicon-shield"></span>
        该工具需要权限确认
      </div>
      <div class="permission-actions">
        <button @click="handleDeny" class="btn-deny">
          <span class="codicon codicon-x"></span>
          拒绝
        </button>
        <button @click="handleAllow" class="btn-allow">
          <span class="codicon codicon-check"></span>
          允许
        </button>
      </div>
    </div>

    <!-- 执行状态（权限确认后） -->
    <div class="execution-status" v-if="showExecutionStatus">
      <span class="codicon codicon-loading codicon-modifier-spin" v-if="isExecuting"></span>
      <span class="status-text">{{ executionStatusText }}</span>
    </div>

    <!-- 工具结果（来自 tool_result） -->
    <div class="tool-result" v-if="toolResult">
      <div v-if="toolResult.is_error" class="result-error">
        <div class="result-header">
          <span class="codicon codicon-error"></span>
          <span class="result-label">执行失败</span>
        </div>
        <div class="result-content">{{ toolResult.content }}</div>
      </div>
      <div v-else class="result-success">
        <div class="result-header">
          <span class="codicon codicon-check"></span>
          <span class="result-label">执行成功</span>
        </div>
        <pre class="result-content">{{ toolResult.content }}</pre>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getToolMessage, setPermissionResponse } from '../../stores/toolMessageStore';
import { sendPermissionResponse } from '../../services/messageBus';
import { getToolIcon, getToolDescription } from '../../utils/messageUtils';
// 新的细粒度工具渲染器
import Bash from './blocks/tools/Bash.vue';
import Read from './blocks/tools/Read.vue';
import Write from './blocks/tools/Write.vue';
import Edit from './blocks/tools/Edit.vue';
import MultiEdit from './blocks/tools/MultiEdit.vue';
import Glob from './blocks/tools/Glob.vue';
import Grep from './blocks/tools/Grep.vue';
import WebSearch from './blocks/tools/WebSearch.vue';
import TodoWrite from './blocks/tools/TodoWrite.vue';
import Task from './blocks/tools/Task.vue';
import ExitPlanMode from './blocks/tools/ExitPlanMode.vue';
import WebFetch from './blocks/tools/WebFetch.vue';
import SlashCommand from './blocks/tools/SlashCommand.vue';
import Default from './blocks/tools/Default.vue';

interface Props {
  toolUseId: string;
  messageIndex: number;
  tabIndex: number;
}

const props = defineProps<Props>();

// 获取工具消息状态
const toolMessageState = computed(() => {
  return getToolMessage(props.toolUseId);
});

const toolUse = computed(() => {
  return toolMessageState.value?.toolUse;
});

const toolResult = computed(() => {
  return toolMessageState.value?.toolResult;
});

const toolName = computed(() => {
  return toolUse.value?.name || 'Unknown Tool';
});

const toolIcon = computed(() => {
  return getToolIcon(toolName.value);
});

const permissionState = computed(() => {
  return toolMessageState.value?.permissionState || 'none';
});

const executionState = computed(() => {
  return toolMessageState.value?.executionState || 'waiting';
});

// 是否显示权限确认按钮
const showPermissionButtons = computed(() => {
  return permissionState.value === 'pending';
});

// 是否显示执行状态
const showExecutionStatus = computed(() => {
  return executionState.value === 'executing' && !toolResult.value;
});

const isExecuting = computed(() => {
  return executionState.value === 'executing';
});

// 状态文本
const statusText = computed(() => {
  switch (executionState.value) {
    case 'waiting':
      return permissionState.value === 'pending' ? '等待确认' : '等待执行';
    case 'executing':
      return '执行中';
    case 'completed':
      return '已完成';
    case 'error':
      return '执行失败';
    default:
      return '';
  }
});

const executionStatusText = computed(() => {
  return '工具正在执行中...';
});

// 状态样式类
const statusClass = computed(() => {
  return {
    'status-waiting': executionState.value === 'waiting',
    'status-pending': permissionState.value === 'pending',
    'status-executing': executionState.value === 'executing',
    'status-completed': executionState.value === 'completed',
    'status-error': executionState.value === 'error'
  };
});

// 获取工具渲染器组件
function getToolRenderer() {
  const name = toolName.value.toLowerCase();

  const toolMap: Record<string, any> = {
    'bash': Bash,
    'read': Read,
    'write': Write,
    'edit': Edit,
    'multiedit': MultiEdit,
    'glob': Glob,
    'grep': Grep,
    'websearch': WebSearch,
    'todowrite': TodoWrite,
    'task': Task,
    'exitplanmode': ExitPlanMode,
    'webfetch': WebFetch,
    'slashcommand': SlashCommand
  };

  return toolMap[name] || Default;
}

// 处理权限确认
function handleAllow() {
  if (!props.toolUseId) return;

  // 更新本地状态
  setPermissionResponse(props.toolUseId, true);

  // 发送权限响应（序列化 input 确保可克隆）
  const safeInput = toolUse.value?.input ? JSON.parse(JSON.stringify(toolUse.value.input)) : {};
  sendPermissionResponse(props.toolUseId, {
    behavior: 'allow',
    updatedInput: safeInput
  });
}

function handleDeny() {
  if (!props.toolUseId) return;

  // 更新本地状态
  setPermissionResponse(props.toolUseId, false);

  // 发送权限响应
  sendPermissionResponse(props.toolUseId, {
    behavior: 'deny',
    message: '用户拒绝了权限请求'
  });
}
</script>

<style scoped>
.tool-message {
  display: block;
  outline: none;
  padding: 0px 18px 0.4rem;
  background-color: var(--vscode-sideBar-background);
  opacity: 1;
  position: relative;
}

.message-wrapper {
  background-color: color-mix(in srgb, var(--vscode-editor-background) 30%, transparent);
  border: 1px solid var(--vscode-editorWidget-border);
  border-radius: 8px;
  padding: 12px;
  transition: border-color 0.3s ease;
}

.tool-message.status-pending {
  /* border-color: var(--vscode-charts-orange); */
}

.tool-message.status-executing {
  /* border-color: var(--vscode-charts-blue); */
}

.tool-message.status-completed {
  /* border-color: var(--vscode-charts-green); */
}

.tool-message.status-error {
  /* border-color: var(--vscode-charts-red); */
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--vscode-panel-border);
}

.tool-header .codicon {
  color: var(--vscode-charts-blue);
}

.tool-name {
  font-weight: 600;
  color: var(--vscode-foreground);
}

.tool-id {
  color: color-mix(in srgb, var(--vscode-foreground) 60%, transparent);
  font-family: var(--vscode-editor-font-family);
  font-size: 0.85em;
}

.tool-status {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: 500;
}

.tool-status.status-waiting {
  background-color: color-mix(in srgb, var(--vscode-charts-yellow) 20%, transparent);
  color: var(--vscode-charts-yellow);
}

.tool-status.status-pending {
  background-color: color-mix(in srgb, var(--vscode-charts-orange) 20%, transparent);
  color: var(--vscode-charts-orange);
}

.tool-status.status-executing {
  background-color: color-mix(in srgb, var(--vscode-charts-blue) 20%, transparent);
  color: var(--vscode-charts-blue);
}

.tool-status.status-completed {
  background-color: color-mix(in srgb, var(--vscode-charts-green) 20%, transparent);
  color: var(--vscode-charts-green);
}

.tool-status.status-error {
  background-color: color-mix(in srgb, var(--vscode-charts-red) 20%, transparent);
  color: var(--vscode-charts-red);
}

.tool-params {
  margin-bottom: 12px;
}

.permission-request {
  background-color: color-mix(in srgb, var(--vscode-charts-orange) 10%, transparent);
  border: 1px solid var(--vscode-charts-orange);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.permission-message {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--vscode-charts-orange);
  font-weight: 500;
  margin-bottom: 12px;
}

.permission-actions {
  display: flex;
  gap: 8px;
}

.btn-allow,
.btn-deny {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-allow {
  background-color: var(--vscode-charts-green);
  color: white;
}

.btn-allow:hover {
  opacity: 0.8;
}

.btn-deny {
  background-color: var(--vscode-charts-red);
  color: white;
}

.btn-deny:hover {
  opacity: 0.8;
}

.execution-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: color-mix(in srgb, var(--vscode-charts-blue) 10%, transparent);
  border-radius: 6px;
  color: var(--vscode-charts-blue);
  font-size: 0.9em;
  margin-bottom: 12px;
}

.tool-result {
  border-top: 1px solid var(--vscode-panel-border);
  padding-top: 12px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-weight: 500;
}

.result-error .result-header {
  color: var(--vscode-charts-red);
}

.result-success .result-header {
  color: var(--vscode-charts-green);
}

.result-content {
  background-color: color-mix(in srgb, var(--vscode-editor-background) 80%, transparent);
  border: 1px solid var(--vscode-input-border);
  border-radius: 4px;
  padding: 8px;
  font-family: var(--vscode-editor-font-family);
  /* font-size: var(--vscode-editor-font-size); */
  color: var(--vscode-editor-foreground);
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}

.result-error .result-content {
  border-left: 3px solid var(--vscode-charts-red);
  background-color: color-mix(in srgb, var(--vscode-charts-red) 5%, transparent);
}

.result-success .result-content {
  border-left: 3px solid var(--vscode-charts-green);
}
</style>