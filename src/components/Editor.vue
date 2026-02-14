<template>
  <section class="panel-card editor-card">
    <div class="panel-head">
      <div>
        <h2 class="panel-title">Editor</h2>
        <p class="panel-subtitle">Adjust dimensions, preview live output, and export when ready.</p>
      </div>
    </div>

    <div class="editor-grid">
      <div>
        <label class="field-label">Width</label>
        <input
          v-model.number="settings.width"
          type="number"
          min="0.1"
          step="0.1"
          class="field-control"
        />
      </div>

      <div>
        <label class="field-label">Height</label>
        <input
          v-model.number="settings.height"
          type="number"
          min="0.1"
          step="0.1"
          class="field-control"
        />
      </div>

      <div>
        <label class="field-label">Logo Padding</label>
        <input
          v-model.number="settings.padding"
          type="number"
          min="0"
          step="0.1"
          class="field-control"
        />
      </div>

      <div>
        <label class="field-label">Unit</label>
        <select
          v-model="settings.unit"
          class="field-control"
        >
          <option value="mm">mm</option>
          <option value="cm">cm</option>
          <option value="in">in</option>
        </select>
      </div>
    </div>

    <div class="stack-gap-md">
      <label class="field-label">Text</label>
      <input
        v-model="text"
        type="text"
        placeholder="Enter text to engrave"
        class="field-control"
      />
      <p class="form-note">Preview updates automatically as you type.</p>
    </div>

    <div class="stack-gap-md">
      <label class="check-wrap">
        <input
          v-model="settings.isFlipped"
          type="checkbox"
          class="check-input"
        />
        <span class="check-label">Flip Horizontally</span>
      </label>
    </div>

    <div class="preview-shell">
      <p class="preview-label">Live Preview</p>
      <div class="preview-stage">
        <canvas
          ref="canvasRef"
          class="preview-canvas"
          style="max-width: 100%; height: auto;"
        />
      </div>
    </div>

    <div class="action-row">
      <button
        @click="saveToHistory"
        class="btn-primary action-btn"
      >
        Save to History
      </button>
      <button
        @click="exportBMP"
        class="btn-secondary action-btn"
      >
        Export BMP
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { renderCanvas } from '../utils/canvas'
import { generateBMP, downloadBMP } from '../utils/bmp'
import type { LaserSettings } from '../types'

const emit = defineEmits<{
  (e: 'save', payload: { text: string; settings: LaserSettings }): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const text = ref('Sample Text')

const settings = reactive<LaserSettings>({
  width: 3,
  height: 1,
  padding: 0.5,
  unit: 'in',
  isFlipped: false
})

const updateCanvas = () => {
  if (canvasRef.value) {
    renderCanvas(canvasRef.value, text.value, settings)
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

watch([text, settings], updateCanvas, { deep: true })

onMounted(() => {
  updateCanvas()
})

defineExpose({
  settings
})
</script>
