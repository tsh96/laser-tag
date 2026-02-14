import { ref, onMounted, onUnmounted } from 'vue'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase'
import type { LaserSettings, HistoryItem } from '../types'

export function useHistory() {
  const PAGE_SIZE = 20
  const historyItems = ref<HistoryItem[]>([])
  const loading = ref(true)
  const loadingMore = ref(false)
  const hasMore = ref(false)
  const error = ref<string | null>(null)
  let unsubscribeAuth: Unsubscribe | null = null
  const currentUserId = ref<string | null>(null)
  const lastVisible = ref<QueryDocumentSnapshot<DocumentData> | null>(null)

  const fetchHistory = async (userId: string, reset = true) => {
    try {
      if (reset) {
        loading.value = true
        historyItems.value = []
        lastVisible.value = null
      } else {
        loadingMore.value = true
      }

      error.value = null

      const q = query(
        collection(db, 'history'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        ...(lastVisible.value && !reset
          ? [startAfter(lastVisible.value)]
          : []),
        limit(PAGE_SIZE)
      )

      const snapshot = await getDocs(q)
      const newItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HistoryItem))

      historyItems.value = reset
        ? newItems
        : [...historyItems.value, ...newItems]
      lastVisible.value = snapshot.docs.at(-1) ?? null
      hasMore.value = snapshot.docs.length === PAGE_SIZE
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
      loadingMore.value = false
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
      await fetchHistory(user.uid, true)
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
      await fetchHistory(user.uid, true)
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
      await fetchHistory(user.uid, true)
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  const loadMoreHistory = async () => {
    if (!currentUserId.value || loading.value || loadingMore.value || !hasMore.value) {
      return
    }

    await fetchHistory(currentUserId.value, false)
  }

  onMounted(() => {
    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      currentUserId.value = user?.uid ?? null

      if (!user) {
        historyItems.value = []
        hasMore.value = false
        loading.value = false
        return
      }

      void fetchHistory(user.uid, true)
    })
  })

  onUnmounted(() => {
    if (unsubscribeAuth) {
      unsubscribeAuth()
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
