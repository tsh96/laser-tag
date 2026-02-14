import { ref, onMounted, onUnmounted } from 'vue'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore'
import { db } from '../firebase'
import type { LaserSettings, HistoryItem } from '../types'

export function useHistory() {
  const historyItems = ref<HistoryItem[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  let unsubscribe: Unsubscribe | null = null

  const fetchHistory = () => {
    try {
      const q = query(collection(db, 'history'), orderBy('timestamp', 'desc'))

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
      await addDoc(collection(db, 'history'), {
        text,
        settings,
        status: 'pending',
        timestamp: serverTimestamp()
      })
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  const updateHistoryItem = async (id: string, updates: Partial<HistoryItem>) => {
    try {
      const docRef = doc(db, 'history', id)
      await updateDoc(docRef, updates as any)
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  const deleteHistoryItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'history', id))
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  onMounted(() => {
    fetchHistory()
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
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
