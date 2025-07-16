/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Phone, Mail, MapPin, Clock, Battery, Truck, Briefcase, Star, CheckCircle, Calendar, BarChart3, MessageSquare, Package, FileText, Send, Navigation } from 'lucide-react'
import Image from "next/image"
import { Panel, PanelTabs } from "./pannel-system"
import { Employee } from "../types/employee"

interface EmployeeStats {
  tasksCompleted: number
  onTimeRate: number
  customerSatisfaction: number
  responseTime: number
  efficiency: number
}

export interface Task {
  id: string
  title: string
  status: string
  address?: string
  estimatedTime?: string
  createdAt?: string
}




interface EmployeePanelProps {
  employee: Employee
  onClose: () => void
  onAssignTask?: () => void
  onSendMessage?: (message: string) => void
  onNavigateTo?: (lat: number, lon: number) => void
  onPinChange?: (isPinned: boolean, id: string) => void
  panelIndex?: number
}

export function EmployeePanel({
  employee,
  onClose,
  onAssignTask,
  onSendMessage,
  onNavigateTo,
  onPinChange,
  panelIndex = 0
}: EmployeePanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "performance" | "tasks" | "message">("overview")
  const [message, setMessage] = useState("")
  const [showSkills, setShowSkills] = useState(false)

  const handleSendMessage = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message)
      setMessage("")
    }
  }

  const handleNavigateTo = () => {
    if (onNavigateTo && employee) {
      onNavigateTo(employee.lat, employee.lon)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-emerald-500"
      case "on route":
        return "bg-sky-500"
      case "busy":
        return "bg-amber-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTaskStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-emerald-900 text-emerald-300 border-emerald-700"
      case "in progress":
        return "bg-sky-900 text-sky-300 border-sky-700"
      case "pending":
        return "bg-amber-900 text-amber-300 border-amber-700"
      case "not started":
        return "bg-rose-900 text-rose-300 border-rose-700"
      default:
        return "bg-gray-900 text-gray-300 border-gray-700"
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 60) return "bg-emerald-500"
    if (level > 30) return "bg-amber-500"
    return "bg-rose-500"
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "performance", label: "Performance" },
    { id: "tasks", label: "Tasks" },
    { id: "message", label: "Message" }
  ]

  return (
    <Panel
      id={`employee-${employee.id}`}
      title={employee.name}
      statusColor={getStatusColor(employee.status)}
      statusText={employee.position}
      onClose={onClose}
      onPinChange={onPinChange}
      panelIndex={panelIndex}
    >
      <div className="bg-gradient-to-b from-gray-800/80 via-gray-850/80 to-gray-900/80 p-4 border-b border-gray-700">
        <div className="flex items-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center mr-4 shadow-xl ring-2 ring-sky-400/20">
              {employee.avatar ? (
                <Image
                  src={employee.avatar || "/placeholder.svg"}
                  alt={employee.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">{employee.name.charAt(0)}</span>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">{employee.name}</h1>
                <p className="text-gray-300 text-sm">{employee.position}</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < Math.round(employee.rating) ? "text-amber-400" : "text-gray-600"}`}
                      fill={i < Math.round(employee.rating) ? "#f59e0b" : "none"}
                    />
                  ))}
                </div>
                <p className="text-sm text-amber-400 font-medium">{employee.rating}</p>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="flex items-center">
                <Battery className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                <div className="w-full bg-gray-700 rounded-full h-1.5 mr-1.5">
                  <div
                    className={`h-1.5 rounded-full ${getBatteryColor(employee.batteryLevel)}`}
                    style={{ width: `${employee.batteryLevel}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-300">{employee.batteryLevel}%</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                <span className="text-xs text-gray-300">{employee.currentTasks} tasks</span>
              </div>
              <div className="flex items-center">
                <Truck className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                <span className="text-xs text-gray-300">{employee.vehicle || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            onClick={handleNavigateTo}
            className="flex items-center justify-center py-2 px-3 bg-sky-600/80 hover:bg-sky-500/80 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg border border-sky-500/30"
          >
            <Navigation className="h-3.5 w-3.5 mr-1.5" />
            Navigate
          </button>
          <button
            onClick={() => setActiveTab("message")}
            className="flex items-center justify-center py-2 px-3 bg-gray-700/80 hover:bg-gray-600/80 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg border border-gray-600/30"
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Message
          </button>
          <button
            onClick={onAssignTask}
            className="flex items-center justify-center py-2 px-3 bg-emerald-600/80 hover:bg-emerald-500/80 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg border border-emerald-500/30"
          >
            <Package className="h-3.5 w-3.5 mr-1.5" />
            Assign
          </button>
        </div>
      </div>

      <PanelTabs 
        activeTab={activeTab} 
        setActiveTab={(tab) => setActiveTab(tab as any)} 
        tabs={tabs} 
      />

      <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 220px)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <div className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                <div className="mb-4">
                  <div
                    className="bg-gray-800/40 p-3 rounded-lg border border-gray-700 flex items-center hover:bg-gray-800/60 transition-colors cursor-pointer"
                    onClick={handleNavigateTo}
                  >
                    <MapPin className="h-5 w-5 text-sky-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Current Location</p>
                      <p className="text-white text-sm">{employee.address || "Unknown location"}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-sky-400 mb-2 text-sm flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Contact Information
                  </h3>

                  <div className="space-y-2">
                    <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700 flex items-center">
                      <Phone className="h-4 w-4 text-sky-400 mr-3" />
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="text-white text-sm">{employee.phoneNumber}</p>
                      </div>
                    </div>

                    <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700 flex items-center">
                      <Mail className="h-4 w-4 text-sky-400 mr-3" />
                      <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="text-white text-sm">{employee.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-sky-400 mb-2 text-sm flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Current Tasks
                  </h3>

                  <div className="space-y-2">
                    {employee.recentTasks
                      .filter((task) => task.status.toLowerCase() === "in progress")
                      .slice(0, 3)
                      .map((task, index) => (
                        <div key={index} className="bg-gray-800/40 p-3 rounded-lg border border-gray-700">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-medium text-white text-sm">{task.title}</h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTaskStatusColor(
                                task.status,
                              )}`}
                            >
                              {task.status}
                            </span>
                          </div>
                          {task.address && (
                            <div className="flex items-center text-gray-400 text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {task.address}
                            </div>
                          )}
                          {task.estimatedTime && (
                            <div className="mt-1 text-xs text-sky-400">Est. time: {task.estimatedTime}</div>
                          )}
                        </div>
                      ))}
                    {employee.recentTasks.filter((task) => task.status.toLowerCase() === "in progress").length === 0 && (
                      <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700 text-center">
                        <p className="text-gray-400 text-sm">No active tasks</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-sky-400 mb-2 text-sm flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Performance Summary
                  </h3>

                  <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                        <p className="text-gray-300 text-xs mb-1">Tasks Completed</p>
                        <p className="text-lg font-bold text-white">{employee.stats.tasksCompleted}</p>
                      </div>

                      <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                        <p className="text-gray-300 text-xs mb-1">On-Time Rate</p>
                        <p className="text-lg font-bold text-sky-400">{employee.stats.onTimeRate}%</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300 text-xs">Customer Satisfaction</span>
                        <span className="text-white text-xs">{employee.stats.customerSatisfaction}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
                        <div
                          className="bg-sky-500 h-1.5 rounded-full"
                          style={{ width: `${employee.stats.customerSatisfaction}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300 text-xs">Efficiency</span>
                        <span className="text-white text-xs">{employee.stats.efficiency}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-sky-500 h-1.5 rounded-full"
                          style={{ width: `${employee.stats.efficiency}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "performance" && (
              <div className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                <h3 className="font-medium text-sky-400 mb-3 text-sm flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Performance Metrics
                </h3>

                <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700 mb-4">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                      <p className="text-gray-300 text-xs mb-1">Tasks Completed</p>
                      <p className="text-lg font-bold text-white">{employee.stats.tasksCompleted}</p>
                      <p className="text-xs text-sky-400 mt-1">+12% from last month</p>
                    </div>

                    <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                      <p className="text-gray-300 text-xs mb-1">On-Time Rate</p>
                      <p className="text-lg font-bold text-sky-400">{employee.stats.onTimeRate}%</p>
                      <p className="text-xs text-sky-400 mt-1">+3% from last month</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300 text-xs">Customer Satisfaction</span>
                        <span className="text-white text-xs">{employee.stats.customerSatisfaction}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
                        <div
                          className="bg-sky-500 h-1.5 rounded-full"
                          style={{ width: `${employee.stats.customerSatisfaction}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Based on 48 reviews</span>
                        <span className="text-xs text-sky-400">+5% from last month</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300 text-xs">Response Time</span>
                        <span className="text-white text-xs">{employee.stats.responseTime}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
                        <div
                          className="bg-sky-500 h-1.5 rounded-full"
                          style={{ width: `${employee.stats.responseTime}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Avg. 4.2 minutes</span>
                        <span className="text-xs text-sky-400">+2% from last month</span>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="font-medium text-sky-400 mb-2 text-sm flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Recent Customer Feedback
                </h3>

                <div className="space-y-2 mb-4">
                  {[
                    {
                      name: "John D.",
                      date: "2 days ago",
                      rating: 5,
                      comment: "Very professional and arrived on time. Handled my packages with care.",
                    },
                    {
                      name: "Sarah M.",
                      date: "1 week ago",
                      rating: 4,
                      comment: "Good service, but was a little late due to traffic.",
                    },
                  ].map((feedback, index) => (
                    <div key={index} className="bg-gray-800/40 p-3 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium text-white text-sm">{feedback.name}</div>
                        <div className="text-xs text-gray-400">{feedback.date}</div>
                      </div>
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < feedback.rating ? "text-amber-400" : "text-gray-600"}`}
                            fill={i < feedback.rating ? "#f59e0b" : "none"}
                          />
                        ))}
                      </div>
                      <p className="text-gray-300 text-xs">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "tasks" && (
              <div className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                <h3 className="font-medium text-sky-400 mb-3 text-sm flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Current Tasks
                </h3>

                <div className="space-y-2 mb-4">
                  {employee.recentTasks
                    .filter((task) => task.status.toLowerCase() === "in progress")
                    .map((task, index) => (
                      <div key={index} className="bg-gray-800/40 p-3 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium text-white text-sm">{task.title}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTaskStatusColor(
                              task.status,
                            )}`}
                          >
                            {task.status}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-400 text-xs mb-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {task.estimatedTime || "No estimate"}
                        </div>
                        {task.address && (
                          <div className="flex items-center text-gray-400 text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {task.address}
                          </div>
                        )}
                      </div>
                    ))}
                  {employee.recentTasks.filter((task) => task.status.toLowerCase() === "in progress").length === 0 && (
                    <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700 text-center">
                      <p className="text-gray-400 text-sm">No active tasks</p>
                    </div>
                  )}
                </div>

                <h3 className="font-medium text-sky-400 mb-2 text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed Tasks
                </h3>

                <div className="space-y-2 mb-4">
                  {employee.recentTasks
                    .filter((task) => task.status.toLowerCase() === "completed")
                    .slice(0, 3)
                    .map((task, index) => (
                      <div key={index} className="bg-gray-800/40 p-3 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium text-white text-sm">{task.title}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTaskStatusColor(
                              task.status,
                            )}`}
                          >
                            {task.status}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-400 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {task.createdAt || "Unknown date"}
                        </div>
                      </div>
                    ))}
                  {employee.recentTasks.filter((task) => task.status.toLowerCase() === "completed").length === 0 && (
                    <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700 text-center">
                      <p className="text-gray-400 text-sm">No completed tasks</p>
                    </div>
                  )}
                </div>

                <h3 className="font-medium text-sky-400 mb-2 text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Upcoming Tasks
                </h3>

                <div className="space-y-2">
                  {employee.recentTasks
                    .filter((task) => task.status.toLowerCase() === "not started")
                    .slice(0, 3)
                    .map((task, index) => (
                      <div key={index} className="bg-gray-800/40 p-3 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium text-white text-sm">{task.title}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTaskStatusColor(
                              task.status,
                            )}`}
                          >
                            {task.status}
                          </span>
                        </div>
                        {task.address && (
                          <div className="flex items-center text-gray-400 text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {task.address}
                          </div>
                        )}
                      </div>
                    ))}
                  {employee.recentTasks.filter((task) => task.status.toLowerCase() === "not started").length === 0 && (
                    <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700 text-center">
                      <p className="text-gray-400 text-sm">No upcoming tasks</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "message" && (
              <div className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                <h3 className="font-medium text-sky-400 mb-3 text-sm flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </h3>

                <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700 mb-4">
                  <div className="relative">
                    <textarea
                      className="w-full bg-gray-900/70 text-white border border-gray-700 rounded-lg p-3 pr-12 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-sm"
                      placeholder={`Message ${employee.name.split(" ")[0]}...`}
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    ></textarea>

                    <button
                      className="absolute bottom-3 right-3 bg-sky-600 text-white p-1.5 rounded-lg hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:hover:bg-sky-600"
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-medium text-sky-400 mb-2 text-sm flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Quick Templates
                </h3>

                <div className="space-y-2">
                  {[
                    "I'm on my way to your location.",
                    "I've arrived at the pickup location.",
                    "Package has been picked up and is on the way.",
                    "I'm running a bit late due to traffic.",
                    "Could you provide more details about the delivery?",
                  ].map((template, index) => (
                    <button
                      key={index}
                      className="w-full text-left p-2 bg-gray-800/40 hover:bg-gray-700/40 text-gray-300 rounded-lg border border-gray-700 transition-colors text-xs"
                      onClick={() => setMessage(template)}
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.5);
        }
      `}</style>
    </Panel>
  )
}
