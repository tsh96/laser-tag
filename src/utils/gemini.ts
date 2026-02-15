import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY_STORAGE_KEY = 'laser-tag-gemini-api-key'

class MissingGeminiApiKeyError extends Error {
  constructor() {
    super('Gemini API key is required')
    this.name = 'MissingGeminiApiKeyError'
  }
}

export function getGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    const storedApiKey = window.localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY)?.trim()
    if (storedApiKey) {
      return storedApiKey
    }
  }

  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim()
}

export function saveGeminiApiKey(apiKey: string): void {
  if (typeof window === 'undefined') {
    return
  }

  const normalizedApiKey = apiKey.trim()
  if (!normalizedApiKey) {
    window.localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, normalizedApiKey)
}

/**
 * Extract names from an image using Gemini AI
 * @param imageFile - The image file containing names
 * @returns Array of extracted names
 */
export async function extractNamesFromImage(imageFile: File): Promise<string[]> {
  try {
    const geminiApiKey = getGeminiApiKey()
    if (!geminiApiKey) {
      throw new MissingGeminiApiKeyError()
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Convert image to base64
    const reader = new FileReader()
    const imageData = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(imageFile)
    })

    const base64Data = imageData.split(',')[1]
    const mimeType = imageFile.type

    const prompt = `Extract all names from this image. The image may contain a handwritten or printed list of names. 
Return ONLY the names, one per line, without any numbering, bullets, or additional text.
If no names are found, return an empty response.`

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data
        }
      },
      prompt
    ])

    const response = await result.response
    const text = response.text()

    // Split by newlines and filter out empty lines
    const names = text
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0 && !name.match(/^[\d\.\-\*]+$/))
      .map(name => name.toUpperCase())

    return names
  } catch (error) {
    console.error('Error extracting names:', error)
    if (error instanceof MissingGeminiApiKeyError) {
      throw new Error('Gemini API key is required. Add it in History before using AI import.')
    }
    throw new Error('Failed to extract names from image')
  }
}
