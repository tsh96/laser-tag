<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__inner">
        <div class="app-header__row">
          <h1 class="app-title">LaserTag</h1>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="app-main__grid">
        <History @names-extracted="handleNamesExtracted" @select-item="handleHistorySelected" />
        <Editor @save="handleSave" ref="editorRef" />
      </div>
    </main>

    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Editor from './components/Editor.vue'
import History from './components/History.vue'
import Toast from './components/Toast.vue'
import { useHistory } from './composables/useHistory'
import type { HistoryItem, LaserSettings } from './types'

const { addHistoryItem } = useHistory()
const editorRef = ref<InstanceType<typeof Editor> | null>(null)
const toastRef = ref<InstanceType<typeof Toast> | null>(null)

const isLaserSettings = (value: unknown): value is LaserSettings => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.width === 'number' &&
    typeof candidate.height === 'number' &&
    typeof candidate.padding === 'number' &&
    (candidate.unit === 'mm' || candidate.unit === 'cm' || candidate.unit === 'in') &&
    typeof candidate.isFlipped === 'boolean' &&
    typeof candidate.fontSize === 'number' &&
    typeof candidate.autoSize === 'boolean'
  )
}

const handleSave = async ({ text, settings }: { text: string; settings: LaserSettings }) => {
  if (!text || text.trim() === '') {
    toastRef.value?.addNotification('Please enter text before saving', 'warning')
    return
  }

  await addHistoryItem(text, settings)
  toastRef.value?.addNotification('Saved to history!', 'success')
}

const handleNamesExtracted = async (names: string[]) => {
  const editorSettings = editorRef.value?.settings

  const settings: LaserSettings = isLaserSettings(editorSettings)
    ? { ...editorSettings }
    : {
      width: 3,
      height: 1,
      padding: 0.5,
      unit: 'in',
      isFlipped: false,
      fontSize: 24,
      autoSize: true
    }

  // Add each name to history
  for (const name of names) {
    await addHistoryItem(name, settings)
  }

  toastRef.value?.addNotification(`Successfully added ${names.length} names to history!`, 'success', 5000)
}

const handleHistorySelected = (item: HistoryItem) => {
  editorRef.value?.loadHistoryItem(item)
  toastRef.value?.addNotification('Loaded history item into editor', 'info', 2000)
}
</script>
