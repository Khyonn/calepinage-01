import { useEffect, useState } from 'react'

export interface ImageDimensions {
  naturalWidth: number
  naturalHeight: number
}

export function useImageDimensions(url: string | undefined): ImageDimensions | null {
  const [dims, setDims] = useState<ImageDimensions | null>(null)

  useEffect(() => {
    if (!url) {
      setDims(null)
      return
    }
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (cancelled) return
      setDims({ naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight })
    }
    img.src = url
    return () => {
      cancelled = true
    }
  }, [url])

  return dims
}
