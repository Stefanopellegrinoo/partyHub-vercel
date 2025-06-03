"use client"

import { useState, useEffect, useCallback } from "react"

export function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null)

  const startCountdown = useCallback(
    (seconds: number) => {
      setTimeLeft(seconds)

      if (timerId) {
        clearInterval(timerId)
      }

      const id = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(id)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      setTimerId(id)

      return () => {
        if (id) clearInterval(id)
      }
    },
    [timerId],
  )

  const stopCountdown = useCallback(() => {
    if (timerId) {
      clearInterval(timerId)
      setTimerId(null)
    }
    setTimeLeft(0)
  }, [timerId])

  useEffect(() => {
    return () => {
      if (timerId) clearInterval(timerId)
    }
  }, [timerId])

  return { timeLeft, startCountdown, stopCountdown }
}
