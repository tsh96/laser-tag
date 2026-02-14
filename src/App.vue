<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__inner">
        <div class="app-header__row">
          <h1 class="app-title">LaserTag</h1>
          <span class="app-badge">
            1-bit BMP
          </span>
        </div>
        <p class="app-subtitle">
          Laser engraving label studio with live preview, quick export, and AI-assisted batch name extraction.
        </p>
      </div>
    </header>

    <main class="app-main">
      <div class="app-main__grid">
        <Editor @save="handleSave" ref="editorRef" />
        <AIUpload @names-extracted="handleNamesExtracted" />
      </div>

      <History ref="historyRef" />
    </main>

    <footer class="app-footer">
      <div class="app-footer__inner">
        LaserTag PWA · Built with Vue, Firebase, and Gemini AI
      </div>
    </footer>

    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Editor from './components/Editor.vue'
import AIUpload from './components/AIUpload.vue'
import History from './components/History.vue'
import Toast from './components/Toast.vue'
import { useHistory } from './composables/useHistory'
import type { LaserSettings } from './types'

const { addHistoryItem } = useHistory()
const editorRef = ref<InstanceType<typeof Editor> | null>(null)
const toastRef = ref<InstanceType<typeof Toast> | null>(null)
const historyRef = ref<InstanceType<typeof History> | null>(null)

const handleSave = async ({ text, settings }: { text: string; settings: LaserSettings }) => {
  if (!text || text.trim() === '') {
    toastRef.value?.addNotification('Please enter text before saving', 'warning')
    return
  }
  
  await addHistoryItem(text, settings)
  toastRef.value?.addNotification('Saved to history!', 'success')
}

const handleNamesExtracted = async (names: string[]) => {
  // Get current settings from editor
  const settings: LaserSettings = editorRef.value ? {
    width: editorRef.value.settings.width,
    height: editorRef.value.settings.height,
    padding: editorRef.value.settings.padding,
    unit: editorRef.value.settings.unit,
    isFlipped: editorRef.value.settings.isFlipped
  } : {
    width: 3,
    height: 1,
    padding: 0.5,
    unit: 'in',
    isFlipped: false
  }
  
  // Add each name to history
  for (const name of names) {
    await addHistoryItem(name, settings)
  }
  
  toastRef.value?.addNotification(`Successfully added ${names.length} names to history!`, 'success', 5000)
}
</script>
