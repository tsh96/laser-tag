import type { LaserSettings } from '../types'

/**
 * Convert units to pixels at 300 DPI
 * @param value - The value in the specified unit
 * @param unit - The unit (mm, cm, in)
 * @returns Value in pixels at 300 DPI
 */
export function convertToPixels(value: number, unit: LaserSettings['unit']): number {
  const DPI = 300

  switch (unit) {
    case 'mm':
      return (value / 25.4) * DPI
    case 'cm':
      return (value / 2.54) * DPI
    case 'in':
      return value * DPI
    default:
      return value
  }
}

/**
 * Render text on canvas with auto-scaling
 * @param canvas - The canvas element
 * @param text - The text to render
 * @param settings - Settings object with width, height, padding, unit
 * @returns The rendered font size in points, or null if rendering is skipped/failed
 */
export function renderCanvas(canvas: HTMLCanvasElement, text: string, settings: LaserSettings): number | null {
  const { width, height, padding, unit } = settings

  // Convert dimensions to pixels at 300 DPI
  const widthPx = convertToPixels(width, unit)
  const heightPx = convertToPixels(height, unit)
  const paddingPx = convertToPixels(padding, unit)

  // Set canvas size
  canvas.width = widthPx
  canvas.height = heightPx

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Clear canvas with white background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, widthPx, heightPx)

  // Draw logo dead-zone with hatch pattern
  ctx.fillStyle = '#F3F4F6'
  ctx.fillRect(0, 0, paddingPx, heightPx)

  // Draw hatch pattern
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, paddingPx, heightPx)
  ctx.clip()

  ctx.strokeStyle = '#D1D5DB'
  ctx.lineWidth = 1
  const hatchSpacing = 10

  for (let i = -heightPx; i < paddingPx; i += hatchSpacing) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + heightPx, heightPx)
    ctx.stroke()
  }

  ctx.restore()

  // Calculate engrave zone
  const engraveX = paddingPx
  const engraveWidth = widthPx - paddingPx
  const engraveHeight = heightPx

  // Apply 5% safety margin
  const safetyMargin = 0.05
  const safeWidth = engraveWidth * (1 - safetyMargin * 2)
  const safeHeight = engraveHeight * (1 - safetyMargin * 2)

  if (!text || text.trim() === '') {
    return null
  }

  // Split text into lines
  const lines = text.split('\n')

  // Auto-scale text to fit
  ctx.fillStyle = '#000000'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Binary search for optimal font size
  const PT_TO_PX = 300 / 72
  const MAX_AUTO_SIZE = 32 * PT_TO_PX
  const lineHeightMultiplier = 1.2

  let fontSize: number

  if (settings.autoSize || settings.autoSize === undefined) {
    let low = 1
    let high = Math.floor(MAX_AUTO_SIZE)
    let bestSize = low

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      ctx.font = `${mid}px Arial`

      let maxWidth = 0
      for (const line of lines) {
        const metrics = ctx.measureText(line)
        maxWidth = Math.max(maxWidth, metrics.width)
      }

      const totalHeight = mid * lines.length * lineHeightMultiplier

      if (maxWidth <= safeWidth && totalHeight <= safeHeight) {
        bestSize = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    fontSize = bestSize
  } else {
    fontSize = (settings.fontSize || 24) * PT_TO_PX
  }

  ctx.font = `${fontSize}px Arial`

  // Draw text centered in engrave zone
  const textX = engraveX + engraveWidth / 2
  const totalHeight = fontSize * lines.length * lineHeightMultiplier
  const startY = (engraveHeight - totalHeight) / 2 + (fontSize * lineHeightMultiplier) / 2

  lines.forEach((line, index) => {
    const lineY = startY + (index * fontSize * lineHeightMultiplier)
    ctx.fillText(line, textX, lineY)
  })

  return fontSize / PT_TO_PX
}

/**
 * Render a miniature preview of the canvas
 * @param canvas - The target canvas element
 * @param text - The text to render
 * @param settings - Settings object
 * @param maxWidth - Maximum width of the preview
 * @param maxHeight - Maximum height of the preview
 */
export function renderMiniature(canvas: HTMLCanvasElement, text: string, settings: LaserSettings, maxWidth = 200, maxHeight = 100): void {
  const { width, height, padding, unit } = settings

  // Calculate aspect ratio
  const widthPx = convertToPixels(width, unit)
  const heightPx = convertToPixels(height, unit)
  const aspectRatio = widthPx / heightPx

  // Calculate preview dimensions
  let previewWidth, previewHeight
  if (aspectRatio > maxWidth / maxHeight) {
    previewWidth = maxWidth
    previewHeight = maxWidth / aspectRatio
  } else {
    previewHeight = maxHeight
    previewWidth = maxHeight * aspectRatio
  }

  canvas.width = previewWidth
  canvas.height = previewHeight

  // Create a temporary canvas at full resolution
  const tempCanvas = document.createElement('canvas')
  renderCanvas(tempCanvas, text, settings)

  // Scale down to preview size
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(tempCanvas, 0, 0, previewWidth, previewHeight)
}
