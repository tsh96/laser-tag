<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">AI Batch Entry</h2>
    
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Upload a photo of a name list
      </label>
      <input
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
    
    <div v-if="processing" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Processing image with AI...</p>
    </div>
    
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <p class="text-red-800">{{ error }}</p>
    </div>
    
    <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <p class="text-green-800">Successfully extracted {{ namesCount }} names!</p>
    </div>
    
    <div class="text-sm text-gray-600">
      <p class="mb-2"><strong>Tips:</strong></p>
      <ul class="list-disc list-inside space-y-1">
        <li>Take a clear, well-lit photo of the name list</li>
        <li>Ensure names are clearly visible and readable</li>
        <li>Works with handwritten or printed lists</li>
        <li>Each detected name will be added to history with current settings</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { extractNamesFromImage } from '../utils/gemini'

const emit = defineEmits(['names-extracted'])

const processing = ref(false)
const error = ref(null)
const success = ref(false)
const namesCount = ref(0)

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
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
    event.target.value = ''
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      success.value = false
    }, 5000)
  } catch (err) {
    error.value = err.message || 'Failed to process image'
  } finally {
    processing.value = false
  }
}
</script>
