<template>
  <section class="panel-card upload-card">
    <div class="panel-head">
      <h2 class="panel-title">AI Batch Entry</h2>
    </div>

    <div class="upload-zone">
      <label class="field-label">
        Upload a photo of a name list
      </label>
      <input
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        aria-describedby="upload-help"
        class="upload-input"
      />
      <p id="upload-help" class="form-note">Supports common image formats. Best results with a clear, well-lit image.</p>
    </div>

    <div v-if="processing" class="status-block">
      <div class="loader"></div>
      <p class="status-text">Processing image with AI...</p>
    </div>

    <div v-if="error" class="alert alert--error">
      <p>{{ error }}</p>
    </div>

    <div v-if="success" class="alert alert--success">
      <p>Successfully extracted {{ namesCount }} names.</p>
    </div>

  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { extractNamesFromImage } from '../utils/gemini'

const emit = defineEmits<{
  (e: 'names-extracted', names: string[]): void
}>()

const processing = ref(false)
const error = ref<string | null>(null)
const success = ref(false)
const namesCount = ref(0)

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  processing.value = true
  error.value = null
  success.value = false
  
  try {
    const names = await extractNamesFromImage(file)
    
    if (names.length === 0) {
      error.value = 'No names were detected in the image. Please try a clearer photo.'
      return
    }
    
    namesCount.value = names.length
    success.value = true
    emit('names-extracted', names)
    
    // Reset file input
    target.value = ''
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      success.value = false
    }, 5000)
  } catch (err: any) {
    error.value = err.message || 'Failed to process image'
  } finally {
    processing.value = false
  }
}
</script>
