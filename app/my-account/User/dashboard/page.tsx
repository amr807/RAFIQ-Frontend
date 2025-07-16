"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Badge,
  Trophy,
  Calendar,
  ArrowUpRight,
  Activity,
  Users,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import type { Task } from "@/app/types/task"
import { fetchEmployees } from "@/app/components/fetchfrom_BE/Fetch_employess"
import { fetchTasks } from "@/app/components/fetchfrom_BE/Fetch_tasks"
import { Progress } from "@radix-ui/react-progress"

// Colors for charts - Soft, eye-friendly palette
const COLORS = ["#64B5F6", "#81C784", "#FFB74D", "#E57373", "#9575CD"]
const TASK_STATUS_COLORS = {
  Completed: "#81C784",
  "In Progress": "#64B5F6",
  Pending: "#FFB74D",
  "Not Started": "#E57373",
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completionRate, setCompletionRate] = useState(0)

  interface Employee {
    user_id: string
    firstname: string
    lastname: string
    avatar: string | null
  }

  const [employees, setEmployees] = useState<Employee[]>([])
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const { data: session } = useSession()
  const Email = session?.user?.email

  const router = useRouter()

  // Calculate task statistics
  const calculateTaskStats = (taskList: Task[]) => {
    const total = taskList.length
    const completed = taskList.filter((t) => t.status === "Completed").length
    const inProgress = taskList.filter((t) => t.status === "In Progress").length
    const notStarted = taskList.filter((t) => t.status === "Not Started").length
    const pending = taskList.filter((t) => t.status === "Almost Done").length

    setCompletionRate(total > 0 ? Math.round((completed / total) * 100) : 0)

    return {
      total,
      completed,
      inProgress,
      notStarted,
      pending,
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const taskResponse = await fetchTasks()
        if (taskResponse) {
          setTasks(taskResponse.task)
          calculateTaskStats(taskResponse.task)
        }

        const employeeResponse = await fetchEmployees(Email)
        if (employeeResponse) {
          setEmployees(employeeResponse)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [Email, toast])

  // Get recent tasks
  const recentTasks = tasks.slice(-5).reverse()

  // Filter tasks based on search and filters
  const filteredTasks = recentTasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "All" || task.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Prepare data for charts
  const taskStatusData = [
    { name: "Completed", value: tasks.filter((t) => t.status === "Completed").length },
    { name: "In Progress", value: tasks.filter((t) => t.status === "In Progress").length },
    { name: "Pending", value: tasks.filter((t) => t.status ==="Almost Done" ).length },
    { name: "Not Started", value: tasks.filter((t) => t.status === "Not Started").length },
  ].filter((item) => item.value > 0)

  // Weekly task completion data (mock data - replace with real data if available)
  const weeklyData = [
    { name: "Mon", completed: 4, total: 5 },
    { name: "Tue", completed: 3, total: 6 },
    { name: "Wed", completed: 5, total: 7 },
    { name: "Thu", completed: 2, total: 4 },
    { name: "Fri", completed: 6, total: 8 },
    { name: "Sat", completed: 1, total: 2 },
    { name: "Sun", completed: 0, total: 1 },
  ]

  // Monthly trend data
  const monthlyTrendData = [
    { name: "Jan", tasks: 20, completed: 15, efficiency: 75 },
    { name: "Feb", tasks: 25, completed: 18, efficiency: 72 },
    { name: "Mar", tasks: 30, completed: 22, efficiency: 73 },
    { name: "Apr", tasks: 28, completed: 20, efficiency: 71 },
    { name: "May", tasks: 32, completed: 25, efficiency: 78 },
    { name: "Jun", tasks: 35, completed: 30, efficiency: 85 },
  ]

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`
  }

  return (
    <div >
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full px-4 py-8">
        <motion.div variants={itemVariants} className="mb-8 px-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-md border border-blue-100">
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard</h1>
              <p className="text-blue-600">Welcome back! Here&apos;s an overview of your tasks and team performance.</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-4">
          <Card className="bg-white shadow-md border border-blue-50 overflow-hidden rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{tasks.length}</h3>
                </div>
                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  <span className="text-green-500 font-medium">+{Math.round(tasks.length * 0.1)}% </span>
                  from last month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md border border-blue-50 overflow-hidden rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{completionRate}%</h3>
                </div>
                <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="mt-2">
                <Progress value={completionRate} className="h-2 bg-gray-100">
                  <div
                    className="bg-green-400 h-full"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </Progress>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md border border-blue-50 overflow-hidden rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Team Members</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{employees.length}</h3>
                </div>
                <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex -space-x-2">
                {employees.slice(0, 5).map((employee) => (
                  <Avatar key={employee.user_id} className="border-2 border-white h-8 w-8">
                    <AvatarImage src={employee.avatar == null ? "/defult.png" : employee.avatar} />
                    <AvatarFallback className="bg-purple-100 text-purple-600">{`${employee.firstname[0]}`}</AvatarFallback>
                  </Avatar>
                ))}
                {employees.length > 5 && (
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                    +{employees.length - 5}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md border border-blue-50 overflow-hidden rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Upcoming Deadlines</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {tasks.filter((t) => new Date(t.createdAt) > new Date() && t.status !== "Completed").length}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-400" />
                </div>
              </div>
              <div className="mt-4">
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-amber-500 hover:text-amber-600 hover:bg-transparent"
                  onClick={() => router.push("task")}
                    onMouseUp={() => router.prefetch("/my-account/User/task")}
                  
                >
                  View deadlines <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          <motion.div variants={itemVariants} className="md:col-span-2">
            <Card className="bg-white shadow-md border border-blue-50 overflow-hidden rounded-xl h-full">
              <CardHeader className="pb-2 border-b border-blue-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-bold text-blue-800">Recent Tasks</CardTitle>
                    <CardDescription>Your latest 5 tasks and their status</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-500 border-blue-100 hover:bg-blue-50"
                    onClick={() => router.push("task")}
                    onMouseUp={() => router.prefetch("/my-account/User/task")}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-blue-50/30 border-blue-100"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px] bg-blue-50/30 border-blue-100">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-blue-50 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : (
                  <AnimatePresence>
                    <div className="space-y-3">
                      {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            whileHover={{
                              scale: 1.01,
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                              backgroundColor: "rgba(249, 250, 251, 0.8)",
                            }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between p-4 border border-blue-100 rounded-lg bg-white shadow-sm cursor-pointer"
                            onClick={() => router.push(`/tasks/${task.id}`)}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="w-2 h-full min-h-[40px] rounded-full"
                                style={{
                                  backgroundColor:
                                    TASK_STATUS_COLORS[task.status as keyof typeof TASK_STATUS_COLORS] || "#CBD5E1",
                                }}
                              ></div>
                              <div>
                                <p className="font-medium text-gray-700">{task.title}</p>
                                <div className="flex items-center mt-1 text-sm text-gray-500">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Due: {formatDate(task.createdAt)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`px-2 py-1 rounded-md ${
                                  task.completed
                                    ? "bg-green-100 text-green-700"
                                    : task.status === "Not Started"
                                      ? "bg-red-100 text-red-700"
                                      : task.status === "In Progress"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {task.status}
                              </Badge>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">No tasks match your filters</div>
                      )}
                    </div>
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white shadow-md border border-blue-50 overflow-hidden rounded-xl h-full">
              <CardHeader className="pb-2 border-b border-blue-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-bold text-blue-800">Top Performers</CardTitle>
                    <CardDescription>Your team&apos;s best performers</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-purple-500 border-purple-100 hover:bg-purple-50"
                    onClick={() => router.push("/my-account/User/employees")}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-blue-50 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {employees.slice(0, 5).map((employee, index) => (
                      <motion.div
                        key={employee.user_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        whileHover={{
                          scale: 1.01,
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                          backgroundColor: "rgba(249, 250, 251, 0.8)",
                        }}
                        className="flex items-center space-x-4 p-4 border border-blue-100 rounded-lg bg-white shadow-sm cursor-pointer"
                        onClick={() => router.push(`/my-account/User/employees/${employee.user_id}`)}
                      >
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            <AvatarImage src={employee.avatar == null ? "/defult.png" : employee.avatar} />
                            <AvatarFallback className="bg-purple-100 text-purple-600 text-lg">
                              {`${employee.firstname[0]}`}
                            </AvatarFallback>
                          </Avatar>
                          {index === 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                              className="absolute -top-2 -right-2 bg-amber-400 rounded-full p-1 shadow-md"
                            >
                              <Trophy className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-700">{`${employee.firstname} ${employee.lastname}`}</p>
                          <div className="flex items-center mt-1">
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-purple-400 h-2 rounded-full"
                                style={{ width: `${100 - index * 15}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-500 ml-2">{100 - index * 15}%</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 px-4">
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="bg-white shadow-md  border border-blue-50 overflow-hidden rounded-xl">
              <CardHeader className="border-b border-blue-50">
                <CardTitle className="text-xl font-bold text-blue-800">Task Status</CardTitle>
                <CardDescription>Distribution of tasks by current status</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={2}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            TASK_STATUS_COLORS[entry.name as keyof typeof TASK_STATUS_COLORS] ||
                            COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} tasks`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="bg-white shadow-md border border-blue-50 overflow-hidden rounded-xl">
              <CardHeader className="border-b border-blue-50">
                <CardTitle className="text-xl font-bold text-blue-800">Monthly Trend</CardTitle>
                <CardDescription>Task completion over the past months</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F6" />
                    <XAxis dataKey="name" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(255, 255, 255, 0.95)", 
                        border: "1px solid #E2E8F0",
                        borderRadius: "6px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
                      }} 
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tasks"
                      name="Total Tasks"
                      stroke="#64B5F6"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#64B5F6", strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      name="Completed"
                      stroke="#81C784"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#81C784", strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="efficiency"
                      name="Efficiency (%)"
                      stroke="#9575CD"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#9575CD", strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="mt-6 px-4">
          <Card className="bg-white shadow-md border border-blue-50 overflow-hidden rounded-xl">
            <CardHeader className="border-b border-blue-50">
              <CardTitle className="text-xl font-bold text-blue-800">Weekly Progress</CardTitle>
              <CardDescription>Task completion over the past week</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F6" />
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.95)", 
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="total" name="Total Tasks" fill="#BFDBFE" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

 
      </motion.div>
    </div>
  )
}
