"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  MapPin,
  Download,
  PlusCircle,
  Search,
  Filter,
  SortAsc,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Car,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { fetchEmployees } from "@/app/components/fetchfrom_BE/Fetch_employess"
import { fetchTasks } from "@/app/components/fetchfrom_BE/Fetch_tasks"
import type { Task } from "@/app/types/task"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList } from "@/app/components/ui/tabs"
import { Progress } from "@radix-ui/react-progress"
import { TabsTrigger } from "@radix-ui/react-tabs"

export default function EmployeescontextPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<{
    id: string
    name: string
    status: string
    location: string
    user_id?: string
    email?: string
    phone?: string
    vehicle?: string
    createdAt?: string
    Isfirstlogin?: boolean
  }[]>([{ id: "", name: "", status: "Active", location: "" }])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [filterByStatus, setFilterByStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEmployee, setSelectedEmployee] = useState<null | {
    id: string
    name: string
    status: string
    location: string
    profileImage?: string
    email?: string
    phone?: string
    vehicle?: string
    createdAt?: string
    Isfirstlogin?: boolean
    user_id?: string
  }>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingEmployee, setIsAddingEmployee] = useState(false)
  const [newEmployeeData, setNewEmployeeData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicle: "",
  })
  const itemsPerPage = 5
  const Email = session?.user?.email

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch tasks
        const taskResponse = await fetchTasks()
        if (taskResponse) {
          console.log("Fetched Task:", taskResponse)
          setTasks(taskResponse.task)
        } else {
          console.error("Failed to fetch Task")
        }

        // Fetch employees
        const employeeResponse = await fetchEmployees(Email)
        if (employeeResponse !== null) {
          const transformedEmployees = employeeResponse.map(
            (user: {
              user_id: string
              firstname: string
              lastname: string
            }) => ({
              id: user.user_id,
              name: `${user.firstname} ${user.lastname}`,
              ...user,
            }),
          )
          setEmployees(transformedEmployees)
        } else {
          throw new Error("Failed to fetch employees")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [Email, session, toast])

  const filteredEmployees = employees
    .filter((employee) => {
      const name = employee.name || ""
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase())
      const status = employee.Isfirstlogin ? "Inactive" : "Active"
      const matchesStatus = filterByStatus === "all" || status === filterByStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      } else if (sortBy === "status") {
        const statusA = a.Isfirstlogin ? "Inactive" : "Active"
        const statusB = b.Isfirstlogin ? "Inactive" : "Active"
        return statusA.localeCompare(statusB)
      } else {
        return Number(a.id) - Number(b.id)
      }
    })

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleEmployeeClick = (employee: {
    id: string
    name: string
    status: string
    location: string
    profileImage?: string
    email?: string
    phone?: string
    vehicle?: string
    createdAt?: string
    Isfirstlogin?: boolean
    user_id?: string
  }) => {
    setSelectedEmployee(employee)
  }

  const handleAddEmployee = () => {
    setIsAddingEmployee(true)
  }

  const handleSubmitNewEmployee = async () => {
    // Here you would normally send this to your backend
    const newEmployee = {
      id: (employees.length + 1).toString(),
      name: newEmployeeData.name,
      email: newEmployeeData.email,
      phone: newEmployeeData.phone,
      vehicle: newEmployeeData.vehicle,
      status: "Active",
      location: "Unknown",
      createdAt: new Date().toISOString(),
      Isfirstlogin: true,
      user_id: (employees.length + 1).toString(),
    }

    setEmployees([...employees, newEmployee])
    setIsAddingEmployee(false)
    setNewEmployeeData({
      name: "",
      email: "",
      phone: "",
      vehicle: "",
    })

    toast({
      title: "Employee Added",
      description: "A new employee has been added to the list.",
    })
  }

  const handleEditEmployee = async (employee: {
    id?: string
    name: string
    status?: string
    location?: string
  }) => {
    try {
      // This would normally be a proper form
      const updatedName = prompt("Enter the new name:", employee.name)
      if (updatedName) {
        const updatedEmployee = { ...employee, name: updatedName }
        setEmployees(
          employees.map((emp) =>
            emp.id === updatedEmployee.id
              ? {
                  id: updatedEmployee.id || emp.id,
                  name: updatedEmployee.name || emp.name,
                  status: updatedEmployee.status || emp.status,
                  location: updatedEmployee.location || emp.location,
                }
              : emp,
          ),
        )
        toast({
          title: "Employee Updated",
          description: "The employee's details have been updated.",
        })
      }
    } catch (error) {
      console.error("Error updating employee:", error)
      toast({
        title: "Error",
        description: "Failed to update employee. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEmployee = (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      setEmployees(employees.filter((employee) => employee.id !== id))
      if (selectedEmployee && selectedEmployee.id === id) {
        setSelectedEmployee(null)
      }
      toast({
        title: "Employee Deleted",
        description: "The employee has been removed from the list.",
      })
    }
  }

  const handleExportData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Name,Email,Phone,Vehicle,Join Date,Tasks Assigned,Tasks Completed,Account Status\n" +
      employees
        .map(
          (employee) =>
            `${employee.user_id},${employee.name},${employee.email},${employee.phone},${employee.vehicle},${
              employee.createdAt
                ? `${new Date(employee.createdAt).getDate().toString().padStart(2, "0")}/${(new Date(employee.createdAt).getMonth() + 1).toString().padStart(2, "0")}/${new Date(employee.createdAt).getFullYear()}`
                : "N/A"
            },${tasks.filter((task) => task.employee_id === employee.user_id).length},${tasks.filter((task) => task.employee_id === employee.user_id && task.status == "Completed").length},${employee.Isfirstlogin ? "Inactive" : "Active"}`,
        )
        .join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "employees.csv")
    document.body.appendChild(link)
    link.click()
    toast({
      title: "Data Exported",
      description: "Employee data has been exported as CSV.",
    })
  }

  // Calculate employee stats
  const getEmployeeStats = (employeeId: string) => {
    const employeeTasks = tasks.filter((task) => task.employee_id === employeeId)
    const completedTasks = employeeTasks.filter((task) => task.status === "Completed")
    const completionRate = employeeTasks.length > 0 ? (completedTasks.length / employeeTasks.length) * 100 : 0

    return {
      totalTasks: employeeTasks.length,
      completedTasks: completedTasks.length,
      completionRate: completionRate,
    }
  }

  return (
    <div >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <Card className="max-w-6xl mx-auto shadow-lg border-0">
          <CardHeader className="pb-4 bg-gradient-to-r from-slate-100 to-slate-50 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                  Employees Management
                </CardTitle>
                <CardDescription>Manage your team members and their performance</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddEmployee}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Employee
                </Button>
                <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col md:flex-row gap-4 mb-6"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                  <SortAsc className="text-slate-400 w-4 h-4" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-slate-400 w-4 h-4" />
                  <Select value={filterByStatus} onValueChange={setFilterByStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>

            <AnimatePresence>
              {isAddingEmployee && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <Card className="mb-6 border border-emerald-100 bg-emerald-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Add New Employee</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Full Name</label>
                          <Input
                            value={newEmployeeData.name}
                            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, name: e.target.value })}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Email</label>
                          <Input
                            value={newEmployeeData.email}
                            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })}
                            placeholder="john.doe@example.com"
                            type="email"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Phone</label>
                          <Input
                            value={newEmployeeData.phone}
                            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, phone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Vehicle</label>
                          <Input
                            value={newEmployeeData.vehicle}
                            onChange={(e) => setNewEmployeeData({ ...newEmployeeData, vehicle: e.target.value })}
                            placeholder="Toyota Corolla"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddingEmployee(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSubmitNewEmployee}>Save Employee</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {isLoading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center h-12 mb-6">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  <span className="ml-2 text-slate-600">Loading employees...</span>
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-[80px]">Profile</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {paginatedEmployees.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              No employees found. Try adjusting your search or filters.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedEmployees.map((employee, index) => {
                            const stats = getEmployeeStats(employee.user_id || employee.id)

                            return (
                              <motion.tr
                                key={employee.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                onClick={() => handleEmployeeClick(employee)}
                                className="cursor-pointer hover:bg-slate-50 transition-colors"
                                whileHover={{ scale: 1.01 }}
                                layout
                              >
                                <TableCell>
                                  <Avatar className="border-2 border-white shadow-sm">
                                    <AvatarImage
                                      src={`../../defult copy.png`}
                                      alt={employee.name}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white">
                                      {employee.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">{employee.name}</TableCell>
                                <TableCell className="text-slate-600">{employee.email || "N/A"}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={employee.Isfirstlogin ? "destructive" : "default"}
                                    className="flex w-fit items-center gap-1"
                                  >
                                    {employee.Isfirstlogin ? (
                                      <>
                                        <AlertCircle className="w-3 h-3" /> Inactive
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-3 h-3" /> Active
                                      </>
                                    )}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <div className="text-xs text-slate-500">
                                      {stats.completedTasks} of {stats.totalTasks} completed
                                    </div>
                                    <Progress value={stats.completionRate} className="h-2" />
                                  </div>
                                </TableCell>
                                <TableCell className="flex justify-end space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toast({
                                        title: "Chat Initiated",
                                        description: `You are now chatting with ${employee.name}.`,
                                      })
                                    }}
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      router.push("location")
                                    }}
                                    onMouseUp={() => router.prefetch("my-account/User/location")}
                                  >
                                    <MapPin className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditEmployee(employee)
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteEmployee(employee.id)
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </motion.tr>
                            )
                          })
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {paginatedEmployees.length > 0 && (
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-slate-500">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length}{" "}
                      employees
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {selectedEmployee && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="mt-8"
                    >
                      <Card className="border border-slate-200 shadow-md overflow-hidden">
                        <CardHeader className="pb-2 bg-gradient-to-r from-slate-100 to-slate-50">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-xl">Employee Profile</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedEmployee(null)}
                              className="h-8 px-2"
                            >
                              Close
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                              <TabsTrigger
                                value="overview"
                                className="rounded-none border-b-2 border-transparent px-6 mr-4 data-[state=active]:border-slate-900 data-[state=active]:bg-transparent"
                              >
                                Overview
                              </TabsTrigger>
                              <TabsTrigger
                                value="tasks"
                                className="rounded-none border-b-2 border-transparent px-6 mx-4 data-[state=active]:border-slate-900 data-[state=active]:bg-transparent"
                              >
                                Tasks
                              </TabsTrigger>
                              <TabsTrigger
                                value="performance"
                                className="rounded-none border-b-2 border-transparent px-6 ml-4 data-[state=active]:border-slate-900 data-[state=active]:bg-transparent"
                              >
                                Performance
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview" className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="col-span-1 flex flex-col items-center text-center">
                                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg mb-4">
                                    <AvatarImage
                                      src={`https://avatar.vercel.sh/${selectedEmployee.id}.png`}
                                      alt={selectedEmployee.name}
                                    />
                                    <AvatarFallback className="text-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white">
                                      {selectedEmployee.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <h3 className="text-xl font-bold">{selectedEmployee.name}</h3>
                                  <p className="text-slate-500 mb-4">
                                    {selectedEmployee.location || "No location set"}
                                  </p>
                                  <Badge
                                    variant={selectedEmployee.Isfirstlogin ? "destructive" : "default"}
                                    className="mb-4"
                                  >
                                    {selectedEmployee.Isfirstlogin ? "Inactive" : "Active"}
                                  </Badge>
                                  <div className="flex gap-2 mt-2">
                                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                                      <MessageCircle className="w-3 h-3" /> Message
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                                      <Edit className="w-3 h-3" /> Edit
                                    </Button>
                                  </div>
                                </div>
                                <div className="col-span-2 space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center text-slate-500 text-sm">
                                        <Mail className="w-4 h-4 mr-2" /> Email
                                      </div>
                                      <p>{selectedEmployee.email || "No email available"}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center text-slate-500 text-sm">
                                        <Phone className="w-4 h-4 mr-2" /> Phone
                                      </div>
                                      <p>{selectedEmployee.phone || "No phone available"}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center text-slate-500 text-sm">
                                        <Calendar className="w-4 h-4 mr-2" /> Join Date
                                      </div>
                                      <p>
                                        {selectedEmployee.createdAt
                                          ? new Date(selectedEmployee.createdAt).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                            })
                                          : "No date available"}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center text-slate-500 text-sm">
                                        <Car className="w-4 h-4 mr-2" /> Vehicle
                                      </div>
                                      <p>{selectedEmployee.vehicle || "No vehicle information"}</p>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">Task Summary</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {(() => {
                                        const stats = getEmployeeStats(selectedEmployee.user_id || selectedEmployee.id)
                                        return (
                                          <>
                                            <Card className="bg-slate-50">
                                              <CardContent className="p-4 text-center">
                                                <p className="text-sm text-slate-500">Total Tasks</p>
                                                <p className="text-2xl font-bold">{stats.totalTasks}</p>
                                              </CardContent>
                                            </Card>
                                            <Card className="bg-slate-50">
                                              <CardContent className="p-4 text-center">
                                                <p className="text-sm text-slate-500">Completed</p>
                                                <p className="text-2xl font-bold">{stats.completedTasks}</p>
                                              </CardContent>
                                            </Card>
                                            <Card className="bg-slate-50">
                                              <CardContent className="p-4 text-center">
                                                <p className="text-sm text-slate-500">Completion Rate</p>
                                                <p className="text-2xl font-bold">{stats.completionRate.toFixed(0)}%</p>
                                              </CardContent>
                                            </Card>
                                          </>
                                        )
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="tasks" className="p-6">
                              <div className="space-y-4">
                                <h3 className="text-lg font-medium">Assigned Tasks</h3>
                                {tasks.filter(
                                  (task) => task.employee_id === (selectedEmployee.user_id || selectedEmployee.id),
                                ).length > 0 ? (
                                  <div className="space-y-3">
                                    {tasks
                                      .filter(
                                        (task) =>
                                          task.employee_id === (selectedEmployee.user_id || selectedEmployee.id),
                                      )
                                      .map((task, index) => (
                                        <motion.div
                                          key={task.id || index}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.2, delay: index * 0.05 }}
                                          className="p-4 border rounded-md hover:bg-slate-50 transition-colors"
                                        >
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <h4 className="font-medium">{task.title || `Task #${task.id}`}</h4>
                                              <p className="text-sm text-slate-500">
                                                {task.description || "No description available"}
                                              </p>
                                            </div>
                                            <Badge variant={task.status === "Completed" ? "default" : "outline"}>
                                              {task.status || "Pending"}
                                            </Badge>
                                          </div>
                                          {task.createdAt && (
                                            <div className="mt-2 text-xs text-slate-500 flex items-center">
                                              <Calendar className="w-3 h-3 mr-1" />
                                              Due: {new Date(task.createdAt).toLocaleDateString()}
                                            </div>
                                          )}
                                        </motion.div>
                                      ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-slate-500">
                                    <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p>No tasks assigned to this employee yet</p>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                            <TabsContent value="performance" className="p-6">
                              <div className="space-y-6">
                                <div>
                                  <h3 className="text-lg font-medium mb-4">Performance Overview</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                      <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Task Completion Rate</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        {(() => {
                                          const stats = getEmployeeStats(
                                            selectedEmployee.user_id || selectedEmployee.id,
                                          )
                                          return (
                                            <div className="space-y-2">
                                              <div className="flex justify-between text-sm">
                                                <span>Progress</span>
                                                <span>{stats.completionRate.toFixed(0)}%</span>
                                              </div>
                                              <Progress value={stats.completionRate} className="h-2" />
                                              <p className="text-xs text-slate-500 mt-2">
                                                {stats.completedTasks} of {stats.totalTasks} tasks completed
                                              </p>
                                            </div>
                                          )
                                        })()}
                                      </CardContent>
                                    </Card>

                                    <Card>
                                      <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Account Status</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="flex items-center gap-4">
                                          <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedEmployee.Isfirstlogin ? "bg-red-100" : "bg-green-100"}`}
                                          >
                                            {selectedEmployee.Isfirstlogin ? (
                                              <AlertCircle className="w-6 h-6 text-red-500" />
                                            ) : (
                                              <CheckCircle className="w-6 h-6 text-green-500" />
                                            )}
                                          </div>
                                          <div>
                                            <p className="font-medium">
                                              {selectedEmployee.Isfirstlogin ? "Inactive Account" : "Active Account"}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                              {selectedEmployee.Isfirstlogin
                                                ? "Employee has not completed first login"
                                                : "Employee account is active and in good standing"}
                                            </p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </div>

                                <div>
                                  <h3 className="text-lg font-medium mb-4">Activity Timeline</h3>
                                  {tasks.filter(
                                    (task) => task.employee_id === (selectedEmployee.user_id || selectedEmployee.id),
                                  ).length > 0 ? (
                                    <div className="relative pl-6 border-l border-slate-200 space-y-6">
                                      {tasks
                                        .filter(
                                          (task) =>
                                            task.employee_id === (selectedEmployee.user_id || selectedEmployee.id),
                                        )
                                        .sort(
                                          (a, b) =>
                                            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
                                        )
                                        .slice(0, 5)
                                        .map((task, index) => (
                                          <motion.div
                                            key={task.id || index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className="relative"
                                          >
                                            <div className="absolute -left-9 mt-1.5 h-4 w-4 rounded-full border border-white bg-slate-200" />
                                            <div className="mb-1 text-sm font-medium">
                                              {task.title || `Task #${task.id}`}
                                              <Badge
                                                variant={task.status === "Completed" ? "default" : "outline"}
                                                className="ml-2"
                                              >
                                                {task.status || "Pending"}
                                              </Badge>
                                            </div>
                                            <time className="text-xs text-slate-500">
                                              {task.createdAt
                                                ? new Date(task.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                  })
                                                : "No date available"}
                                            </time>
                                          </motion.div>
                                        ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 text-slate-500">
                                      <p>No activity recorded for this employee</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
