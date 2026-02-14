<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-gray-800 text-white shadow-lg">
      <div class="container mx-auto px-4 py-6">
        <h1 class="text-3xl font-bold">LaserTag</h1>
        <p class="text-gray-300">Laser Engraving Tool - Generate 1-bit BMP files</p>
      </div>
    </header>
    
    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Editor -->
        <Editor @save="handleSave" ref="editorRef" />
        
        <!-- AI Upload -->
        <AIUpload @names-extracted="handleNamesExtracted" />
      </div>
      
      <!-- History -->
      <History />
    </main>
    
    <!-- Footer -->
    <footer class="bg-gray-800 text-white mt-12">
      <div class="container mx-auto px-4 py-6 text-center">
        <p class="text-gray-400">LaserTag PWA - Built with Vue.js, Firebase & Gemini AI</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Editor from './components/Editor.vue'
import AIUpload from './components/AIUpload.vue'
import History from './components/History.vue'
import { useHistory } from './composables/useHistory'

const { addHistoryItem } = useHistory()
const editorRef = ref(null)

const handleSave = async ({ text, settings }) => {
  if (!text || text.trim() === '') {
    alert('Please enter text before saving')
    return
  }
  
  await addHistoryItem(text, settings)
  alert('Saved to history!')
}

const handleNamesExtracted = async (names) => {
  // Get current settings from editor
  const settings = editorRef.value ? {
    width: editorRef.value.settings.width,
    height: editorRef.value.settings.height,
    padding: editorRef.value.settings.padding,
    unit: editorRef.value.settings.unit,
    isFlipped: editorRef.value.settings.isFlipped
  } : {
    width: 3,
    height: 1,
    padding: 0.5,
    unit: 'in',
    isFlipped: false
  }
  
  // Add each name to history
  for (const name of names) {
    await addHistoryItem(name, settings)
  }
}
</script>
