<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="dialog-overlay"
      @click.self="cancel"
    >
      <div class="dialog-panel">
        <h3 class="dialog-title">{{ title }}</h3>
        <p class="dialog-text">{{ message }}</p>
        <div class="dialog-actions">
          <button
            @click="cancel"
            class="dialog-cancel"
          >
            Cancel
          </button>
          <button
            @click="confirm"
            class="dialog-confirm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)
const title = ref('')
const message = ref('')
let resolvePromise: ((value: boolean) => void) | null = null

const show = (titleText: string, messageText: string) => {
  title.value = titleText
  message.value = messageText
  isOpen.value = true
  
  return new Promise<boolean>((resolve) => {
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
