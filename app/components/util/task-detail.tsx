/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  X,
  Navigation,
  MapPin,
  Clock,
  User,
  Truck,
  FileText,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Package,
  Clipboard,
  MessageSquare,
  ChevronRight,
  Share2,
  Send,
  ImageIcon,
  PenTool,
  Pin,
  PinOff,
  BarChart3,
  Users,
  CheckCheck,
  XCircle,
  Hourglass,
  Loader2,
  Maximize2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Employee {
  id?: string
  name?: string
  lat: number
  lon: number
  status?: string
  vehicle?: string
  batteryLevel?: number
  currentTasks?: number
  lastActive?: string
  phoneNumber?: string
  email?: string
}

interface PackageItem {
  type: string
  customType?: string
  quantity: number
}

interface Task {
  id?: string
  title: string
  description?: string
  status?: string
  priority?: string
  address?: string
  location?: string
  lat?: number
  lon?: number
  createdAt?: string
  amount?: number
  image?: string
  employee_id?: string
  packageItems?: PackageItem[]
  dueDate?: string
  progress?: number
  assignedTo?: string[]
}

interface TaskDetailsPanelProps {
  task: Task | null
  onClose: () => void
  onDirectionsClick: (task: any) => void
  estimatedTime?: string
  estimatedDistance?: string
  assignedEmployee?: Employee | null
  employee: Employee | null
  isManager?: boolean
  onPinChange?: (isPinned: boolean, taskId?: string) => void
  panelIndex?: number
}

export function TaskDetailsPanel({
  task,
  employee,
  onClose,
  onDirectionsClick,
  estimatedTime,
  estimatedDistance,
  assignedEmployee,
  isManager = true, // Default to manager view
  onPinChange,
  panelIndex = 1.9,
}: TaskDetailsPanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "notes" | "status">("overview")
  const [note, setNote] = useState("")
  const [notes, setNotes] = useState<{ text: string; timestamp: Date; author: string }[]>([])
  const [isAccepted, setIsAccepted] = useState(false)
  const [showPackages, setShowPackages] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x:0, y: panelIndex * 40 }) // Offset each panel
  const [collapsed, setCollapsed] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [showPinned, setShowPinned] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)

  // Task status helpers
  const getStatusColor = (status?: string) => {
    if (!status) return "gray"
    const statusLower = status.toLowerCase()
    if (statusLower.includes("complete")) return "green"
    if (statusLower.includes("progress")) return "blue"
    if (statusLower.includes("pending") || statusLower.includes("waiting")) return "amber"
    if (statusLower.includes("cancel") || statusLower.includes("fail")) return "rose"
    if (statusLower.includes("started")) return "red"
    return "gray"
  }

  const getStatusIcon = (status?: string) => {
    if (!status) return Clipboard
    const statusLower = status.toLowerCase()
    if (statusLower.includes("complete")) return CheckCheck
    if (statusLower.includes("progress")) return Loader2
    if (statusLower.includes("pending") || statusLower.includes("waiting")) return Hourglass
    if (statusLower.includes("cancel") || statusLower.includes("fail")) return XCircle
    if (statusLower.includes("assign")) return Users
    return Clipboard
  }

  useEffect(() => {
    if (task) {
      setTimeout(() => setIsVisible(true), 50)
    }

    return () => {
      setIsVisible(false)
    }
  }, [task])

  useEffect(() => {
    if (onPinChange) {
      onPinChange(isPinned, task?.id)
    }
  }, [isPinned, task?.id, onPinChange])

  if (!task) return null

  const handleDirectionsClick = () => {
    onDirectionsClick(task)
  }

  const handleAddNote = () => {
    if (note.trim()) {
      setNotes([...notes, { text: note, timestamp: new Date(), author: "You" }])
      setNote("")
    }
  }

  const togglePin = () => {
    const newPinState = !isPinned
    setIsPinned(newPinState)

    // When pinning while collapsed, show the pinned indicator
    if (collapsed) {
      setShowPinned(true)
    }

    // Notify parent component about pin state change
    if (onPinChange) {
      onPinChange(newPinState, task?.id)
    }
  }

  const resetPanel = () => {
    collapsed? setPosition({ x: -70, y: panelIndex * 20 }):setPosition({ x: 0, y: panelIndex * 20 }) ;// Reset to initial position with offset
    setHasMoved(false)
  }

  const handleCancelTask = () => {
    onClose()
  }

  const handleCollapse = () => {
    setCollapsed(!collapsed)
collapsed? setPosition({ x: 0, y: panelIndex * 20 }): setPosition({ x: -70, y: panelIndex * 20 })
    if (isPinned) {
      setShowPinned(!collapsed)
    }
  }

  const employeeDetails = assignedEmployee || {
    id: "EMP" + Math.floor(Math.random() * 1000),
    name: task.employee_id || "Field Agent",
    lat: task.lat ,
    lon: task.lon ,
    status: "Available",
    vehicle: "Delivery Van",
    batteryLevel: Math.floor(Math.random() * 100),
    currentTasks: Math.floor(Math.random() * 5),
    lastActive: new Date().toISOString(),
    phoneNumber: "+1 (555) 123-4567",
    email: "field.agent@company.com",
  }

  const packageItems: PackageItem[] = task.packageItems || [
    { type: "document", quantity: 1 },
    { type: "small_package", quantity: 2 },
  ]

  const getPackageTypeInfo = (typeId: string) => {
    const packageTypes = [
      {
        id: "document",
        label: "Document",
        icon: FileText,
        color: "bg-blue-500",
        lightColor: "bg-blue-100/10",
        textColor: "text-blue-400",
      },
      {
        id: "small_package",
        label: "Small Package",
        icon: Package,
        color: "bg-purple-500",
        lightColor: "bg-purple-100/10",
        textColor: "text-purple-400",
      },
      {
        id: "medium_package",
        label: "Medium Package",
        icon: Truck,
        color: "bg-amber-500",
        lightColor: "bg-amber-100/10",
        textColor: "text-amber-400",
      },
      {
        id: "large_package",
        label: "Large Package",
        icon: Truck,
        color: "bg-indigo-500",
        lightColor: "bg-indigo-100/10",
        textColor: "text-indigo-400",
      },
      {
        id: "fragile",
        label: "Fragile Item",
        icon: AlertTriangle,
        color: "bg-rose-500",
        lightColor: "bg-rose-100/10",
        textColor: "text-rose-400",
      },
      {
        id: "other",
        label: "Other",
        icon: Package,
        color: "bg-slate-500",
        lightColor: "bg-slate-100/10",
        textColor: "text-slate-400",
      },
    ]
    return packageTypes.find((type) => type.id === typeId) || packageTypes[5]
  }

  const taskProgress =
    task.progress !== undefined
      ? task.progress
      : task.status?.toLowerCase().includes("complete")
        ? 100
        : task.status?.toLowerCase().includes("done")
          ? 60
          : task.status?.toLowerCase().includes("progress")
            ? 30

            : 0

  const statusColor = getStatusColor(task.status)
  const StatusIcon = getStatusIcon(task.status)

  const shouldShowPinnedIndicator = isPinned && collapsed && showPinned

  return (
    <>
      {shouldShowPinnedIndicator && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed z-50 cursor-pointer"
          style={{
            left: `${position.x + 20}px`,
            top: `${position.y + 20}px`,
          }}
          onClick={() => setCollapsed(false)}
        >
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          x: position.x,
          y: position.y,
          scale: collapsed ? 0.6 : 1,
          width: collapsed ? "300px" : "400px",
          height: collapsed ? "auto" : "auto",
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        drag={!isPinned}
        dragConstraints={{ left: -100, right: window.innerWidth - 300, top: 0, bottom: window.innerHeight - 200 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(event, info) => {
          setIsDragging(false)
          setPosition({ x: position.x + info.offset.x, y: position.y + info.offset.y })
          setHasMoved(true)
        }}
        className={`fixed bg-gray-900 text-white shadow-2xl z-50 overflow-hidden rounded-xl border border-gray-800 ${
          collapsed ? "max-h-[120px]" : "max-h-[calc(100vh-150px)] overflow-y-auto"
        } ${isPinned ? "ring-2 ring-teal-500" : "cursor-move"}`}
        style={{
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
          touchAction: "none",
          top: `${36 + panelIndex * 40}px`,
          left: "16px",
        }}
      >
        <div className="relative p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 rounded-t-xl">
          <div className="flex items-center justify-between">
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
                          : statusColor === "red"
                            ? "bg-red-500"
                            : "bg-gray-500"
                }`}
              ></div>
              <h2 className="text-lg font-semibold truncate text-white">{task.title}</h2>
            </div>
            <div className="flex items-center gap-2">

              <button
                onClick={togglePin}
                className={`p-1.5 rounded-full hover:bg-gray-700 transition-colors ${
                  isPinned ? "bg-teal-900/50 text-teal-400" : ""
                }`}
                aria-label={isPinned ? "Unpin panel" : "Pin panel"}
                title={
                  isPinned
                    ? "Unpin panel (keep when selecting other tasks)"
                    : "Pin panel (keep when selecting other tasks)"
                }
              >
            {isPinned ? <PinOff className="h-5 w-5 text-teal-400" /> : <Pin className="h-5 w-5 text-gray-300" />}
              </button>

              <button
                onClick={handleCollapse}
                className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                aria-label={collapsed ? "Expand panel" : "Collapse panel"}
                title={collapsed ? "Expand panel" : "Collapse panel"}
              >
                <ChevronRight
                  className={`h-5 w-5 text-gray-300 transition-transform ${collapsed ? "-rotate-90" : "rotate-90"}`}
                />
              </button>

              {hasMoved?      <button   onClick={(e) => {
                    e.stopPropagation()
                    resetPanel()
                    
                  }}>           <Loader2 className="h-4 w-4 text-teal-400" /></button> :<></>
}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Close panel"
                title="Close panel"
              >
                <X className="h-5 w-5 text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        {!collapsed && (
          <>
            {isManager && (
              <div className="p-3 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusIcon
                      className={`h-4 w-4 ${
                        statusColor === "green"
                          ? "text-green-400"
                          : statusColor === "blue"
                            ? "text-blue-400"
                            : statusColor === "amber"
                              ? "text-amber-400"
                              : statusColor === "rose"
                                ? "text-rose-400"
                                : statusColor === "red"
                                  ? "text-red-400"
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
                                : statusColor === "red"
                                  ? "text-red-400"
                                  : "text-gray-400"
                      }`}
                    >
                      {task.status || "No Status"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {task.dueDate ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Due: {task.dueDate}</span>
                      </div>
                    ) : task.createdAt ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                  <div
                    className={`h-2 rounded-full ${
                      statusColor === "green"
                        ? "bg-green-500"
                        : statusColor === "blue"
                          ? "bg-blue-500"
                          : statusColor === "amber"
                            ? "bg-amber-500"
                            : statusColor === "rose"
                              ? "bg-rose-500"
                              : statusColor === "red"
                                ? "bg-red-500"
                                : "bg-gray-500"
                    }`}
                    style={{ width: `${taskProgress}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-gray-400">
                  <span>{taskProgress}% Complete</span>
                  {task.assignedTo && task.assignedTo.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {task.assignedTo.length} {task.assignedTo.length === 1 ? "assignee" : "assignees"}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="relative h-48 bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden">
              {task.image ? (
                <Image
                  src={task.image || "/placeholder.svg?height=400&width=600"}
                  alt={task.title}
                  fill
                  className="object-cover opacity-90"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800/50">
                  <Package className="h-16 w-16 text-gray-600 mb-2" />
                  <span className="text-gray-500 text-sm">No image available</span>
                </div>
              )}

              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statusColor === "green"
                      ? "bg-green-900/80 text-green-300 border border-green-700"
                      : statusColor === "blue"
                        ? "bg-blue-900/80 text-blue-300 border border-blue-700"
                        : statusColor === "amber"
                          ? "bg-amber-900/80 text-amber-300 border border-amber-700"
                          : statusColor === "rose"
                            ? "bg-rose-900/80 text-rose-300 border border-rose-700"
                            : statusColor === "red"
                              ? "bg-red-900/80 text-red-300 border border-purple-700"
                              : "bg-gray-800/80 text-gray-300 border border-gray-700"
                  }`}
                >
                  {task.status || "No Status"}
                </span>
              </div>

              {task.amount && (
                <div className="absolute bottom-4 right-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-teal-900/80 text-teal-300 border border-teal-700">
                    ${task.amount}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 bg-gradient-to-b from-gray-900 to-gray-800">
              <h1 className="text-2xl font-bold text-white">{task.title}</h1>

              <div className="flex items-center mt-2 text-gray-400">
                <Clipboard className="h-4 w-4 mr-2" />
                <span>{"Task"}</span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {task.priority || "Normal Priority"}
                </span>
              </div>
            </div>

            <div className="border-b border-t border-gray-700 bg-gray-800">
              <div className="flex">
                <button
                  className={`flex-1 py-4 px-2 font-medium transition-colors ${
                    activeTab === "overview"
                      ? "text-teal-400 border-b-2 border-teal-400 bg-gray-800"
                      : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  className={`flex-1 py-4 px-2 font-medium transition-colors ${
                    activeTab === "details"
                      ? "text-teal-400 border-b-2 border-teal-400 bg-gray-800"
                      : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
                  }`}
                  onClick={() => setActiveTab("details")}
                >
                  Details
                </button>
                {isManager && (
                  <button
                    className={`flex-1 py-4 px-2 font-medium transition-colors ${
                      activeTab === "status"
                        ? "text-teal-400 border-b-2 border-teal-400 bg-gray-800"
                        : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
                    }`}
                    onClick={() => setActiveTab("status")}
                  >
                    Status
                  </button>
                )}
                <button
                  className={`flex-1 py-4 px-2 font-medium transition-colors ${
                    activeTab === "notes"
                      ? "text-teal-400 border-b-2 border-teal-400 bg-gray-800"
                      : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
                  }`}
                  onClick={() => setActiveTab("notes")}
                >
                  Notes
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "overview" && (
                  <>
                    <div className="p-4 bg-gray-800 border-b border-gray-700">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setShowPackages(!showPackages)}
                      >
                        <h3 className="font-medium text-teal-400 text-lg flex items-center">
                          <Package className="h-5 w-5 mr-2" />
                          Package Items ({packageItems.length})
                        </h3>
                        <ChevronRight
                          className={`h-5 w-5 text-gray-400 transition-transform ${showPackages ? "rotate-90" : ""}`}
                        />
                      </div>

                      <AnimatePresence>
                        {showPackages && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-3 overflow-hidden"
                          >
                            {packageItems.length > 0 ? (
                              <div className="space-y-2">
                                {packageItems.map((item, index) => {
                                  const typeInfo = getPackageTypeInfo(item.type)
                                  const TypeIcon = typeInfo.icon
                                  return (
                                    <div
                                      key={index}
                                      className={`flex items-center justify-between p-3 rounded-lg ${typeInfo.lightColor} border border-gray-700`}
                                    >
                                      <div className="flex items-center">
                                        <div className={`p-2 rounded-full ${typeInfo.color} text-white mr-3`}>
                                          <TypeIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <p className={`font-medium ${typeInfo.textColor}`}>
                                            {item.type === "other" ? item.customType : typeInfo.label}
                                          </p>
                                          <span className="text-xs text-gray-400">
                                            {item.quantity} {item.quantity === 1 ? "item" : "items"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500 border border-dashed border-gray-700 rounded-lg">
                                No package items specified
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {(estimatedTime || estimatedDistance) && (
                      <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
                        <h3 className="font-medium text-teal-400 mb-3 text-lg flex items-center">
                          <Navigation className="h-5 w-5 mr-2" />
                          Route Information
                        </h3>

                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                          {estimatedTime && (
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-3 bg-gray-700 rounded-full border border-gray-600">
                                <Clock className="h-5 w-5 text-teal-400" />
                              </div>
                              <div>
                                <p className="text-gray-300 text-sm">Estimated Time</p>
                                <p className="text-xl font-bold text-white">{estimatedTime}</p>
                              </div>
                            </div>
                          )}

                          {estimatedDistance && (
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-gray-700 rounded-full border border-gray-600">
                                <Navigation className="h-5 w-5 text-teal-400" />
                              </div>
                              <div>
                                <p className="text-gray-300 text-sm">Distance</p>
                                <p className="text-xl font-bold text-white">{estimatedDistance}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="p-4 space-y-4 bg-gradient-to-r from-gray-800 to-gray-900">
                      <div className="flex items-start gap-4">
                        <MapPin className="h-5 w-5 text-teal-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-white">{task.address}</p>
                          <p className="text-gray-400 text-sm">
                            {task.location || `${task.lat?.toFixed(6) || "0"}, ${task.lon?.toFixed(6) || "0"}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <Clock className="h-5 w-5 text-teal-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-white">
                            {task.dueDate ? (
                              <>Due: {task.dueDate}</>
                            ) : task.createdAt ? (
                              <>Created: {new Date(task.createdAt).toLocaleDateString()}</>
                            ) : (
                              "No due date"
                            )}
                          </p>
                          {task.status && <p className="text-gray-400 text-sm">Status: {task.status}</p>}
                        </div>
                      </div>

                      {task.description && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <h3 className="font-medium mb-2 text-white flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2 text-teal-400" />
                            Description
                          </h3>
                          <p className="text-gray-300">{task.description}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {activeTab === "details" && (
                  <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900">
                    <h3 className="font-medium text-teal-400 mb-4 text-lg flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                    </h3>

                    <div className="bg-gray-700/50 p-4 rounded-lg mb-4 border border-gray-700">
                      <div className="flex items-center mb-3">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center mr-3 shadow-lg">
                          {employeeDetails.name ? (
                            <span className="text-2xl font-bold text-white">{employeeDetails.name.charAt(0)}</span>
                          ) : (
                            <User className="h-8 w-8 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">
                            {employeeDetails.name || "Employee #" + employeeDetails.id}
                          </h4>
                          <p className="text-gray-300 text-sm">ID: {employeeDetails.id || "Unknown"}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-600 pb-2">
                          <span className="text-gray-300">Status</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              employeeDetails.status?.toLowerCase().includes("available")
                                ? "bg-green-900 text-green-300 border border-green-700"
                                : employeeDetails.status?.toLowerCase().includes("nearby")
                                  ? "bg-teal-900 text-teal-300 border border-teal-700"
                                  : employeeDetails.status?.toLowerCase().includes("route")
                                    ? "bg-yellow-900 text-yellow-300 border border-yellow-700"
                                    : "bg-gray-700 text-gray-300 border border-gray-600"
                            }`}
                          >
                            {employeeDetails.status || "Unknown"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center border-b border-gray-600 pb-2">
                          <span className="text-gray-300">Phone</span>
                          <span className="text-white">{employeeDetails.phoneNumber || "N/A"}</span>
                        </div>

                        <div className="flex justify-between items-center border-b border-gray-600 pb-2">
                          <span className="text-gray-300">Email</span>
                          <span className="text-white text-sm">{employeeDetails.email || "N/A"}</span>
                        </div>

                        <div className="flex justify-between items-center border-b border-gray-600 pb-2">
                          <span className="text-gray-300">Vehicle</span>
                          <span className="text-white">{employeeDetails.vehicle || "N/A"}</span>
                        </div>

                        <div className="flex justify-between items-center border-b border-gray-600 pb-2">
                          <span className="text-gray-300">Battery</span>
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-600 rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full ${
                                  (employeeDetails.batteryLevel || 0) > 60
                                    ? "bg-green-500"
                                    : (employeeDetails.batteryLevel || 0) > 30
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${employeeDetails.batteryLevel || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-white">{employeeDetails.batteryLevel || 0}%</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-b border-gray-600 pb-2">
                          <span className="text-gray-300">Current Tasks</span>
                          <span className="text-white">{employeeDetails.currentTasks || 0}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Last Active</span>
                          <span className="text-white">
                            {employeeDetails.lastActive
                              ? new Date(employeeDetails.lastActive).toLocaleString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "numeric",
                                  month: "short",
                                })
                              : "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-medium text-teal-400 mb-3 text-lg flex items-center mt-6">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Performance Metrics
                    </h3>

                    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-700">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-800/70 p-3 rounded-lg border border-gray-600">
                          <p className="text-gray-300 text-sm mb-1">Tasks Completed</p>
                          <p className="text-2xl font-bold text-white">{Math.floor(Math.random() * 100) + 20}</p>
                        </div>

                        <div className="bg-gray-800/70 p-3 rounded-lg border border-gray-600">
                          <p className="text-gray-300 text-sm mb-1">On-Time Rate</p>
                          <p className="text-2xl font-bold text-teal-400">{Math.floor(Math.random() * 20) + 80}%</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-300 text-sm">Customer Satisfaction</span>
                            <span className="text-white text-sm">{Math.floor(Math.random() * 10) + 90}%</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-teal-500 h-2 rounded-full"
                              style={{ width: `${Math.floor(Math.random() * 10) + 90}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-300 text-sm">Response Time</span>
                            <span className="text-white text-sm">{Math.floor(Math.random() * 10) + 85}%</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-teal-500 h-2 rounded-full"
                              style={{ width: `${Math.floor(Math.random() * 10) + 85}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-300 text-sm">Task Efficiency</span>
                            <span className="text-white text-sm">{Math.floor(Math.random() * 15) + 80}%</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-teal-500 h-2 rounded-full"
                              style={{ width: `${Math.floor(Math.random() * 15) + 80}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-medium text-teal-400 mb-3 text-lg flex items-center mt-6">
                      <Calendar className="h-5 w-5 mr-2" />
                      Schedule
                    </h3>

                    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-700">
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => {
                          const hours = Math.floor(Math.random() * 3) + 1
                          const minutes = Math.floor(Math.random() * 60)
                          const status = i === 0 ? "In Progress" : i === 1 ? "Pending" : "Scheduled"

                          return (
                            <div
                              key={i}
                              className="flex items-start p-3 bg-gray-800/70 rounded-lg border border-gray-600"
                            >
                              <div
                                className={`p-2 rounded-full mr-3 ${
                                  status === "In Progress"
                                    ? "bg-teal-900"
                                    : status === "Pending"
                                      ? "bg-yellow-900"
                                      : "bg-gray-900"
                                }`}
                              >
                                <AlertTriangle
                                  className={`h-4 w-4 ${
                                    status === "In Progress"
                                      ? "text-teal-400"
                                      : status === "Pending"
                                        ? "text-yellow-400"
                                        : "text-gray-400"
                                  }`}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <p className="font-medium text-white">
                                    Task #{Math.floor(Math.random() * 1000) + 1000}
                                  </p>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      status === "In Progress"
                                        ? "bg-teal-900 text-teal-300 border border-teal-700"
                                        : status === "Pending"
                                          ? "bg-yellow-900 text-yellow-300 border border-yellow-700"
                                          : "bg-gray-900 text-gray-300 border border-gray-700"
                                    }`}
                                  >
                                    {status}
                                  </span>
                                </div>
                                <p className="text-gray-400 text-sm mt-1">
                                  {`${hours} hour${hours > 1 ? "s" : ""} ${minutes} min${minutes !== 1 ? "s" : ""}`}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "status" && isManager && (
                  <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900">
                    <h3 className="font-medium text-teal-400 mb-4 text-lg flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Task Status
                    </h3>

                    <div className="bg-gray-700/50 p-4 rounded-lg mb-6 border border-gray-700">
                      <h4 className="text-white font-medium mb-4">Status Timeline</h4>

                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-600"></div>

                        <div className="space-y-6 relative ml-10">
                          <div className="relative">
                            <div className="absolute -left-10 mt-1 w-4 h-4 rounded-full bg-green-500 border-2 border-gray-800"></div>
                            <div>
                              <p className="text-green-400 font-medium">Task Created</p>
                              <p className="text-xs text-gray-400">
                                {task.createdAt
                                  ? new Date(task.createdAt).toLocaleString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "May 5, 2023, 09:30 AM"}
                              </p>
                              <p className="text-sm text-gray-300 mt-1">Task was created and added to the system</p>
                            </div>
                          </div>

                          <div className="relative">
                            <div className="absolute -left-10 mt-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-gray-800"></div>
                            <div>
                              <p className="text-purple-400 font-medium">Assigned to Employee</p>
                              <p className="text-xs text-gray-400">May 5, 2023, 10:15 AM</p>
                              <p className="text-sm text-gray-300 mt-1">
                                Task assigned to {employeeDetails.name || "Field Agent"}
                              </p>
                            </div>
                          </div>

                          <div className="relative">
                            <div className="absolute -left-10 mt-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-gray-800"></div>
                            <div>
                              <p className="text-blue-400 font-medium">In Progress</p>
                              <p className="text-xs text-gray-400">May 5, 2023, 11:30 AM</p>
                              <p className="text-sm text-gray-300 mt-1">Employee started working on the task</p>
                            </div>
                          </div>

                          <div className="relative">
                            <div
                              className={`absolute -left-10 mt-1 w-4 h-4 rounded-full ${
                                statusColor === "green"
                                  ? "bg-green-500"
                                  : statusColor === "blue"
                                    ? "bg-blue-500"
                                    : statusColor === "amber"
                                      ? "bg-amber-500"
                                      : statusColor === "rose"
                                        ? "bg-rose-500"
                                        : statusColor === "red"
                                          ? "bg-red-500"
                                          : "bg-gray-500"
                              } border-2 border-gray-800 animate-pulse`}
                            ></div>
                            <div>
                              <p
                                className={`${
                                  statusColor === "green"
                                    ? "text-green-400"
                                    : statusColor === "blue"
                                      ? "text-blue-400"
                                      : statusColor === "amber"
                                        ? "text-amber-400"
                                        : statusColor === "rose"
                                          ? "text-rose-400"
                                          : statusColor === "red"
                                            ? "text-red-400"
                                            : "text-gray-400"
                                } font-medium`}
                              >
                                Current Status: {task.status || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-400">Now</p>
                              <p className="text-sm text-gray-300 mt-1">{taskProgress}% complete</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-medium text-teal-400 mb-3 text-lg flex items-center mt-6">
                      <Users className="h-5 w-5 mr-2" />
                      Assignment Information
                    </h3>

                    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-700">
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center mr-3 shadow-lg">
                          {employeeDetails.name ? (
                            <span className="text-xl font-bold text-white">{employeeDetails.name.charAt(0)}</span>
                          ) : (
                            <User className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">
                            {employeeDetails.name || "Employee #" + employeeDetails.id}
                          </h4>
                          <p className="text-xs text-gray-400">Primary Assignee</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <button className="bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                          <Users className="h-4 w-4 mr-2" />
                          Reassign
                        </button>
                        <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </button>
                      </div>
                    </div>

                    <h3 className="font-medium text-teal-400 mb-3 text-lg flex items-center mt-6">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Task Analytics
                    </h3>

                    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-700">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-800/70 p-3 rounded-lg border border-gray-600">
                          <p className="text-gray-300 text-sm mb-1">Time Spent</p>
                          <p className="text-xl font-bold text-white">2h 15m</p>
                        </div>

                        <div className="bg-gray-800/70 p-3 rounded-lg border border-gray-600">
                          <p className="text-gray-300 text-sm mb-1">Estimated Completion</p>
                          <p className="text-xl font-bold text-teal-400">3:45 PM</p>
                        </div>
                      </div>

                      <div className="space-y-3 mt-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-300 text-sm">Task Efficiency</span>
                            <span className="text-white text-sm">85%</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div className="bg-teal-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-300 text-sm">On-Time Probability</span>
                            <span className="text-white text-sm">92%</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: "92%" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "notes" && (
                  <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900">
                    <h3 className="font-medium text-teal-400 mb-3 text-lg flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Notes
                    </h3>

                    <div className="bg-gray-700/50 p-4 rounded-lg mb-4 border border-gray-700">
                      {notes.length > 0 ? (
                        <div className="space-y-4 mb-4">
                          {notes.map((note, index) => (
                            <div key={index} className="bg-gray-800/70 p-3 rounded-lg border border-gray-600">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-teal-400">{note.author}</span>
                                <span className="text-xs text-gray-400">
                                  {note.timestamp.toLocaleString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                              </div>
                              <p className="text-gray-300">{note.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-300 mb-4">No notes have been added to this task yet.</p>
                      )}

                      <div className="relative">
                        <textarea
                          className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Add a note about this task..."
                          rows={4}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        ></textarea>

                        <button
                          className="absolute bottom-3 right-3 bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:hover:bg-teal-600"
                          onClick={handleAddNote}
                          disabled={!note.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-medium text-teal-400 mb-3 text-lg flex items-center mt-6">
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Attachments
                    </h3>

                    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-700">
                      <div className="text-center py-6 border border-dashed border-gray-600 rounded-lg mb-3">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                        <p className="text-gray-400">No attachments yet</p>
                        <p className="text-gray-500 text-sm">Upload photos or documents</p>
                      </div>

                      <button className="w-full bg-gray-800 text-white py-2 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors flex items-center justify-center">
                        <PenTool className="h-4 w-4 mr-2" />
                        Add Attachment
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-around p-4 border-t border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
              <button className="flex flex-col items-center gap-1 text-teal-400" onClick={handleDirectionsClick}>
                <div className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors border border-gray-600">
                  <Navigation className="h-5 w-5 text-teal-400" />
                </div>
                <span className="text-xs">Directions</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-teal-400">
                <div className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors border border-gray-600">
                  <Share2 className="h-5 w-5 text-teal-400" />
                </div>
                <span className="text-xs">Share</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-rose-400" onClick={handleCancelTask}>
                <div className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors border border-gray-600">
                  <XCircle className="h-5 w-5 text-rose-400" />
                </div>
                <span className="text-xs">Cancel</span>
              </button>
              {hasMoved && (
                <button className="flex flex-col items-center gap-1 text-teal-400" onClick={resetPanel}>
                  <div className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors border border-gray-600">
                    <Loader2 className="h-5 w-5 text-teal-400" />
                  </div>
                  <span className="text-xs">Reset</span>
                </button>
              )}
            </div>


          </>
        )}

        {collapsed && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
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
                            : statusColor === "red"
                              ? "bg-red-500"
                              : "bg-gray-500"
                  }`}
                ></div>
                <div>
                  <h3 className="text-sm font-medium text-white truncate max-w-[120px]">{task.title}</h3>
                  <p className="text-xs text-gray-400 truncate max-w-[120px]">{task.address}</p>
                </div>
              </div>
              {isPinned && <Pin className="h-4 w-4 text-teal-400 mr-1" />}
            </div>

            <div className="flex justify-around mt-2 pt-2 border-t border-gray-700">
              <button
                className="flex items-center justify-center p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCollapse()
                }}
                title="Expand panel"
              >
                <Maximize2 className="h-4 w-4 text-teal-400" />
              </button>

              <button
                className="flex items-center justify-center p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCancelTask()
                }}
                title="Cancel task"
              >
                <XCircle className="h-4 w-4 text-rose-400" />
              </button>

             

              <button
                className="flex items-center justify-center p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  togglePin()
                }}
                title={isPinned ? "Unpin panel" : "Pin panel"}
              >
                {isPinned ? <PinOff className="h-4 w-4 text-teal-400" /> : <Pin className="h-4 w-4 text-gray-300" />}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  )
}
