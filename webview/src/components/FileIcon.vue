<template>
  <div class="show-file-icons">
    <div class="file-icon-wrapper">
      <div class="file-icon-inner">
        <div class="file-icon" :class="getFileIconClass(fileName)"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  fileName: string
}

defineProps<Props>()

function getFileIconClass(fileName: string): string {
  if (!fileName) return 'monaco-icon-label file-icon ext-file-icon'
  
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'ts':
      return 'monaco-icon-label file-icon ts-ext-file-icon ext-file-icon typescript-lang-file-icon'
    case 'js':
      return 'monaco-icon-label file-icon js-ext-file-icon ext-file-icon javascript-lang-file-icon'
    case 'html':
      return 'monaco-icon-label file-icon html-ext-file-icon ext-file-icon html-lang-file-icon'
    case 'css':
      return 'monaco-icon-label file-icon css-ext-file-icon ext-file-icon css-lang-file-icon'
    case 'vue':
      return 'monaco-icon-label file-icon vue-ext-file-icon ext-file-icon vue-lang-file-icon'
    case 'json':
      return 'monaco-icon-label file-icon json-ext-file-icon ext-file-icon json-lang-file-icon'
    case 'md':
      return 'monaco-icon-label file-icon md-ext-file-icon ext-file-icon markdown-lang-file-icon'
    case 'lock':
      return 'monaco-icon-label file-icon lock-ext-file-icon ext-file-icon'
    default:
      return 'monaco-icon-label file-icon ext-file-icon'
  }
}
</script>

<style scoped>
/* 使用全局样式 */
</style>