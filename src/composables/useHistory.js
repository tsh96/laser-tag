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
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../firebase'

export function useHistory() {
  const historyItems = ref([])
  const loading = ref(true)
  const error = ref(null)
  let unsubscribe = null

  const fetchHistory = () => {
    try {
      const q = query(collection(db, 'history'), orderBy('timestamp', 'desc'))
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        historyItems.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        loading.value = false
      }, (err) => {
        error.value = err.message
        loading.value = false
      })
    } catch (err) {
      error.value = err.message
      loading.value = false
    }
  }

  const addHistoryItem = async (text, settings) => {
    try {
      await addDoc(collection(db, 'history'), {
        text,
        settings,
        status: 'pending',
        timestamp: serverTimestamp()
      })
    } catch (err) {
      error.value = err.message
    }
  }

  const updateHistoryItem = async (id, updates) => {
    try {
      const docRef = doc(db, 'history', id)
      await updateDoc(docRef, updates)
    } catch (err) {
      error.value = err.message
    }
  }

  const deleteHistoryItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'history', id))
    } catch (err) {
      error.value = err.message
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
