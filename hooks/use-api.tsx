"use client"

import useSWR, { type SWRConfiguration } from "swr"
import axios from "@/lib/axios"

// Fetcher genérico para useSWR
const fetcher = async (url: string) => {
  const response = await axios.get(url)
  return response.data
}

export function useApi<T>(url: string | null, options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    ...options,
  })

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}
