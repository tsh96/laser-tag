<template>
  <section class="panel-card editor-card">
    <div class="panel-head">
      <div>
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
            :disabled="settings.autoSize" />
          <span class="input-unit">pt</span>
        </div>
      </div>
    </div>

    <div class="stack-gap-md">
      <label class="field-label">Text</label>
      <textarea v-model="text" placeholder="Enter text to engrave" class="field-control" rows="2"></textarea>
    </div>

    <div class="stack-gap-md flex flex-wrap gap-x-6 gap-y-2">
      <label class="check-wrap">
        <input v-model="settings.autoSize" type="checkbox" class="check-input" />
        <span class="check-label">Auto Size (Max 32pt)</span>
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
        Save to History
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
import { ref, reactive, watch, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { renderCanvas } from '../utils/canvas'
import { generateBMP, downloadBMP } from '../utils/bmp'
import type { HistoryItem, LaserSettings } from '../types'

const SETTINGS_STORAGE_KEY = 'lasertag-global-settings'

const DEFAULT_SETTINGS: LaserSettings = {
  width: 3,
  height: 1,
  padding: 0.5,
  unit: 'in',
  isFlipped: false,
  fontSize: 24,
  autoSize: true
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
    autoSize: typeof value.autoSize === 'boolean' ? value.autoSize : DEFAULT_SETTINGS.autoSize
  }
}

const emit = defineEmits<{
  (e: 'save', payload: { text: string; settings: LaserSettings }): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const text = ref('Sample Text')

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
    const actualFontSize = renderCanvas(canvasRef.value, text.value, settings)
    if (settings.autoSize && typeof actualFontSize === 'number') {
      const roundedAutoFontSize = Math.round(actualFontSize)
      if (settings.fontSize !== roundedAutoFontSize) {
        settings.fontSize = roundedAutoFontSize
      }
    }
  }
}

const saveToHistory = () => {
  emit('save', {
    text: text.value,
    settings: { ...settings }
  })
}

const exportBMP = () => {
  if (canvasRef.value) {
    // Render at full resolution for export
    const exportCanvas = document.createElement('canvas')
    renderCanvas(exportCanvas, text.value, settings)

    const blob = generateBMP(exportCanvas, settings.isFlipped)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    downloadBMP(blob, `laser-tag-${timestamp}.bmp`)
  }
}

const loadHistoryItem = (item: HistoryItem) => {
  text.value = item.text
  Object.assign(settings, sanitizeSettings(item.settings))
}

watch(
  [
    text,
    () => settings.width,
    () => settings.height,
    () => settings.padding,
    () => settings.unit,
    () => settings.isFlipped,
    () => settings.fontSize,
    () => settings.autoSize
  ],
  updateCanvas,
  { immediate: true, flush: 'sync' }
)

onMounted(() => {
  updateCanvas()
})

defineExpose({
  settings,
  loadHistoryItem
})
</script>
