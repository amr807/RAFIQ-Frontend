/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Task {
    [x: string]: any
    amount: number
    id: string
    title: string
    address:string
    description: string
    status: string
    lat: number
    lon: number
    employee_id: string
    completedAt?: string
    deadline: string
    assignedAt: string
    createdAt: string
    rating?: number
    distance?: number
    fuelConsumption?: number
    estimatedTime?: string
    completed?: boolean
    name: string
    employeeName:string
}
  
  