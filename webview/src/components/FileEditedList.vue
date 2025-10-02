<template>
  <div v-if="visible && filesEdited.length > 0" class="file-edited-section">
    <!-- Files Edited 头部 -->
    <div
      style="display: flex; justify-content: space-between; align-items: center; height: 24px; cursor: pointer;"
      @click="toggleExpanded"
    >
      <div style="display: flex; align-items: center; gap: 4px; flex-grow: 1; padding-left: 4px;">
        <span
          class="codicon"
          :class="expanded ? 'codicon-chevron-down' : 'codicon-chevron-right'"
          style="color: var(--vscode-foreground); opacity: 0.6; font-size: 12px;"
        />
        <div style="font-size: 12px; color: var(--vscode-input-placeholderForeground); opacity: 0.8;">
          <span>{{ filesEdited.length }} Files Edited</span>
          <span style="margin-left: 8px;">
            <span style="color: var(--vscode-gitDecoration-addedResourceForeground);">+{{ totalAdditions }}</span>
            <span style="color: var(--vscode-gitDecoration-deletedResourceForeground); margin-left: 6px;">-{{ totalDeletions }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Files列表 (当展开时) -->
    <div
      v-if="expanded"
      style="padding: 4px 0;"
    >
      <div
        v-for="(file, index) in filesEdited"
        :key="index"
        class="file-item"
      >
        <span style="color: var(--vscode-foreground);">{{ file.name }}</span>
        <span style="display: flex; gap: 6px;">
          <span style="color: var(--vscode-gitDecoration-addedResourceForeground);">+{{ file.additions || 0 }}</span>
          <span style="color: var(--vscode-gitDecoration-deletedResourceForeground);">-{{ file.deletions || 0 }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FileEdit } from '../../types/toolbar'

interface Props {
  filesEdited?: FileEdit[]
  visible?: boolean
  initialExpanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  filesEdited: () => [],
  visible: false,
  initialExpanded: false
})

const expanded = ref(props.initialExpanded)

const totalAdditions = computed(() => {
  return props.filesEdited.reduce((sum, file) => sum + (file.additions || 0), 0)
})

const totalDeletions = computed(() => {
  return props.filesEdited.reduce((sum, file) => sum + (file.deletions || 0), 0)
})

function toggleExpanded() {
  expanded.value = !expanded.value
}
</script>

<style scoped>
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  transition: background-color 0.1s ease;
  cursor: pointer;
}

.file-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>