/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import type { Task } from "../../../types/task"
import SuccessMessage from "../../../components/SucessMessage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import {
  Trash2,
  Plus,
  Minus,
  FileText,
  Package,
  Box,
  Truck,
  AlertTriangle,
  MoreHorizontal,
  X,
  User,
  FileEdit,
  MessageSquare,
  DollarSign,
  MapPin,
  Badge,
  CalendarIcon,
  Clock,
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { FindId } from "@/app/components/fetchfrom_BE/fetch_id"

const AzureMap = dynamic(() => import("../../../components/Googlemap"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-md overflow-hidden shadow-md flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  ),
})

// Define a type for package items
type PackageItem = {
  type: string
  customType?: string
  quantity: number
}

export default function AddcontextTask() {
  const router = useRouter()
  const { data: session } = useSession()
  const [employeeName, setEmployeeName] = useState("")
  const [ID, setID] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [employees, setEmployees] = useState<{ id: string; firstname: string; lastname: string }[]>([])
  const [packageItems, setPackageItems] = useState<PackageItem[]>([])
  const [showAddPackage, setShowAddPackage] = useState(false)
  const [newPackage, setNewPackage] = useState<PackageItem>({ type: "document", quantity: 1 })
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [task, setTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    address: "",
    createdAt: "",
    deadline: "", // Add deadline field
    amount: 0,
    packageItems: [],
    completed: false,
    name: "",
    employee_id: "",
    status: "Not Started",
    image: "", // Add missing properties
    priority: "Low", // Default priority
    location: "",
    lon: 0,
    lat: 0,
    estimatedTime: "",
  })
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number }>({ lat: 0, lon: 0 })
  const [selectedMapEmployee, setSelectedMapEmployee] = useState<{ id: string; name: string } | null>(null)

  // Package type definitions with colors and icons
  const packageTypes = [
    {
      id: "document",
      label: "Document",
      icon: FileText,
      color: "bg-teal-500",
      lightColor: "bg-teal-50",
      textColor: "text-teal-700",
      borderColor: "border-teal-200",
    },
    {
      id: "small_package",
      label: "Small Package",
      icon: Package,
      color: "bg-violet-500",
      lightColor: "bg-violet-50",
      textColor: "text-violet-700",
      borderColor: "border-violet-200",
    },
    {
      id: "medium_package",
      label: "Medium Package",
      icon: Box,
      color: "bg-amber-500",
      lightColor: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
    },
    {
      id: "large_package",
      label: "Large Package",
      icon: Truck,
      color: "bg-indigo-500",
      lightColor: "bg-indigo-50",
      textColor: "text-indigo-700",
      borderColor: "border-indigo-200",
    },
    {
      id: "fragile",
      label: "Fragile Item",
      icon: AlertTriangle,
      color: "bg-rose-500",
      lightColor: "bg-rose-50",
      textColor: "text-rose-700",
      borderColor: "border-rose-200",
    },
    {
      id: "other",
      label: "Other",
      icon: MoreHorizontal,
      color: "bg-slate-500",
      lightColor: "bg-slate-50",
      textColor: "text-slate-700",
      borderColor: "border-slate-200",
    },
  ]

  useEffect(() => {
    const findid = async () => {
      const response = await FindId(session?.user?.email || "")
      if (response !== null) {
        setID(response)
      }
    }

    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/employees`, {
          method: "POST",
          body: JSON.stringify({ email: session?.user?.email }),
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data_res = await response.json()
          if (data_res) {
            const employeeNames = data_res.map((user: { user_id: string; firstname: string; lastname: string }) => ({
              id: user.user_id,
              firstname: user.firstname,
              lastname: user.lastname,
            }))
            setEmployees(employeeNames)
            console.log(employees)
          }
        }
      } catch (error) {
        console.error("Error fetching employees:", error)
      }
    }

    fetchEmployees()
    findid()
    const intervalId = setInterval(fetchEmployees, 3600000) // Fetch every hour
    return () => clearInterval(intervalId)
  }, [session])

  useEffect(() => {
    if (date) {
      setTask((prev) => ({
        ...prev,
        deadline: date.toISOString(),
      }))
    }
  }, [date])

  // Update task with current package items whenever packageItems changes
  useEffect(() => {
    setTask((prev) => ({
      ...prev,
      packageItems: packageItems,
    }))
  }, [packageItems])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const id = e.target.value
    const names = employees.find((employee) => employee.id === id)
    const { name, value } = e.target
    if (names !== undefined) {
      setEmployeeName(names?.firstname + " " + names?.lastname)
    }
    setTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }))
  }

  // const handleAddressSelect = (address: string) => {
  //   setTask((prev) => ({ ...prev, address }))
  // }

  const handleAddPackage = () => {
    // If it's "other" type but no custom type is specified, don't add
    if (newPackage.type === "other" && (!newPackage.customType || newPackage.customType.trim() === "")) {
      return
    }

    setPackageItems((prev) => [...prev, { ...newPackage }])
    setNewPackage({ type: "document", quantity: 1, customType: "" })
    setShowAddPackage(false)
  }

  const handleRemovePackage = (index: number) => {
    setPackageItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updatePackageQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 100) return

    setPackageItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity: newQuantity } : item)))
  }

  const getPackageTypeInfo = (typeId: string) => {
    return packageTypes.find((type) => type.id === typeId) || packageTypes[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuccess(false)
    task.employee_id = employeeName

    // Validate deadline
    if (!task.deadline) {
      alert("Please set a deadline for the task")
      return
    }

    // Ensure we have at least one package item
    if (packageItems.length === 0) {
      alert("Please add at least one package item")
      return
    }

    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      amount: 0,
      title: "",
      address: "",
      description: "",
      status: "",
      lat: 0,
      lon: 0,
      employee_id: "",
      deadline: "",
      assignedAt: "",
      createdAt: "",
      name: "",
      employeeName: "",
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: session?.user?.email,
        ...task,
        packageItems: packageItems,
        ...currentLocation,
      }),
    })

    if (response.ok) {
      setShowSuccess(true)
      const existingTasks = JSON.parse(localStorage.getItem("task") || "[]")
      localStorage.setItem("task", JSON.stringify([...existingTasks, newTask]))

      setTimeout(() => {
        router.push("/my-account/User/task")
      }, 2000)
    } else {
      console.error("Failed to add task")
    }
  }

  const handleEmployeeSelect = (employee: { id: string; name: string }) => {
    setSelectedMapEmployee(employee)
    // Set the employee in the form
    setTask((prev) => ({
      ...prev,
      employeeName: employee.id,
    }))
  }

  useEffect(() => {
    if (selectedMapEmployee) {
      const names = employees.find((employee) => employee.id === selectedMapEmployee.id)
      if (names !== undefined) {
        setEmployeeName(names?.firstname + " " + names?.lastname)
      }
    }
  }, [selectedMapEmployee, employees])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 mt-20 min-h-screen px-4 py-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative flex flex-col items-center mb-8"
      >
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full opacity-70" />
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
          Add New Task
        </h1>
        <div className="mt-2 flex items-center space-x-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-teal-300" />
          <span className="text-sm font-medium text-slate-500">Create a new delivery assignment</span>
          <div className="h-px w-8 bg-gradient-to-r from-teal-300 to-transparent" />
        </div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full opacity-70" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="max-w-3xl mx-auto overflow-hidden shadow-xl border-0 rounded-xl">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-6">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6" />
              New Delivery Task
              <span className="ml-auto text-sm font-normal bg-white/20 px-3 py-1 rounded-full">Interactive Form</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="address" className="text-base font-semibold text-slate-700 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-emerald-500" />
                    Delivery Location
                  </Label>
                  <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    Drag marker to set exact location
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border-2 border-emerald-100 shadow-lg">
                  <AzureMap
                    currentLocationProps={(currentCenter: { lat: number; lon: number }) =>
                      setCurrentLocation({ lat: currentCenter.lat, lon: currentCenter.lon })
                    }
                    employeeName={employees}
                    onAddressSelect={(address) => setTask((prev) => ({ ...prev, address }))}
                    Manager_id={ID}
                    onEmployeeSelect={handleEmployeeSelect}
                  />
                </div>
                {selectedMapEmployee && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center"
                  >
                    <Badge className="bg-emerald-100 text-emerald-700 mr-2">Selected from map</Badge>
                    <span className="text-sm text-emerald-700">
                      Employee {selectedMapEmployee.name} has been assigned
                    </span>
                  </motion.div>
                )}

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1">
                    <Label htmlFor="address" className="text-sm font-medium text-slate-600">
                      Delivery Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={task.address}
                      onChange={handleChange}
                      required
                      placeholder="Enter or select address from map"
                      className="w-full mt-1 border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-slate-500">Task Details</span>
                </div>
              </div>
              <div className="space-y-2 bg-gradient-to-br from-slate-50 to-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <Label htmlFor="employeeName" className="text-base font-semibold text-slate-700 flex items-center">
                  <User className="w-5 h-5 mr-2 text-emerald-500" />
                  Assign To Employee
                </Label>
                <select
                  id="employeeName"
                  name="employeeName"
                  value={task.employeeName}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                >
                  <option value="">Select an employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstname} {employee.lastname}
                    </option>
                  ))}
                </select>
                {task.employeeName && (
                  <div className="mt-2 text-sm text-emerald-600 flex items-center">
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Assigned</Badge>
                  </div>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 bg-gradient-to-br from-slate-50 to-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <Label htmlFor="title" className="text-base font-semibold text-slate-700 flex items-center">
                    <FileEdit className="w-5 h-5 mr-2 text-emerald-500" />
                    Task Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={task.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter a descriptive title"
                    className="w-full border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2 bg-gradient-to-br from-slate-50 to-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <Label htmlFor="amount" className="text-base font-semibold text-slate-700 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-emerald-500" />
                    Amount ($)
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    value={task.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2 bg-gradient-to-br from-slate-50 to-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <Label htmlFor="description" className="text-base font-semibold text-slate-700 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-emerald-500" />
                  Description
                </Label>
                <textarea
                  id="description"
                  name="description"
                  value={task.description}
                  onChange={handleChange}
                  required
                  placeholder="Provide detailed instructions for this delivery task"
                  className="w-full p-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  rows={3}
                />
              </div>
              <div className="space-y-2 bg-gradient-to-br from-slate-50 to-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <Label htmlFor="deadline" className="text-base font-semibold text-slate-700 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-teal-500" />
                  Deadline
                </Label>
                <div className="grid gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!date ? "text-muted-foreground" : ""}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Select deadline date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      id="deadlineTime"
                      name="deadlineTime"
                      className="w-full border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      onChange={(e) => {
                        if (date && e.target.value) {
                          const [hours, minutes] = e.target.value.split(":").map(Number)
                          const newDate = new Date(date)
                          newDate.setHours(hours, minutes)
                          setDate(newDate)
                        }
                      }}
                    />
                    <div className="text-sm text-muted-foreground">
                      {date && (
                        <div className="flex items-center gap-1">
                          <span className="inline-block px-2 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-medium">
                            {format(date, "h:mm a")}
                          </span>
                          <span className="text-slate-500">on</span>
                          <span className="inline-block px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
                            {format(date, "MMM d, yyyy")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 border rounded-xl p-5 bg-gradient-to-br from-white to-slate-50 shadow-md">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold text-slate-700 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-teal-500" />
                    Package Items
                  </Label>
                  <Button
                    type="button"
                    onClick={() => setShowAddPackage(true)}
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                    disabled={showAddPackage}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Package
                  </Button>
                </div>

                {packageItems.length > 0 ? (
                  <div className="space-y-3">
                    {packageItems.map((item, index) => {
                      const typeInfo = getPackageTypeInfo(item.type)
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-center justify-between p-3 rounded-lg border ${typeInfo.lightColor} ${typeInfo.borderColor}`}
                        >
                          <div className="flex items-center">
                            <div className={`p-2 rounded-full ${typeInfo.color} text-white mr-3`}>
                              <typeInfo.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className={`font-medium ${typeInfo.textColor}`}>
                                {item.type === "other" ? item.customType : typeInfo.label}
                              </p>
                              <Badge className={`${typeInfo.textColor} ${typeInfo.borderColor}`}>
                                {item.quantity} {item.quantity === 1 ? "item" : "items"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className={`h-8 w-8 rounded-full border-slate-200 hover:bg-${typeInfo.color.replace("bg-", "")} hover:text-white`}
                              onClick={() => updatePackageQuantity(index, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className={`h-8 w-8 rounded-full border-slate-200 hover:bg-${typeInfo.color.replace("bg-", "")} hover:text-white`}
                              onClick={() => updatePackageQuantity(index, item.quantity + 1)}
                              disabled={item.quantity >= 100}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemovePackage(index)}
                              className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 border border-dashed rounded-lg bg-slate-50">
                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No package items added yet.</p>
                    <p className="text-sm">Click &quot;Add Package&quot; to begin.</p>
                  </div>
                )}

                {showAddPackage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-slate-700">Add New Package</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowAddPackage(false)}
                        className="h-8 w-8 text-slate-500 hover:text-slate-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {packageTypes.map((type) => (
                          <div
                            key={type.id}
                            onClick={() => setNewPackage((prev) => ({ ...prev, type: type.id }))}
                            className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                              newPackage.type === type.id
                                ? `${type.lightColor} ${type.borderColor} shadow-sm`
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <type.icon
                              className={`w-6 h-6 mb-1 ${newPackage.type === type.id ? type.textColor : "text-slate-500"}`}
                            />
                            <span
                              className={`text-xs font-medium ${newPackage.type === type.id ? type.textColor : "text-slate-700"}`}
                            >
                              {type.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      {newPackage.type === "other" && (
                        <div className="space-y-1">
                          <Label htmlFor="customType" className="text-sm text-slate-700">
                            Specify Package Type
                          </Label>
                          <Input
                            id="customType"
                            value={newPackage.customType || ""}
                            onChange={(e) => setNewPackage((prev) => ({ ...prev, customType: e.target.value }))}
                            placeholder="Enter custom package type"
                            className="w-full border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                      )}

                      <div className="space-y-1">
                        <Label htmlFor="newQuantity" className="text-sm text-slate-700">
                          Quantity
                        </Label>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-r-none border-slate-200"
                            onClick={() =>
                              setNewPackage((prev) => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))
                            }
                            disabled={newPackage.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            id="newQuantity"
                            type="number"
                            value={newPackage.quantity}
                            onChange={(e) =>
                              setNewPackage((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 1 }))
                            }
                            min="1"
                            max="100"
                            className="w-16 text-center rounded-none border-x-0 h-9 border-slate-200"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-l-none border-slate-200"
                            onClick={() =>
                              setNewPackage((prev) => ({ ...prev, quantity: Math.min(100, prev.quantity + 1) }))
                            }
                            disabled={newPackage.quantity >= 100}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleAddPackage}
                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                        disabled={
                          newPackage.type === "other" && (!newPackage.customType || newPackage.customType.trim() === "")
                        }
                      >
                        Add to Task
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onMouseUp={() => router.prefetch("/")}
                  onClick={() => router.push("/")}
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 px-6"
                >
                  Cancel
                </Button>
                <Button
                  onMouseUp={() => router.prefetch("/my-account/User/task")}
                  type="submit"
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white px-8 shadow-lg shadow-emerald-200"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create Task
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
      {showSuccess && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <SuccessMessage message="Task added successfully" />
        </motion.div>
      )}
    </motion.div>
  )
}
