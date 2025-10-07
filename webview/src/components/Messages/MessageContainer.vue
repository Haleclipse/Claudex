<template>
  <div ref="messagesContainerRef" class="messages-container" @scroll="handleScroll">
    <div v-for="(message, index) in messages" :key="message.id || index" class="message-item">
      <!-- 用户消息 -->
      <UserMessage
        v-if="message.role === 'user'"
        :message="message"
        :message-index="index"
        :tab-index="index"
        :is-editing="editingIndex === index"
        :sticky="index === activeStickyIndex"
        @request-edit="handleRequestEdit(index)"
        @cancel-edit="handleCancelEdit"
        @save-edit="handleSaveEdit(index, $event)"
      />

      <!-- 工具消息 -->
      <ToolMessage
        v-else-if="message.role === 'assistant' && message.type === 'tool_use'"
        :tool-use-id="getToolUseId(message)"
        :message-index="index"
        :tab-index="index"
      />

      <!-- 助手消息 -->
      <AssistantMessage
        v-else-if="message.role === 'assistant'"
        :message="message"
        :message-index="index"
        :tab-index="index"
        :streaming="message.streaming"
      />

      <!-- 错误消息 -->
      <ErrorMessage
        v-else-if="message.role === 'error'"
        :message="message"
        :message-index="index"
        :tab-index="index"
      />

      <!-- 系统消息 -->
      <SystemMessage
        v-else-if="message.role === 'system'"
        :message="message"
        :message-index="index"
        :tab-index="index"
      />

      <!-- 未知类型消息：原样输出 -->
      <div
        v-else
        :tabindex="index"
        :data-message-index="index"
        class="raw-message"
      >
        <div class="message-header">
          <span class="codicon codicon-question"></span>
          <span class="message-role">未知消息类型</span>
        </div>
        <pre>{{ JSON.stringify(message, null, 2) }}</pre>
      </div>
    </div>

    <!-- 等待指示器与占位区域（留整页高度） -->
    <div v-if="shouldShowWaiting" :style="{ minHeight: pageHeightPx }" class="waiting-spacer">
      <WaitingIndicator />
    </div>

    <!-- 底部哨兵：用于判断是否处于底部范围内（近底） -->
    <div ref="bottomSentinel" class="bottom-sentinel" aria-hidden="true"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import UserMessage from './UserMessage.vue';
import AssistantMessage from './AssistantMessage.vue';
import SystemMessage from './SystemMessage.vue';
import ErrorMessage from './ErrorMessage.vue';
import ToolMessage from './ToolMessage.vue';
import WaitingIndicator from './WaitingIndicator.vue';
import type { ChatMessage } from '../../../types/messages';

const props = defineProps<{
  messages: ChatMessage[];
}>();

// 暴露根元素给父组件
const messagesContainerRef = ref<HTMLElement>();
const bottomSentinel = ref<HTMLDivElement>();

// 对外暴露：根元素、滚动到底部方法、是否在底部判断
function scrollToBottom(smooth = false) {
  const el = messagesContainerRef.value;
  if (!el) return;
  el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
}

defineExpose({
  $el: messagesContainerRef,
  scrollToBottom,
  isAtBottom: () => isAtBottom.value,
});

interface Emits {
  (e: 'saveEditMessage', index: number, content: string): void;
}

const emit = defineEmits<Emits>();

// 当前正在编辑的消息索引（用于控制单例编辑）
const editingIndex = ref<number | null>(null);

// 当前吸顶的用户消息索引
const activeStickyIndex = ref<number>(-1);

// 视窗内页高（用于等待占位区）
const pageHeight = ref<number>(0);
const pageHeightPx = computed(() => (pageHeight.value > 0 ? `${pageHeight.value}px` : '0px'));

// 是否在底部（近底）
const isAtBottom = ref<boolean>(true);

// 吸顶目标为当前活跃的用户消息索引（用于传递给子组件做 sticky）

// 从工具消息中提取 tool_use_id
function getToolUseId(message: ChatMessage): string {
  if (message.contentBlocks && message.contentBlocks.length > 0) {
    for (const block of message.contentBlocks) {
      if (block.type === 'tool_use' && block.id) {
        return block.id;
      }
    }
  }
  // 如果找不到，返回消息ID作为备用
  return message.id;
}

// 处理编辑请求：更新正在编辑的索引
function handleRequestEdit(requestIndex: number) {
  editingIndex.value = requestIndex;
}

// 取消编辑
function handleCancelEdit() {
  editingIndex.value = null;
}

// 保存编辑
function handleSaveEdit(index: number, content: string) {
  emit('saveEditMessage', index, content);
  editingIndex.value = null;
}

// 判断是否显示等待指示器
const shouldShowWaiting = computed(() => {
  if (props.messages.length === 0) return false;

  const lastMessage = props.messages[props.messages.length - 1];

  // 最后一条是用户消息,且没有正在流式的 assistant 消息
  if (lastMessage.role === 'user') {
    // 检查是否有流式消息
    const hasStreamingAssistant = props.messages.some(
      msg => msg.role === 'assistant' && msg.streaming
    );
    return !hasStreamingAssistant;
  }

  return false;
});

// 计算当前可视区高度
function updatePageHeight() {
  if (!messagesContainerRef.value) return;
  pageHeight.value = messagesContainerRef.value.clientHeight;
}

// 计算当前应吸顶的用户消息索引
function updateActiveSticky() {
  const el = messagesContainerRef.value;
  if (!el) return;
  const containerTop = el.getBoundingClientRect().top;
  const userNodes = Array.from(el.querySelectorAll('.user-message')) as HTMLElement[];
  let candidate = -1;
  let minDiff = Number.POSITIVE_INFINITY;
  for (const node of userNodes) {
    const rect = node.getBoundingClientRect();
    const diff = Math.abs(rect.top - containerTop);
    if (rect.top <= containerTop + 1) {
      if (diff < minDiff) {
        minDiff = diff;
        const idxAttr = node.getAttribute('data-message-index');
        const idx = idxAttr ? parseInt(idxAttr, 10) : -1;
        if (!Number.isNaN(idx)) candidate = idx;
      }
    }
  }
  if (candidate === -1) {
    for (const node of userNodes) {
      const rect = node.getBoundingClientRect();
      const containerRect = el.getBoundingClientRect();
      const intersect = rect.bottom > containerRect.top && rect.top < containerRect.bottom;
      if (intersect) {
        const idxAttr = node.getAttribute('data-message-index');
        const idx = idxAttr ? parseInt(idxAttr, 10) : -1;
        candidate = idx;
        break;
      }
    }
  }
  activeStickyIndex.value = candidate;
}

function handleScroll() {
  updateActiveSticky();
}

// 监听尺寸变化，更新页高与 sticky；同时对最后一项监听高度变化用于流式跟随滚动
let resizeObserver: ResizeObserver | null = null;
let lastItemObserver: ResizeObserver | null = null;
let bottomObserver: IntersectionObserver | null = null;

function observeLastItem() {
  if (lastItemObserver) {
    lastItemObserver.disconnect();
  }
  const el = messagesContainerRef.value;
  if (!el) return;
  const items = el.querySelectorAll('.message-item');
  const last = items[items.length - 1] as HTMLElement | undefined;
  if (!last) return;
  lastItemObserver = new ResizeObserver(() => {
    // 内容增长时，若在底部则自动滚动
    if (isAtBottom.value) {
      requestAnimationFrame(() => scrollToBottom(false));
    }
    // 同时更新一次 sticky
    updateActiveSticky();
  });
  lastItemObserver.observe(last);
}
onMounted(() => {
  updatePageHeight();
  updateActiveSticky();
  observeLastItem();
  if (messagesContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updatePageHeight();
      updateActiveSticky();
    });
    resizeObserver.observe(messagesContainerRef.value);
  }

  // 底部哨兵，判断是否在底部范围（近底）
  if (messagesContainerRef.value && bottomSentinel.value) {
    bottomObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === bottomSentinel.value) {
            isAtBottom.value = entry.isIntersecting;
          }
        }
      },
      {
        root: messagesContainerRef.value,
        // 近底 80px 内视为在底部
        rootMargin: '0px 0px -80px 0px',
        threshold: 0,
      }
    );
    bottomObserver.observe(bottomSentinel.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect();
  if (lastItemObserver) lastItemObserver.disconnect();
  if (bottomObserver) bottomObserver.disconnect();
});

// 当消息变化后，等待渲染完成再更新一次 sticky 与页高
watch(
  () => props.messages.length,
  async () => {
    await nextTick();
    updatePageHeight();
    updateActiveSticky();
    observeLastItem();
    // 新增消息后，如在底部则自动滚动
    if (isAtBottom.value) {
      scrollToBottom(false);
    }
  }
);
</script>

<style scoped>
.messages-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 8px 0;
}



.message-item {
  width: 100%;
  /* 移除 gap,改用 margin 避免影响 sticky */
  margin-bottom: 4px;
}

/* 避免滚动到用户消息时被吸顶标题遮挡 */
:deep(.user-message) {
  scroll-margin-top: 44px;
}

.waiting-spacer {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.bottom-sentinel {
  width: 1px;
  height: 1px;
}

.raw-message {
  display: block;
  outline: none;
  padding: 0px 16px 0.4rem;
  background-color: var(--vscode-sideBar-background);
  opacity: 1;
  z-index: 100;
}

.raw-message .message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.9em;
  color: color-mix(in srgb, var(--vscode-foreground) 70%, transparent);
}

.raw-message .codicon {
  color: var(--vscode-charts-orange);
}

.raw-message .message-role {
  font-weight: 500;
  color: var(--vscode-charts-orange);
}

.raw-message pre {
  background-color: color-mix(in srgb, var(--vscode-editor-background) 50%, transparent);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  padding: 12px;
  margin: 8px 0;
  overflow-x: auto;
  font-family: var(--vscode-editor-font-family);
  /* font-size: var(--vscode-editor-font-size); */
  color: var(--vscode-textPreformat-foreground);
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
