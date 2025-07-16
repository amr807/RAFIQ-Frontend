/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Task } from "@/app/types/task"
import { fetchEmployees } from "@/app/components/fetchfrom_BE/Fetch_employess"
import { fetchTasks } from "@/app/components/fetchfrom_BE/Fetch_tasks"
const AzureMap=dynamic(()=>
import ( "@/app/components/Employee"),{ssr:false})
export default function Location() {

const [tasks, setTasks] = useState<Task[]>([])
const [employees, setEmployees] = useState([])
const[manager_id,setManager_id]=useState<string>("")
const { data: session } = useSession();
const Email=session?.user?.email
useEffect(() => {
  const fetchTask = async () => {

    const response=await fetchTasks()
    
      if (response ==null) {
        throw new Error(`Failed to fetch tasks:`)
      }
      console.log(response.manager_id)
  
console.log(response)
setManager_id(response.manager_id)
      setTasks(response.task)
    } 
      // If fetching fails, try to load from localStorage as a fallback
    
    
const fetchEmployee = async () => {
const response= await fetchEmployees(Email)
if (response) {
  console.log("Fetched employees:", response)
setEmployees(response)
}
else {
  console.error("Failed to fetch employees")

}}
  fetchTask()
  fetchEmployee()

  return () => {
  }
},[Email])



const handleTaskClick = (task: any) => {
    console.log("Task clicked:", task)
  }

  const handleAddTask = (task: any) => {
    setTasks([...tasks, task])
  }

  return (
    <AzureMap
manager_id={manager_id}
employees={employees}
    tasks={tasks}
      onTaskClick={handleTaskClick}
      onAddTask={handleAddTask}
    />
  )
}