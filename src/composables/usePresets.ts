import { ref } from 'vue'
import {
    collection,
    addDoc,
    query,
    orderBy,
    serverTimestamp,
    onSnapshot,
    Unsubscribe,
    where,
    updateDoc,
    doc,
    getDocs
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase'
import type { LaserSettings, Preset } from '../types'

export function usePresets() {
    const presets = ref<Preset[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    let unsubscribeAuth: Unsubscribe | null = null
    let unsubscribeListener: Unsubscribe | null = null
    const currentUserId = ref<string | null>(null)
    let initialized = false

    const loadPresets = (userId: string) => {
        if (unsubscribeListener) {
            unsubscribeListener()
        }

        loading.value = true
        error.value = null

        const q = query(
            collection(db, 'presets'),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        )

        unsubscribeListener = onSnapshot(q, (snapshot) => {
            try {
                presets.value = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Preset))
                loading.value = false
            } catch (err) {
                error.value = 'Failed to load presets'
                loading.value = false
                console.error('Error loading presets:', err)
            }
        })
    }

    const savePreset = async (name: string, settings: LaserSettings) => {
        if (!currentUserId.value) {
            throw new Error('User not authenticated')
        }

        try {
            const presetsRef = collection(db, 'presets')
            
            // Check if a preset with the same name already exists for this user
            const q = query(
                presetsRef,
                where('userId', '==', currentUserId.value),
                where('name', '==', name)
            )
            const existingPresets = await getDocs(q)
            
            if (!existingPresets.empty) {
                // Update existing preset
                const existingDoc = existingPresets.docs[0]
                await updateDoc(doc(db, 'presets', existingDoc.id), {
                    settings,
                    timestamp: serverTimestamp()
                })
            } else {
                // Create new preset
                await addDoc(presetsRef, {
                    name,
                    settings,
                    userId: currentUserId.value,
                    timestamp: serverTimestamp()
                })
            }
        } catch (err) {
            console.error('Error saving preset:', err)
            error.value = 'Failed to save preset'
            throw err
        }
    }

    const initPresets = () => {
        if (initialized) return
        initialized = true
        unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                currentUserId.value = user.uid
                loadPresets(user.uid)
            } else {
                currentUserId.value = null
                presets.value = []
                if (unsubscribeListener) {
                    unsubscribeListener()
                }
            }
        })
    }

    const cleanup = () => {
        if (unsubscribeAuth) unsubscribeAuth()
        if (unsubscribeListener) unsubscribeListener()
    }

    initPresets()

    return {
        presets,
        loading,
        error,
        savePreset,
        initPresets,
        cleanup
    }
}