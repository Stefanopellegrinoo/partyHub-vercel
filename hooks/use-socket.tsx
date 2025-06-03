"use client"

import { useSocketContext } from "@/context/socket-context"

export function useSocket() {
  const { socket } = useSocketContext()
  return socket
}
