"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CountdownTimerProps {
  expiresAt: number
  totalSeconds: number
  onExpire?: () => void
}

export function CountdownTimer({ expiresAt, totalSeconds, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [progress, setProgress] = useState<number>(100)

  useEffect(() => {
    // Calculate initial time left
    const calculateTimeLeft = () => {
      const now = Date.now()
      const diff = expiresAt - now
      return Math.max(0, Math.floor(diff / 1000))
    }

    // Set initial values
    setTimeLeft(calculateTimeLeft())

    // Update timer every second
    const timerId = setInterval(() => {
      const secondsLeft = calculateTimeLeft()
      setTimeLeft(secondsLeft)
      setProgress((secondsLeft / totalSeconds) * 100)

      if (secondsLeft === 0) {
        clearInterval(timerId)
        if (onExpire) onExpire()
      }
    }, 1000)

    return () => clearInterval(timerId)
  }, [expiresAt, totalSeconds, onExpire])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="space-y-2">
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertTitle>Tiempo restante</AlertTitle>
        <AlertDescription>{formatTime(timeLeft)}</AlertDescription>
      </Alert>
      <Progress value={progress} className="h-2" />
    </div>
  )
}
