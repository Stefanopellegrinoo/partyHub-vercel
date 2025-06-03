"use client"

import { useState, useEffect } from "react"

export function useImageLoading(src: string | null | undefined) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!src) {
      setIsLoaded(false)
      setHasError(true)
      return
    }

    setIsLoaded(false)
    setHasError(false)

    const img = new Image()
    img.src = src
    img.onload = () => setIsLoaded(true)
    img.onerror = () => setHasError(true)

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return { isLoaded, hasError }
}
