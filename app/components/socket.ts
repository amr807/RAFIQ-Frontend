"use server";
import { io } from "socket.io-client"
import { cookies } from "next/headers";

export const socket = io(`${process.env.NEXT_PUBLIC_Base_URL}/notifications`, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  query: {
    access_token: cookies().get("access_token")?.value,
  },
})

// Helper function to get access token from cookies
export const connectSocket = () => {
  if (!socket.connected) {
    try {
      socket.connect()
      return true
    } catch (error) {
      console.error("Failed to connect socket:", error)
      return false
    }
  }
  return true
}

// Helper function to disconnect socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect()
  }
}
