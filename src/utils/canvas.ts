import type { LaserSettings, RichText, TextSpan } from '../types'

// Constants
const DPI = 300
const PT_TO_PX = DPI / 72
const MAX_AUTO_SIZE_PT = 32
const SAFETY_MARGIN = 0.05
const LINE_HEIGHT_MULTIPLIER = 1.2
const HATCH_SPACING = 10

/**
 * Convert units to pixels at 300 DPI
 * @param value - The value in the specified unit
 * @param unit - The unit (mm, cm, in)
 * @returns Value in pixels at 300 DPI
 */
export function convertToPixels(value: number, unit: LaserSettings['unit']): number {
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
  const safeWidth = engraveWidth * (1 - SAFETY_MARGIN * 2)
  const safeHeight = engraveHeight * (1 - SAFETY_MARGIN * 2)

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
  const MAX_AUTO_SIZE = MAX_AUTO_SIZE_PT * PT_TO_PX

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

      const totalHeight = mid * lines.length * LINE_HEIGHT_MULTIPLIER

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
  const totalHeight = fontSize * lines.length * LINE_HEIGHT_MULTIPLIER
  const startY = (engraveHeight - totalHeight) / 2 + (fontSize * LINE_HEIGHT_MULTIPLIER) / 2

  lines.forEach((line, index) => {
    const lineY = startY + (index * fontSize * LINE_HEIGHT_MULTIPLIER)
    ctx.fillText(line, textX, lineY)
  })

  return fontSize / PT_TO_PX
}

/**
 * Render rich text on canvas with auto-scaling
 * @param canvas - The canvas element
 * @param richText - The rich text to render
 * @param settings - Settings object with width, height, padding, unit
 * @returns The rendered font size in points, or null if rendering is skipped/failed
 */
export function renderRichTextCanvas(canvas: HTMLCanvasElement, richText: RichText, settings: LaserSettings): number | null {
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

  for (let i = -heightPx; i < paddingPx; i += HATCH_SPACING) {
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
  const safeWidth = engraveWidth * (1 - SAFETY_MARGIN * 2)
  const safeHeight = engraveHeight * (1 - SAFETY_MARGIN * 2)

  if (!richText || !richText.spans || richText.spans.length === 0) {
    return null
  }

  const MAX_AUTO_SIZE = MAX_AUTO_SIZE_PT * PT_TO_PX

  // Group spans into lines based on newlines
  const lines: TextSpan[][] = [[]]
  for (const span of richText.spans) {
    const parts = span.text.split('\n')
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        lines.push([])
      }
      if (parts[i]) {
        lines[lines.length - 1].push({ ...span, text: parts[i] })
      }
    }
  }

  let scaleFactor = 1

  if (settings.autoSize || settings.autoSize === undefined) {
    // Binary search for optimal scale factor
    let low = 0.01
    let high = MAX_AUTO_SIZE / PT_TO_PX
    let bestScale = low

    while (high - low > 0.1) {
      const mid = (low + high) / 2
      let maxWidth = 0
      let maxHeight = 0

      for (const lineSpans of lines) {
        let lineWidth = 0
        let lineHeight = 0

        for (const span of lineSpans) {
          const fontSize = (span.fontSize || 24) * mid * PT_TO_PX
          const fontWeight = span.fontWeight === 'bold' ? 'bold' : 'normal'
          const fontStyle = span.fontStyle === 'italic' ? 'italic' : 'normal'
          const fontFamily = span.fontFamily || 'Arial'
          ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`

          const metrics = ctx.measureText(span.text)
          lineWidth += metrics.width
          lineHeight = Math.max(lineHeight, fontSize)
        }

        maxWidth = Math.max(maxWidth, lineWidth)
        maxHeight += lineHeight * LINE_HEIGHT_MULTIPLIER
      }

      if (maxWidth <= safeWidth && maxHeight <= safeHeight) {
        bestScale = mid
        low = mid
      } else {
        high = mid
      }
    }
    scaleFactor = bestScale
  } else {
    scaleFactor = 1
  }

  // Calculate total height for centering
  let totalHeight = 0
  const lineHeights: number[] = []
  for (const lineSpans of lines) {
    let lineHeight = 0
    for (const span of lineSpans) {
      const fontSize = (span.fontSize || 24) * scaleFactor * PT_TO_PX
      lineHeight = Math.max(lineHeight, fontSize)
    }
    lineHeights.push(lineHeight)
    totalHeight += lineHeight * LINE_HEIGHT_MULTIPLIER
  }

  ctx.fillStyle = '#000000'
  ctx.textBaseline = 'middle'

  const textX = engraveX + engraveWidth / 2
  const startY = (engraveHeight - totalHeight) / 2 + (lineHeights[0] * LINE_HEIGHT_MULTIPLIER) / 2

  let currentY = startY

  for (let i = 0; i < lines.length; i++) {
    const lineSpans = lines[i]
    const lineHeight = lineHeights[i]

    // Calculate total width for centering
    let totalWidth = 0
    for (const span of lineSpans) {
      const fontSize = (span.fontSize || 24) * scaleFactor * PT_TO_PX
      const fontWeight = span.fontWeight === 'bold' ? 'bold' : 'normal'
      const fontStyle = span.fontStyle === 'italic' ? 'italic' : 'normal'
      const fontFamily = span.fontFamily || 'Arial'
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
      const metrics = ctx.measureText(span.text)
      totalWidth += metrics.width
    }

    let currentX = textX - totalWidth / 2

    for (const span of lineSpans) {
      const fontSize = (span.fontSize || 24) * scaleFactor * PT_TO_PX
      const fontWeight = span.fontWeight === 'bold' ? 'bold' : 'normal'
      const fontStyle = span.fontStyle === 'italic' ? 'italic' : 'normal'
      const fontFamily = span.fontFamily || 'Arial'
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`

      const metrics = ctx.measureText(span.text)

      // Draw text decoration
      if (span.textDecoration === 'underline') {
        ctx.beginPath()
        ctx.moveTo(currentX, currentY + fontSize * 0.1)
        ctx.lineTo(currentX + metrics.width, currentY + fontSize * 0.1)
        ctx.lineWidth = Math.max(1, fontSize * 0.05)
        ctx.stroke()
      } else if (span.textDecoration === 'line-through') {
        ctx.beginPath()
        ctx.moveTo(currentX, currentY - fontSize * 0.2)
        ctx.lineTo(currentX + metrics.width, currentY - fontSize * 0.2)
        ctx.lineWidth = Math.max(1, fontSize * 0.05)
        ctx.stroke()
      }

      // Draw text
      ctx.fillText(span.text, currentX, currentY)
      currentX += metrics.width
    }

    currentY += lineHeight * LINE_HEIGHT_MULTIPLIER
  }

  // Return average font size
  let avgFontSize = 0
  for (const span of richText.spans) {
    avgFontSize += (span.fontSize || 24) * scaleFactor
  }
  return avgFontSize / richText.spans.length
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

/**
 * Render a miniature preview of rich text canvas
 * @param canvas - The target canvas element
 * @param richText - The rich text to render
 * @param settings - Settings object
 * @param maxWidth - Maximum width of the preview
 * @param maxHeight - Maximum height of the preview
 */
export function renderRichTextMiniature(canvas: HTMLCanvasElement, richText: RichText, settings: LaserSettings, maxWidth = 200, maxHeight = 100): void {
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
  renderRichTextCanvas(tempCanvas, richText, settings)

  // Scale down to preview size
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(tempCanvas, 0, 0, previewWidth, previewHeight)
}
