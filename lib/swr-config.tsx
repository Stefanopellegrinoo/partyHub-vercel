"use client"

import type React from "react"

import { SWRConfig } from "swr"

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetch(url).then((res) => res.json()),
        revalidateOnFocus: false, // No revalidar al volver a la pestaña
        revalidateIfStale: true,
        revalidateOnReconnect: true,
        errorRetryCount: 3,
        dedupingInterval: 5000, // 5 segundos
      }}
    >
      {children}
    </SWRConfig>
  )
}
