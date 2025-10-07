<template>
  <div
    :tabindex="tabIndex"
    :data-message-index="messageIndex"
    :data-toolid="toolUseId"
    class="tool-message"
  >
    <!-- 子组件负责完整渲染 -->
    <component
      :is="getToolRenderer()"
      :tool-use="toolUse"
      :tool-result="toolResult"
      :tool-use-result="toolUseResult"
      :permission-state="permissionState"
      @allow="handleAllow"
      @deny="handleDeny"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getToolMessage, setPermissionResponse } from '../../stores/toolMessageStore';
import { sendPermissionResponse } from '../../services/messageBus';
// 新的细粒度工具渲染器
import Bash from './blocks/tools/Bash.vue';
import BashOutput from './blocks/tools/BashOutput.vue';
import KillShell from './blocks/tools/KillShell.vue';
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
import McpTool from './blocks/tools/McpTool.vue';
import NotebookEdit from './blocks/tools/NotebookEdit.vue';
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

const toolUseResult = computed(() => {
  return toolMessageState.value?.toolUseResult;
});

const permissionState = computed(() => {
  return toolMessageState.value?.permissionState || 'none';
});

const toolName = computed(() => {
  return toolUse.value?.name || 'Unknown Tool';
});

// 获取工具渲染器组件
function getToolRenderer() {
  const name = toolName.value.toLowerCase();

  // MCP工具优先处理
  if (name.startsWith('mcp__')) {
    return McpTool;
  }

  const toolMap: Record<string, any> = {
    'bash': Bash,
    'bashoutput': BashOutput,
    'killshell': KillShell,
    'read': Read,
    'write': Write,
    'edit': Edit,
    'multiedit': MultiEdit,
    'notebookedit': NotebookEdit,
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
  padding: 0px 18px 0.2rem;
  position: relative;
}
</style>