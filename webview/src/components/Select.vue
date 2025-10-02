<template>
  <div ref="selectRef" class="custom-select" :class="{ open: isOpen }">
    <button
      class="select-button"
      @click="toggleDropdown"
      :class="{ active: isOpen }"
    >
      <span class="select-text">{{ selectedLabel }}</span>
      <span class="codicon codicon-chevron-down select-icon" :class="{ rotated: isOpen }"></span>
    </button>

    <Motion
      v-if="isOpen"
      class="select-dropdown"
      :initial="{ opacity: 0, scale: 0.95, y: -10 }"
      :animate="{ opacity: 1, scale: 1, y: 0 }"
      :exit="{ opacity: 0, scale: 0.95, y: -10 }"
      :transition="{ duration: 0.15, ease: 'easeOut' }"
    >
      <div
        v-for="option in options"
        :key="option.value"
        class="select-option"
        :class="{ selected: option.value === modelValue }"
        @click="selectOption(option)"
      >
        {{ option.label }}
      </div>
    </Motion>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Motion } from 'motion-v';

export interface SelectOption {
  label: string;
  value: string;
}

interface Props {
  modelValue: string;
  options: SelectOption[];
  placeholder?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择'
});

const emit = defineEmits<Emits>();

const isOpen = ref(false);
const selectRef = ref<HTMLElement | null>(null);

const selectedLabel = computed(() => {
  const selected = props.options.find(option => option.value === props.modelValue);
  return selected?.label || props.placeholder;
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
};

const selectOption = (option: SelectOption) => {
  emit('update:modelValue', option.value);
  emit('change', option.value);
  isOpen.value = false;
};

// 点击外部关闭下拉菜单
const handleClickOutside = (event: Event) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.custom-select {
  position: relative;
  display: inline-block;
  user-select: none;
}

.select-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 6px;
  min-width: 120px;
  border: 1px solid var(--vscode-input-border);
  background: var(--vscode-input-background);
  color: var(--vscode-input-foreground);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  white-space: nowrap;
  user-select: none;
}

.select-button:hover {
  border-color: var(--vscode-focusBorder);
}

.select-button.active {
  border-color: var(--vscode-focusBorder);
  background: var(--vscode-input-background);
}

.select-text {
  flex: 1;
  text-align: left;
}

.select-icon {
  font-size: 12px;
  transition: transform 0.2s;
}

.select-icon.rotated {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--vscode-dropdown-background);
  border: 1px solid var(--vscode-dropdown-border);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  margin-top: 2px;
}

.select-option {
  padding: 3px 6px;
  cursor: pointer;
  font-size: 12px;
  color: var(--vscode-dropdown-foreground);
  transition: background-color 0.2s;
  user-select: none;
}

.select-option:hover {
  background: var(--vscode-list-hoverBackground);
}

.select-option.selected {
  background: var(--vscode-list-activeSelectionBackground);
  color: var(--vscode-list-activeSelectionForeground);
}

.select-option:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.select-option:last-child {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
</style>