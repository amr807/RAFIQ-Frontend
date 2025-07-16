import type React from "react"
import { CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react"

interface EmployeeStatusIndicatorProps {
  status: "online" | "timeout" | "offline"
  lastUpdate?: string
  className?: string
}

export const EmployeeStatusIndicator: React.FC<EmployeeStatusIndicatorProps> = ({
  status,
  lastUpdate,
  className = "",
}) => {
  const getStatusDetails = () => {
    switch (status) {
      case "online":
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          label: "Online",
          color: "text-green-500",
          bgColor: "bg-green-100",
        }
      case "timeout":
        return {
          icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
          label: "Timeout",
          color: "text-yellow-500",
          bgColor: "bg-yellow-100",
        }
      case "offline":
        return {
          icon: <XCircle className="h-4 w-4 text-red-500" />,
          label: "Offline",
          color: "text-red-500",
          bgColor: "bg-red-100",
        }
      default:
        return {
          icon: <Clock className="h-4 w-4 text-gray-500" />,
          label: "Unknown",
          color: "text-gray-500",
          bgColor: "bg-gray-100",
        }
    }
  }

  const { icon, label, color, bgColor } = getStatusDetails()

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`flex items-center ${bgColor} px-2 py-1 rounded-full`}>
        {icon}
        <span className={`ml-1 text-xs font-medium ${color}`}>{label}</span>
      </div>
      {lastUpdate && (
        <div className="ml-2 text-xs text-gray-500 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>Last: {lastUpdate}</span>
        </div>
      )}
    </div>
  )
}

