<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="cancel"
    >
      <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
        <p class="text-gray-600 mb-6">{{ message }}</p>
        <div class="flex gap-3 justify-end">
          <button
            @click="cancel"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            @click="confirm"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
const title = ref('')
const message = ref('')
let resolvePromise = null

const show = (titleText, messageText) => {
  title.value = titleText
  message.value = messageText
  isOpen.value = true
  
  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

const confirm = () => {
  isOpen.value = false
  if (resolvePromise) {
    resolvePromise(true)
    resolvePromise = null
  }
}

const cancel = () => {
  isOpen.value = false
  if (resolvePromise) {
    resolvePromise(false)
    resolvePromise = null
  }
}

defineExpose({
  show
})
</script>
