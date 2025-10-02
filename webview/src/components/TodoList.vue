<template>
  <div v-if="visible" class="todo-list-section">
    <!-- Todo 头部 -->
    <div
      style="display: flex; align-items: center; height: 24px; cursor: pointer;"
      @click="toggleExpanded"
    >
      <div style="display: flex; align-items: center; gap: 4px; flex-grow: 1; padding-left: 4px;">
        <span
          class="codicon"
          :class="expanded ? 'codicon-chevron-down' : 'codicon-chevron-right'"
          style="color: var(--vscode-foreground); opacity: 0.6; font-size: 12px; transition: transform 0.1s;"
        />
        <div style="font-size: 12px; color: var(--vscode-input-placeholderForeground); opacity: 0.8;">
          {{ todos.length }} To-dos
        </div>
      </div>
    </div>

    <!-- Todo列表 -->
    <div
      v-if="expanded && todos.length > 0"
      style="height: 190px; overflow: hidden; padding-bottom: 3px;"
    >
      <div class="custom-scrollbar" style="height: 100%; overflow-y: auto;">
        <ul class="todo-list fade-in-fast" style="margin: 0; padding: 0; list-style: none;">
          <li
            v-for="(todo, index) in todos"
            :key="index"
            class="todo-item fade-in-todo"
            :class="todo.status"
            @click="toggleTodo(index)"
          >
            <div class="todo-item-icon-container">
              <div
                v-if="todo.status === 'in_progress'"
                class="todo-in-progress-circle"
              >
                <span class="codicon codicon-arrow-small-right" />
              </div>
              <div
                v-else
                class="todo-item-indicator"
                :class="{ 'has-icon': todo.status === 'completed' }"
              >
                <div
                  v-if="todo.status === 'completed'"
                  class="codicon codicon-x"
                  style="font-size: 10px;"
                />
              </div>
            </div>
            <div class="todo-item-content">
              <span
                class="todo-item-text"
                :class="{ 'todo-in-progress': todo.status === 'in_progress' }"
              >
                {{ todo.content }}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Todo } from '../../types/toolbar'

interface Props {
  todos?: Todo[]
  visible?: boolean
  initialExpanded?: boolean
}

interface Emits {
  (e: 'todoToggle', index: number): void
}

const props = withDefaults(defineProps<Props>(), {
  todos: () => [],
  visible: false,
  initialExpanded: true
})

const emit = defineEmits<Emits>()

const expanded = ref(props.initialExpanded)

function toggleExpanded() {
  expanded.value = !expanded.value
}

function toggleTodo(index: number) {
  emit('todoToggle', index)
}
</script>

<style scoped>
/* 自定义滚动条样式 - 默认隐藏，hover时显示 */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 4px;
  border: none;
  transition: background-color 0.2s ease;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: var(--vscode-scrollbarSlider-background);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--vscode-scrollbarSlider-hoverBackground);
}

.custom-scrollbar::-webkit-scrollbar-corner {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-button {
  display: none;
}

/* Firefox 滚动条样式 */
.custom-scrollbar {
  scrollbar-width: none;
}

.custom-scrollbar:hover {
  scrollbar-width: thin;
  scrollbar-color: var(--vscode-scrollbarSlider-background) transparent;
}
</style>