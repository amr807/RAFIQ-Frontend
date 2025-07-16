"use client"

/* eslint-disable react-hooks/exhaustive-deps */
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge, Bell, Check, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  fetchNotificationsFromDB,
  UptateAllNotificationsFromDB
} from "./fetchfrom_BE/etch_notification"
import { FindId } from "./fetchfrom_BE/fetch_id"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { socket } from "./socket"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

type Notification = {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: "info" | "success" | "warning" | "error"
  avatar?: string
  recipient_id?: string
  priority?: string
  created_at?: Date
  updated_at?: Date
  notificationAttachment?: Record<string, unknown>
}
const NOTIFICATION_STORAGE_KEY = "erp-notifications-v6"

export default function Bill() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()
  const dotVariants = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: {
      scale: [0.8, 1.2, 0.8],
      opacity: [0.5, 1, 0.5],
      transition: {
        repeat: Number.POSITIVE_INFINITY,
        duration: 2,
      },
    },
  }

  // Load initial notifications
  useEffect(() => {
    const loadInitialNotifications = async () => {
      try {
        setIsLoading(true)

        // 1. Try to load from localStorage
        const savedNotifications = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
        if (savedNotifications) {
          const parsed = JSON.parse(savedNotifications)
          const withDates = parsed.map((n: { created_at?: string; updated_at?: string }) => ({
            ...n,
            created_at: n.created_at ? new Date(n.created_at) : undefined,
            updated_at: n.updated_at ? new Date(n.updated_at) : undefined,
          }))
          const sorted = sortNotifications(withDates)
          setNotifications(sorted)
          updateNotificationCount(sorted)
          setIsLoading(false)
          return
        }

        // 2. If nothing in localStorage, fetch from DB
        if (session?.user?.email) {
          const dbNotifications = await fetchNotificationsFromDB(String(session?.user?.email))
          if (dbNotifications) {
            const formatted = dbNotifications.map((n: Record<string, unknown>) => formatNotification(n))
            const sorted = sortNotifications(formatted)
            setNotifications(sorted)
            updateNotificationCount(sorted)
            updateLocalStorage(sorted)
          }
        }
      } catch (error) {
        console.error("Failed to load notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialNotifications()
  }, [session?.user?.email])

  const sortNotifications = (notifs: Notification[]): Notification[] => {
    return [...notifs].sort((a, b) => {
      // If both are read or both are unread, sort by date
      if (a.read === b.read) {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      }
      // Unread notifications come first
      return a.read ? 1 : -1
    })
  }

  // Format notification from DB
  const formatNotification = (data: {
    id?: string
    title?: string
    content?: string
    created_at?: string
    updated_at?: string
    is_read?: boolean
    type?: string
    name?: string
    recipient_id?: string
    priority?: string
    attachment?: Record<string, unknown>
  }): Notification => ({
    id: data.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    title: data.title || "New Notification",
    message: data.content || "You have a new notification",
    time: formatTime(data.created_at),
    read: data.is_read || false,
    type: mapNotificationType(data.type),
    avatar: data.name || session?.user?.image,
    recipient_id: data.recipient_id,
    priority: data.priority,
    created_at: data.created_at ? new Date(data.created_at) : new Date(),
    updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
    notificationAttachment: data.attachment,
  })

  // Update localStorage
  const updateLocalStorage = (notifs: Notification[]) => {
    try {
      const forStorage = notifs.map((n) => ({
        ...n,
        created_at: n.created_at?.toISOString(),
        updated_at: n.updated_at?.toISOString(),
      }))
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(forStorage))
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  // Update notification count
  const updateNotificationCount = (notifs: Notification[]) => {
    setNotificationCount(notifs.filter((n) => !n.read).length)
  }

  // Centralized state updater with sorting
  const updateNotifications = (updater: (prev: Notification[]) => Notification[]) => {
    setNotifications((prev) => {
      const newNotifications = sortNotifications(updater(prev))
      updateLocalStorage(newNotifications)
      updateNotificationCount(newNotifications)
      return newNotifications
    })
  }

  useEffect(() => {
    let isMounted = true
    let userId: string | null = null

    const setupSocket = async () => {
      try {
        userId = await FindId(String(session?.user?.email))
        if (!userId || !isMounted) return

        // Handle connection and reconnection
        if (!socket.connected) {
          socket.connect()
        }

        // Remove any existing listeners to prevent duplicates
        socket.off(userId)
        socket.off("join_employee_room")

        // Listen for join_employee_room event
        socket.on("connect", () => {
          console.log("Socket connected")
          // Emit join_employee_room event after connection
          socket.emit("join_employee_room", { userId })
        })

        // Set up new listener
        socket.on(userId, (data) => {
          if (!isMounted) return
          handleNewNotification(data)
        })

        // Handle disconnection
        socket.on("disconnect", () => {
          console.log("Socket disconnected, will attempt to reconnect")
        })
      } catch (error) {
        console.error("Socket setup error:", error)
      }
    }

    if (session?.user?.email) {
      setupSocket()
    }

    return () => {
      isMounted = false
      if (userId) {
        socket.off(userId)
        socket.off("join_employee_room")
      }
    }
  }, [session?.user?.email])

  // Handle new notification from socket
  const handleNewNotification = (data: { id: string }) => {
    updateNotifications((prev) => {
      // Check for duplicates
      if (data.id && prev.some((n) => n.id === data.id)) return prev

      const newNotif = formatNotification(data)

      // Show browser notification
      if (typeof window !== "undefined" && Notification.permission === "granted") {
        new Notification(newNotif.title, {
          body: newNotif.message,
          icon: newNotif.avatar,
        })
      }

      return [newNotif, ...prev]
    })
  }

  // Notification actions
  const markAllAsRead = async () => {
    await UptateAllNotificationsFromDB(notifications.filter((n) => n.read == false).map((n) => n.id))
    updateNotifications((prev) => prev.map((n) => ({ ...n, read: true, updated_at: new Date() })))
  }

  const markAsRead = async (id: string) => {
    updateNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true, updated_at: new Date() } : n)))
  }

  const removeNotification = (id: string) => {
    updateNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAllNotifications = () => {
    updateNotifications(() => [])
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    if (notification.notificationAttachment) {
      setSelectedNotification(notification)
    }
  }

  // Helper functions
  const formatTime = (timestamp: Date | string | undefined): string => {
    if (!timestamp) return "Just now"
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
    return date.toLocaleDateString()
  }

  const mapNotificationType = (type: string | undefined): "info" | "success" | "warning" | "error" => {
    if (!type) return "info"
    switch (type.toLowerCase()) {
      case "success":
        return "success"
      case "warning":
        return "warning"
      case "error":
        return "error"
      default:
        return "info"
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      case "warning":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }
  const NotificationItem = ({ notification }: { notification: Notification }) => {
    return (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "p-3 border-b last:border-0 relative cursor-pointer group",
          !notification.read ? "bg-blue-50/50 hover:bg-blue-100/50" : "hover:bg-gray-50/50",
        )}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start">
          {!notification.read && (
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500"></div>
          )}

          <div className={cn("flex-shrink-0 mr-3", !notification.read ? "ml-3" : "ml-5")}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={notification.avatar || "/placeholder.svg"} />
              <AvatarFallback className={cn("text-xs font-bold", getNotificationColor(notification.type))}>
                {notification.title.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 pr-8">
            <div className="flex items-start justify-between">
              <h4
                className={cn("text-sm", notification.read ? "font-normal text-gray-700" : "font-medium text-gray-900")}
              >
                {notification.title}
              </h4>
              <span className={cn("text-xs", notification.read ? "text-gray-400" : "text-gray-500")}>
                {notification.time}
              </span>
            </div>
            <p className={cn("text-xs mt-1", notification.read ? "text-gray-500" : "text-gray-600")}>
              {notification.message}
            </p>
            <div className="mt-1">
              <Badge
                className={cn(
                  "text-[10px] py-0 h-4",
                  getNotificationColor(notification.type),
                  notification.read ? "opacity-80" : "",
                )}
              >
                {notification.type}
              </Badge>
            </div>
          </div>

          <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-blue-600 hover:text-blue-800"
                onClick={(e) => {
                  e.stopPropagation()
                  markAsRead(notification.id)
                }}
              >
                <Check className="h-3 w-3" />
                <span className="sr-only">Mark as read</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation()
                removeNotification(notification.id)
              }}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      {session !== null && status == "authenticated" ? (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <motion.div className="relative cursor-pointer" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="text-gray-600">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold"
                    initial="initial"
                    animate="animate"
                    variants={dotVariants}
                  >
                    {notificationCount}
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-sm font-medium">Notifications</h3>
              <div className="flex space-x-2">
                {notifications.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                      disabled={notificationCount === 0}
                    >
                      Mark all read
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllNotifications}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Clear all
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                </div>
              ) : notifications.length > 0 ? (
                <AnimatePresence>
                  {notifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </div>

            {selectedNotification?.notificationAttachment && (
              <div className="p-3 border-t">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Details</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
                    onClick={() => setSelectedNotification(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="bg-gray-50 p-2 rounded-md text-xs max-h-[150px] overflow-auto">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(selectedNotification.notificationAttachment, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      ) : (
        <></>
      )}
    </>
  )
}
