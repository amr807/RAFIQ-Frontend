"use client"

import { useEffect, useRef, useState } from "react"
import * as atlas from "azure-maps-control"
import { ZoomIn, ZoomOut, Navigation } from "lucide-react"
import "azure-maps-control/dist/atlas.min.css"

export default function AzureMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<atlas.Map | null>(null)
  const dataSourceRef = useRef<atlas.source.DataSource | null>(null)

  // Initialize the map
  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new atlas.Map(mapRef.current, {
        authOptions: {
          authType: atlas.AuthenticationType.subscriptionKey,
          subscriptionKey: process.env.NEXT_PUBLIC_AZURE_MAPS_KEY || "",
        },
        center: [-122.33, 47.6],
        zoom: 12,
        style: "road",
      })

      newMap.events.add("ready", () => {
        setMap(newMap)
        // Create a data source and add it to the map
        const dataSource = new atlas.source.DataSource()
        newMap.sources.add(dataSource)
        dataSourceRef.current = dataSource
      })
    }
  }, [map])

  // Function to get and show current location
  const showCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          // setUserLocation([longitude, latitude])

          if (map && dataSourceRef.current) {
            const dataSource = dataSourceRef.current

            // Clear existing data
            dataSource.clear()

            // Add the location point
            const point = new atlas.data.Point([longitude, latitude])

            // Add outer circle (pulse effect)
            dataSource.add(
              new atlas.data.Feature(point, {
                type: "pulse",
              }),
            )

            // Add inner circle (solid blue dot)
            dataSource.add(
              new atlas.data.Feature(point, {
                type: "inner",
              }),
            )

            // Remove existing layers if they exist
            if (map.layers.getLayerById("pulse-layer")) {
              map.layers.remove("pulse-layer")
            }
            if (map.layers.getLayerById("inner-layer")) {
              map.layers.remove("inner-layer")
            }

            // Add the pulse effect layer
            map.layers.add(
              new atlas.layer.BubbleLayer(dataSource, "pulse-layer", {
                radius: 20,
                color: "#007AFF",
                strokeColor: "transparent",
                filter: ["==", ["get", "type"], "pulse"],
                opacity: 0.4,
              }),
            )

            // Add the solid inner circle layer
            map.layers.add(
              new atlas.layer.BubbleLayer(dataSource, "inner-layer", {
                radius: 8,
                color: "#007AFF",
                strokeColor: "#FFFFFF",
                strokeWidth: 2,
                filter: ["==", ["get", "type"], "inner"],
              }),
            )

            // Center the map on the location
            map.setCamera({
              center: [longitude, latitude],
              zoom: 15,
            })
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get your current location. Please check your browser permissions.")
        },
      )
    } else {
      alert("Geolocation is not supported by your browser")
    }
  }

  // Zoom controls
  const handleZoom = (direction: "in" | "out") => {
    if (map) {
      const currentZoom = map.getCamera().zoom
      map.setCamera({
        zoom: direction === "in" ? (currentZoom ?? 0) + 1 : (currentZoom ?? 0) - 1,
      })
    }
  }

  return (
    <div className="relative w-300 h-[300px]">
      <div ref={mapRef} className="h-full w-full" />

      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <div className="bg-white rounded-lg shadow-md flex flex-col divide-y">
          <button
            onClick={showCurrentLocation}
            className="p-3 hover:bg-gray-100 transition-colors rounded-t-lg"
            aria-label="Show my location"
          >
            <Navigation className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={() => handleZoom("in")}
            className="p-3 hover:bg-gray-100 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={() => handleZoom("out")}
            className="p-3 hover:bg-gray-100 transition-colors rounded-b-lg"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .pulse-layer {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(2);
            opacity: 0.2;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

