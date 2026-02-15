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
  serverTimestamp,
  Unsubscribe,
  onSnapshot
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase'
import type { LaserSettings, HistoryItem, RichText } from '../types'

export function useHistory() {
  const PAGE_SIZE = 20
  const historyItems = ref<HistoryItem[]>([])
  const loading = ref(true)
  const loadingMore = ref(false)
  const hasMore = ref(false)
  const error = ref<string | null>(null)
  let unsubscribeAuth: Unsubscribe | null = null
  let unsubscribeListener: Unsubscribe | null = null
  const currentUserId = ref<string | null>(null)
  const allHistoryItems = ref<HistoryItem[]>([])
  const displayLimit = ref(PAGE_SIZE)

  const fetchHistory = (userId: string) => {
    if (unsubscribeListener) {
      unsubscribeListener()
    }

    loading.value = true
    error.value = null
    displayLimit.value = PAGE_SIZE

    const q = query(
      collection(db, 'history'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    )

    unsubscribeListener = onSnapshot(q, (snapshot) => {
      try {
        allHistoryItems.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as HistoryItem)).sort((a, b) => {
          const aTime = a.timestamp?.toMillis?.() ?? 0
          const bTime = b.timestamp?.toMillis?.() ?? 0
          return bTime - aTime
        })

        historyItems.value = allHistoryItems.value.slice(0, displayLimit.value)
        hasMore.value = allHistoryItems.value.length > displayLimit.value
        loading.value = false
      } catch (err: any) {
        error.value = err.message
        loading.value = false
      }
    }, (err) => {
      error.value = err.message
      loading.value = false
    })
  }

  const addHistoryItem = async (text: string, settings: LaserSettings, richText?: RichText) => {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('Please sign in before saving history.')
      }

      const data: any = {
        text,
        settings,
        status: 'pending',
        userId: user.uid,
        timestamp: serverTimestamp()
      }

      if (richText) {
        data.richText = richText
      }

      const docRef = await addDoc(collection(db, 'history'), data)
      return docRef.id
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

      // Filter out undefined values to prevent Firestore errors
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      )

      await updateDoc(docRef, filteredUpdates as any)
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

  const loadMoreHistory = () => {
    if (loadingMore.value || !hasMore.value) {
      return
    }

    loadingMore.value = true
    displayLimit.value += PAGE_SIZE
    historyItems.value = allHistoryItems.value.slice(0, displayLimit.value)
    hasMore.value = allHistoryItems.value.length > displayLimit.value
    loadingMore.value = false
  }

  onMounted(() => {
    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      currentUserId.value = user?.uid ?? null

      if (!user) {
        if (unsubscribeListener) {
          unsubscribeListener()
          unsubscribeListener = null
        }
        historyItems.value = []
        allHistoryItems.value = []
        hasMore.value = false
        loading.value = false
        return
      }

      fetchHistory(user.uid)
    })
  })

  onUnmounted(() => {
    if (unsubscribeAuth) {
      unsubscribeAuth()
    }
    if (unsubscribeListener) {
      unsubscribeListener()
    }
  })

  return {
    historyItems,
    loading,
    loadingMore,
    hasMore,
    error,
    addHistoryItem,
    updateHistoryItem,
    deleteHistoryItem,
    loadMoreHistory
  }
}
