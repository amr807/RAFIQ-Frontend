/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import * as atlas from "azure-maps-control"
import { ZoomIn, ZoomOut, Search, Navigation } from "lucide-react"
import "azure-maps-control/dist/atlas.min.css"
import * as atlasRest from "azure-maps-rest"
import { FiMapPin } from "react-icons/fi"
import type { Task } from "../types/task"
import { socket } from "./../../socket"
// Add this import at the top with the other imports
import { TaskDetailsPanel } from "./util/task-detail"
import { BiCurrentLocation } from "react-icons/bi"
import { TbCurrentLocation } from "react-icons/tb"
import { EmployeePanel } from "./Employee_pannel"
import { Employee } from "../types/employee"

interface AzureMapProps {
  manager_id: string

  employees: any[]
  tasks: Task[]
  onTaskClick: (task: Task) => void // Callback when a task is clicked
  onAddTask: (task: Task) => void // Callback to add a new task
}


interface EmployeeLocation {
  [key: string]: {
    id: string;
    lat: number;
    lng: number;
    lon: number;
    speed: number;
    accuracy: number;
    task_id: string;
    battry: number;
    lastSeen: number;
  }
}

interface MapEvent {
  shapes: Array<{
    getProperties: () => {
      employee?: Employee
      task?: Task
    }
  }>
}

interface RoutePoint {
  longitude: number
  latitude: number
}

interface SearchSuggestion {
  position: {
    lat: number
    lon: number
  }
  address: {
    freeformAddress: string
  }
}

const NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY =process.env.NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY  
interface CurrentPosition {
  latitude: number
  longitude: number
}
export default function AzureMap({ tasks, onTaskClick, manager_id, employees }: AzureMapProps) {
  console.log("AzureMap component rendering with tasks:", tasks)
const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<atlas.Map | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [routeLine, setRouteLine] = useState<atlas.data.LineString | null>(null)
  const dataSourceRef = useRef<atlas.source.DataSource | null>(null)
  const searchDataSourceRef = useRef<atlas.source.DataSource | null>(null)
  const routeDataSourceRef = useRef<atlas.source.DataSource | null>(null)
  const employeeRouteDataSourceRef = useRef<atlas.source.DataSource | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [isAtUserLocation, setIsAtUserLocation] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false)
  const [myPosition, setMyPosition] = useState<CurrentPosition>({ latitude: 0, longitude: 0 })
  const popupRef = useRef<atlas.Popup | null>(null)
  const [hasReceivedData, setHasReceivedData] = useState(false)
  const [showTaskPanel, setShowTaskPanel] = useState<boolean>(false)
  const [offline, setOffline] = useState<boolean>(true)
  const [estimatedTime, setEstimatedTime] = useState<string>("")
  const [estimatedDistance, setEstimatedDistance] = useState<string>("")
  const [assignedEmployee, setAssignedEmployee] = useState<Employee | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showEmployeePanel, setShowEmployeePanel] = useState(false)
  const [activeRoutes, setActiveRoutes] = useState<{ [key: string]: atlas.data.LineString }>({})
  const [employeeRoutes, setEmployeeRoutes] = useState<{ [key: string]: atlas.data.LineString }>({})
  const [showStats, setShowStats] = useState(false);
  const [selectedEmployeeStats, setSelectedEmployeeStats] = useState<Employee | null>(null);
  const [showTaskList, setShowTaskList] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  console.log(socket.connected)
  const fetchdata = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/employeedblive-track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manager_id: manager_id }),
      })

      const data = await response.json()
      if (response.status === 201 && map) {
        let employeeSource = map.sources.getById("employee-source")
        
        if (!employeeSource) {
          employeeSource = new atlas.source.DataSource("employee-source")
          setOffline(true)
          map.sources.add(employeeSource)
        } else {
          (employeeSource as atlas.source.DataSource).clear()
        }

        // Add employee icon to the map's image sprite if not already added
        if (!map.imageSprite.hasImage("employee-icon")) {
          map.imageSprite
            .add("employee-icon", "../../motorcycle-svgrepo-com (2).svg")
            .then(() => {
              console.log("Employee icon added successfully!")
              addEmployeeMarkers(data, employeeSource as atlas.source.DataSource, map)
            })
            .catch((error) => {
              console.error("Error adding employee icon:", error)
              map.imageSprite.add("employee-icon", "pin-blue").then(() => {
                addEmployeeMarkers(data, employeeSource as atlas.source.DataSource, map)
              })
            })
        } else {
          addEmployeeMarkers(data, employeeSource as atlas.source.DataSource, map)
        }

        // Process employee routes
        Object.entries(data).forEach(([employeeId, employeeData]) => {
          const empData = employeeData as { task_id?: string }
          const inProgressTasks = tasks.find(
            (task) => task.id === empData.task_id
          )

          if (inProgressTasks) {
            calculateEmployeeRoute(
              [Number((employeeData as any).lng || (employeeData as any).lon), (employeeData as any).lat],
              [inProgressTasks.lon, inProgressTasks.lat],
              (employeeData as any).speed || 0,
              (employeeData as any).accuracy || 0,
              employeeId
            )
          } else {
            // Remove route if no in-progress tasks
            const shapes = employeeRouteDataSourceRef.current?.getShapes() || []
            shapes.forEach((shape) => {
              const props = shape.getProperties()
              if (props.employeeId === employeeId) {
                employeeRouteDataSourceRef.current?.remove(shape)
              }
            })
            setEmployeeRoutes(prev => {
              const newRoutes = { ...prev }
              delete newRoutes[employeeId]
              return newRoutes
            })
          }
        })
      } else {
        console.log("error fetching employees")
      }
    } catch (error) {
      console.error("Fetch error:", error)
    }
  }
    const getAddressFromCoords = async (latitude: number, longitude: number): Promise<string> => {
      const url = `https://atlas.microsoft.com/search/address/reverse/json?api-version=1.0&subscription-key=${NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY}&query=${latitude},${longitude}`;
    
      try {
        const response = await fetch(url, { method: "GET" });
        const data = await response.json();
        if (response.ok) {
          const address = data.addresses?.[0]?.address;
          if (address) {
            return `${address.streetNumber || ''} ${address.streetName || ''}, ${address.municipality || ''}, ${address.countrySubdivision || ''}, ${address.country || ''}`;
          }
        }
        return 'No address found';
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
        return 'Error retrieving address';
      }
    };
  const addEmployeeMarkers = (data: EmployeeLocation, source: atlas.source.DataSource, map: atlas.Map) => {
    const keys = Object.keys(data)
    if (keys.length > 0) {
      const firstEmployee = data[keys[0]]
      const employee = employees.find(emp => emp.user_id === firstEmployee.id)
      if (employee) {
        setAssignedEmployee({
          ...employee,
          lat: firstEmployee.lat,
          lon: firstEmployee.lon || firstEmployee.lng,
          batteryLevel: firstEmployee.battry,
          status: Date.now() - firstEmployee.lastSeen > 30000 ? "Offline" : "Available"
        })
      }
    }

    // Add employee markers
    keys.forEach((key) => {
      const employeeData = data[key]
      console.log("Processing employee:", employeeData)

      const longitude = employeeData.lon || employeeData.lng
      if (employeeData && typeof longitude === "number" && typeof employeeData.lat === "number") {
        const point = new atlas.data.Point([longitude, employeeData.lat])
        source.add(
          new atlas.data.Feature(point, {
            employee: {
              ...employeeData,
              lon: longitude,
              lat: employeeData.lat,
              batteryLevel: employeeData.battry
            },
            type: "employee",
          }),
        )
      } else {
        console.error("Invalid employee location data:", employeeData)
      }
    })

    // Remove existing employee layer if it exists
    if (map.layers.getLayerById("employee-layer")) {
      map.layers.remove("employee-layer")
    }

    // Add a new symbol layer for employees
    const employeeLayer = new atlas.layer.SymbolLayer(source, "employee-layer", {
      iconOptions: {
        image: "employee-icon",
        anchor: "bottom",
        allowOverlap: true,
        size: 1.2,
      },
    })

    map.layers.add(employeeLayer)

    // Add click event to employee markers
    map.events.add("click", employeeLayer, async (e: atlas.MapMouseEvent) => {
      if (e.shapes && e.shapes.length > 0) {
        const shape = e.shapes[0] as atlas.Shape
        const properties = shape.getProperties()
        if (properties.employee) {
          const employeeData = properties.employee
          const task = tasks
            .map((task) => (task.employee_id === employeeData.id ? task : undefined))
            .filter((t) => t !== undefined)
          console.log("Clicked on employee:", employeeData)
          const employee = employees.find((emp) => emp.user_id === employeeData.id)
          if (employee) {
            const clickedEmployee: Employee = {
              id: employee.user_id,
              name: `${employee.firstname} ${employee.lastname}`,
              firstname: employee.firstname,
              lastname: employee.lastname,
              position: employee.position,
              address: String(await getAddressFromCoords(employeeData.lat, employeeData.lon)),
              lat: employeeData.lat,
              lon: employeeData.lon,
              vehicle: employee.vehicle,
              batteryLevel: employeeData.battry,
              battry: employeeData.battry,
              statusTask: task.find((t) => t.status == "In Progress" || t.status == "Almost Done") ? "Busy" : "Available",
              status: Date.now() - employeeData.lastSeen > 30000 ? "Offline" : task.find((t) => t.status == "In Progress" || t.status == "Almost Done") ? "Busy" : "Available",
              phone: employee.phone,
              phoneNumber: employee.phone,
              email: employee.email,
              createdAt: employee.createdAt,
              joinDate: employee.createdAt,
              rating: employee.rating,
              onTimeRate: employee.onTimeRate,
              customerSatisfaction: employee.customerSatisfaction,
              responseTime: employee.responseTime,
              efficiency: employee.efficiency,
              skills: employee.skills,
              currentTasks: task.length,
              lastActive: employeeData.lastSeen,
              stats: {
                tasksCompleted: 0,
                onTimeRate: employee.onTimeRate,
                customerSatisfaction: employee.customerSatisfaction,
                responseTime: employee.responseTime,
                efficiency: employee.efficiency,
              },
              recentTasks: task,
              avatar: ""
            }
            console.log("Employee clicked:", clickedEmployee)
            setSelectedEmployee(clickedEmployee)
            setShowEmployeePanel(true)
            if (popupRef.current) {
              const lon = Number.parseFloat(String(employeeData.lon))
              const lat = Number.parseFloat(String(employeeData.lat))
              if (!isNaN(lon) && !isNaN(lat)) {
                popupRef.current.setOptions({
                  position: [employeeData.lon, employeeData.lat],
                  content: `
    <div class="p-4 bg-white rounded-lg shadow-md">
      <h3 class="font-bold">${clickedEmployee.name}</h3>
      <p class="text-sm">${clickedEmployee.position}</p>
      <p class="text-sm text-teal-600 cursor-pointer" id="view-details-link">
        View full details
      </p>
    </div>
  `,
                })

                popupRef.current.open(map)

                setTimeout(() => {
                  const viewDetailsLink = document.getElementById("view-details-link")
                  if (viewDetailsLink) {
                    viewDetailsLink.onclick = () => {
                      setSelectedEmployee(clickedEmployee)
                      setShowEmployeePanel(true)
                    }
                  }
                }, 100)
              }
            }
          }
        }
      }
    })
  }

  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new atlas.Map(mapRef.current, {
        authOptions: {
          authType: atlas.AuthenticationType.subscriptionKey,
          subscriptionKey: NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY,
        },
        center: [31.584641, 30.662537],
        zoom: 12,
        style: "road",
      })

      newMap.events.add("ready", () => {
        console.log("Map is ready!")
        setMap(newMap)

        const taskDataSource = new atlas.source.DataSource()
        newMap.sources.add(taskDataSource)
        dataSourceRef.current = taskDataSource

        // Data source for search marker
        const searchDataSource = new atlas.source.DataSource()
        newMap.sources.add(searchDataSource)
        searchDataSourceRef.current = searchDataSource

        // Data source for route line
        const routeDataSource = new atlas.source.DataSource()
        newMap.sources.add(routeDataSource)
        routeDataSourceRef.current = routeDataSource

        // Initialize employee route data source
        const employeeRouteDataSource = new atlas.source.DataSource()
        newMap.sources.add(employeeRouteDataSource)
        employeeRouteDataSourceRef.current = employeeRouteDataSource

        // Add a line layer for user/task routes (Blue)
        const userRouteLayer = new atlas.layer.LineLayer(routeDataSource, "user-route-layer", {
          strokeColor: "#2563eb", // Bright blue
          strokeWidth: 6,
          lineJoin: "round",
          lineCap: "round",
          strokeOpacity: 0.8,
          filter: ["==", ["get", "routeType"], "user-path"],
        })
        newMap.layers.add(userRouteLayer)

        // Add a line layer for employee routes (Orange)
        const employeeRouteLayer = new atlas.layer.LineLayer(employeeRouteDataSource, "employee-route-layer", {
          strokeColor: "#FF4500", // Orange
          strokeWidth: 4,
          lineJoin: "round",
          lineCap: "round",
          strokeOpacity: 0.8,
          filter: ["==", ["get", "routeType"], "employee-path"],
        })
        newMap.layers.add(employeeRouteLayer)

        // Add a symbol layer for task markers
        const taskSymbolLayer = new atlas.layer.SymbolLayer(taskDataSource)
        newMap.layers.add(taskSymbolLayer)

        // Add a symbol layer for the search marker
        const searchSymbolLayer = new atlas.layer.SymbolLayer(searchDataSource, "search-layer", {
          iconOptions: {
            image: "marker-red", // Red marker for search results
            anchor: "bottom",
            allowOverlap: true,
          },
        })
        newMap.layers.add(searchSymbolLayer)

        // Create a popup for task details (click)
        const clickPopup = new atlas.Popup({
          closeButton: true, // Enable the close button
          pixelOffset: [0, -18], // Offset to position the popup above the marker
        })
        popupRef.current = clickPopup

        // Add click event to task markers
        newMap.events.add("click", taskSymbolLayer, (e: atlas.MapMouseEvent) => {
          if (e.shapes && e.shapes.length > 0) {
            const shape = e.shapes[0] as atlas.Shape
            const properties = shape.getProperties()
            if (properties.task) {
              const task = properties.task
              setSelectedTask(task)
              onTaskClick(task)

              // Display the task popup
              displayTaskPopup(task, clickPopup, newMap)
            }
          }
        })
      }) 
    }
  }, [map, onTaskClick])
  const calculateEmployeeRoute = async (
    startPoint: [number, number],
    endPoint: [number, number],
    speed: number,
    accuracy: number,
    employeeId: string,
  ) => {
    if (!map || !employeeRouteDataSourceRef.current) {
      console.error("Map or employee route data source not initialized")
      return
    }

    try {
      console.log("Calculating employee route for employee:", employeeId)
      console.log("Route from:", startPoint, "to:", endPoint)

      const routeURL = `https://atlas.microsoft.com/route/directions/json?subscription-key=${NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY}&api-version=1.0&query=${startPoint[1]},${startPoint[0]}:${endPoint[1]},${endPoint[0]}&travelMode=car&traffic=true&routeType=fastest&avoid=unpavedRoads&computeBestOrder=true`

      const response = await fetch(routeURL)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      if (data.routes && data.routes.length > 0) {
        const points = data.routes[0].legs[0].points.map((point: RoutePoint) => [point.longitude, point.latitude])
        const line = new atlas.data.LineString(points)

        // Clear existing route for this employee if it exists
        const shapes = employeeRouteDataSourceRef.current.getShapes()
        shapes.forEach((shape) => {
          const props = shape.getProperties()
          if (props.employeeId === employeeId) {
            employeeRouteDataSourceRef.current?.remove(shape)
          }
        })

        // Add the new route
        const routeFeature = new atlas.data.Feature(line, {
          routeType: "employee-path", // Changed back to "employee-path"
          employeeId: employeeId,
          speed: speed,
          accuracy: accuracy,
        })
        employeeRouteDataSourceRef.current.add(routeFeature)

        // Update the employee routes state
        setEmployeeRoutes(prev => ({
          ...prev,
          [employeeId]: line
        }))

        console.log("Employee route updated successfully for employee:", employeeId)
      }
    } catch (error) {
      console.error("Error calculating employee route:", error)
    }
  }


  // Modify the displayTaskPopup function to find a nearby employee
  const displayTaskPopup = useCallback(
    (task: Task, popup: atlas.Popup, mapInstance: atlas.Map) => {
      // Set the selected task and show the panel
      setSelectedTask(task)

      // Find the closest employee to this task (if any employees exist)
      // findNearestEmployee(task)

      // Show the panel
      setShowTaskPanel(true)

      // Center the map on the task location with animation
      mapInstance.setCamera({
        center: [task.lon, task.lat],
        zoom: 14,
        type: "ease",
        duration: 1000,
      })
    },
    [userLocation],
  )

  // const findNearestEmployee = (task: Task) => {
  //   if (map && map.sources.getById("employee-layer")) {
  //     const employeeSource = map.sources.getById("employee-layer") as atlas.source.DataSource
  //     const employees = employeeSource.getShapes()

  //     if (employees && employees.length > 0) {
  //       let closestEmployee = null
  //       let shortestDistance = Number.POSITIVE_INFINITY

  //       // Find the closest employee
  //       employees.forEach((shape) => {
  //         console.log("Processing employee shape:", shape)
  //         const properties = shape.getProperties()
  //         if (properties && properties.employee) {
  //           const employee = properties.employee
  //           const distance = atlas.math.getDistanceTo([task.lon, task.lat], [employee.lon, employee.lat], "kilometers")

  //           if (distance < shortestDistance) {
  //             shortestDistance = distance
  //             closestEmployee = employee
  //           }
  //         }
  //       })

  //       if (closestEmployee) {
  //         // Add a status based on distance
  //         let status = "Available"
  //         if (shortestDistance < 1) {
  //           status = "Nearby"
  //         } else if (shortestDistance < 5) {
  //           status = "En Route"
  //         } else {
  //           status = `${shortestDistance.toFixed(1)} km away`
  //         }

  //         setAssignedEmployee({
  //           ...closestEmployee,
  //           status,
  //         })
  //       } else {
  //         setAssignedEmployee(null)
  //       }
  //     } else {
  //       setAssignedEmployee(null)
  //     }
  //   } else {
  //     setAssignedEmployee(null)
  //   }
  // }

  // Handle directions button click in the task panel
  const handleDirectionsClick = useCallback(
    (task: Task) => {
      if (!userLocation) {
        // If no user location, request it first
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords
              const newUserLocation: [number, number] = [longitude, latitude]
              setUserLocation(newUserLocation)

              // Now calculate the route with the new location
              calculateRoute(newUserLocation, [task.lon, task.lat])
            },
            (error) => {
              console.error("Error getting location:", error)
              alert("Unable to get your current location. Please check your browser permissions.")
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
            },
          )
        } else {
          alert("Geolocation is not supported by your browser.")
        }
      } else {
        // If we already have user location, calculate route
        calculateRoute(userLocation, [task.lon, task.lat])
      }
    },
    [userLocation],
  )

  // Display user location on map
  const displayUserLocation = useCallback((mapInstance: atlas.Map, longitude: number, latitude: number) => {
    // First, remove any existing user location layer
    if (mapInstance.layers.getLayerById("user-location-layer")) {
      mapInstance.layers.remove("user-location-layer")
    }

    // Create a separate data source for user location if it doesn't exist
    let userLocationSource = mapInstance.sources.getById("user-location-source") as atlas.source.DataSource

    if (!userLocationSource) {
      userLocationSource = new atlas.source.DataSource("user-location-source")
      mapInstance.sources.add(userLocationSource)
    } else {
      // Clear the existing data in the source
      userLocationSource.clear()
    }

    // Add the new user location point
    const point = new atlas.data.Point([longitude, latitude])
    userLocationSource.add(new atlas.data.Feature(point, { type: "user-location" }))

    // Add a new bubble layer for the user location
    mapInstance.layers.add(
      new atlas.layer.BubbleLayer(userLocationSource, "user-location-layer", {
        radius: 10, // Size of the circle

        color: "#007AFF", // Blue color
        strokeColor: "#FFFFFF", // White border
        strokeWidth: 2, // Border width
        filter: ["==", ["get", "type"], "user-location"], // Filter for user location features
      }),
    )
  }, [])

  useEffect(() => {
    if (socket.connected && map) {
      console.log("Setting up socket listener for", `location_update:${manager_id}`)
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        if (!hasReceivedData) {
          fetchdata()
          setOffline(true)
          console.log("offline")
        }
      }, 300)

      const handleLocationUpdate = (data: EmployeeLocation) => {
        console.log("Received employee locations:", data)
        setOffline(false)       
        setHasReceivedData(true)
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        let employeeSource = map.sources.getById("employee-source")
        
        if (!employeeSource) {
          employeeSource = new atlas.source.DataSource("employee-source")
          map.sources.add(employeeSource)
        } else {
          (employeeSource as atlas.source.DataSource).clear()
        }

        if (!map.imageSprite.hasImage("employee-icon")) {
          map.imageSprite
            .add("employee-icon", "../../motorcycle-svgrepo-com (2).svg")
            .then(() => {
              addEmployeeMarkers(data, employeeSource as atlas.source.DataSource, map)
            })
            .catch((error) => {
              console.error("Error adding employee icon:", error)
              map.imageSprite.add("employee-icon", "pin-blue").then(() => {
                addEmployeeMarkers(data, employeeSource as atlas.source.DataSource, map)
              })
            })
        } else {
          addEmployeeMarkers(data, employeeSource as atlas.source.DataSource, map)
        }

        // Process employee routes
        Object.entries(data).forEach(([employeeId, employeeData]) => {
          const inProgressTasks = tasks.find(
            (task) => task.id === employeeData.task_id
          )

          if (inProgressTasks) {
            calculateEmployeeRoute(
              [Number(employeeData.lng || employeeData.lon), employeeData.lat],
              [inProgressTasks.lon, inProgressTasks.lat],
              employeeData.speed || 0,
              employeeData.accuracy || 0,
              employeeId
            )
          } else {
            // Remove route if no in-progress tasks
            const shapes = employeeRouteDataSourceRef.current?.getShapes() || []
            shapes.forEach((shape) => {
              const props = shape.getProperties()
              if (props.employeeId === employeeId) {
                employeeRouteDataSourceRef.current?.remove(shape)
              }
            })
            setEmployeeRoutes(prev => {
              const newRoutes = { ...prev }
              delete newRoutes[employeeId]
              return newRoutes
            })
          }
        })
      }
console.log(manager_id)
      socket.on(`location_update_${manager_id}`, handleLocationUpdate)

      return () => {
        socket.off(`location_update_${manager_id}`, handleLocationUpdate)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    }
  }, [map, manager_id, socket.connected, tasks])

  useEffect(() => {
    if (map && dataSourceRef.current) {
      const dataSource = dataSourceRef.current
      dataSource.clear()

      // Add custom icon to the map's image sprite
      map.imageSprite
        .add("task-icon", "../../location-svgrepo-com (2).svg")
        .then(() => {
          console.log("Task icon added to image sprite!")
          // Add task markers after icon is loaded
          if (tasks && tasks.length > 0) {
            console.log("Adding tasks to map:", tasks)
            tasks.forEach((task) => {
              const point = new atlas.data.Point([task.lon, task.lat])
              dataSource.add(new atlas.data.Feature(point, { task, type: "task" }))
            })
          } else {
            console.warn("No tasks available to display")
          }
        })
        .catch((error) => {
          console.error("Error adding task icon:", error)
          // Use a default marker if custom icon fails
          map.imageSprite.add("task-icon", "pin-red").then(() => {
            if (tasks && tasks.length > 0) {
              console.log("Adding tasks with default icon:", tasks)
              tasks.forEach((task) => {
                const point = new atlas.data.Point([task.lon, task.lat])
                dataSource.add(new atlas.data.Feature(point, { task, type: "task" }))
              })
            } else {
              console.warn("No tasks available to display")
            }
          })
        })

      // Add a symbol layer for task markers with the custom icon
      map.layers.add(
        new atlas.layer.SymbolLayer(dataSource, "tasks-icon", {
          iconOptions: {
            image: "task-icon", // Use the custom icon
            anchor: "bottom", // Anchor the icon at the bottom
            allowOverlap: true, // Allow markers to overlap
          },
          filter: ["==", ["get", "type"], "task"], // Filter to show only task markers
        }),
      ) 
      // Add a symbol layer for task markers with the custom icon
    }
  }, [map, tasks]) // Removed userLocation dependency
  // Removed userLocation dependency

  useEffect(() => {
    if (map && dataSourceRef.current) {
      const dataSource = dataSourceRef.current

      // Only clear if we have new tasks to add
      if (tasks && tasks.length > 0) {
        dataSource.clear()

        console.log("Adding tasks in second useEffect:", tasks)
        tasks.forEach((task) => {
          if (task && typeof task.lon === "number" && typeof task.lat === "number") {
            const point = new atlas.data.Point([task.lon, task.lat])
            dataSource.add(new atlas.data.Feature(point, { task }))
          } else {
            console.error("Invalid task coordinates:", task)
          }
        })
      }

      // Check if the layer already exists
      if (!map.layers.getLayerById("tasks")) {
        const taskSymbolLayer = new atlas.layer.SymbolLayer(dataSource, "tasks", {
          iconOptions: {
            image: "task-icon", // Use a custom icon for tasks
            anchor: "bottom",
            allowOverlap: true,
            size: 1.2, // Make slightly larger than default
          },
        })
        map.layers.add(taskSymbolLayer)

        // Set up event handlers for the layer
        setupTaskEventHandlers(map, taskSymbolLayer)
      }
    }
  }, [map, tasks, displayTaskPopup])

  // Add this helper function to set up event handlers
  const setupTaskEventHandlers = (map: atlas.Map, taskSymbolLayer: atlas.layer.SymbolLayer) => {
    const hoverPopup = new atlas.Popup({
      closeButton: false,
      pixelOffset: [0, -18],
    });

    map.events.add("mouseover", taskSymbolLayer, (e: atlas.MapMouseEvent) => {
      if (e.shapes && e.shapes.length > 0) {
        const shape = e.shapes[0] as atlas.Shape;
        const properties = shape.getProperties();
        if (properties.task) {
          const task = properties.task;
          hoverPopup.setOptions({
            position: [task.lon, task.lat],
            content: `
              <div class="p-2 bg-white rounded-lg shadow-md">
                <h3 class="font-bold text-sm">${task.title}</h3>
              </div>
            `,
          });
          hoverPopup.open(map);
        }
      }
    });

    map.events.add("mouseout", taskSymbolLayer, () => {
      hoverPopup.close();
    });

    map.events.add("click", taskSymbolLayer, (e: atlas.MapMouseEvent) => {
      if (e.shapes && e.shapes.length > 0) {
        const shape = e.shapes[0]  as atlas.Shape;
        const properties = shape.getProperties();
        if (properties.task) {
          const task = properties.task;
          setSelectedTask(task);
          if (popupRef.current) {
            displayTaskPopup(task, popupRef.current, map);
          }
        }
      }
    });
  };

  // Fetch suggestions from Azure Maps Fuzzy Search API
  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([])
      return
    }

    const pipeline = atlasRest.MapsURL.newPipeline(
      new atlasRest.SubscriptionKeyCredential(NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY as string),
    )
    const searchURL = new atlasRest.SearchURL(pipeline)

    try {
      const response = await searchURL.searchFuzzy(atlasRest.Aborter.timeout(10000), query, {
        limit: 5,
      })
      const validResults =
        response.results
          ?.filter(
            (result) =>
              result.position?.lat !== undefined &&
              result.position?.lon !== undefined &&
              result.address?.freeformAddress !== undefined,
          )
          .map((result) => ({
            position: {
              lat: result.position!.lat as number,
              lon: result.position!.lon as number,
            },
            address: {
              freeformAddress: result.address!.freeformAddress as string,
            },
          })) || []
      setSuggestions(validResults)
      setShowSuggestions(true)
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    fetchSuggestions(query)
  }

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.position) {
      const { lat, lon } = suggestion.position
      const coordinates: [number, number] = [lon, lat]

      // Clear previous search marker
      searchDataSourceRef.current?.clear()

      // Add a new search marker
      const point = new atlas.data.Point(coordinates)
      searchDataSourceRef.current?.add(new atlas.data.Feature(point, { address: suggestion.address }))

      // Set the map camera to the selected location
      if (map) {
        map.setCamera({
          center: coordinates,
          zoom: 15,
        })
      }

      // Update the search query with the selected suggestion
      setSearchQuery(suggestion.address.freeformAddress)
      setShowSuggestions(false)
    }
  }

  // Calculate and draw route between user location and selected task
  const calculateRoute = async (startPoint: [number, number], endPoint: [number, number]) => {
    if (!map || !routeDataSourceRef.current) {
      console.error("Map or route data source not initialized")
      return Promise.reject(new Error("Map or route data source not initialized"))
    }

    try {
      setIsCalculatingRoute(true)
      console.log("Fetching route from:", startPoint, "to:", endPoint)

      const routeURL = `https://atlas.microsoft.com/route/directions/json?subscription-key=${NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY}&api-version=1.0&query=${startPoint[1]},${startPoint[0]}:${endPoint[1]},${endPoint[0]}&travelMode=car&traffic=true&routeType=fastest&avoid=unpavedRoads&computeBestOrder=true`

      const response = await fetch(routeURL)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("Route API response:", data)

      if (data.routes && data.routes.length > 0) {
        const points = data.routes[0].legs[0].points.map((point: RoutePoint) => [point.longitude, point.latitude])
        console.log("Route points:", points)

        const line = new atlas.data.LineString(points)
        setRouteLine(line)
        routeDataSourceRef.current.clear()

        const routeFeature = new atlas.data.Feature(line, {
          routeType: "user-path",
        })
        routeDataSourceRef.current.add(routeFeature)

        // Remove existing route layer if it exists
        if (map.layers.getLayerById("user-route-layer")) {
          map.layers.remove("user-route-layer")
        }

        // Add a new line layer with blue color for user/task routes
        const routeLineLayer = new atlas.layer.LineLayer(routeDataSourceRef.current, "user-route-layer", {
          strokeColor: "#2563eb", // Bright blue color for user/task routes
          strokeWidth: 6,
          lineJoin: "round",
          lineCap: "round",
          strokeOpacity: 0.8,
          filter: ["==", ["get", "routeType"], "user-path"],
        })
        map.layers.add(routeLineLayer)

        // Calculate and display route information
        if (data.routes[0].summary) {
          const { travelTimeInSeconds, lengthInMeters } = data.routes[0].summary

          // Format time (convert seconds to minutes/hours)
          let timeString = ""
          if (travelTimeInSeconds < 60) {
            timeString = `${Math.round(travelTimeInSeconds)} seconds`
          } else if (travelTimeInSeconds < 3600) {
            timeString = `${Math.round(travelTimeInSeconds / 60)} minutes`
          } else {
            const hours = Math.floor(travelTimeInSeconds / 3600)
            const minutes = Math.round((travelTimeInSeconds % 3600) / 60)
            timeString = `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${minutes > 1 ? "s" : ""}`
          }

          // Format distance (convert meters to km or miles)
          const distanceString =
            lengthInMeters < 1000 ? `${Math.round(lengthInMeters)} meters` : `${(lengthInMeters / 1000).toFixed(1)} km`

          // Set the estimated time and distance
          setEstimatedTime(timeString)
          setEstimatedDistance(distanceString)
        }

        // Adjust the map camera to show the entire route
        const bounds = atlas.data.BoundingBox.fromData(line)
        map.setCamera({
          bounds: bounds,
          padding: 100,
          type: "ease",
          duration: 1000,
        })

        console.log("Route drawn successfully")
        return Promise.resolve()
      } else {
        console.error("No routes found in response")
        throw new Error("No route found")
      }
    } catch (error) {
      console.error("Error calculating route:", error)
      return Promise.reject(error)
    } finally {
      setIsCalculatingRoute(false)
    }
  }
  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      console.log("Reverse geocoding coordinates:", { latitude, longitude })

      // Create a URL to the Azure Maps Reverse Geocoding API
      const geocodeURL = `https://atlas.microsoft.com/search/address/reverse/json?subscription-key=${NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY}&api-version=1.0&query=${latitude},${longitude}&language=en-US`

      const response = await fetch(geocodeURL)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Reverse geocode response:", data)

      if (data.addresses && data.addresses.length > 0) {
        const address = data.addresses[0].address

        // Format the address based on available fields
        let formattedAddress = ""

        if (address.freeformAddress) {
          formattedAddress = address.freeformAddress
        } else {
          // Build address from components
          const components = []

          if (address.streetName) {
            let street = address.streetName
            if (address.streetNumber) {
              street = `${address.streetNumber} ${street}`
            }
            components.push(street)
          }

          if (address.municipality) {
            components.push(address.municipality)
          }

          if (address.countrySubdivision) {
            components.push(address.countrySubdivision)
          }

          if (address.countryCodeISO3) {
            components.push(address.countryCodeISO3)
          }

          if (address.postalCode) {
            components.push(address.postalCode)
          }

          formattedAddress = components.join(", ")
        }

        return formattedAddress || "Address not found"
      } else {
        return "Address not found"
      }
    } catch (error) {
      console.error("Error in reverse geocoding:", error)
      return "Error retrieving address"
    }
  }
  // Show current user location
  const showCurrentLocation = (e: React.MouseEvent) => {
    e.preventDefault()

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          console.log("Current location obtained:", { latitude, longitude })

          // Update state with the new location
          const newUserLocation: [number, number] = [longitude, latitude]
          setUserLocation(newUserLocation)
          localStorage.setItem("latitude", JSON.stringify(latitude))
          localStorage.setItem("longitude", JSON.stringify(longitude))
          setMyPosition({ latitude, longitude })

          if (map) {
            // Display user location on map
            displayUserLocation(map, longitude, latitude)

            // Move map to user's new location
            map.setCamera({
              center: [longitude, latitude],
              zoom: 15, // Closer zoom
              type: "ease",
              duration: 1000, // Smooth animation
            })

            setIsAtUserLocation(true)

            // Detect if user moves away from their location
            map.events.add("move", () => {
              const currentCenter = map.getCamera().center
              if (currentCenter) {
                const distance = atlas.math.getDistanceTo(currentCenter, [longitude, latitude], "kilometers")
                setIsAtUserLocation(distance < 0.1)
              }
            })
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get your current location. Please check your browser permissions.")
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
        },
      )
    } else {
      alert("Geolocation is not supported by your browser.")
    }
  }

  // Clear the route line
  const clearRoute = () => {
    if (routeDataSourceRef.current) {
      routeDataSourceRef.current.clear()
      setRouteLine(null)
      setEstimatedTime("")
      setEstimatedDistance("")
    }
  }

  // Zoom out to show the entire route
  const zoomOutToShowRoute = () => {
    if (map && routeDataSourceRef.current && routeLine) {
      // Get the bounds of the route line
      const bounds = atlas.data.BoundingBox.fromData(routeLine)
      // Set the camera to show the entire route
      map.setCamera({
        bounds: bounds,
        padding: 100,
        type: "ease",
        duration: 1000,
      })
    } else if (selectedTask && userLocation) {
      // If we don't have a route line but have task and user location
      // Create a bounding box that includes both points
      const bounds = new atlas.data.BoundingBox([
        Math.min(userLocation[0], selectedTask.lon),
        Math.min(userLocation[1], selectedTask.lat),
        Math.max(userLocation[0], selectedTask.lon),
        Math.max(userLocation[1], selectedTask.lat),
      ])
      if (map) {
        map.setCamera({
          bounds: bounds,
          padding: 100,
          type: "ease",
          duration: 1000,
        })
      }
    }
  }

  // Handle zoom in/out
  const handleZoom = (direction: "in" | "out", e: React.MouseEvent) => {
    e.preventDefault()
    if (map) {
      const currentZoom = map.getCamera().zoom || 12
      map.setCamera({
        zoom: direction === "in" ? currentZoom + 1 : currentZoom - 1,
        type: "ease",
        duration: 500,
      })
    }
  }

  // useEffect to check for geolocation support
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation is not supported by your browser")
    }
  }, [])
  const handleEmployeeClick = (employee: Employee) => {
    console.log("Employee clicked:", employee)
    setAssignedEmployee(employee)
    // Close task panel if open
    setSelectedTask(null)
  }

  const handleSendMessage = (message: string) => {
    if (selectedEmployee) {
      console.log(`Message sent to ${selectedEmployee.name}: ${message}`)
      // Here you would implement your actual message sending logic
      // For example, using your socket connection:
      // socket.emit('send_message', { employeeId: selectedEmployee.id, message });
    }
  }

  const handleAssignTask = () => {
    if (selectedEmployee) {
      console.log(`Assigning task to ${selectedEmployee.name}`)
      // Here you would implement your task assignment logic
      // For example, opening a modal or navigating to a task form
      // with the employee pre-selected
    }
  }
  // Log when userLocation changes
  useEffect(() => {
    console.log("userLocation state updated:", userLocation)
  }, [userLocation])

  // Handle closing the task panel
  const handleCloseTaskPanel = () => {
    // Add a fade-out animation by setting showTaskPanel to false
    setShowTaskPanel(false)

    // Clear route information when panel is closed
    clearRoute()
  }
  console.warn(assignedEmployee)

  // Update the search bar and panel positioning
  return (
    <div className="fixed inset-0 w-full h-full">
      {" "}
      <div ref={mapRef} className="h-full w-full" />  
      {showTaskPanel && selectedTask && (
        <TaskDetailsPanel
          employee={assignedEmployee}
          task={selectedTask}
          onClose={handleCloseTaskPanel}
          onDirectionsClick={handleDirectionsClick}
          estimatedTime={estimatedTime}
          estimatedDistance={estimatedDistance}
        />
      )}
      {showEmployeePanel && selectedEmployee && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <EmployeePanel
              employee={selectedEmployee}
              onClose={() => {
                console.log("Closing employee panel")
                setShowEmployeePanel(false)
              }}
              onSendMessage={handleSendMessage}
              onAssignTask={handleAssignTask}
            />
          </div>
        </div>
      )}
      <div className="absolute top-20 left-4 z-10 w-80">
        <div className="flex items-center bg-white rounded-full shadow-xl px-4 py-2 border border-gray-200 transition-all hover:shadow-2xl">
          <Search className="h-5 w-5 text-teal-500 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search locations..."
            className="flex-1 py-2 px-1 outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-32 left-4 z-20 bg-white border border-gray-200 rounded-lg shadow-xl w-80 overflow-hidden animate-fadeIn">
          <ul>
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="p-3 hover:bg-teal-50 cursor-pointer flex items-center gap-2 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
              >
                <FiMapPin className="text-teal-500 flex-shrink-0" />
                <span className="truncate text-gray-700">{suggestion.address.freeformAddress}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="absolute top-60 right-4 flex flex-col gap-2">
        <div className="bg-white rounded-lg shadow-xl flex flex-col divide-y border border-gray-200">
          <button
            onClick={showCurrentLocation}
            className={`p-3 hover:bg-teal-50 transition-colors rounded-t-lg ${
              isAtUserLocation ? "text-teal-500" : "text-gray-700"
            }`}
            aria-label="Show my location"
          >
            {isAtUserLocation ? <BiCurrentLocation className="w-5 h-5" /> : <TbCurrentLocation className="w-5 h-5" />}
          </button>
          <button
            onClick={(e) => handleZoom("in", e)}
            className="p-3 hover:bg-teal-50 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={(e) => handleZoom("out", e)}
            className="p-3 hover:bg-teal-50 transition-colors rounded-b-lg"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
      {isCalculatingRoute && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-white px-5 py-3 rounded-lg shadow-xl border border-gray-200 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div>
            <span className="text-gray-700 font-medium">Calculating route...</span>
          </div>
        </div>
      )}
      {routeLine && (
        <button
          onClick={zoomOutToShowRoute}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-teal-600 text-white px-5 py-2.5 rounded-lg shadow-xl hover:bg-teal-700 transition-colors font-medium flex items-center space-x-2 border border-teal-500"
        >
          <Navigation className="h-4 w-4" />
          <span>Show Full Route</span>
        </button>
      )}
   
      {showStats && selectedEmployeeStats && (
        <div className="absolute top-20 left-4 z-10 bg-white rounded-lg shadow-xl w-80">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Employee Stats</h2>
              <button onClick={() => setShowStats(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                <span className="text-2xl text-teal-600">
                  {selectedEmployeeStats.firstname[0]}{selectedEmployeeStats.lastname[0]}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{selectedEmployeeStats.firstname} {selectedEmployeeStats.lastname}</h3>
                <p className="text-sm text-gray-600">{selectedEmployeeStats.position}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Tasks Completed</p>
                <p className="text-xl font-semibold text-gray-800">{selectedEmployeeStats.stats.tasksCompleted}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">On-Time Rate</p>
                <p className="text-xl font-semibold text-gray-800">{selectedEmployeeStats.stats.onTimeRate}%</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Customer Satisfaction</p>
                <p className="text-xl font-semibold text-gray-800">{selectedEmployeeStats.stats.customerSatisfaction}%</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-xl font-semibold text-gray-800">{selectedEmployeeStats.stats.responseTime} min</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={() => setShowTaskList(!showTaskList)}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </button>
        <button
          onClick={() => setShowStats(!showStats)}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

