<template>
  <section class="panel-card history-card">
    <div class="history-head">
      <div class="history-head__left">
        <h2 class="panel-title">History</h2>
      </div>

      <div class="history-head__actions">
        <button type="button" class="camera-btn" @click="openSettingsModal" aria-label="Open settings" title="Settings">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <label class="camera-btn" :class="{ 'is-processing': processing }">
          <svg v-if="!processing" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
          <div v-else class="loader loader--small"></div>
          <input ref="captureInputRef" type="file" accept="image/*" capture="environment" @change="handleFileSelect"
            class="hidden-input" :disabled="processing || isCropModalOpen" />
        </label>
      </div>
    </div>

    <div v-if="uploadError" class="alert alert--error alert--center">
      {{ uploadError }}
    </div>

    <div v-if="loading" class="status-block">
      <div class="loader"></div>
      <p class="status-text">Loading history...</p>
    </div>

    <div v-else-if="error" class="alert alert--error alert--center">
      {{ error }}
    </div>

    <div v-else-if="historyItems.length === 0" class="empty-state">
      <p>No history items yet.</p>
      <p class="empty-hint">Use the camera icon above to capture a list of names with AI.</p>
    </div>

    <div v-else ref="historyListRef" class="history-list">
      <div v-for="item in historyItems" :key="item.id" :ref="el => setItemRef(item.id, el)" class="history-item"
        :class="{ 'history-item--selected': selectedHistoryId === item.id }" :title="formatTimestamp(item.timestamp)"
        role="button" tabindex="0" @click="selectItem(item)" @keydown.enter.prevent="selectItem(item)"
        @keydown.space.prevent="selectItem(item)">
        <div class="history-item__layout">
          <div class="history-preview">
            <div v-if="item.status === 'pending'" class="history-tag">Pending</div>
            <div v-if="item.settings?.isFlipped" class="history-tag history-tag--flipped">Flipped</div>
            <canvas :ref="el => setCanvasRef(item.id, el)" class="history-canvas" />
            <div class="history-actions">
              <button @click.stop="exportItem(item, true)" class="history-icon-btn" type="button"
                title="Export as a new file" aria-label="Export as a new file">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              <button @click.stop="confirmDelete(item.id)" class="history-icon-btn history-icon-btn--danger"
                type="button" title="Delete item" aria-label="Delete item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="hasMore" ref="loadMoreTriggerRef" class="history-load-trigger" aria-hidden="true">
        <div v-if="loadingMore" class="loader loader--small"></div>
      </div>
    </div>

    <div v-if="isCropModalOpen" class="dialog-overlay dialog-overlay--fullscreen" @click.self="closeCropModal">
      <div class="dialog-panel crop-dialog" role="dialog" aria-modal="true" aria-labelledby="crop-photo-title">
        <h3 id="crop-photo-title" class="dialog-title">Crop Photo</h3>
        <p class="dialog-text">Adjust the crop box to select the area to scan for names.</p>
        <div ref="cropStageRef" class="crop-stage">
          <img ref="cropImageRef" v-if="cropImageUrl" :src="cropImageUrl" alt="Captured photo"
            class="crop-stage__image" />
        </div>
        <p v-if="uploadError" class="form-note crop-note crop-note--error">{{ uploadError }}</p>
        <div class="dialog-actions">
          <button type="button" class="dialog-cancel" :disabled="processing" @click="closeCropModal">Cancel</button>
          <button type="button" class="btn-secondary btn-secondary--alt" :disabled="processing"
            @click="resetCropSelection">Reset Crop</button>
          <button type="button" class="btn-primary" :disabled="processing || !pendingImageFile"
            @click="applyCropAndExtract">
            {{ processing ? 'Processing…' : 'Extract Names' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="isSettingsModalOpen" class="dialog-overlay" @click.self="closeSettingsModal">
      <div class="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="history-settings-title">
        <h3 id="history-settings-title" class="dialog-title">Settings</h3>
        <label for="gemini-api-key" class="field-label">Gemini API Key</label>
        <input id="gemini-api-key" v-model="geminiApiKeyInput" type="password" class="field-control"
          placeholder="Paste your Gemini API key" autocomplete="new-password" spellcheck="false" />
        <p class="form-note">Stored only in this browser (localStorage).</p>
        <p v-if="geminiApiKeyStatus" class="form-note">{{ geminiApiKeyStatus }}</p>
        <div class="dialog-actions">
          <button type="button" class="dialog-cancel" @click="closeSettingsModal">Close</button>
          <button type="button" class="btn-secondary btn-secondary--alt"
            @click="clearGeminiApiKeySetting">Clear</button>
          <button type="button" class="btn-primary" @click="saveGeminiApiKeySetting">Save API Key</button>
        </div>
      </div>
    </div>

    <ConfirmDialog ref="confirmDialogRef" />
  </section>
</template>

<script setup lang="ts">
import Cropper from 'cropperjs'
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useHistory } from '../composables/useHistory'
import { renderMiniature, renderCanvas, renderRichTextMiniature, renderRichTextCanvas } from '../utils/canvas'
import { generateBMP, downloadBMP, overwriteBMP } from '../utils/bmp'
import { extractNamesFromImage, getGeminiApiKey, saveGeminiApiKey } from '../utils/gemini'
import ConfirmDialog from './ConfirmDialog.vue'
import type { HistoryItem } from '../types'

const props = defineProps<{
  currentSettings?: any
}>()

const emit = defineEmits<{
  (e: 'names-extracted', names: string[]): void
  (e: 'select-item', item: HistoryItem): void
}>()

const { historyItems, loading, loadingMore, hasMore, error, updateHistoryItem, deleteHistoryItem, loadMoreHistory } = useHistory()

const canvasRefs = ref<Record<string, HTMLCanvasElement>>({})
const itemRefs = ref<Record<string, HTMLElement>>({})
const confirmDialogRef = ref<InstanceType<typeof ConfirmDialog> | null>(null)
const historyListRef = ref<HTMLElement | null>(null)
const loadMoreTriggerRef = ref<HTMLElement | null>(null)
const selectedHistoryId = ref<string | null>(null)

const processing = ref(false)
const uploadError = ref<string | null>(null)
const captureInputRef = ref<HTMLInputElement | null>(null)
const isCropModalOpen = ref(false)
const cropStageRef = ref<HTMLElement | null>(null)
const cropImageRef = ref<HTMLImageElement | null>(null)
const cropImageUrl = ref<string | null>(null)
const pendingImageFile = ref<File | null>(null)
const cropperInstance = ref<Cropper | null>(null)
const geminiApiKeyInput = ref('')
const geminiApiKeyStatus = ref<string | null>(null)
const isSettingsModalOpen = ref(false)
const LOAD_MORE_THRESHOLD = 0.2
let resizeObserver: ResizeObserver | null = null
let loadMoreObserver: IntersectionObserver | null = null

const openSettingsModal = () => {
  isSettingsModalOpen.value = true
  geminiApiKeyInput.value = ''
  geminiApiKeyStatus.value = null
}

const closeSettingsModal = () => {
  isSettingsModalOpen.value = false
}

const saveGeminiApiKeySetting = () => {
  saveGeminiApiKey(geminiApiKeyInput.value)
  const storedKey = getGeminiApiKey()
  geminiApiKeyInput.value = ''
  geminiApiKeyStatus.value = storedKey ? 'Gemini API key saved locally.' : 'Gemini API key removed.'
}

const clearGeminiApiKeySetting = () => {
  geminiApiKeyInput.value = ''
  saveGeminiApiKey('')
  geminiApiKeyStatus.value = 'Gemini API key removed.'
}

const revokeCropImageUrl = () => {
  if (cropImageUrl.value) {
    URL.revokeObjectURL(cropImageUrl.value)
    cropImageUrl.value = null
  }
}

const destroyCropper = () => {
  cropperInstance.value?.destroy()
  cropperInstance.value = null
}

const initCropper = () => {
  destroyCropper()

  const image = cropImageRef.value
  if (!image || !cropStageRef.value) {
    return
  }

  const mountCropper = () => {
    cropperInstance.value = new Cropper(image, {
      container: cropStageRef.value as Element,
      template: '<cropper-canvas background>'
        + '<cropper-image rotatable scalable skewable translatable></cropper-image>'
        + '<cropper-shade hidden></cropper-shade>'
        + '<cropper-handle action="select" plain></cropper-handle>'
        + '<cropper-selection initial-coverage="0.8" movable resizable>'
        + '<cropper-grid role="grid" bordered covered></cropper-grid>'
        + '<cropper-crosshair centered></cropper-crosshair>'
        + '<cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>'
        + '<cropper-handle action="n-resize"></cropper-handle>'
        + '<cropper-handle action="e-resize"></cropper-handle>'
        + '<cropper-handle action="s-resize"></cropper-handle>'
        + '<cropper-handle action="w-resize"></cropper-handle>'
        + '<cropper-handle action="ne-resize"></cropper-handle>'
        + '<cropper-handle action="nw-resize"></cropper-handle>'
        + '<cropper-handle action="se-resize"></cropper-handle>'
        + '<cropper-handle action="sw-resize"></cropper-handle>'
        + '</cropper-selection>'
        + '</cropper-canvas>'
    })
  }

  if (image.complete && image.naturalWidth > 0) {
    mountCropper()
    return
  }

  image.addEventListener('load', mountCropper, { once: true })
}

const resetCropSelection = () => {
  cropperInstance.value?.getCropperSelection()?.$reset()
}

const openCropModal = (file: File) => {
  destroyCropper()
  revokeCropImageUrl()
  pendingImageFile.value = file
  cropImageUrl.value = URL.createObjectURL(file)
  isCropModalOpen.value = true
}

const closeCropModal = () => {
  isCropModalOpen.value = false
  pendingImageFile.value = null
  destroyCropper()
  revokeCropImageUrl()
  if (captureInputRef.value) {
    captureInputRef.value.value = ''
  }
}

const toBlob = (canvas: HTMLCanvasElement, type: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
        return
      }

      reject(new Error('Unable to create cropped image'))
    }, type, 0.95)
  })
}

const createCroppedImageFile = async (file: File) => {
  const selection = cropperInstance.value?.getCropperSelection()
  if (!selection) {
    return file
  }

  const canvas = await selection.$toCanvas()
  if (canvas.width <= 0 || canvas.height <= 0) {
    return file
  }

  const outputType = /image\/(png|webp|jpeg)/.test(file.type) ? file.type : 'image/jpeg'
  const blob = await toBlob(canvas, outputType)
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'captured-photo'
  const extension = outputType === 'image/png' ? 'png' : outputType === 'image/webp' ? 'webp' : 'jpg'

  return new File([blob], `${baseName}-crop.${extension}`, { type: outputType })
}

const applyCropAndExtract = async () => {
  if (!pendingImageFile.value || processing.value) {
    return
  }

  processing.value = true
  uploadError.value = null

  try {
    const croppedFile = await createCroppedImageFile(pendingImageFile.value)
    const names = await extractNamesFromImage(croppedFile)

    if (names.length === 0) {
      uploadError.value = 'No names were detected in the selected crop.'
      return
    }

    emit('names-extracted', names)
    closeCropModal()
  } catch (err: any) {
    uploadError.value = err.message || 'Failed to process image'
  } finally {
    processing.value = false
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  target.value = ''
  uploadError.value = null

  openCropModal(file)
}

const setCanvasRef = (id: string, el: unknown) => {
  if (el instanceof HTMLCanvasElement) {
    canvasRefs.value[id] = el
  }
}

const setItemRef = (id: string, el: unknown) => {
  if (el instanceof HTMLElement) {
    itemRefs.value[id] = el
  }
}

const renderPreviews = async () => {
  await nextTick()

  historyItems.value.forEach(item => {
    const canvas = canvasRefs.value[item.id]
    if (canvas && item.settings) {
      const parentWidth = Math.floor(canvas.parentElement?.clientWidth || 200)
      const maxWidth = Math.max(140, parentWidth)
      const maxHeight = Math.max(80, Math.floor(parentWidth * 0.6))

      if (item.richText) {
        renderRichTextMiniature(canvas, item.richText, item.settings, maxWidth, maxHeight)
      } else {
        renderMiniature(canvas, item.text, item.settings, maxWidth, maxHeight)
      }
    }
  })
}

const selectItem = (item: HistoryItem) => {
  selectedHistoryId.value = item.id

  const selectedElement = itemRefs.value[item.id]
  selectedElement?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest'
  })

  emit('select-item', item)
}

const formatTimestamp = (timestamp: any) => {
  if (!timestamp) return 'Just now'

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const exportItem = async (item: HistoryItem, overwrite: boolean) => {
  // Mark as exported
  await updateHistoryItem(item.id, { status: 'exported' })

  // Generate BMP
  const exportCanvas = document.createElement('canvas')
  if (item.settings.useRichTextMode && item.richText) {
    renderRichTextCanvas(exportCanvas, item.richText, item.settings)
  } else {
    renderCanvas(exportCanvas, item.text, item.settings)
  }

  const blob = generateBMP(exportCanvas, item.settings.isFlipped)

  if (overwrite) {
    const result = await overwriteBMP(blob, 'output.bmp')
    if (result === 'fallback') {
      downloadBMP(blob, 'output.bmp')
    }
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
watch([isCropModalOpen, cropImageUrl], async ([isOpen, imageUrl]) => {
  if (!isOpen || !imageUrl) {
    return
  }

  await nextTick()
  initCropper()
})

watch([historyItems, hasMore], async () => {
  await nextTick()

  if (loadMoreObserver) {
    loadMoreObserver.disconnect()
    loadMoreObserver = null
  }

  if (!hasMore.value || !loadMoreTriggerRef.value || typeof IntersectionObserver === 'undefined') {
    return
  }

  loadMoreObserver = new IntersectionObserver((entries) => {
    if (!loadingMore.value && entries.some(entry => entry.isIntersecting)) {
      void loadMoreHistory()
    }
  }, {
    threshold: LOAD_MORE_THRESHOLD
  })

  loadMoreObserver.observe(loadMoreTriggerRef.value)
})

onMounted(() => {
  renderPreviews()

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      renderPreviews()
    })

    if (historyListRef.value) {
      resizeObserver.observe(historyListRef.value)
    }
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  loadMoreObserver?.disconnect()
  destroyCropper()
  revokeCropImageUrl()
})
</script>
