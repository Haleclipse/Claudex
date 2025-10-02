<template>
  <div class="editor-container">
    <div class="editor-wrapper">
      <div class="scrollable-editor">
        <div class="editor-grid">
          <!-- Main Editable Area -->
          <div
            ref="editorRef"
            class="editor-input"
            :contenteditable="!readonly"
            :spellcheck="false"
            autocapitalize="off"
            role="textbox"
            data-lexical-editor="true"
            @input="handleInput"
            @keydown="handleKeydown"
            @focus="handleFocus"
            @blur="handleBlur"
            :style="editorStyle"
          >
            <p v-if="!modelValue"><br></p>
            <span v-else v-html="formattedContent" />
          </div>
          
          <!-- Placeholder -->
          <div
            v-if="!modelValue && !isFocused"
            class="editor-placeholder"
            :style="placeholderStyle"
          >
            {{ placeholder }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type CSSProperties } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  readonly?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'input', value: string): void
  (e: 'keydown', event: KeyboardEvent): void
  (e: 'focus'): void
  (e: 'blur'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Plan, search, build anything',
  readonly: false
})

const emit = defineEmits<Emits>()

const editorRef = ref<HTMLElement>()
const isFocused = ref(false)

const formattedContent = computed(() => {
  if (!props.modelValue) return ''
  return props.modelValue.replace(/\n/g, '<br>')
})

const editorStyle = computed((): CSSProperties => ({
  resize: 'none',
  gridArea: '1 / 1 / 1 / 1',
  overflow: 'hidden',
  lineHeight: '1.5',
  fontFamily: 'inherit',
  fontSize: '13px',
  color: 'var(--vscode-input-foreground)',
  backgroundColor: 'transparent',
  display: 'block',
  outline: 'none',
  scrollbarWidth: 'none',
  boxSizing: 'border-box',
  border: 'none',
  overflowWrap: 'break-word',
  wordBreak: 'break-word',
  padding: '0px',
  userSelect: 'text',
  whiteSpace: 'pre-wrap'
}))

const placeholderStyle = computed((): CSSProperties => ({
  gridArea: '1 / 2 / 1 / 2',
  position: 'relative',
  top: '0px',
  left: '-100%',
  padding: '0px',
  pointerEvents: 'none',
  userSelect: 'none',
  lineHeight: '1.5',
  fontSize: '13px',
  color: 'var(--vscode-input-placeholderForeground)',
  opacity: '0.5'
}))

function handleInput(event: Event) {
  const target = event.target as HTMLElement
  const content = target.textContent || ''
  emit('update:modelValue', content)
  emit('input', content)
}

function handleKeydown(event: KeyboardEvent) {
  emit('keydown', event)
}

function handleFocus() {
  isFocused.value = true
  emit('focus')
}

function handleBlur() {
  isFocused.value = false
  emit('blur')
}


// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (editorRef.value && editorRef.value.textContent !== newValue) {
      editorRef.value.textContent = newValue
    }
  }
)

// Focus method for external use
function focus() {
  if (editorRef.value) {
    editorRef.value.focus()
  }
}

// Expose focus method
defineExpose({
  focus
})
</script>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  outline: none;
  overflow: hidden;
}

.editor-wrapper {
  position: relative;
  padding-top: 0px;
  cursor: text;
  gap: 0px;
  flex: unset;
}

.scrollable-editor {
  height: 20px;
  min-height: 20px;
  width: 100%;
  max-height: 240px;
  transition: none;
  will-change: height;
  position: relative;
  overflow-y: hidden;
}

.editor-grid {
  display: grid;
  position: relative;
  grid-template-columns: 1fr 1fr;
  width: 200%;
}

.editor-input:focus {
  outline: none;
}

.editor-input p {
  margin: 0;
}

.editor-input p:empty::before {
  content: '\00a0';
  color: transparent;
}
</style>