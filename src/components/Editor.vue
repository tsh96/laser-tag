<template>
  <section class="panel-card editor-card">
    <div class="panel-head">
      <div class="flex items-center justify-between w-full">
        <h2 class="panel-title">Editor</h2>
      </div>
    </div>

    <div class="editor-grid">
      <div class="field-group">
        <label class="field-label">Width</label>
        <div class="input-with-unit">
          <input v-model.number="settings.width" type="number" min="0.1" step="0.1" class="field-control" />
          <span class="input-unit">{{ settings.unit }}</span>
        </div>
      </div>

      <div class="field-group">
        <label class="field-label">Height</label>
        <div class="input-with-unit">
          <input v-model.number="settings.height" type="number" min="0.1" step="0.1" class="field-control" />
          <span class="input-unit">{{ settings.unit }}</span>
        </div>
      </div>

      <div class="field-group">
        <label class="field-label">Logo Padding</label>
        <div class="input-with-unit">
          <input v-model.number="settings.padding" type="number" min="0" step="0.1" class="field-control" />
          <span class="input-unit">{{ settings.unit }}</span>
        </div>
      </div>

      <div class="field-group">
        <label class="field-label">Unit</label>
        <select v-model="settings.unit" class="field-control select-control">
          <option value="mm">mm</option>
          <option value="cm">cm</option>
          <option value="in">in</option>
        </select>
      </div>

      <div class="field-group">
        <label class="field-label">Font Size</label>
        <div class="input-with-unit">
          <input v-model.number="settings.fontSize" type="number" min="1" step="1" class="field-control"
            :disabled="settings.autoSize || useRichTextMode" />
          <span class="input-unit">pt</span>
        </div>
      </div>

      <div v-if="settings.autoSize" class="field-group">
        <label class="field-label">Max Font Size</label>
        <div class="input-with-unit">
          <input v-model.number="settings.maxFontSize" type="number" min="1" step="1" class="field-control"
            :disabled="!settings.autoSize" />
          <span class="input-unit">pt</span>
        </div>
      </div>


      <div class="field-group">
        <label class="field-label">Load Preset</label>
        <select v-model="selectedPresetId" @change="applyPreset" class="field-control select-control">
          <option value="">Select a preset...</option>
          <option v-for="preset in presets" :key="preset.id" :value="preset.id">{{ preset.name }}</option>
        </select>
      </div>

      <div class="field-group">
        <label class="field-label">Save Preset</label>
        <button @click="savePresetSettings" class="field-control btn-secondary"
          style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
          </svg>
          Save
        </button>
      </div>
    </div>

    <div class="stack-gap-md">
      <div class="flex items-center justify-between">
        <label class="field-label">Text</label>
        <div class="flex items-center gap-2">
          <button @click="convertToUppercase" class="btn-secondary"
            style="padding: 0.375rem 0.5rem; font-size: 0.875rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
            Uppercase
          </button>
          <label class="check-wrap">
            <input v-model="useRichTextMode" type="checkbox" class="check-input"
              @change="triggerRichTextMode(($event.target as HTMLInputElement).checked)" />
            <span class="check-label whitespace-nowrap">Rich Text Mode</span>
          </label>
        </div>
      </div>
      <RichTextEditor v-if="useRichTextMode" v-model="richText" placeholder="Enter text to engrave" />
      <textarea v-else v-model="text" placeholder="Enter text to engrave" class="field-control" rows="2"></textarea>
    </div>

    <div class="stack-gap-md flex flex-wrap gap-x-6 gap-y-2">
      <label class="check-wrap">
        <input v-model="settings.autoSize" type="checkbox" class="check-input" />
        <span class="check-label">Auto Size</span>
      </label>
      <label class="check-wrap">
        <input v-model="settings.isFlipped" type="checkbox" class="check-input" />
        <span class="check-label">Flip Horizontally</span>
      </label>
    </div>

    <div class="preview-shell">
      <p class="preview-label">Live Preview</p>
      <div class="preview-stage">
        <canvas ref="canvasRef" class="preview-canvas" style="max-width: 100%; height: auto;" />
      </div>
    </div>

    <div class="action-row main-actions">
      <button @click="saveToHistory" class="btn-secondary action-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        {{ currentHistoryId ? 'Save as New' : 'Save to History' }}
      </button>
      <button @click="exportBMP" class="btn-primary action-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export BMP
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useStorage, watchDebounced } from '@vueuse/core'
import { renderCanvas, renderRichTextCanvas } from '../utils/canvas'
import { generateBMP, downloadBMP, overwriteBMP } from '../utils/bmp'
import { deleteField } from 'firebase/firestore'
import { useHistory } from '../composables/useHistory'
import { usePresets } from '../composables/usePresets'
import RichTextEditor from './RichTextEditor.vue'
import type { HistoryItem, LaserSettings, RichText } from '../types'

const SETTINGS_STORAGE_KEY = 'lasertag-global-settings'

const DEFAULT_SETTINGS: LaserSettings = {
  width: 3,
  height: 1,
  padding: 0.5,
  unit: 'in',
  isFlipped: false,
  fontSize: 24,
  autoSize: true,
  useRichTextMode: true,
  maxFontSize: 32
}

const isValidUnit = (value: unknown): value is LaserSettings['unit'] => {
  return value === 'mm' || value === 'cm' || value === 'in'
}

const sanitizeSettings = (value: Partial<LaserSettings>): LaserSettings => {
  return {
    width: typeof value.width === 'number' && value.width > 0 ? value.width : DEFAULT_SETTINGS.width,
    height: typeof value.height === 'number' && value.height > 0 ? value.height : DEFAULT_SETTINGS.height,
    padding: typeof value.padding === 'number' && value.padding >= 0 ? value.padding : DEFAULT_SETTINGS.padding,
    unit: isValidUnit(value.unit) ? value.unit : DEFAULT_SETTINGS.unit,
    isFlipped: typeof value.isFlipped === 'boolean' ? value.isFlipped : DEFAULT_SETTINGS.isFlipped,
    fontSize: typeof value.fontSize === 'number' && value.fontSize > 0 ? value.fontSize : DEFAULT_SETTINGS.fontSize,
    autoSize: typeof value.autoSize === 'boolean' ? value.autoSize : DEFAULT_SETTINGS.autoSize,
    useRichTextMode: typeof value.useRichTextMode === 'boolean' ? value.useRichTextMode : DEFAULT_SETTINGS.useRichTextMode,
    maxFontSize: typeof value.maxFontSize === 'number' && value.maxFontSize > 0 ? value.maxFontSize : DEFAULT_SETTINGS.maxFontSize
  }
}

const { addHistoryItem, updateHistoryItem } = useHistory()
const { savePreset, presets } = usePresets()
const currentHistoryId = ref<string | null>(null)
const selectedPresetId = ref('')
const canvasRef = ref<HTMLCanvasElement | null>(null)
const text = ref('Sample Text')
const isLoading = ref(false)
const useRichTextMode = computed({
  get: () => settings.useRichTextMode,
  set: (value: boolean) => {
    settings.useRichTextMode = value
  }
})

const storedSettings = useStorage<LaserSettings>(
  SETTINGS_STORAGE_KEY,
  { ...DEFAULT_SETTINGS },
  localStorage,
  {
    serializer: {
      read: (raw) => {
        try {
          return sanitizeSettings(JSON.parse(raw) as Partial<LaserSettings>)
        } catch {
          return { ...DEFAULT_SETTINGS }
        }
      },
      write: (value) => JSON.stringify(sanitizeSettings(value))
    }
  }
)

const settings = reactive<LaserSettings>(sanitizeSettings(storedSettings.value))
const richText = ref<RichText>({ spans: [{ text: 'Sample Text', fontSize: settings.fontSize, fontFamily: 'Arial' }] })

watch(
  settings,
  (nextSettings) => {
    storedSettings.value = sanitizeSettings({ ...nextSettings })
  },
  { deep: true }
)

watch(
  storedSettings,
  (nextStoredSettings) => {
    Object.assign(settings, sanitizeSettings(nextStoredSettings))
  },
  { deep: true }
)

const updateCanvas = () => {
  if (canvasRef.value) {
    let actualFontSize: number | null = null

    if (useRichTextMode.value) {
      actualFontSize = renderRichTextCanvas(canvasRef.value, richText.value, settings)
    } else {
      actualFontSize = renderCanvas(canvasRef.value, text.value, settings)
    }

    if (settings.autoSize && typeof actualFontSize === 'number') {
      const roundedAutoFontSize = Math.round(actualFontSize)
      if (settings.fontSize !== roundedAutoFontSize) {
        settings.fontSize = roundedAutoFontSize
      }
    }
  }
}

const convertToUppercase = () => {
  if (useRichTextMode.value) {
    richText.value = {
      ...richText.value,
      spans: richText.value.spans.map(span => ({
        ...span,
        text: span.text.toUpperCase()
      }))
    }
  } else {
    text.value = text.value.toUpperCase()
  }
}

const saveToHistory = () => {
  addHistoryItem(text.value, settings, useRichTextMode.value ? richText.value : undefined)
}

const savePresetSettings = async () => {
  const name = prompt('Enter preset name:')
  if (name) {
    try {
      await savePreset(name, { ...settings })
      alert('Preset saved!')
    } catch (err) {
      alert('Failed to save preset')
    }
  }
}

const applyPreset = () => {
  const preset = presets.value.find(p => p.id === selectedPresetId.value)
  if (preset) {
    Object.assign(settings, preset.settings)
    selectedPresetId.value = ''
  }
}

const exportBMP = async () => {
  if (canvasRef.value) {
    // Render at full resolution for export
    const exportCanvas = document.createElement('canvas')
    if (useRichTextMode) {
      renderRichTextCanvas(exportCanvas, richText.value, settings)
    } else {
      renderCanvas(exportCanvas, text.value, settings)
    }

    const blob = generateBMP(exportCanvas, settings.isFlipped)

    const result = await overwriteBMP(blob, 'output.bmp')
    if (result === 'fallback') {
      downloadBMP(blob, 'output.bmp')
    }
  }
}

const loadHistoryItem = (item: HistoryItem) => {
  isLoading.value = true
  currentHistoryId.value = item.id
  if (item.settings.useRichTextMode && item.richText) {
    richText.value = item.richText
    text.value = item.richText.spans.map(s => s.text).join('')
    settings.useRichTextMode = true
  } else {
    text.value = item.text
    richText.value = { spans: [{ text: item.text, fontSize: settings.fontSize, fontFamily: 'Arial' }] }
    settings.useRichTextMode = false
  }
  Object.assign(settings, sanitizeSettings(item.settings))
  isLoading.value = false
}

watchDebounced(
  [text, richText, settings, useRichTextMode],
  async () => {
    try {
      if (currentHistoryId.value) {
        // Update existing history item
        const updates: any = {
          text: text.value,
          settings: { ...settings }
        }
        if (useRichTextMode.value) {
          updates.richText = richText.value
        } else {
          updates.richText = deleteField()
        }
        await updateHistoryItem(currentHistoryId.value, updates)
      }
    } catch (err) {
      console.error('Auto-save failed:', err)
    }
  },
  { deep: true, debounce: 1000 }
)

async function triggerRichTextMode(newMode: boolean) {
  if (isLoading.value) return
  if (newMode) {
    // Switching to rich text mode - convert plain text to rich text
    richText.value = { spans: [{ text: text.value, fontSize: settings.fontSize, fontFamily: 'Arial' }] }
  } else {
    // Switching to plain text mode - convert rich text to plain text
    text.value = richText.value.spans.map(span => span.text).join('')
  }

  // Trigger immediate auto-save when mode changes
  if (currentHistoryId.value) {
    try {
      const updates: any = {
        text: text.value,
        settings: { ...settings }
      }
      if (newMode) {
        updates.richText = richText.value
      } else {
        // When switching to plain text mode, delete the richText field
        updates.richText = deleteField()
      }
      await updateHistoryItem(currentHistoryId.value, updates)
    } catch (err) {
      console.error('Auto-save failed:', err)
    }
  }
}

watch(
  richText,
  (newRichText) => {
    if (useRichTextMode.value) {
      text.value = newRichText.spans.map(s => s.text).join('')
    }
  },
  { deep: true }
)

watch(
  [
    text,
    richText,
    useRichTextMode,
    settings
  ],
  updateCanvas,
  { immediate: true, flush: 'sync', deep: true }
)



onMounted(() => {
  updateCanvas()
})

defineExpose({
  settings,
  currentHistoryId,
  loadHistoryItem,
})
</script>
