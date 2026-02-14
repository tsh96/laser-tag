<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">Editor</h2>
    
    <!-- Input Fields -->
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Width</label>
        <input
          v-model.number="settings.width"
          type="number"
          min="0.1"
          step="0.1"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Height</label>
        <input
          v-model.number="settings.height"
          type="number"
          min="0.1"
          step="0.1"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Logo Padding</label>
        <input
          v-model.number="settings.padding"
          type="number"
          min="0"
          step="0.1"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
        <select
          v-model="settings.unit"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="mm">mm</option>
          <option value="cm">cm</option>
          <option value="in">in</option>
        </select>
      </div>
    </div>
    
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">Text</label>
      <input
        v-model="text"
        type="text"
        placeholder="Enter text to engrave"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    
    <div class="mb-4">
      <label class="flex items-center">
        <input
          v-model="settings.isFlipped"
          type="checkbox"
          class="mr-2"
        />
        <span class="text-sm font-medium text-gray-700">Flip Horizontally</span>
      </label>
    </div>
    
    <!-- Canvas Preview -->
    <div class="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 overflow-auto">
      <div class="flex justify-center items-center min-h-[200px]">
        <canvas
          ref="canvasRef"
          class="border border-gray-400 bg-white"
          style="max-width: 100%; height: auto;"
        />
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="mt-4 flex gap-2">
      <button
        @click="saveToHistory"
        class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Save to History
      </button>
      <button
        @click="exportBMP"
        class="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Export BMP
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { renderCanvas } from '../utils/canvas'
import { generateBMP, downloadBMP } from '../utils/bmp'

const emit = defineEmits(['save'])

const canvasRef = ref(null)
const text = ref('Sample Text')

const settings = reactive({
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
</script>
