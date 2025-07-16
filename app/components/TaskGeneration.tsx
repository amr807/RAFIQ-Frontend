/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileSpreadsheet, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"

interface PackageItem {
  type: string
  quantity: number
}

interface Task {
  title: string
  description: string
  address: string
  createdAt: string
  deadline: string
  amount: string
  packageItems: PackageItem[]
  completed: boolean
  employeeName: string
  employee_id: string
  status: string
  image: string
  priority: string
  location: string
  lon: number
  lat: number
  estimatedTime: number
  id: string
}

// Sample tasks data (expanded from the provided sample)
const sampleTasks: Task[] = [
  {
    title: "k",
    description: "kkkkkkkkkk",
    address: "126, 15, 6th of October, Giza",
    createdAt: "2025-01-10T08:00:00.000Z",
    deadline: "2025-05-27T21:00:00.000Z",
    amount: "0222",
    packageItems: [{ type: "document", quantity: 1 }],
    completed: false,
    employeeName: "84222062-2dab-4731-a8e0-f81fad3609ff",
    employee_id: "User2037 Test8778",
    status: "Not Started",
    image: "",
    priority: "Low",
    location: "",
    lon: 0,
    lat: 0,
    estimatedTime: 0,
    id: "1748273273400",
  },
  {
    title: "Delivery Package A",
    description: "Urgent delivery to downtown office building",
    address: "45 Main Street, Cairo, Egypt",
    createdAt: "2025-01-08T10:30:00.000Z",
    deadline: "2025-01-15T17:00:00.000Z",
    amount: "150",
    packageItems: [
      { type: "envelope", quantity: 3 },
      { type: "box", quantity: 1 },
    ],
    completed: true,
    employeeName: "Ahmed Hassan",
    employee_id: "User1001 Ahmed123",
    status: "Completed",
    image: "delivery1.jpg",
    priority: "High",
    location: "Cairo Downtown",
    lon: 31.2357,
    lat: 30.0444,
    estimatedTime: 45,
    id: "1748273273401",
  },
  {
    title: "Medical Supply Transport",
    description: "Transport medical supplies to clinic",
    address: "78 Medical District, Alexandria",
    createdAt: "2025-01-09T14:15:00.000Z",
    deadline: "2025-01-20T12:00:00.000Z",
    amount: "300",
    packageItems: [
      { type: "medical_box", quantity: 2 },
      { type: "temperature_controlled", quantity: 1 },
    ],
    completed: false,
    employeeName: "Sara Mohamed",
    employee_id: "User2045 Sara567",
    status: "In Progress",
    image: "medical1.jpg",
    priority: "Critical",
    location: "Alexandria",
    lon: 29.9187,
    lat: 31.2001,
    estimatedTime: 90,
    id: "1748273273402",
  },
]

export default function TaskExcelGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateTaskSummary = (tasks: Task[]) => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.completed).length
    const pendingTasks = totalTasks - completedTasks

    const statusCounts = tasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const priorityCounts = tasks.reduce(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const totalAmount = tasks.reduce((sum, task) => sum + Number.parseFloat(task.amount || "0"), 0)
    const avgEstimatedTime = tasks.reduce((sum, task) => sum + task.estimatedTime, 0) / tasks.length

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      statusCounts,
      priorityCounts,
      totalAmount,
      avgEstimatedTime,
      completionRate: ((completedTasks / totalTasks) * 100).toFixed(2),
    }
  }

  const generateExcelReport = async () => {
    setIsGenerating(true)

    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new()

      // 1. Task Details Sheet
      const taskDetailsData = sampleTasks.map((task) => ({
        "Task ID": task.id,
        Title: task.title,
        Description: task.description,
        Address: task.address,
        "Created At": new Date(task.createdAt || Date.now()).toLocaleString(),
        Deadline: new Date(task.deadline).toLocaleString(),
        "Amount (Currency)": task.amount,
        "Employee Name": task.employeeName,
        "Employee ID": task.employee_id,
        Status: task.status,
        Priority: task.priority,
        Completed: task.completed ? "Yes" : "No",
        Location: task.location || "Not specified",
        Longitude: task.lon,
        Latitude: task.lat,
        "Estimated Time (min)": task.estimatedTime,
        "Package Items Count": task.packageItems.length,
        Image: task.image || "No image",
        "Days Until Deadline": Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      }))

      const taskDetailsSheet = XLSX.utils.json_to_sheet(taskDetailsData)
      XLSX.utils.book_append_sheet(workbook, taskDetailsSheet, "Task Details")

      // 2. Package Items Details Sheet
      const packageItemsData: any[] = []
      sampleTasks.forEach((task) => {
        task.packageItems.forEach((item) => {
          packageItemsData.push({
            "Task ID": task.id,
            "Task Title": task.title,
            "Package Type": item.type,
            Quantity: item.quantity,
            Employee: task.employeeName,
            Status: task.status,
            Priority: task.priority,
          })
        })
      })

      const packageItemsSheet = XLSX.utils.json_to_sheet(packageItemsData)
      XLSX.utils.book_append_sheet(workbook, packageItemsSheet, "Package Items")

      // 3. Summary & Analytics Sheet
      const summary = generateTaskSummary(sampleTasks)

      const summaryData = [
        ["TASK SUMMARY REPORT", ""],
        ["Generated On:", new Date().toLocaleString()],
        ["", ""],
        ["OVERVIEW", ""],
        ["Total Tasks", summary.totalTasks],
        ["Completed Tasks", summary.completedTasks],
        ["Pending Tasks", summary.pendingTasks],
        ["Completion Rate (%)", summary.completionRate],
        ["Total Amount", summary.totalAmount],
        ["Average Estimated Time (min)", summary.avgEstimatedTime.toFixed(2)],
        ["", ""],
        ["STATUS BREAKDOWN", ""],
        ...Object.entries(summary.statusCounts).map(([status, count]) => [status, count]),
        ["", ""],
        ["PRIORITY BREAKDOWN", ""],
        ...Object.entries(summary.priorityCounts).map(([priority, count]) => [priority, count]),
        ["", ""],
        ["EMPLOYEE PERFORMANCE", ""],
        ["Employee", "Tasks Assigned", "Completed", "Completion Rate"],
        ...Object.entries(
          sampleTasks.reduce(
            (acc, task) => {
              if (!acc[task.employeeName]) {
                acc[task.employeeName] = { total: 0, completed: 0 }
              }
              acc[task.employeeName].total++
              if (task.completed) acc[task.employeeName].completed++
              return acc
            },
            {} as Record<string, { total: number; completed: number }>,
          ),
        ).map(([employee, stats]) => [
          employee,
          stats.total,
          stats.completed,
          `${((stats.completed / stats.total) * 100).toFixed(1)}%`,
        ]),
      ]

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary & Analytics")

      // 4. Location Analysis Sheet
      const locationData = sampleTasks
        .filter((task) => task.location)
        .map((task) => ({
          "Task ID": task.id,
          Title: task.title,
          Location: task.location,
          Address: task.address,
          Longitude: task.lon,
          Latitude: task.lat,
          Status: task.status,
          Priority: task.priority,
          "Estimated Time": task.estimatedTime,
        }))

      const locationSheet = XLSX.utils.json_to_sheet(locationData)
      XLSX.utils.book_append_sheet(workbook, locationSheet, "Location Analysis")

      // 5. Timeline Analysis Sheet
      const timelineData = sampleTasks.map((task) => {
        const created = new Date(task.createdAt || Date.now())
        const deadline = new Date(task.deadline)
        const daysToComplete = Math.ceil((deadline.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        const daysRemaining = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

        return {
          "Task ID": task.id,
          Title: task.title,
          "Created Date": created.toLocaleDateString(),
          "Deadline Date": deadline.toLocaleDateString(),
          "Days to Complete": daysToComplete,
          "Days Remaining": daysRemaining,
          Status: task.status,
          "Is Overdue": daysRemaining < 0 ? "Yes" : "No",
          Priority: task.priority,
        }
      })

      const timelineSheet = XLSX.utils.json_to_sheet(timelineData)
      XLSX.utils.book_append_sheet(workbook, timelineSheet, "Timeline Analysis")

      // Generate and download the file
      const fileName = `Task_Detailed_Report_${new Date().toISOString().split("T")[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)
    } catch (error) {
      console.error("Error generating Excel report:", error)
    } finally {
      setIsGenerating(false)
    }
  }


  return (
      
        
        

          <Button onClick={generateExcelReport} disabled={isGenerating} size="lg" className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Task Report
              </>
            )}
          </Button>

        
        
 
  )
}
