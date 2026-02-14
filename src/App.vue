<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__inner">
        <div class="app-header__row">
          <h1 class="app-title">LaserTag</h1>
          <div v-if="user" class="app-header__user">
            <span class="app-user-email">{{ user.email }}</span>
            <button class="btn-secondary app-inline-btn" type="button" @click="handleSignOut">
              Sign out
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

        <form class="editor-grid" @submit.prevent="handleSignIn">
          <div>
            <label for="auth-email" class="field-label">Email</label>
            <input
              id="auth-email"
              v-model.trim="email"
              type="email"
              class="field-control"
              autocomplete="email"
              required
            >
          </div>

          <div>
            <label for="auth-password" class="field-label">Password</label>
            <input
              id="auth-password"
              v-model="password"
              type="password"
              class="field-control"
              autocomplete="current-password"
              minlength="6"
              required
            >
          </div>

          <div class="action-row auth-action-row">
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
import { ref } from 'vue'
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

  await addHistoryItem(text, settings)
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
