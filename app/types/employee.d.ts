import { Task } from "./task"

export interface Employee {
  id: string
  name: string
  firstname: string
  lastname: string
  position: string
  statusTask: string
  lat: number
  lon: number
  lng?: number
  vehicle: string
  batteryLevel: number
  avatar:string
  battry: number
  status: "Busy" | "Available" | "Offline"
  phone: string
  phoneNumber: string
  email: string
  createdAt: string
  joinDate: string
  rating: number
  onTimeRate: number
  customerSatisfaction: number
  responseTime: number
  efficiency: number
  skills: string[]
  currentTasks: number
  lastActive: string
  lastSeen?: number
  stats: {
    tasksCompleted: number
    onTimeRate: number
    customerSatisfaction: number
    responseTime: number
    efficiency: number
  }
  address: string
  recentTasks: Task[]
  task_id?: string
  progress?: number
  speed?: number
  accuracy?: number
}