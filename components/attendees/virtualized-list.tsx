"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"

interface VirtualizedListProps<T> {
  items: T[]
  height: number
  width?: string | number
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
}

export function VirtualizedList<T>({
  items,
  height,
  width = "100%",
  itemHeight,
  renderItem,
  overscan = 5,
  className,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  })

  if (!mounted) {
    return <div style={{ height, width }} className={className} />
  }

  return (
    <div
      ref={parentRef}
      style={{
        height,
        width,
        overflow: "auto",
      }}
      className={className}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  )
}
