"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useImageLoading } from "@/hooks/use-image-loading"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  objectFit = "cover",
}: OptimizedImageProps) {
  const { isLoaded, hasError } = useImageLoading(src)
  const [placeholderUrl, setPlaceholderUrl] = useState(`/placeholder.svg?height=${height}&width=${width}`)

  // Generar un placeholder con las dimensiones correctas
  useEffect(() => {
    setPlaceholderUrl(`/placeholder.svg?height=${height}&width=${width}`)
  }, [height, width])

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ width, height }}>
      {/* Placeholder mientras carga o si hay error */}
      {(!isLoaded || hasError) && (
        <div
          className="absolute inset-0 bg-muted animate-pulse"
          style={{
            backgroundImage: `url(${placeholderUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Imagen real */}
      {!hasError && (
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          className={cn("transition-opacity duration-300", isLoaded ? "opacity-100" : "opacity-0", {
            "object-cover": objectFit === "cover",
            "object-contain": objectFit === "contain",
            "object-fill": objectFit === "fill",
            "object-none": objectFit === "none",
            "object-scale-down": objectFit === "scale-down",
          })}
          priority={priority}
          onLoad={() => {}}
          onError={() => {}}
        />
      )}
    </div>
  )
}
