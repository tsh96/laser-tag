<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">History</h2>
    
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading history...</p>
    </div>
    
    <div v-else-if="error" class="text-center py-8 text-red-600">
      {{ error }}
    </div>
    
    <div v-else-if="historyItems.length === 0" class="text-center py-8 text-gray-500">
      No history items yet. Create your first item using the editor or AI upload.
    </div>
    
    <div v-else class="space-y-4">
      <div
        v-for="item in historyItems"
        :key="item.id"
        class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex gap-4">
          <!-- Preview Canvas -->
          <div class="flex-shrink-0">
            <canvas
              :ref="el => setCanvasRef(item.id, el)"
              class="border border-gray-300 bg-white"
              width="200"
              height="100"
            />
          </div>
          
          <!-- Item Details -->
          <div class="flex-1">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h3 class="font-semibold text-lg text-gray-800">{{ item.text }}</h3>
                <p class="text-sm text-gray-500">
                  {{ formatTimestamp(item.timestamp) }}
                </p>
              </div>
              <span
                v-if="item.status === 'pending'"
                class="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded"
              >
                Pending
              </span>
            </div>
            
            <div class="text-sm text-gray-600 mb-3">
              <span class="font-medium">Dimensions:</span>
              {{ item.settings.width }} × {{ item.settings.height }} {{ item.settings.unit }}
              (Padding: {{ item.settings.padding }} {{ item.settings.unit }})
              <span v-if="item.settings.isFlipped" class="ml-2 text-blue-600">• Flipped</span>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex gap-2">
              <button
                @click="exportItem(item, false)"
                class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Export (New)
              </button>
              <button
                @click="exportItem(item, true)"
                class="bg-green-700 text-white px-3 py-1 rounded text-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                Export (Overwrite)
              </button>
              <button
                @click="deleteItem(item.id)"
                class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useHistory } from '../composables/useHistory'
import { renderMiniature } from '../utils/canvas'
import { generateBMP, downloadBMP } from '../utils/bmp'
import { renderCanvas } from '../utils/canvas'

const { historyItems, loading, error, updateHistoryItem, deleteHistoryItem } = useHistory()

const canvasRefs = ref({})

const setCanvasRef = (id, el) => {
  if (el) {
    canvasRefs.value[id] = el
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

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Just now'
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString()
}

const exportItem = async (item, overwrite) => {
  // Mark as exported
  await updateHistoryItem(item.id, { status: 'exported' })
  
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

const deleteItem = async (id) => {
  if (confirm('Are you sure you want to delete this item?')) {
    await deleteHistoryItem(id)
  }
}

watch(historyItems, renderPreviews, { deep: true })

onMounted(() => {
  renderPreviews()
})
</script>
