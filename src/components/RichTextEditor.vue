<template>
  <div class="rich-text-editor">
    <div class="toolbar">
      <div class="toolbar-section">
        <button
          @click="toggleFormat('bold')"
          :class="{ active: isFormatActive('bold') }"
          class="toolbar-btn"
          type="button"
          title="Bold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          </svg>
        </button>
        <button
          @click="toggleFormat('italic')"
          :class="{ active: isFormatActive('italic') }"
          class="toolbar-btn"
          type="button"
          title="Italic"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="4" x2="10" y2="4" />
            <line x1="14" y1="20" x2="5" y2="20" />
            <line x1="15" y1="4" x2="9" y2="20" />
          </svg>
        </button>
        <button
          @click="toggleFormat('underline')"
          :class="{ active: isFormatActive('underline') }"
          class="toolbar-btn"
          type="button"
          title="Underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
            <line x1="4" y1="21" x2="20" y2="21" />
          </svg>
        </button>
        <button
          @click="toggleFormat('strikethrough')"
          :class="{ active: isFormatActive('strikethrough') }"
          class="toolbar-btn"
          type="button"
          title="Strikethrough"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4H9a3 3 0 0 0-2.83 4" />
            <path d="M14 12a4 4 0 0 1 0 8H6" />
            <line x1="4" y1="12" x2="20" y2="12" />
          </svg>
        </button>
      </div>

      <div class="toolbar-section">
        <select
          v-model="currentFontFamily"
          @change="applyFontFamily"
          class="toolbar-select"
          title="Font Family"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
          <option value="Impact">Impact</option>
        </select>

        <select
          v-model="currentFontSize"
          @change="applyFontSize"
          class="toolbar-select"
          title="Font Size"
        >
          <option v-for="size in fontSizes" :key="size" :value="size">{{ size }}pt</option>
        </select>
      </div>
    </div>

    <div
      ref="editorRef"
      contenteditable="true"
      @input="handleInput"
      @keydown="handleKeyDown"
      @mouseup="updateToolbarState"
      @keyup="updateToolbarState"
      class="editor-content"
      :placeholder="placeholder"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import type { RichText, TextSpan } from '../types'

interface Props {
  modelValue: RichText
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Enter text to engrave'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: RichText): void
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const currentFontFamily = ref('Arial')
const currentFontSize = ref(24)
const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72]

const toggleFormat = (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
  const command = format === 'strikethrough' ? 'strikeThrough' : format
  document.execCommand(command, false)
  updateToolbarState()
  emitChange()
}

const isFormatActive = (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
  const command = format === 'strikethrough' ? 'strikeThrough' : format
  return document.queryCommandState(command)
}

const applyFontFamily = () => {
  document.execCommand('fontName', false, currentFontFamily.value)
  emitChange()
}

const applyFontSize = () => {
  // Convert pt to px for HTML (approximate conversion)
  const pxSize = Math.round(currentFontSize.value * 1.33)
  document.execCommand('fontSize', false, '7') // Use a size we can replace
  const fontElements = editorRef.value?.querySelectorAll('font[size="7"]')
  fontElements?.forEach(el => {
    const span = document.createElement('span')
    span.style.fontSize = `${pxSize}px`
    span.innerHTML = el.innerHTML
    el.replaceWith(span)
  })
  emitChange()
}

const updateToolbarState = () => {
  // Get current font family
  const fontFamily = document.queryCommandValue('fontName')
  if (fontFamily && fontFamily !== 'false') {
    currentFontFamily.value = fontFamily.replace(/["']/g, '')
  }
}

const handleInput = () => {
  emitChange()
}

const handleKeyDown = (e: KeyboardEvent) => {
  // Allow standard keyboard shortcuts
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'b') {
      e.preventDefault()
      toggleFormat('bold')
    } else if (e.key === 'i') {
      e.preventDefault()
      toggleFormat('italic')
    } else if (e.key === 'u') {
      e.preventDefault()
      toggleFormat('underline')
    }
  }
}

const emitChange = () => {
  nextTick(() => {
    const richText = parseEditorContent()
    emit('update:modelValue', richText)
  })
}

const parseEditorContent = (): RichText => {
  if (!editorRef.value) {
    return { spans: [] }
  }

  const spans: TextSpan[] = []
  const walker = document.createTreeWalker(
    editorRef.value,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    null
  )

  let currentSpan: TextSpan | null = null
  const styleStack: Partial<TextSpan>[] = [{}]

  while (walker.nextNode()) {
    const node = walker.currentNode

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      const tagName = element.tagName.toLowerCase()
      const computedStyle = window.getComputedStyle(element)

      const style: Partial<TextSpan> = { ...styleStack[styleStack.length - 1] }

      if (tagName === 'b' || tagName === 'strong' || computedStyle.fontWeight === 'bold' || parseInt(computedStyle.fontWeight) >= 700) {
        style.fontWeight = 'bold'
      }
      if (tagName === 'i' || tagName === 'em' || computedStyle.fontStyle === 'italic') {
        style.fontStyle = 'italic'
      }
      if (tagName === 'u' || computedStyle.textDecoration?.includes('underline')) {
        style.textDecoration = 'underline'
      }
      if (tagName === 's' || tagName === 'strike' || computedStyle.textDecoration?.includes('line-through')) {
        style.textDecoration = 'line-through'
      }
      if (computedStyle.fontFamily) {
        style.fontFamily = computedStyle.fontFamily.replace(/["']/g, '').split(',')[0]
      }
      if (computedStyle.fontSize) {
        const pxSize = parseInt(computedStyle.fontSize)
        style.fontSize = Math.round(pxSize / 1.33) // Convert px to pt
      }

      styleStack.push(style)
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      if (text) {
        const style = styleStack[styleStack.length - 1]
        const span: TextSpan = {
          text,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          fontStyle: style.fontStyle,
          textDecoration: style.textDecoration
        }
        spans.push(span)
      }
    }
  }

  return { spans }
}

const renderRichText = (richText: RichText) => {
  if (!editorRef.value) return

  let html = ''
  for (const span of richText.spans) {
    let text = span.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    let style = ''

    if (span.fontFamily) {
      style += `font-family: ${span.fontFamily};`
    }
    if (span.fontSize) {
      style += `font-size: ${Math.round(span.fontSize * 1.33)}px;`
    }

    let opening = ''
    let closing = ''

    if (span.fontWeight === 'bold') {
      opening = '<b>' + opening
      closing = closing + '</b>'
    }
    if (span.fontStyle === 'italic') {
      opening = '<i>' + opening
      closing = closing + '</i>'
    }
    if (span.textDecoration === 'underline') {
      opening = '<u>' + opening
      closing = closing + '</u>'
    }
    if (span.textDecoration === 'line-through') {
      opening = '<s>' + opening
      closing = closing + '</s>'
    }

    if (style) {
      html += `<span style="${style}">${opening}${text}${closing}</span>`
    } else {
      html += `${opening}${text}${closing}`
    }
  }

  editorRef.value.innerHTML = html || ''
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (editorRef.value && document.activeElement !== editorRef.value) {
      renderRichText(newValue)
    }
  },
  { deep: true }
)

onMounted(() => {
  if (props.modelValue.spans.length > 0) {
    renderRichText(props.modelValue)
  }
})

defineExpose({
  focus: () => editorRef.value?.focus()
})
</script>

<style scoped>
.rich-text-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  flex-wrap: wrap;
}

.toolbar-section {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.toolbar-btn {
  padding: 0.375rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.toolbar-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-select {
  padding: 0.375rem 0.5rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.toolbar-select:hover {
  border-color: #9ca3af;
}

.editor-content {
  min-height: 4rem;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  font-size: 1rem;
  line-height: 1.5;
  outline: none;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.editor-content:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.editor-content:empty:before {
  content: attr(placeholder);
  color: #9ca3af;
  pointer-events: none;
}
</style>
