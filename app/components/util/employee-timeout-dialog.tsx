"use client"

import type React from "react"
import { AlertTriangle, Clock } from "lucide-react"

interface EmployeeTimeoutDialogProps {
  isVisible: boolean
  onClose: () => void
  employeeName?: string
  lastUpdateTime?: string
}

export const EmployeeTimeoutDialog: React.FC<EmployeeTimeoutDialogProps> = ({
  isVisible,
  onClose,
  employeeName = "Employee",
  lastUpdateTime = "Unknown",
}) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="bg-yellow-100 p-2 rounded-full mr-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold">Employee Timeout</h2>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 mb-2">
            <strong>{employeeName}</strong> has not sent location updates for an extended period.
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>Last update: {lastUpdateTime}</span>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-sm">
            The employee may be experiencing connectivity issues or their device may be offline. Consider contacting
            them directly to verify their status.
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              alert("Contact functionality would go here")
              onClose()
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
          >
            Contact Employee
          </button>
        </div>
      </div>
    </div>
  )
}

