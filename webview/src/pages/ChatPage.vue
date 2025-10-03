<template>
  <div class="chat-page">
    <!-- Chat 页面顶部标题栏 -->
    <div class="chat-header">
      <div class="header-left">
        <button class="menu-btn" @click="$emit('switchToSessions')">
          <span class="codicon codicon-menu"></span>
        </button>
        <h2 class="chat-title">{{ chatTitle }}</h2>
      </div>
      <div class="header-right">
        <button class="new-chat-btn" @click="handleNewChat" title="新开对话">
          <span class="codicon codicon-plus"></span>
        </button>
      </div>
    </div>

    <main class="main">
      <MessageContainer
        :messages="chatState.messages"
        @edit-message="handleEditMessage"
        class="custom-scroll-container"
      />

      <!-- 下方输入区域  -->
      <div class="input-area-container">

        <!-- InputExtraBox区域 -->
        <InputExtraBox
          :todos="sampleTodos"
          :files-edited="sampleFiles"
          :queued-messages="messageQueueState.queuedMessages"
          :show-todos="showTodoList"
          :show-files="showFileList"
          :show-queue="true"
          @todo-toggle="handleTodoToggle"
          @queue-remove="handleQueueRemove"
          @queue-send-now="handleQueueSendNow"
        />

        <!-- 输入框 -->
        <ChatInputBox
          :show-progress="true"
          :progress-percentage="progressPercentage"
          :selected-model="selectedModel"
          :conversation-working="conversationWorking"
          :show-search="false"
          @submit="handleSubmit"
          @queue-message="handleQueueMessage"
          @stop="handleStop"
          @input="handleInput"
          @attach="handleAttach"
          @image="handleImage"
          @search="handleSearch"
          @add-context="handleAddContext"
          @agent-dropdown="handleAgentDropdown"
          @model-dropdown="handleModelDropdown"
        />

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  chatState,
  sessionState,
  messageQueueState,
  sendChatMessage,
  addMessageToQueue,
  removeMessageFromQueue,
  processNextQueuedMessage,
  interruptChat,
  createNewSession
} from '../services/messageBus';
import ChatInputBox from '../components/ChatInputBox.vue';
import InputExtraBox from '../components/InputExtraBox.vue';
import MessageContainer from '../components/Messages/MessageContainer.vue';
import type { Todo, FileEdit } from '../../types/toolbar';
import { modelState } from '../services/messageBus';

// 定义事件
const emit = defineEmits<{
  switchToSessions: [];
}>();

const progressPercentage = ref(48.7);
const selectedModel = computed(() => modelState.selected);

// 计算聊天标题
const chatTitle = computed(() => {
  // 如果有当前会话ID，查找对应的会话标题
  if (sessionState.currentSessionId) {
    const currentSession = sessionState.sessions.find(
      session => session.id === sessionState.currentSessionId
    );
    if (currentSession && currentSession.label) {
      return currentSession.label;
    }
  }

  // 如果没有找到会话或会话没有标题，显示默认标题
  return 'New Chat';
});

// 计算对话工作状态
const conversationWorking = computed(() => {
  return chatState.currentRequest !== null;
});

// 控制 Todo 和 File List 显示
const showTodoList = ref(false);
const showFileList = ref(false);

// Sample data for demonstration
const sampleTodos = ref<Todo[]>([
  { content: '创建 PKCE 服务：生成 code_verifier/code_challenge (S256)', status: 'pending', activeForm: '创建 PKCE 服务：生成 code_verifier/code_challenge (S256)' },
  { content: '实现本地回调服务器：127.0.0.1:54545/callback，仅登录期间存活', status: 'pending', activeForm: '实现本地回调服务器：127.0.0.1:54545/callback，仅登录期间存活' },
  { content: '完善 OAuth 服务：支持 Console/Claude AI 两种授权入口', status: 'in_progress', activeForm: '完善 OAuth 服务：支持 Console/Claude AI 两种授权入口' },
  { content: '实现令牌刷新逻辑：提前 5 分钟自动刷新，失败时回退登录', status: 'pending', activeForm: '实现令牌刷新逻辑：提前 5 分钟自动刷新，失败时回退登录' },
  { content: '增强存储服务：keytar 存敏感令牌，electron-store 存非敏信息', status: 'pending', activeForm: '增强存储服务：keytar 存敏感令牌，electron-store 存非敏信息' },
  { content: '实现角色/订阅获取：调用 /roles 和 /profile 端点', status: 'pending', activeForm: '实现角色/订阅获取：调用 /roles 和 /profile 端点' },
  { content: '创建 API Key 功能：可选调用 create_api_key 端点', status: 'pending', activeForm: '创建 API Key 功能：可选调用 create_api_key 端点' },
  { content: '实现手动回填模式：当本地回调端口不可用时的备用方案', status: 'pending', activeForm: '实现手动回填模式：当本地回调端口不可用时的备用方案' }
]);

const sampleFiles = ref<FileEdit[]>([
  { name: 'src/auth/oauth.ts', additions: 45, deletions: 12 },
  { name: 'src/auth/storage.ts', additions: 28, deletions: 5 },
  { name: 'src/types/auth.ts', additions: 17, deletions: 3 }
]);

function handleSubmit(content: string) {
  if (!content.trim()) return;
  sendChatMessage(content);
}

function handleQueueMessage(content: string) {
  if (!content.trim()) return;
  addMessageToQueue(content);
}

function handleStop() {
  interruptChat();
}

function handleQueueRemove(messageId: string) {
  removeMessageFromQueue(messageId);
}

function handleQueueSendNow(messageId: string) {
  // 找到该消息
  const message = messageQueueState.queuedMessages.find(msg => msg.id === messageId);
  if (!message) return;

  // 1. 先中断当前对话（如果正在进行）
  if (conversationWorking.value) {
    interruptChat();
  }

  // 2. 从队列中移除该消息
  removeMessageFromQueue(messageId);

  // 3. 立即发送该消息
  setTimeout(() => {
    sendChatMessage(message.content);
  }, 100); // 短暂延迟确保中断操作完成
}

function handleInput(content: string) {
  console.log('Input changed:', content);
}

function handleAttach() {
  console.log('Attach clicked');
}

function handleImage() {
  console.log('Image button clicked');
}

function handleSearch(query: string) {
  console.log('Search query:', query);
}

function handleAddContext() {
  console.log('Add Context clicked');
}

function handleAgentDropdown() {
  console.log('Agent dropdown clicked');
}

function handleModelDropdown() {
  console.log('Model dropdown clicked');
}

function handleTodoToggle(index: number) {
  const todo = sampleTodos.value[index];
  if (todo) {
    if (todo.status === 'pending') {
      todo.status = 'in_progress';
    } else if (todo.status === 'in_progress') {
      todo.status = 'completed';
    } else {
      todo.status = 'pending';
    }
  }
}

function handleEditMessage(index: number) {
  console.log('Edit message at index:', index);
  // TODO: 实现消息编辑功能
}

// 控制 Todo 和 File List 显示的函数
function showTodos() {
  showTodoList.value = true;
}

function hideTodos() {
  showTodoList.value = false;
}

function showFiles() {
  showFileList.value = true;
}

function hideFiles() {
  showFileList.value = false;
}

function handleNewChat() {
  // 创建新会话并重置当前状态
  createNewSession();
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--vscode-panel-border);
  min-height: 32px;
  padding: 0 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--vscode-titleBar-activeForeground);
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.2s;
  opacity: 0.7;
}

.menu-btn .codicon {
  font-size: 12px;
}

.menu-btn:hover {
  background: var(--vscode-toolbar-hoverBackground);
  opacity: 1;
}

.chat-title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--vscode-titleBar-activeForeground);
}

.header-right {
  display: flex;
  gap: 4px;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--vscode-titleBar-activeForeground);
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.2s;
  opacity: 0.7;
}

.new-chat-btn .codicon {
  font-size: 12px;
}

.new-chat-btn:hover {
  background: var(--vscode-toolbar-hoverBackground);
  opacity: 1;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 消息容器撑起剩余高度 */
.main > :first-child {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 0;
}

/* 输入区域容器 */
.input-area-container {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  position: relative;
  margin: 0px 10px 10px;
  width: 100%;
  align-self: center;
  padding: 0 12px;
}

/* 底部对话框区域钉在底部 */
.main > :last-child {
  flex-shrink: 0;
  background-color: var(--vscode-sideBar-background);
  /* border-top: 1px solid var(--vscode-panel-border); */
  max-width: 1200px;
  width: 100%;
  align-self: center;
}
</style>
