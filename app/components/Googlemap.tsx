/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import * as atlas from "azure-maps-control"
import { ZoomIn, ZoomOut, Search, Users, MapPin, Target, Loader2 } from "lucide-react"
import "azure-maps-control/dist/atlas.min.css"
import * as atlasRest from "azure-maps-rest"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BiCurrentLocation } from "react-icons/bi"
import { TbCurrentLocation } from "react-icons/tb"
import { io } from "socket.io-client"

// Configure socket with reconnection options
const socket = io(`${process.env.NEXT_PUBLIC_Base_URL}`, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
})
interface EmployeeLocation {
  [id: string]: {
    lat: number
    lng: number
    id:string
    task_id?: string
    speed?: number
    accuracy?: number
    name?: string
  }
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

interface Task {
  id: string
  lat: number
  lon: number
}

interface AzureMapProps {
  onAddressSelect: (address: string) => void
  currentLocationProps: (location: { lat: number; lon: number }) => void
  Manager_id: string
  tasks?: Task[]
  employeeName: { id: string; firstname: string; lastname: string }[]
  onEmployeeSelect?: (employee: { id: string; name: string }) => void
}

const NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY = process.env.NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY as string
export default function EnhancedAzureMap({
  onAddressSelect,
  currentLocationProps,
  Manager_id,
  tasks = [],
  employeeName,
  onEmployeeSelect,
}: AzureMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<atlas.Map | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const dataSourceRef = useRef<atlas.source.DataSource | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [isAtUserLocation, setIsAtUserLocation] = useState(false)
  const [employeeData, setEmployeeData] = useState<EmployeeLocation>({})
  const [offline, setOffline] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchProgress, setSearchProgress] = useState(0)
  const searchDataSourceRef = useRef<atlas.source.DataSource | null>(null)
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Enhanced nearest employee finder with better animations
  function findNearestEmployee(searchLocation: { latitude: number; longitude: number }) {
    if (!map || Object.keys(employeeData).length === 0) return null

    let nearest = null
    let minDistance = Number.POSITIVE_INFINITY
    const employees: {
      id: string
      name: string
      latitude: number
      longitude: number
      distance: number
      speed: number
      accuracy: number
    }[] = []

    // Calculate distances for all employees
    Object.entries(employeeData).forEach(([id, employee]) => {
      const employeeLng = employee.lng || 0
      const distance = calculateDistance(searchLocation.latitude, searchLocation.longitude, employee.lat, employeeLng)

      const employeeInfo = employeeName.find((emp) => emp.id ===employee.id)
      const employeeData = {
        id:employee.id,
        name: employeeInfo ? `${employeeInfo.firstname} ${employeeInfo.lastname}` : `Employee ${id}`,
        latitude: employee.lat,
        longitude: employeeLng,
        distance,
        speed: employee.speed || 0,
        accuracy: employee.accuracy || 0,
      }

      employees.push(employeeData)

      if (distance < minDistance) {
        minDistance = distance
        nearest = employeeData
      }
    })

    return { nearest, allEmployees: employees.sort((a, b) => a.distance - b.distance) }
  }

  // Enhanced Uber-style search animation
  const performUberStyleSearch = async (searchLocation: { latitude: number; longitude: number }) => {
    if (!map) return

    setIsSearching(true)
    setSearchProgress(0)

    // Clear previous search results
    clearSearchResults()

    // Step 1: Create search pulse at location (20%)
    await createSearchPulse(searchLocation)
    setSearchProgress(20)

    // Step 2: Scanning animation (40%)
    await createScanningEffect(searchLocation)
    setSearchProgress(40)

    // Step 3: Find nearest employee (60%)
    const result = findNearestEmployee(searchLocation)
    setSearchProgress(60)

    if (result?.nearest) {
      // Step 4: Create connection animation (80%)
      await createConnectionAnimation(searchLocation, result.nearest)
      setSearchProgress(80)

      // Step 5: Highlight nearest employee (100%)
      await highlightNearestEmployee(result.nearest)
      setSearchProgress(100)

      setSelectedEmployee(result.nearest)
      showEmployeeDetails(result.nearest)
    }

    setTimeout(() => {
      setIsSearching(false)
      setSearchProgress(0)
    }, 1000)
  }

  // Create enhanced search pulse effect
  const createSearchPulse = (location: { latitude: number; longitude: number }) => {
    return new Promise<void>((resolve) => {
      if (!map) return resolve()

      const pulseSource = new atlas.source.DataSource("search-pulse")
      map.sources.add(pulseSource)

      const point = new atlas.data.Point([location.longitude, location.latitude])
      pulseSource.add(new atlas.data.Feature(point, { type: "pulse" }))

      // Create multiple pulse layers for enhanced effect
      for (let i = 0; i < 4; i++) {
        map.layers.add(
          new atlas.layer.BubbleLayer(pulseSource, `pulse-layer-${i}`, {
            radius: ["interpolate", ["linear"], ["zoom"], 10, 20 + i * 10, 15, 35 + i * 15],
            color: "#00D4AA",
            strokeColor: "#FFFFFF",
            strokeWidth: 3,
            opacity: ["interpolate", ["linear"], ["zoom"], 10, 0.8 - i * 0.15, 15, 0.6 - i * 0.1],
            filter: ["==", ["get", "type"], "pulse"],
          }),
        )
      }

      // Remove pulse after animation
      setTimeout(() => {
        for (let i = 0; i < 4; i++) {
          if (map.layers.getLayerById(`pulse-layer-${i}`)) {
            map.layers.remove(`pulse-layer-${i}`)
          }
        }
        if (map.sources.getById("search-pulse")) {
          map.sources.remove("search-pulse")
        }
        resolve()
      }, 1500)
    })
  }

  // Create scanning radar effect
  const createScanningEffect = (location: { latitude: number; longitude: number }) => {
    return new Promise<void>((resolve) => {
      if (!map) return resolve()

      const scanSource = new atlas.source.DataSource("scan-source")
      map.sources.add(scanSource)

      const point = new atlas.data.Point([location.longitude, location.latitude])
      scanSource.add(new atlas.data.Feature(point, { type: "scan" }))

      // Create expanding scan circles
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          map.layers.add(
            new atlas.layer.BubbleLayer(scanSource, `scan-layer-${i}`, {
              radius: ["interpolate", ["linear"], ["zoom"], 10, 50 + i * 30, 15, 80 + i * 50],
              color: "transparent",
              strokeColor: "#007AFF",
              strokeWidth: 2,
              opacity: 0.6 - i * 0.2,
              filter: ["==", ["get", "type"], "scan"],
            }),
          )
        }, i * 300)
      }

      // Remove scan effect
      setTimeout(() => {
        for (let i = 0; i < 3; i++) {
          if (map.layers.getLayerById(`scan-layer-${i}`)) {
            map.layers.remove(`scan-layer-${i}`)
          }
        }
        if (map.sources.getById("scan-source")) {
          map.sources.remove("scan-source")
        }
        resolve()
      }, 2000)
    })
  }

  // Create animated connection line
  const createConnectionAnimation = (searchLocation: { latitude: number; longitude: number }, employee: any) => {
    return new Promise<void>((resolve) => {
      if (!map) return resolve()

      const connectionSource = new atlas.source.DataSource("connection-source")
      map.sources.add(connectionSource)

      const line = new atlas.data.LineString([
        [searchLocation.longitude, searchLocation.latitude],
        [employee.longitude, employee.latitude],
      ])

      connectionSource.add(new atlas.data.Feature(line, { type: "connection" }))

      map.layers.add(
        new atlas.layer.LineLayer(connectionSource, "connection-layer", {
          strokeColor: "#00D4AA",
          strokeWidth: 4,
          strokeDashArray: [10, 5],
          opacity: 0.9,
          filter: ["==", ["get", "type"], "connection"],
        }),
      )

      // Remove connection after animation
      setTimeout(() => {
        if (map.layers.getLayerById("connection-layer")) {
          map.layers.remove("connection-layer")
        }
        if (map.sources.getById("connection-source")) {
          map.sources.remove("connection-source")
        }
        resolve()
      }, 2000)
    })
  }

  // Highlight the nearest employee with enhanced styling
  const highlightNearestEmployee = (employee: any) => {
    return new Promise<void>((resolve) => {
      if (!map) return resolve()

      const highlightSource = new atlas.source.DataSource("highlight-source")
      map.sources.add(highlightSource)

      const point = new atlas.data.Point([employee.longitude, employee.latitude])
      highlightSource.add(
        new atlas.data.Feature(point, {
          employeeId: employee.id,
          name: employee.name,
          distance: employee.distance,
        }),
      )

      map.layers.add(
        new atlas.layer.SymbolLayer(highlightSource, "highlight-layer", {
          iconOptions: {
            image: "marker-red",
            anchor: "bottom",
            allowOverlap: true,
            size: 1.5,
          },
          textOptions: {
            textField: `🎯 ${employee.name}`,
            offset: [0, -3],
            color: "#FFFFFF",
            size: 16,
            font: ["StandardFont-Bold"],
            haloColor: "#00D4AA",
            haloWidth: 3,
          },
        }),
      )

      resolve()
    })
  }

  // Show employee details in popup
  const showEmployeeDetails = (employee: any) => {
    if (!map) return

    const popupContent = document.createElement("div")
    popupContent.className = "bg-white p-4 rounded-lg shadow-lg border-2 border-green-500"
    popupContent.innerHTML = `
      <div class="text-center">
        <h3 class="font-bold text-lg mb-2 text-green-600">✓ Nearest Employee Found</h3>
        <div class="space-y-2">
          <p><strong>Name:</strong> ${employee.name}</p>
          <p><strong>Distance:</strong> ${employee.distance.toFixed(2)} km</p>
          <p><strong>Speed:</strong> ${employee.speed} km/h</p>
          <p><strong>Accuracy:</strong> ${employee.accuracy}m</p>
        </div>
        <div class="mt-3 pt-3 border-t">
          <span class="text-sm text-gray-600">Click to assign task</span>
        </div>
      </div>
    `

    const popup = new atlas.Popup({
      content: popupContent,
      position: [employee.longitude, employee.latitude],
      pixelOffset: [0, -50],
    })

    popup.open(map)

    // Center map on employee
    map.setCamera({
      center: [employee.longitude, employee.latitude],
      zoom: 16,
      type: "ease",
      duration: 1000,
    })
  }

  // Clear all search-related visual elements
  const clearSearchResults = () => {
    if (!map) return

    const layersToRemove = [
      "pulse-layer-0",
      "pulse-layer-1",
      "pulse-layer-2",
      "pulse-layer-3",
      "scan-layer-0",
      "scan-layer-1",
      "scan-layer-2",
      "connection-layer",
      "highlight-layer",
    ]

    const sourcesToRemove = ["search-pulse", "scan-source", "connection-source", "highlight-source"]

    layersToRemove.forEach((layerId) => {
      if (map.layers.getLayerById(layerId)) {
        map.layers.remove(layerId)
      }
    })

    sourcesToRemove.forEach((sourceId) => {
      if (map.sources.getById(sourceId)) {
        map.sources.remove(sourceId)
      }
    })
  }

  // Enhanced search functionality
  const handleEnhancedSearch = async () => {
    let searchLocation: { latitude: number; longitude: number } | null = null

    if (userLocation) {
      const [longitude, latitude] = userLocation
      searchLocation = { latitude, longitude }
    } else if (searchQuery && suggestions.length > 0) {
      const firstSuggestion = suggestions[0]
      searchLocation = {
        latitude: firstSuggestion.position.lat,
        longitude: firstSuggestion.position.lon,
      }
    }

    if (!searchLocation) {
      alert("Please enable location or search for a place first")
      return
    }

    if (Object.keys(employeeData).length === 0) {
      alert("No employee data available")
      return
    }

    await performUberStyleSearch(searchLocation)
  }

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new atlas.Map(mapRef.current, {
        authOptions: {
          authType: atlas.AuthenticationType.subscriptionKey,
          subscriptionKey: NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY,
        },
        center: [31.584641, 30.662537],
        zoom: 12,
        style: "road_shaded_relief",
      })

      newMap.events.add("ready", () => {
        setMap(newMap)
        const dataSource = new atlas.source.DataSource()
        newMap.sources.add(dataSource)
        dataSourceRef.current = dataSource

        // Initialize search data source
        const searchDataSource = new atlas.source.DataSource("search-results")
        newMap.sources.add(searchDataSource)
        searchDataSourceRef.current = searchDataSource

        // Add a symbol layer for search markers
        newMap.layers.add(
          new atlas.layer.SymbolLayer(searchDataSource, "search-marker-layer", {
            iconOptions: {
              image: "pin-round-red",
              anchor: "bottom",
              allowOverlap: true,
              size: 1.2,
            },
          }),
        )
      })
    }
  }, [map])
  const handleLocationUpdate = (mockEmployeeData: any) => {
    let formattedData: EmployeeLocation

    if (Array.isArray(mockEmployeeData)) {
      formattedData = {}
      mockEmployeeData.forEach((emp: any) => {
        if (emp.employee_id) {
          formattedData[emp.employee_id] = {
            id:emp.id,
            lat: emp.lat,
            lng: emp.lng,
            speed: emp.speed || 0,
            accuracy: emp.accuracy || 0,
            task_id: emp.task_id || null,
          }
        }
      })
    } else {
      formattedData = mockEmployeeData
    }

    console.log("✅ Formatted employee data:", formattedData)
    setEmployeeData(formattedData)
  }

  // Manual reconnect function
  const reconnectSocket = () => {
    console.log("Attempting to reconnect socket...")
    if (socket.disconnected) {
      socket.connect()

      // Request data immediately after reconnection attempt
      setTimeout(() => {
        if (socket.connected) {
          socket.emit("request_employee_locations", { manager_id: Manager_id })
        } else {
          console.log("Reconnection failed, fetching from API instead")
          fetchEmployeeDataFromAPI()
        }
      }, 1000)
    }
  }

  // Function to fetch employee data from API
  const fetchEmployeeDataFromAPI = async () => {
    try {
      console.log("Fetching employee data from API...")
      const response = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/employeedblive-track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manager_id: Manager_id }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ API data received:", data)
        handleLocationUpdate(data)
        setLastUpdated(new Date())
      } else {
        console.error("API error:", response.status)
      }
    } catch (error) {
      console.error("Error fetching employee data:", error)
    }
  }
  // Mock employee data for demo
  useEffect(() => {
    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect()
      console.log("Socket connecting...")
    }

    // Setup connection handlers
    const onConnect = () => {
      console.log("Socket connected successfully")
      setOffline(false)

      // Request initial data after connection
      socket.emit("request_employee_locations", { manager_id: Manager_id })
    }

    const onDisconnect = () => {
      console.log("Socket disconnected")
      setOffline(true)

      // Try to fetch data from API when socket is disconnected
      fetchEmployeeDataFromAPI()
    }

    const onLocationUpdate = (data: any) => {
      console.log("✅ Received location update:", data)
      handleLocationUpdate(data)
      setLastUpdated(new Date())
    }

    // Fetch employee data from API when socket is disconnected
    const fetchEmployeeDataFromAPI = async () => {
      try {
        console.log("Fetching employee data from API...")
        const response = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/employeedblive-track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ manager_id: Manager_id }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log("✅ API data received:", data)
          handleLocationUpdate(data)
          setLastUpdated(new Date())
        } else {
          console.error("API error:", response.status)
          // Show fallback UI for no data
          setEmployeeData({})
        }
      } catch (error) {
        console.error("Error fetching employee data:", error)
        // Show fallback UI for no data
        setEmployeeData({})
      }
    }

    // Register event handlers
    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on(`location_update_${Manager_id}`, onLocationUpdate)

    // Initial connection status check
    if (socket.connected) {
      console.log("Socket already connected")
      setOffline(false)
      socket.emit("request_employee_locations", { manager_id: Manager_id })
    } else {
      console.log("Socket not connected, attempting to connect...")
      socket.connect()
    }

    // Cleanup function
    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off(`location_update_${Manager_id}`, onLocationUpdate)
    }
  }, [Manager_id])

  // Fetch suggestions from Azure Maps
  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([])
      return
    }

    try {
      const pipeline = atlasRest.MapsURL.newPipeline(
        new atlasRest.SubscriptionKeyCredential(NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY),
      )
      const searchURL = new atlasRest.SearchURL(pipeline)
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    fetchSuggestions(query)
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.position) {
      const { lat, lon } = suggestion.position
      const coordinates: [number, number] = [lon, lat]

      // Clear previous search marker
      if (!searchDataSourceRef.current) {
        // Initialize search data source if it doesn't exist
        searchDataSourceRef.current = new atlas.source.DataSource("search-results")
        map?.sources.add(searchDataSourceRef.current)

        // Add a symbol layer for the search markers
        map?.layers.add(
          new atlas.layer.SymbolLayer(searchDataSourceRef.current, "search-marker-layer", {
            iconOptions: {
              image: "pin-round-red",
              anchor: "bottom",
              allowOverlap: true,
              size: 1.2,
            },
          }),
        )
      } else {
        searchDataSourceRef.current.clear()
      }

      // Add a new search marker
      const point = new atlas.data.Point(coordinates)
      searchDataSourceRef.current.add(new atlas.data.Feature(point, { address: suggestion.address }))

      // Set the map camera to the selected location
      if (map) {
        map.setCamera({
          center: coordinates,
          zoom: 15,
        })
      }

      setSearchQuery(suggestion.address.freeformAddress)
      setShowSuggestions(false)
      onAddressSelect(suggestion.address.freeformAddress)
      currentLocationProps({ lat: suggestion.position.lat, lon: suggestion.position.lon })
    }
  }

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

  // Handle assigning employee
  const handleAssignEmployee = () => {
    if (selectedEmployee && onEmployeeSelect) {
      onEmployeeSelect({
        id: selectedEmployee.id,
        name: selectedEmployee.name,
      })
    }
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapRef} className="h-full w-full" />

      <Card className="absolute top-4 left-4 z-10 w-80">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for a location..."
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <Button onClick={handleEnhancedSearch} disabled={isSearching} className="bg-green-600 hover:bg-green-700">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
            </Button>
          </div>

          {isSearching && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Searching for nearest employee...</span>
                <span>{searchProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-green-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${searchProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-20 left-4 z-10 w-80 max-h-60 overflow-y-auto">
          <CardContent className="p-0">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center space-x-2"
              >
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{suggestion.address.freeformAddress}</span>
              </div>
            ))}
          </CardContent>
        </Card>
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

      <div className="absolute bottom-4 left-4 z-10 flex flex-col space-y-2">
        {offline && (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>Offline Mode</span>
          </Badge>
        )}

        {lastUpdated && (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
          </Badge>
        )}

        <Badge variant="outline" className="flex items-center space-x-1">
          <Users className="w-3 h-3" />
          <span>{Object.keys(employeeData).length} employees</span>
        </Badge>

        {Object.keys(employeeData).length === 0 && (
          <Card className="mt-2 bg-amber-50 border-amber-200">
            <CardContent className="p-3">
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-amber-800">No employee data available</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={reconnectSocket}
                  className="bg-white hover:bg-amber-100 border-amber-300"
                >
                  <Loader2 className={`w-3 h-3 mr-2 ${offline ? "animate-spin" : ""}`} />
                  Reconnect
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedEmployee && (
        <Card className="absolute bottom-4 right-4 z-10 w-64">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-semibold text-green-600">Selected Employee</span>
            </div>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Name:</strong> {selectedEmployee.name}
              </p>
              <p>
                <strong>Distance:</strong> {selectedEmployee.distance.toFixed(2)} km
              </p>
              <p>
                <strong>Speed:</strong> {selectedEmployee.speed} km/h
              </p>
            </div>
            <Button className="w-full mt-3 bg-green-600 hover:bg-green-700" size="sm" onClick={handleAssignEmployee}>
              Assign Task
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
