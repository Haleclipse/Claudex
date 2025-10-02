<template>
  <div class="sessions-page">
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="$emit('switchToChat')">
          <span class="codicon codicon-arrow-left"></span>
        </button>
        <h2 class="page-title">Sessions</h2>
      </div>
      <div class="header-center">
      </div>
      <div class="header-right">
        <button class="icon-btn" @click="toggleSearch" :class="{ active: showSearch }">
          <span class="codicon codicon-search"></span>
        </button>
        <button class="icon-btn" @click="createNewSession">
          <span class="codicon codicon-add"></span>
        </button>
      </div>
    </div>

    <!-- 搜索栏 - 只在需要时显示 -->
    <Motion
      v-if="showSearch"
      class="search-bar"
      :initial="{ opacity: 0, y: -20 }"
      :animate="{ opacity: 1, y: 0 }"
      :exit="{ opacity: 0, y: -20 }"
      :transition="{ duration: 0.2, ease: 'easeOut' }"
    >
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="text"
        placeholder="Search Agent/Chat Threads"
        class="search-input"
        @keydown.escape="hideSearch"
      >
    </Motion>

    <div class="page-content custom-scroll-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载会话历史中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
        <button class="btn-primary" @click="refreshSessions">重试</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="sessionState.sessions.length === 0" class="empty-state">
        <div class="empty-icon">
          <Icon icon="comment-discussion" :size="48" />
        </div>
        <h3>暂无历史会话</h3>
        <p class="empty-hint">开始与 Claude 对话后，会话历史将出现在这里</p>
        <button class="btn-primary" @click="startNewChat">开始新对话</button>
      </div>

      <!-- 会话列表 -->
      <div v-else class="sessions-container">
        <div
          v-for="session in filteredSessions"
          :key="session.id"
          class="session-card"
          @click="openSession(session)"
        >
            <div class="session-card-header">
              <h3 class="session-title">{{ session.label }}</h3>
              <div class="session-date">{{ formatDate(session.timestamp) }}</div>
            </div>

            <div class="session-meta">
              <span class="session-messages">{{ session.messages.length }} 条消息</span>
              <span class="session-id">ID: {{ session.id.slice(0, 8) }}...</span>
            </div>

            <div class="session-preview">
              <div v-if="session.messages.length > 0" class="last-message">
                {{ getLastMessagePreview(session) }}
              </div>
              <div v-else class="no-messages">尚无对话内容</div>
            </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { Motion } from 'motion-v';
import { sessionState, requestSessionList, loadSession, createNewSession as createSession } from '../services/messageBus';
import Icon from '../components/Icon.vue';

// 定义事件
const emit = defineEmits<{
  switchToChat: [sessionId?: string];
}>();

// 组件状态
const loading = ref(true);
const error = ref('');
const sortBy = ref('timestamp');
const searchQuery = ref('');
const showSearch = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);


// 计算属性
const filteredSessions = computed(() => {
  let filtered = sessionState.sessions;

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(session =>
      session.label.toLowerCase().includes(query) ||
      session.id.toLowerCase().includes(query)
    );
  }

  // 排序
  return [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'timestamp':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'label':
        return a.label.localeCompare(b.label);
      case 'messageCount':
        return b.messages.length - a.messages.length;
      default:
        return 0;
    }
  });
});

// 方法
const refreshSessions = async () => {
  loading.value = true;
  error.value = '';

  try {
    requestSessionList();
    // sessionState.sessions 会自动更新
  } catch (err) {
    error.value = `加载会话失败: ${err}`;
  } finally {
    loading.value = false;
  }
};


const openSession = (session: any) => {
  loadSession(session.id);
  emit('switchToChat', session.id);
};


const createNewSession = () => {
  createSession();
  emit('switchToChat');
};

const startNewChat = () => {
  emit('switchToChat');
};

// 搜索功能
const toggleSearch = async () => {
  showSearch.value = !showSearch.value;
  if (showSearch.value) {
    await nextTick();
    searchInput.value?.focus();
  } else {
    searchQuery.value = '';
  }
};

const hideSearch = () => {
  showSearch.value = false;
  searchQuery.value = '';
};

// 工具方法
const formatDate = (timestamp: Date | string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) {
    return '刚刚';
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else {
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  }
};

const getLastMessagePreview = (session: any) => {
  if (session.messages.length === 0) {
    return '无消息';
  }

  const lastMessage = session.messages[session.messages.length - 1];
  let content = '';

  if (lastMessage.message?.content) {
    if (typeof lastMessage.message.content === 'string') {
      content = lastMessage.message.content;
    } else if (Array.isArray(lastMessage.message.content)) {
      const textBlocks = lastMessage.message.content.filter((block: any) => block.type === 'text');
      content = textBlocks.map((block: any) => block.text).join(' ');
    }
  }

  return content.length > 80 ? content.substring(0, 80) + '...' : content;
};

// 生命周期
onMounted(() => {
  refreshSessions();
});
</script>

<style scoped>
.sessions-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* background: var(--vscode-editor-background); */
  color: var(--vscode-editor-foreground);
}

.page-header {
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

.header-center {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.back-btn {
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
}

.back-btn .codicon {
  font-size: 12px;
}

.back-btn:hover {
  background: var(--vscode-toolbar-hoverBackground);
}

.page-title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--vscode-titleBar-activeForeground);
}

.header-right {
  display: flex;
  gap: 4px;
}

.icon-btn {
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

.icon-btn .codicon {
  font-size: 12px;
}

.icon-btn:hover {
  background: var(--vscode-toolbar-hoverBackground);
  opacity: 1;
}

.icon-btn.active {
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  opacity: 1;
}

.search-bar {
  border-bottom: 1px solid var(--vscode-panel-border);
  background: var(--vscode-sideBar-background);
}

.search-bar .search-input {
  width: 100%;
  padding: 2px 8px;
  border: 1px solid var(--vscode-input-border);
  background: var(--vscode-input-background);
  color: var(--vscode-input-foreground);
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.search-bar .search-input:focus {
  border-color: var(--vscode-focusBorder);
}

.btn-primary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: baseline;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.btn-primary {
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
}

.btn-primary:hover {
  background: var(--vscode-button-hoverBackground);
}

.btn-secondary {
  background: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
}

.btn-secondary:hover {
  background: var(--vscode-button-secondaryHoverBackground);
}

.page-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  flex: 1;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--vscode-progressBar-background);
  border-top: 2px solid var(--vscode-progressBar-activeForeground);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: var(--vscode-errorForeground);
  margin-bottom: 16px;
}

.empty-state {
  gap: 16px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.6;
}

.empty-icon .codicon {
  font-size: 48px;
}

.empty-state h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.empty-hint {
  color: var(--vscode-descriptionForeground);
  font-size: 14px;
  margin: 0;
}

.sessions-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.session-card {
  border: 1px solid var(--vscode-panel-border);
  border-radius: 8px;
  padding: 16px;
  background: var(--vscode-editor-background);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  height: 120px;
}

.session-card:hover {
  border-color: var(--vscode-focusBorder);
  background: var(--vscode-list-hoverBackground);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.session-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.session-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  word-break: break-word;
}

.session-date {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  white-space: nowrap;
}

.session-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
}

.session-preview {
  flex: 1;
  min-height: 40px;
}

.last-message {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.no-messages {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
  font-style: italic;
}

</style>