<template>
  <div v-if="shouldShow" style="padding: 0px 8px;">
    <div class="toolbar-section">
      <TodoList
        :todos="todos"
        :visible="showTodos"
        @todo-toggle="$emit('todoToggle', $event)"
      />
      <!-- 分割线 - Todo 和 Queue 之间 -->
      <div
        v-if="shouldShowTodoQueueDivider"
        style="height: 1px; background: color-mix(in srgb, var(--vscode-input-border, var(--vscode-widget-border)) 40%, transparent); margin: 2px -5px;"
      />
      <MessageQueueList
        :queued-messages="queuedMessages"
        :visible="showQueue"
        @remove="$emit('queueRemove', $event)"
        @send-now="$emit('queueSendNow', $event)"
      />
      <!-- 分割线 - Queue 和 Files 之间 -->
      <div
        v-if="shouldShowQueueFilesDivider"
        style="height: 1px; background: color-mix(in srgb, var(--vscode-input-border, var(--vscode-widget-border)) 40%, transparent); margin: 2px -5px;"
      />
      <FileEditedList
        :files-edited="filesEdited"
        :visible="showFiles"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TodoList from './TodoList.vue'
import FileEditedList from './FileEditedList.vue'
import MessageQueueList from './MessageQueueList.vue'
import type { Todo, FileEdit } from '../../types/toolbar'
import type { QueuedMessage } from '../../types/queue'

interface Props {
  todos?: Todo[]
  filesEdited?: FileEdit[]
  queuedMessages?: QueuedMessage[]
  showTodos?: boolean
  showFiles?: boolean
  showQueue?: boolean
}

interface Emits {
  (e: 'todoToggle', index: number): void
  (e: 'queueRemove', messageId: string): void
  (e: 'queueSendNow', messageId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  todos: () => [],
  filesEdited: () => [],
  queuedMessages: () => [],
  showTodos: false,
  showFiles: false,
  showQueue: false
})

defineEmits<Emits>()

// 内部显示逻辑：当有任一项需要显示时才显示整个容器
const shouldShow = computed(() => {
  const hasTodos = props.showTodos && props.todos.length > 0
  const hasFiles = props.showFiles && props.filesEdited.length > 0
  const hasQueue = props.showQueue && props.queuedMessages.length > 0
  return hasTodos || hasFiles || hasQueue
})

// Todo 与 Queue 之间的分割线
const shouldShowTodoQueueDivider = computed(() => {
  const hasTodos = props.showTodos && props.todos.length > 0
  const hasQueue = props.showQueue && props.queuedMessages.length > 0
  return hasTodos && hasQueue
})

// Queue 与 Files 之间的分割线
const shouldShowQueueFilesDivider = computed(() => {
  const hasQueue = props.showQueue && props.queuedMessages.length > 0
  const hasFiles = props.showFiles && props.filesEdited.length > 0
  return hasQueue && hasFiles
})
</script>