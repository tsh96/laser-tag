/**
 * Generate a 1-bit monochrome BMP file from canvas
 * @param canvas - The canvas element
 * @param isFlipped - Whether to flip the image horizontally
 * @returns BMP file blob
 */
export function generateBMP(canvas: HTMLCanvasElement, isFlipped = false): Blob {
  const width = canvas.width
  const height = canvas.height

  // Get image data from canvas
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get canvas context')

  const imageData = ctx.getImageData(0, 0, width, height)
  const pixels = imageData.data

  // Calculate row size (must be multiple of 4 bytes)
  const rowSize = Math.floor((width + 31) / 32) * 4
  const pixelArraySize = rowSize * height

  // BMP file size
  const fileSize = 62 + pixelArraySize // 14 (file header) + 40 (info header) + 8 (color table) + pixel data

  // Create buffer for BMP file
  const buffer = new ArrayBuffer(fileSize)
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)

  // BMP File Header (14 bytes)
  view.setUint8(0, 0x42) // 'B'
  view.setUint8(1, 0x4D) // 'M'
  view.setUint32(2, fileSize, true) // File size
  view.setUint32(6, 0, true) // Reserved
  view.setUint32(10, 62, true) // Offset to pixel data

  // DIB Header (BITMAPINFOHEADER - 40 bytes)
  view.setUint32(14, 40, true) // Header size
  view.setInt32(18, width, true) // Width
  view.setInt32(22, height, true) // Height (positive = bottom-up)
  view.setUint16(26, 1, true) // Planes
  view.setUint16(28, 1, true) // Bits per pixel (1-bit)
  view.setUint32(30, 0, true) // Compression (none)
  view.setUint32(34, pixelArraySize, true) // Image size
  view.setInt32(38, 11811, true) // X pixels per meter (300 DPI)
  view.setInt32(42, 11811, true) // Y pixels per meter (300 DPI)
  view.setUint32(46, 2, true) // Colors used
  view.setUint32(50, 2, true) // Important colors

  // Color table (8 bytes for 2 colors)
  // Color 0: White (background)
  view.setUint8(54, 255) // Blue
  view.setUint8(55, 255) // Green
  view.setUint8(56, 255) // Red
  view.setUint8(57, 0)   // Reserved

  // Color 1: Black (foreground)
  view.setUint8(58, 0)   // Blue
  view.setUint8(59, 0)   // Green
  view.setUint8(60, 0)   // Red
  view.setUint8(61, 0)   // Reserved

  // Pixel data (1-bit, packed, bottom-up)
  let offset = 62

  for (let y = height - 1; y >= 0; y--) {
    let bitBuffer = 0
    let bitCount = 0
    let byteCount = 0

    for (let x = 0; x < width; x++) {
      const srcX = isFlipped ? (width - 1 - x) : x
      const pixelIndex = (y * width + srcX) * 4

      // Convert to grayscale and threshold
      const r = pixels[pixelIndex]
      const g = pixels[pixelIndex + 1]
      const b = pixels[pixelIndex + 2]
      const gray = 0.299 * r + 0.587 * g + 0.114 * b

      // Threshold: > 128 = white (0), <= 128 = black (1)
      const bit = gray <= 128 ? 1 : 0

      bitBuffer = (bitBuffer << 1) | bit
      bitCount++

      if (bitCount === 8) {
        bytes[offset++] = bitBuffer
        byteCount++
        bitBuffer = 0
        bitCount = 0
      }
    }

    // Write remaining bits in the row
    if (bitCount > 0) {
      bitBuffer <<= (8 - bitCount)
      bytes[offset++] = bitBuffer
      byteCount++
    }

    // Pad row to multiple of 4 bytes
    while (byteCount % 4 !== 0) {
      bytes[offset++] = 0
      byteCount++
    }
  }

  return new Blob([buffer], { type: 'image/bmp' })
}

/**
 * Trigger download of a BMP file
 * @param blob - The BMP blob
 * @param filename - Name for the downloaded file
 */
export function downloadBMP(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

let overwriteHandle: FileSystemFileHandle | null = null

/**
 * Save BMP to a fixed path when supported, asking user only the first time.
 * Returns whether the save was completed, cancelled by user, or needs fallback.
 */
export async function overwriteBMP(
  blob: Blob,
  filename = 'output.bmp'
): Promise<'saved' | 'cancelled' | 'fallback'> {
  const pickerWindow = window as Window & {
    showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>
  }

  if (!pickerWindow.showSaveFilePicker) {
    return 'fallback'
  }

  try {
    if (!overwriteHandle) {
      overwriteHandle = await pickerWindow.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'BMP image',
          accept: { 'image/bmp': ['.bmp'] }
        }]
      })
    }

    const writable = await overwriteHandle.createWritable()
    await writable.write(blob)
    await writable.close()
    return 'saved'
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'cancelled'
    }

    overwriteHandle = null
    return 'fallback'
  }
}
