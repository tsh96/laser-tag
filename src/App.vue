<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__inner">
        <div class="app-header__row">
          <div class="app-header__brand">
            <span class="app-logo">⚡</span>
            <h1 class="app-title hidden sm:block">LaserTag</h1>
          </div>
          <button v-if="canInstallApp" class="app-badge" type="button" @click="handleInstallApp">
            Install app
          </button>
          <div v-if="user" class="app-header__user">
            <div class="user-info">
              <span class="app-user-label">USER</span>
              <span class="app-user-email">{{ user.email }}</span>
            </div>
            <button class="btn-logout" type="button" @click="handleSignOut" title="Sign out">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div v-if="authLoading" class="status-block">
        <div class="loader"></div>
        <p class="status-text">Checking authentication...</p>
      </div>

      <section v-else-if="!user" class="panel-card auth-card">
        <div class="panel-head">
          <h2 class="panel-title">Sign in</h2>
          <p class="panel-subtitle">Use Firebase email/password auth to access history and editor.</p>
        </div>

        <form class="auth-form" @submit.prevent="handleSignIn">
          <div class="auth-fields">
            <div class="field-group">
              <label for="auth-email" class="field-label">Email</label>
              <input id="auth-email" v-model.trim="email" type="email" class="field-control"
                placeholder="name@example.com" autocomplete="email" required>
            </div>

            <div class="field-group">
              <label for="auth-password" class="field-label">Password</label>
              <input id="auth-password" v-model="password" type="password" class="field-control" placeholder="••••••••"
                autocomplete="current-password" minlength="6" required>
            </div>
          </div>

          <div class="auth-actions">
            <button class="btn-primary" type="submit" :disabled="authBusy || authLoading">
              {{ authBusy ? 'Signing in...' : 'Sign in' }}
            </button>
            <button class="btn-secondary" type="button" :disabled="authBusy || authLoading" @click="handleSignUp">
              {{ authBusy ? 'Creating account...' : 'Create account' }}
            </button>
          </div>
        </form>

        <div v-if="authMessage" class="alert alert--error">
          {{ authMessage }}
        </div>
      </section>

      <div v-else class="app-main__grid">
        <History @names-extracted="handleNamesExtracted" @select-item="handleHistorySelected" />
        <Editor @save="handleSave" ref="editorRef" />
      </div>
    </main>

    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import Editor from './components/Editor.vue'
import History from './components/History.vue'
import Toast from './components/Toast.vue'
import { useAuth } from './composables/useAuth'
import { useHistory } from './composables/useHistory'
import type { HistoryItem, LaserSettings } from './types'

const { addHistoryItem } = useHistory()
const { user, authLoading, signIn, signUp, logOut } = useAuth()
const editorRef = ref<InstanceType<typeof Editor> | null>(null)
const toastRef = ref<InstanceType<typeof Toast> | null>(null)
const email = ref('')
const password = ref('')
const authBusy = ref(false)
const authMessage = ref<string | null>(null)
const deferredInstallPrompt = ref<BeforeInstallPromptEvent | null>(null)
const isStandalone = ref(false)

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const updateStandaloneMode = () => {
  isStandalone.value =
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
}

const canInstallApp = computed(() => !isStandalone.value && deferredInstallPrompt.value !== null)

const handleBeforeInstallPrompt = (event: Event) => {
  event.preventDefault()
  deferredInstallPrompt.value = event as BeforeInstallPromptEvent
}

const handleAppInstalled = () => {
  deferredInstallPrompt.value = null
  updateStandaloneMode()
  toastRef.value?.addNotification('LaserTag installed successfully!', 'success')
}

const handleInstallApp = async () => {
  if (deferredInstallPrompt.value) {
    await deferredInstallPrompt.value.prompt()
    const { outcome } = await deferredInstallPrompt.value.userChoice
    deferredInstallPrompt.value = null
    updateStandaloneMode()
    if (outcome === 'accepted') {
      return
    }
  }

  toastRef.value?.addNotification('Use your browser menu to install this app.', 'info')
}

onMounted(() => {
  updateStandaloneMode()
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
})

const isLaserSettings = (value: unknown): value is LaserSettings => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.width === 'number' &&
    typeof candidate.height === 'number' &&
    typeof candidate.padding === 'number' &&
    (candidate.unit === 'mm' || candidate.unit === 'cm' || candidate.unit === 'in') &&
    typeof candidate.isFlipped === 'boolean' &&
    typeof candidate.fontSize === 'number' &&
    typeof candidate.autoSize === 'boolean'
  )
}

const handleSave = async ({ text, settings }: { text: string; settings: LaserSettings }) => {
  if (!text || text.trim() === '') {
    toastRef.value?.addNotification('Please enter text before saving', 'warning')
    return
  }

  const id = await addHistoryItem(text, settings)
  if (id && editorRef.value) {
    editorRef.value.currentHistoryId = id
  }
  toastRef.value?.addNotification('Saved to history!', 'success')
}

const getAuthErrorMessage = (err: any) => err?.message ?? 'Authentication failed. Please try again.'

const handleSignIn = async () => {
  authBusy.value = true
  authMessage.value = null
  try {
    await signIn(email.value, password.value)
    password.value = ''
  } catch (err: any) {
    authMessage.value = getAuthErrorMessage(err)
  } finally {
    authBusy.value = false
  }
}

const handleSignUp = async () => {
  authBusy.value = true
  authMessage.value = null
  try {
    await signUp(email.value, password.value)
    password.value = ''
  } catch (err: any) {
    authMessage.value = getAuthErrorMessage(err)
  } finally {
    authBusy.value = false
  }
}

const handleSignOut = async () => {
  authMessage.value = null
  try {
    await logOut()
  } catch (err: any) {
    authMessage.value = getAuthErrorMessage(err)
  }
}

const handleNamesExtracted = async (names: string[]) => {
  const editorSettings = editorRef.value?.settings

  const settings: LaserSettings = isLaserSettings(editorSettings)
    ? { ...editorSettings }
    : {
      width: 3,
      height: 1,
      padding: 0.5,
      unit: 'in',
      isFlipped: false,
      fontSize: 24,
      autoSize: true
    }

  // Add each name to history
  for (const name of names) {
    await addHistoryItem(name, settings)
  }

  toastRef.value?.addNotification(`Successfully added ${names.length} names to history!`, 'success', 5000)
}

const handleHistorySelected = (item: HistoryItem) => {
  editorRef.value?.loadHistoryItem(item)
  toastRef.value?.addNotification('Loaded history item into editor', 'info', 2000)
}
</script>
