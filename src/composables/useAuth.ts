import { ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User
} from 'firebase/auth'
import { auth } from '../firebase'

const user = ref<User | null>(null)
const authLoading = ref(true)
const authError = ref<string | null>(null)

onAuthStateChanged(auth, (nextUser) => {
  user.value = nextUser
  authLoading.value = false
})

const signIn = async (email: string, password: string) => {
  authError.value = null
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (err: any) {
    authError.value = err?.message ?? 'Failed to sign in.'
    throw err
  }
}

const signUp = async (email: string, password: string) => {
  authError.value = null
  try {
    await createUserWithEmailAndPassword(auth, email, password)
  } catch (err: any) {
    authError.value = err?.message ?? 'Failed to create account.'
    throw err
  }
}

const logOut = async () => {
  authError.value = null
  try {
    await signOut(auth)
  } catch (err: any) {
    authError.value = err?.message ?? 'Failed to sign out.'
    throw err
  }
}

export function useAuth() {
  return {
    user,
    authLoading,
    authError,
    signIn,
    signUp,
    logOut
  }
}
