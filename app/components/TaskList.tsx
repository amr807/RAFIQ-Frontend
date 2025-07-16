"use client"

import { useState } from "react"
import type { Task } from "../types/task"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  DollarSign,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Hourglass,
  Star,
  Calendar,
  MoreHorizontal,
  Pin,
  Flag,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { TooltipProvider, TooltipTrigger,Tooltip, TooltipContent } from "@radix-ui/react-tooltip"

interface TaskListProps {
  tasks: Task[]
  showPriorityIndicators?: boolean
}

export default function TaskList({ tasks, showPriorityIndicators = false }: TaskListProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [pinnedTasks, setPinnedTasks] = useState<string[]>([])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Not Started":
        return <AlertCircle className="h-4 w-4" />
      case "In Progress":
        return <Clock3 className="h-4 w-4" />
      case "Almost Done":
        return <Hourglass className="h-4 w-4" />
      case "Completed":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Not Started":
        return "bg-red-500 border-red-600 text-white"
      case "In Progress":
        return "bg-yellow-500 border-yellow-600 text-white"
      case "Almost Done":
        return "bg-blue-500 border-blue-600 text-white"
      case "Completed":
        return "bg-green-500 border-green-600 text-white"
      default:
        return "bg-gray-500 border-gray-600 text-white"
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case "Not Started":
        return "bg-red-500"
      case "In Progress":
        return "bg-yellow-500"
      case "Almost Done":
        return "bg-blue-500"
      case "Completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "Not Started":
        return "Task has not been started yet."
      case "In Progress":
        return "Task is currently being worked on."
      case "Almost Done":
        return "Task is nearing completion."
      case "Completed":
        return "Task has been finished."
      default:
        return "Unknown status."
    }
  }

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "Not Started":
        return 5
      case "In Progress":
        return 50
      case "Almost Done":
        return 75
      case "Completed":
        return 100
      default:
        return 0
    }
  }

  const getPriorityLevel = (task: Task) => {
    if (task.amount > 500) return "High"
    if (task.amount > 200) return "Medium"
    return "Low"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-500"
      case "Medium":
        return "text-orange-500"
      case "Low":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
  }

  const togglePinTask = (taskId: string) => {
    setPinnedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }
console.log(tasks)

  // Sort tasks to show pinned tasks first
  const sortedTasks = [...tasks].sort((a, b) => {
    const aPinned = pinnedTasks.includes(a.id)
    const bPinned = pinnedTasks.includes(b.id)

    if (aPinned && !bPinned) return -1
    if (!aPinned && bPinned) return 1
    return 0
  })
  // Animation variants
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <motion.ul variants={listVariants} initial="hidden" animate="visible" className="space-y-4">
      {sortedTasks.map((task) => (
        <motion.li
          key={task.id}
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          className="transform transition-all duration-300"
        >
          <Card
            className={`overflow-hidden border-l-4 ${
              task.completed ? "border-l-green-500" : "border-l-blue-500"
            } bg-white dark:bg-slate-800/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 ${
              pinnedTasks.includes(task.id) ? "ring-2 ring-amber-400 dark:ring-amber-500" : ""
            }`}
          >
            {pinnedTasks.includes(task.id) && (
              <div className="absolute -top-2 -right-2 z-10">
                <Pin className="h-6 w-6 text-amber-500 fill-amber-500" />
              </div>
            )}

            <CardHeader
              className={`pb-2 ${
                task.completed
                  ? "bg-gradient-to-r from-green-500/10 to-emerald-500/5"
                  : "bg-gradient-to-r from-blue-500/10 to-indigo-500/5"
              }`}
            >
              <CardTitle className="text-xl font-bold flex justify-between items-center text-gray-800 dark:text-white">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  {showPriorityIndicators && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Flag className={`h-4 w-4 mr-1 ${getPriorityColor(getPriorityLevel(task))}`} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getPriorityLevel(task)} Priority</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <span>{task.title}</span>
                </motion.div>
                <motion.div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1 font-normal border px-3 py-1">
                    <User size={14} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{task.name}</span>
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toggleTaskExpansion(task.id)}>
                        {expandedTaskId === task.id ? "Collapse details" : "View details"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePinTask(task.id)}>
                        {pinnedTasks.includes(task.id) ? "Unpin task" : "Pin to top"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Edit task</DropdownMenuItem>
                      {!task.completed && <DropdownMenuItem>Mark as completed</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {expandedTaskId === task.id
                  ? task.description
                  : task.description.length > 120
                    ? `${task.description.substring(0, 120)}...`
                    : task.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-sm">{task.address}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 justify-end">
                  <DollarSign size={16} className="text-emerald-500" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">${task.amount}</span>
                </div>
              </div>

              <AnimatePresence>
                {expandedTaskId === task.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="pt-2 space-y-3 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm">
                          Created: {format(new Date(task.createdAt || Date.now()), "MMM d, yyyy")}
                        </span>
                      </div>
                      {task.completed && task.completedAt && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <CheckCircle2 size={16} className="text-green-500" />
                          <span className="text-sm">
                            Completed: {format(new Date(task.completedAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Priority:{" "}
                        <span className={`font-medium ${getPriorityColor(getPriorityLevel(task))}`}>
                          {getPriorityLevel(task)}
                        </span>
                      </span>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => toggleTaskExpansion(task.id)}
                      >
                        Hide Details
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Badge className={`flex items-center gap-1 ${getStatusColor(task.status)}`}>
                            {getStatusIcon(task.status)}
                            <span>{task.status}</span>
                          </Badge>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{getStatusDescription(task.status)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage(task.status)}%` }}
                      transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getProgressColor(task.status)}`}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </CardContent>

            {expandedTaskId !== task.id && task.description.length > 120 && (
              <CardFooter className="pt-0 pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTaskExpansion(task.id)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-0"
                >
                  Show more
                </Button>
              </CardFooter>
            )}
          </Card>
        </motion.li>
      ))}
    </motion.ul>
  )
}
