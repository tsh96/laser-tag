<template>
  <Teleport to="body">
    <div class="toast-stack">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'toast-item',
          notification.type === 'success' ? 'toast-item--success' :
          notification.type === 'error' ? 'toast-item--error' :
          notification.type === 'warning' ? 'toast-item--warning' :
          'toast-item--info'
        ]"
      >
        <div class="toast-content">
          <div>
            <p class="toast-message">{{ notification.message }}</p>
          </div>
          <button
            @click="removeNotification(notification.id)"
            class="toast-close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Notification } from '../types'

const notifications = ref<Notification[]>([])
let nextId = 1

const addNotification = (message: string, type: Notification['type'] = 'info', duration = 3000) => {
  const id = nextId++
  notifications.value.push({ id, message, type })
  
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }
}

const removeNotification = (id: number) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

defineExpose({
  addNotification
})
</script>
