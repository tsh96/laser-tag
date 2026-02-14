import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

/**
 * Extract names from an image using Gemini AI
 * @param imageFile - The image file containing names
 * @returns Array of extracted names
 */
export async function extractNamesFromImage(imageFile: File): Promise<string[]> {
  try {
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

    return names
  } catch (error) {
    console.error('Error extracting names:', error)
    throw new Error('Failed to extract names from image')
  }
}
