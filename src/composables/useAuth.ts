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
  await signInWithEmailAndPassword(auth, email, password)
}

const signUp = async (email: string, password: string) => {
  authError.value = null
  await createUserWithEmailAndPassword(auth, email, password)
}

const logOut = async () => {
  authError.value = null
  await signOut(auth)
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
