<template>
  <div class="todowrite-container">
    <div class="todo-list-header">
      <div class="todo-list-header-left">
        <div class="todo-list-header-left-title">
          <span class="codicon codicon-checklist todo-list-header-left-title-icon"></span>
          To-dos
          <span class="todo-count">{{ todos.length }}</span>
        </div>
      </div>
      <div class="todo-list-header-right">
        <button class="expander-btn" @click="toggleExpand">
          <span class="codicon" :class="isExpanded ? 'codicon-chevron-down' : 'codicon-chevron-right'"></span>
        </button>
      </div>
    </div>

    <div v-if="isExpanded" class="todo-list-content">
      <ul class="todo-list">
        <li
          v-for="(todo, index) in todos"
          :key="`todo-${index}`"
          class="todo-item"
          :class="getStatusClass(todo.status)"
        >
          <div class="todo-label">
            <div class="todo-item-icon-container">
              <div v-if="todo.status === 'in_progress'" class="todo-in-progress-circle">
                <span class="codicon codicon-arrow-small-right" />
              </div>
              <div
                v-else
                class="todo-item-indicator"
                :class="{ 'has-icon': todo.status === 'completed' }"
              >
                <div
                  v-if="todo.status === 'completed'"
                  class="codicon codicon-check-two"
                  style="font-size: 6px; margin-left: -1px"
                />
              </div>
            </div>
            <span class="todo-content" :class="`todo-${todo.status}`">
              {{ todo.content }}
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Todo {
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  activeForm: string;
}

interface Props {
  toolUse?: any;
  toolResult?: any;
  toolUseResult?: any;
  permissionState?: string;
}

const props = defineProps<Props>();

const isExpanded = ref(true);

const todos = computed(() => {
  // 从 toolUse.input.todos 获取 todo 列表
  return props.toolUse?.input?.todos || [];
});

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'in_progress':
      return 'in-progress';
    case 'completed':
      return 'completed';
    case 'pending':
    default:
      return 'pending';
  }
}
</script>

<style scoped>
.todowrite-container {
  background: color-mix(in srgb, var(--vscode-editor-background) 90%, transparent);
  backdrop-filter: blur(9px) saturate(1.05);
  margin: 4px 0;
  border-radius: 6px;
  overflow: hidden;
}

/* Header */
.todo-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--vscode-panel-border) 50%, transparent);
}

.todo-list-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.todo-list-header-left-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9em;
  font-weight: 600;
  color: var(--vscode-foreground);
}

.todo-list-header-left-title-icon {
  font-size: 14px;
  opacity: 0.8;
}

.todo-count {
  opacity: 0.6;
  font-size: 0.95em;
}

.todo-list-header-right {
  display: flex;
  align-items: center;
}

.expander-btn {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--vscode-foreground);
  cursor: pointer;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.expander-btn:hover {
  background-color: color-mix(in srgb, var(--vscode-list-hoverBackground) 50%, transparent);
}

.expander-btn .codicon {
  font-size: 12px;
}

/* Content */
.todo-list-content {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}

.todo-list {
  list-style: none;
  margin: 0;
  padding: 4px 0;
}

.todo-item {
  padding: 6px 12px;
  transition: background-color 0.2s;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.todo-item:hover {
  background-color: color-mix(in srgb, var(--vscode-list-hoverBackground) 30%, transparent);
}

.todo-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 使用全局样式 .todo-item-icon-container, .todo-item-indicator, .todo-in-progress-circle */

/* Todo content */
.todo-content {
  flex: 1;
  font-size: 0.9em;
  line-height: 1.4;
  color: var(--vscode-foreground);
}

.todo-content.todo-pending {
  opacity: 0.8;
}

.todo-content.todo-in_progress {
  color: var(--vscode-charts-blue);
  font-weight: 500;
}

.todo-content.todo-completed {
  opacity: 0.6;
  text-decoration: line-through;
}

/* Scrollbar styling */
.todo-list-content::-webkit-scrollbar {
  width: 10px;
}

.todo-list-content::-webkit-scrollbar-track {
  background: transparent;
}

.todo-list-content::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--vscode-scrollbarSlider-background) 60%, transparent);
  border-radius: 5px;
}

.todo-list-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--vscode-scrollbarSlider-hoverBackground);
}
</style>
