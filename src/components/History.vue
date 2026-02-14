<template>
  <section class="panel-card history-card">
    <div class="history-head">
      <h2 class="panel-title">History</h2>
      <span class="history-count">
        {{ historyItems.length }} item{{ historyItems.length === 1 ? '' : 's' }}
      </span>
    </div>

    <div v-if="loading" class="status-block">
      <div class="loader"></div>
      <p class="status-text">Loading history...</p>
    </div>

    <div v-else-if="error" class="alert alert--error alert--center">
      {{ error }}
    </div>

    <div v-else-if="historyItems.length === 0" class="empty-state">
      No history items yet. Create your first item using the editor or AI upload.
    </div>

    <div v-else class="history-list">
      <div
        v-for="item in historyItems"
        :key="item.id"
        class="history-item"
      >
        <div class="history-item__layout">
          <div class="history-preview">
            <p class="preview-label">Preview</p>
            <canvas
              :ref="el => setCanvasRef(item.id, el)"
              class="history-canvas"
              width="200"
              height="100"
            />
          </div>

          <div class="history-content">
            <div class="history-item__head">
              <div>
                <h3 class="history-title">{{ item.text }}</h3>
                <p class="history-time">
                  {{ formatTimestamp(item.timestamp) }}
                </p>
              </div>
              <span
                v-if="item.status === 'pending'"
                class="pending-badge"
              >
                Pending
              </span>
            </div>

            <div class="history-meta">
              <span class="history-meta__label">Dimensions:</span>
              {{ item.settings.width }} × {{ item.settings.height }} {{ item.settings.unit }}
              (Padding: {{ item.settings.padding }} {{ item.settings.unit }})
              <span v-if="item.settings.isFlipped" class="history-meta__flipped">• Flipped</span>
            </div>

            <div class="history-actions">
              <button
                @click="exportItem(item, false)"
                class="btn-secondary"
              >
                Export (New)
              </button>
              <button
                @click="exportItem(item, true)"
                class="btn-secondary btn-secondary--alt"
              >
                Export (Overwrite)
              </button>
              <button
                @click="confirmDelete(item.id)"
                class="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog ref="confirmDialogRef" />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useHistory } from '../composables/useHistory'
import { renderMiniature } from '../utils/canvas'
import { generateBMP, downloadBMP } from '../utils/bmp'
import { renderCanvas } from '../utils/canvas'
import ConfirmDialog from './ConfirmDialog.vue'
import type { HistoryItem } from '../types'

const { historyItems, loading, error, updateHistoryItem, deleteHistoryItem } = useHistory()

const canvasRefs = ref<Record<string, HTMLCanvasElement>>({})
const confirmDialogRef = ref<InstanceType<typeof ConfirmDialog> | null>(null)

const setCanvasRef = (id: string, el: Element | null) => {
  if (el) {
    canvasRefs.value[id] = el as HTMLCanvasElement
  }
}

const renderPreviews = async () => {
  await nextTick()
  
  historyItems.value.forEach(item => {
    const canvas = canvasRefs.value[item.id]
    if (canvas && item.settings) {
      renderMiniature(canvas, item.text, item.settings, 200, 100)
    }
  })
}

const formatTimestamp = (timestamp: any) => {
  if (!timestamp) return 'Just now'
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString()
}

const exportItem = async (item: HistoryItem, overwrite: boolean) => {
  // Mark as exported
  await updateHistoryItem(item.id, { status: 'exported' } as any)
  
  // Generate BMP
  const exportCanvas = document.createElement('canvas')
  renderCanvas(exportCanvas, item.text, item.settings)
  
  const blob = generateBMP(exportCanvas, item.settings.isFlipped)
  
  if (overwrite) {
    downloadBMP(blob, 'output.bmp')
  } else {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    downloadBMP(blob, `laser-tag-${item.text.replace(/\s+/g, '-')}-${timestamp}.bmp`)
  }
}

const confirmDelete = async (id: string) => {
  const confirmed = await confirmDialogRef.value?.show(
    'Delete Item',
    'Are you sure you want to delete this item? This action cannot be undone.'
  )
  
  if (confirmed) {
    await deleteHistoryItem(id)
  }
}

watch(historyItems, renderPreviews, { deep: true })

onMounted(() => {
  renderPreviews()
})
</script>
