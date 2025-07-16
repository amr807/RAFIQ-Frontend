/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Sparkles, Search, Filter, SlidersHorizontal, Calendar, DollarSign, Award, X, CheckCircle, TrendingUp } from 'lucide-react'
import type { Task } from "../../../types/task"
import TaskList from "../../../components/TaskList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { fetchTasks } from "@/app/components/fetchfrom_BE/Fetch_tasks"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import confetti from 'canvas-confetti'
import { Slider } from "@/components/ui/slider"
import TaskExcelGenerator from "@/app/components/TaskGeneration"

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("processing")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: [] as string[],
    minAmount: 0,
    maxAmount: 1000,
    showPriority: false,
  })
  const [sortOption, setSortOption] = useState("newest")
  const [showInsights, setShowInsights] = useState(false)
  const [streakCount, setStreakCount] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)

  const router = useRouter()

  useEffect(() => {
    const fetchTask = async () => {
      setIsLoading(true)
      try {
        const response = await fetchTasks()
        if (response !== null) {
          console.log("Fetched Task:", response)
          setTasks(response.task)
          const sortedCompletedTasks = response.task
            .filter((task: Task) => task.completed)
            .sort((a: Task, b: Task) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
          
          // This is a placeholder - in a real app you'd calculate actual streaks
          setStreakCount(Math.min(sortedCompletedTasks.length, 7))
        } else {
          console.error("Failed to fetch Task")
        }
      } catch (error) {
        console.error("Error fetching tasks:", error)
      } finally {
        setIsLoading(false)
      }
    }

      fetchTask()
    
  },[])

  useEffect(() => {
    let result = tasks

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(

        task => 

          task.title.toLowerCase().includes(query) || 
          task.description.toLowerCase().includes(query) ||
          task.name.toLowerCase().includes(query) ||
          task.address.toLowerCase().includes(query)
    )
    }

    if (filters.status.length > 0) {
      result = result.filter(task => filters.status.includes(task.status))
    }
console.log(filters.minAmount,"kkkkkk",filters.maxAmount)

    result = result.filter(
      task => task.amount >= filters.minAmount && task.amount <= filters.maxAmount || task.amount >filters.maxAmount
    )
    result = sortTasks(result, sortOption)
    setFilteredTasks(result)
  }, [tasks, searchQuery, filters, sortOption])

  const sortTasks = (tasksToSort: Task[], option: string) => {
    switch (option) {
      case "newest":
        return [...tasksToSort].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      case "oldest":
        return [...tasksToSort].sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
      case "amount-high":
        return [...tasksToSort].sort((a, b) => b.amount - a.amount)
      case "amount-low":
        return [...tasksToSort].sort((a, b) => a.amount - b.amount)
      case "alphabetical":
        return [...tasksToSort].sort((a, b) => a.title.localeCompare(b.title))
      default:
        return tasksToSort
    }
  }

  const completedTasks = filteredTasks.filter((task) => task.completed)
  const processingTasks = filteredTasks.filter((task) => !task.completed)
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.5,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    // Show confetti when switching to completed tab
    if (value === "completed" && completedTasks.length > 0 && !showConfetti) {
      setShowConfetti(true)
      triggerConfetti()
      
      // Hide confetti after 2.5 seconds
      setTimeout(() => {
        setShowConfetti(false)
      }, 2500)
    }
  }

  const triggerConfetti = () => {
    if (typeof window !== 'undefined') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }

  const toggleStatusFilter = (status: string) => {
    setFilters(prev => {
      const newStatuses = prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
      
      return { ...prev, status: newStatuses }
    })
  }

  const resetFilters = () => {
    setFilters({
      status: [],
      minAmount: 0,
      maxAmount: 1000,
      showPriority: false,
    })
    setSearchQuery("")
    setSortOption("newest")
  }

  const getCompletionRate = () => {
    if (tasks.length === 0) return 0
    return Math.round((completedTasks.length / tasks.length) * 100)
  }

  const getAverageTaskValue = () => {
    if (tasks.length === 0) return 0
    const total = tasks.reduce((sum, task) => sum + task.amount, 0)
    return Math.round(total / tasks.length)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 right-1/4 w-60 h-60 bg-pink-100 dark:bg-pink-900/20 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto">
          <motion.div variants={itemVariants} className="flex items-center justify-center mb-6">
            <div className="relative">
              <h1 className="text-5xl font-bold text-center text-gray-800 dark:text-white">Task Dashboard</h1>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -top-6 -right-12"
              >
                <Sparkles className="h-8 w-8 text-yellow-400" />
              </motion.div>
            </div>
          </motion.div>

          {streakCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                  <Award className="h-5 w-5" />
                  <span className="font-medium">Task Streak: {streakCount} days</span>
                  {streakCount >= 7 && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">🔥 On Fire!</span>}
                </div>
              </div>
            </motion.div>
          )}

          <motion.div 
            variants={itemVariants} 
            className="mb-6 bg-white dark:bg-slate-800/80 rounded-xl p-4 shadow-md backdrop-blur-sm"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-gray-700"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>Filter</span>
                      {(filters.status.length > 0 || filters.minAmount > 0 || filters.maxAmount < 1000) && (
                        <Badge className="ml-1 bg-blue-500 hover:bg-blue-600">
                          {filters.status.length + (filters.minAmount > 0 || filters.maxAmount < 1000 ? 1 : 0)}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">FILTER BY STATUS</h3>
                      <div className="flex flex-wrap gap-2">
                        {["Not Started", "In Progress", "Almost Done", "Completed"].map((status) => (
                          <Badge
                            key={status}
                            variant={filters.status.includes(status) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleStatusFilter(status)}
                          >
                            {status}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">PRICE RANGE</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">${filters.minAmount}</span>
                          <span className="text-sm">${filters.maxAmount}</span>
                        </div>
                        <Slider
                          defaultValue={[filters.minAmount, filters.maxAmount]}
                          max={1000}
                          step={10}
                          onValueChange={(value) => {
                            setFilters(prev => ({
                              ...prev,
                              minAmount: value[0],
                              maxAmount: value[1]
                            }))
                          }}
                          className="mt-2"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="priority-mode"
                          checked={filters.showPriority}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({
                              ...prev,
                              showPriority: checked
                            }))
                          }}
                        />
                        <Label htmlFor="priority-mode">Show priority indicators</Label>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={resetFilters}
                        className="w-full mt-2"
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span>Sort</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className={sortOption === "newest" ? "bg-gray-100 dark:bg-gray-800" : ""}
                      onClick={() => setSortOption("newest")}
                    >
                      Newest first
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={sortOption === "oldest" ? "bg-gray-100 dark:bg-gray-800" : ""}
                      onClick={() => setSortOption("oldest")}
                    >
                      Oldest first
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={sortOption === "amount-high" ? "bg-gray-100 dark:bg-gray-800" : ""}
                      onClick={() => setSortOption("amount-high")}
                    >
                      Amount (high to low)
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={sortOption === "amount-low" ? "bg-gray-100 dark:bg-gray-800" : ""}
                      onClick={() => setSortOption("amount-low")}
                    >
                      Amount (low to high)
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={sortOption === "alphabetical" ? "bg-gray-100 dark:bg-gray-800" : ""}
                      onClick={() => setSortOption("alphabetical")}
                    >
                      Alphabetical
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setShowInsights(!showInsights)}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Insights</span>
                </Button>
                <TaskExcelGenerator/>
              </div>


            </div>
          </motion.div>
          
          <AnimatePresence>
            {showInsights && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{tasks.length}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Tasks</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 dark:text-green-400">{getCompletionRate()}%</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completion Rate</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">${getAverageTaskValue()}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Average Task Value</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="mb-8">
            <Tabs defaultValue="processing" value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 rounded-xl p-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <TabsTrigger
                  value="processing"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg py-3 transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-lg font-medium">Processing Tasks</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-sm font-semibold">
                      {processingTasks.length}
                    </span>
                  </motion.div>
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-lg py-3 transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-lg font-medium">Completed Tasks</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-sm font-semibold">
                      {completedTasks.length}
                    </span>
                  </motion.div>
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="processing" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
                        Processing Tasks
                      </h2>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {processingTasks.length} tasks remaining
                      </div>
                    </div>

                    {isLoading ? (
                      <TaskSkeleton count={3} />
                    ) : processingTasks.length === 0 ? (
                      <EmptyState type="processing" />
                    ) : (
                      <TaskList 
                        tasks={processingTasks} 
                        showPriorityIndicators={filters.showPriority}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                        Completed Tasks
                      </h2>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {completedTasks.length} tasks completed
                      </div>
                    </div>

                    {isLoading ? (
                      <TaskSkeleton count={2} />
                    ) : completedTasks.length === 0 ? (
                      <EmptyState type="completed" />
                    ) : (
                      <TaskList 
                        tasks={completedTasks} 
                        showPriorityIndicators={filters.showPriority}
                      />
                    )}
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
        className="fixed bottom-8 right-8 z-20"
      >
        <Button
          onMouseUp={() => {
            router.prefetch("/my-account/User/addTask")
          }}
          onClick={() => {
            router.push("/my-account/User/addTask")
          }}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg transition-all duration-300 ease-in-out rounded-full p-6"
        >
          <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}>
            <PlusCircle size={24} className="mr-2" />
          </motion.div>
          <span className="font-medium">Add New Task</span>
        </Button>
      </motion.div>
      
      <canvas 
        ref={confettiCanvasRef} 
        className="fixed inset-0 pointer-events-none z-50"
        style={{ display: 'none' }}
      />
    </motion.div>
  )
}

function EmptyState({ type }: { type: "processing" | "completed" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-64 bg-white dark:bg-slate-800/60 rounded-2xl shadow-md backdrop-blur-sm border border-gray-100 dark:border-gray-700 p-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
      >
        {type === "processing" ? (
          <PlusCircle size={32} className="text-blue-500" />
        ) : (
          <Sparkles size={32} className="text-green-500" />
        )}
      </motion.div>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
        {type === "processing" ? "No tasks in progress" : "No completed tasks yet"}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
        {type === "processing"
          ? "Add a new task to get started with your project management."
          : "Complete some tasks to see them appear here."}
      </p>
    </motion.div>
  )
}

function TaskSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800/60 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6 animate-pulse"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-1/5 animate-pulse"></div>
            </div>
          </div>
        ))}
    </div>
  )
}
