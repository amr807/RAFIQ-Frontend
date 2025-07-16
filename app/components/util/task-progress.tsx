/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { Clock, Navigation, Package, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"

interface TaskProgressProps {
  taskId: string
  progress: number
  estimatedTime?: string
  estimatedDistance?: string
  status?: string
}

export function TaskProgressPanel({
  taskId,
  progress,
  estimatedTime,
  estimatedDistance,
  status = "In Progress",
}: TaskProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  // Animate progress on change
  useEffect(() => {
    // Start from current animated value
    const startValue = animatedProgress
    const endValue = progress || 0
    const duration = 1000 // 1 second animation
    const startTime = performance.now()

    const animateProgress = (currentTime: number) => {
      const elapsedTime = currentTime - startTime
      const progress = Math.min(elapsedTime / duration, 1)
      const currentValue = startValue + (endValue - startValue) * progress

      setAnimatedProgress(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animateProgress)
      }
    }

    requestAnimationFrame(animateProgress)
  }, [progress])

  // Get status color
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes("complete")) return "green"
    if (statusLower.includes("progress")) return "blue"
    if (statusLower.includes("pending") || statusLower.includes("waiting")) return "amber"
    if (statusLower.includes("cancel") || statusLower.includes("fail")) return "rose"
    if (statusLower.includes("started")) return "red"
    return "gray"
  }

  const statusColor = getStatusColor(status)

  // Get status icon
  const StatusIcon = status.toLowerCase().includes("progress")
    ? Loader2
    : status.toLowerCase().includes("complete")
      ? CheckCircle
      : AlertTriangle

  return (
    <div className="bg-gray-900 text-white rounded-lg shadow-lg border border-gray-800 p-4 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              statusColor === "green"
                ? "bg-green-500"
                : statusColor === "blue"
                  ? "bg-blue-500"
                  : statusColor === "amber"
                    ? "bg-amber-500"
                    : statusColor === "rose"
                      ? "bg-rose-500"
                      : "bg-gray-500"
            }`}
          />
          <h3 className="font-medium text-lg">Task Progress</h3>
        </div>
        <div className="flex items-center">
          <StatusIcon
            className={`h-5 w-5 mr-2 ${
              statusColor === "green"
                ? "text-green-400"
                : statusColor === "blue"
                  ? "text-blue-400 animate-spin"
                  : statusColor === "amber"
                    ? "text-amber-400"
                    : statusColor === "rose"
                      ? "text-rose-400"
                      : "text-gray-400"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              statusColor === "green"
                ? "text-green-400"
                : statusColor === "blue"
                  ? "text-blue-400"
                  : statusColor === "amber"
                    ? "text-amber-400"
                    : statusColor === "rose"
                      ? "text-rose-400"
                      : "text-gray-400"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${
            statusColor === "green"
              ? "bg-green-500"
              : statusColor === "blue"
                ? "bg-blue-500"
                : statusColor === "amber"
                  ? "bg-amber-500"
                  : statusColor === "rose"
                    ? "bg-rose-500"
                    : "bg-gray-500"
          }`}
          style={{ width: `${animatedProgress}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400 mb-4">
        <span>{Math.round(animatedProgress)}% Complete</span>
        <span>Task #{taskId}</span>
      </div>

      {(estimatedTime || estimatedDistance) && (
        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 mt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Route Information</h4>

          <div className="grid grid-cols-2 gap-3">
            {estimatedTime && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-700 rounded-full">
                  <Clock className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Estimated Time</p>
                  <p className="text-sm font-medium text-white">{estimatedTime}</p>
                </div>
              </div>
            )}

            {estimatedDistance && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-700 rounded-full">
                  <Navigation className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Distance</p>
                  <p className="text-sm font-medium text-white">{estimatedDistance}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-blue-400 mr-2" />
            <span className="text-sm font-medium">Delivery Status</span>
          </div>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              statusColor === "green"
                ? "bg-green-900/50 text-green-300 border border-green-700"
                : statusColor === "blue"
                  ? "bg-blue-900/50 text-blue-300 border border-blue-700"
                  : statusColor === "amber"
                    ? "bg-amber-900/50 text-amber-300 border border-amber-700"
                    : statusColor === "rose"
                      ? "bg-rose-900/50 text-rose-300 border border-rose-700"
                      : "bg-gray-800/50 text-gray-300 border border-gray-700"
            }`}
          >
            {status}
          </span>
        </div>
      </div>
    </div>
  )
}
