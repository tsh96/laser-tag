import { ref, onMounted, onUnmounted } from 'vue'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase'
import type { LaserSettings, HistoryItem } from '../types'

export function useHistory() {
  const historyItems = ref<HistoryItem[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  let unsubscribe: Unsubscribe | null = null
  let unsubscribeAuth: Unsubscribe | null = null

  const fetchHistory = (userId: string) => {
    try {
      const q = query(
        collection(db, 'history'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      )

      unsubscribe = onSnapshot(q, (snapshot) => {
        historyItems.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as HistoryItem))
        loading.value = false
      }, (err) => {
        error.value = err.message
        loading.value = false
      })
    } catch (err: any) {
      error.value = err.message
      loading.value = false
    }
  }

  const addHistoryItem = async (text: string, settings: LaserSettings) => {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('Please sign in before saving history.')
      }

      await addDoc(collection(db, 'history'), {
        text,
        settings,
        status: 'pending',
        userId: user.uid,
        timestamp: serverTimestamp()
      })
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  const updateHistoryItem = async (id: string, updates: Partial<HistoryItem>) => {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('Please sign in before updating history.')
      }

      const docRef = doc(db, 'history', id)
      const docSnapshot = await getDoc(docRef)
      if (!docSnapshot.exists() || docSnapshot.data()?.userId !== user.uid) {
        throw new Error('You do not have permission to update this history item.')
      }

      await updateDoc(docRef, updates as any)
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  const deleteHistoryItem = async (id: string) => {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('Please sign in before deleting history.')
      }

      const docRef = doc(db, 'history', id)
      const docSnapshot = await getDoc(docRef)
      if (!docSnapshot.exists() || docSnapshot.data()?.userId !== user.uid) {
        throw new Error('You do not have permission to delete this history item.')
      }

      await deleteDoc(docRef)
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  onMounted(() => {
    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribe?.()
      unsubscribe = null

      if (!user) {
        historyItems.value = []
        loading.value = false
        return
      }

      loading.value = true
      fetchHistory(user.uid)
    })
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
    if (unsubscribeAuth) {
      unsubscribeAuth()
    }
  })

  return {
    historyItems,
    loading,
    error,
    addHistoryItem,
    updateHistoryItem,
    deleteHistoryItem
  }
}
