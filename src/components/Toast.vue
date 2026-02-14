<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'px-6 py-4 rounded-lg shadow-lg max-w-md transition-all duration-300',
          notification.type === 'success' ? 'bg-green-600 text-white' :
          notification.type === 'error' ? 'bg-red-600 text-white' :
          notification.type === 'warning' ? 'bg-yellow-600 text-white' :
          'bg-blue-600 text-white'
        ]"
      >
        <div class="flex items-start">
          <div class="flex-1">
            <p class="font-semibold">{{ notification.message }}</p>
          </div>
          <button
            @click="removeNotification(notification.id)"
            class="ml-4 text-white hover:text-gray-200 focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const notifications = ref([])
let nextId = 1

const addNotification = (message, type = 'info', duration = 3000) => {
  const id = nextId++
  notifications.value.push({ id, message, type })
  
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }
}

const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

defineExpose({
  addNotification
})
</script>
