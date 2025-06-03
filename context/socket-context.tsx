"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "@/hooks/use-auth"
import { getLocalStorage } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
  joinRoom: (room: string) => void
  leaveRoom: (room: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectInterval = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    // Don't connect if already connected or not authenticated
    if (socket || !isAuthenticated) return

    try {
      // Get auth token
      const token = localStorage.getItem("authToken")

      if (!token) {
        console.warn("No auth token available for socket connection")
        return
      }

      // Initialize socket connection
      const socketInstance = io("http://localhost:4002", {
        // withCredentials: true,
        auth: { token },
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      })

      // Set up event handlers
      socketInstance.on("connection", () => {
        console.log("Socket connected")
        setIsConnected(true)
        reconnectAttempts.current = 0

        // Clear any reconnect interval
        if (reconnectInterval.current) {
          clearInterval(reconnectInterval.current)
          reconnectInterval.current = null
        }
      })

      socketInstance.on("disconnect", (reason) => {
        console.log(`Socket disconnected: ${reason}`)
        setIsConnected(false)

        // If the server closed the connection, try to reconnect manually
        if (reason === "io server disconnect") {
          // Start manual reconnection if not already trying
          if (!reconnectInterval.current && reconnectAttempts.current < maxReconnectAttempts) {
            reconnectInterval.current = setInterval(() => {
              reconnectAttempts.current += 1
              console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`)

              socketInstance.connect()

              if (reconnectAttempts.current >= maxReconnectAttempts) {
                if (reconnectInterval.current) {
                  clearInterval(reconnectInterval.current)
                  reconnectInterval.current = null
                }

                toast({
                  title: "Error de conexión",
                  description: "No se pudo establecer conexión con el servidor. Por favor, recarga la página.",
                  variant: "destructive",
                })
              }
            }, 5000)
          }
        }
      })

      socketInstance.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
      })

      socketInstance.on("error", (error) => {
        console.error("Socket error:", error)
      })

      // Set socket instance
      setSocket(socketInstance)
    } catch (error) {
      console.error("Error initializing socket connection:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo establecer conexión con el servidor.",
        variant: "destructive",
      })
    }
  }, [isAuthenticated, socket, toast])

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)

      // Clear any reconnect interval
      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current)
        reconnectInterval.current = null
      }
    }
  }, [socket])

  const joinRoom = useCallback(
    (room: string) => {
      if (socket && isConnected) {
        socket.emit("join-room", room)
      }
    },
    [socket, isConnected],
  )

  const leaveRoom = useCallback(
    (room: string) => {
      if (socket && isConnected) {
        socket.emit("leave-room", room)
      }
    },
    [socket, isConnected],
  )

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated && !socket) {
      connect()
    }

    // Disconnect when not authenticated
    if (!isAuthenticated && socket) {
      disconnect()
    }

    // Clean up on unmount
    return () => {
      if (socket) {
        socket.disconnect()
      }

      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current)
      }
    }
  }, [isAuthenticated, socket, connect, disconnect])

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connect,
        disconnect,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocketContext() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error("useSocketContext must be used within a SocketProvider")
  }
  return context
}
