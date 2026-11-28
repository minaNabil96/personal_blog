export interface CompressImageOptions {
  /** Longest edge after resizing. The aspect ratio is preserved unless `aspectRatio` is set. */
  maxWidth?: number
  maxHeight?: number
  /** Target width / height. When set, the image is centre-cropped to this ratio. */
  aspectRatio?: number
  /** Encoder quality, 0-1. */
  quality?: number
}

const COMPRESSIBLE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/bmp',
])

function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file)
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image'))
    }
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/**
 * Shrinks a photo in the browser before it is uploaded, so a phone-sized image
 * does not spend tens of seconds on a slow connection. Animated images and SVGs
 * are returned untouched; any failure falls back to the original file because the
 * server compresses again anyway.
 */
export async function compressImage(
  file: File,
  { maxWidth = 1600, maxHeight = 1600, aspectRatio, quality = 0.85 }: CompressImageOptions = {},
): Promise<File> {
  if (!COMPRESSIBLE_TYPES.has(file.type.toLowerCase())) return file

  try {
    const source = await loadBitmap(file)
    const sourceWidth = source.width
    const sourceHeight = source.height

    if (!sourceWidth || !sourceHeight) return file

    let targetWidth: number
    let targetHeight: number
    let sourceX = 0
    let sourceY = 0
    let sourceCropWidth = sourceWidth
    let sourceCropHeight = sourceHeight

    if (aspectRatio) {
      // Centre-crop the source to the requested ratio first.
      const currentRatio = sourceWidth / sourceHeight
      if (currentRatio > aspectRatio) {
        sourceCropWidth = Math.round(sourceHeight * aspectRatio)
        sourceX = Math.round((sourceWidth - sourceCropWidth) / 2)
      } else if (currentRatio < aspectRatio) {
        sourceCropHeight = Math.round(sourceWidth / aspectRatio)
        sourceY = Math.round((sourceHeight - sourceCropHeight) / 2)
      }

      const scale = Math.min(1, maxWidth / sourceCropWidth, maxHeight / sourceCropHeight)
      targetWidth = Math.max(1, Math.round(sourceCropWidth * scale))
      targetHeight = Math.max(1, Math.round(sourceCropHeight * scale))
    } else {
      const scale = Math.min(1, maxWidth / sourceWidth, maxHeight / sourceHeight)
      targetWidth = Math.max(1, Math.round(sourceWidth * scale))
      targetHeight = Math.max(1, Math.round(sourceHeight * scale))
    }

    // Nothing to gain from re-encoding an image that is already small.
    if (targetWidth === sourceWidth && targetHeight === sourceHeight && file.size < 300 * 1024) {
      return file
    }

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight

    const context = canvas.getContext('2d')
    if (!context) return file

    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(
      source,
      sourceX,
      sourceY,
      sourceCropWidth,
      sourceCropHeight,
      0,
      0,
      targetWidth,
      targetHeight,
    )

    if ('close' in source) source.close()

    const blob =
      (await canvasToBlob(canvas, 'image/webp', quality)) ??
      (await canvasToBlob(canvas, 'image/jpeg', quality))

    if (!blob || blob.size >= file.size) return file

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
    return new File([blob], `${baseName}.webp`, { type: blob.type, lastModified: Date.now() })
  } catch {
    return file
  }
}
