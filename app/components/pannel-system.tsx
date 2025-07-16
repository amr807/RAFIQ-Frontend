/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { X, ChevronRight, Pin, PinOff, Loader2, Move } from 'lucide-react'
import { cn } from "@/lib/utils"
import React from "react"

interface PanelProps {
  id: string
  title: string
  icon?: React.ReactNode
  statusColor?: string
  statusText?: string
  children: React.ReactNode
  onClose: () => void
  onPinChange?: (isPinned: boolean, id: string) => void
  initialPosition?: { x: number, y: number }
  panelIndex?: number
  className?: string
}

export function Panel({
  id,
  title,
  icon,
  statusColor = "bg-gray-500",
  statusText,
  children,
  onClose,
  onPinChange,
  initialPosition = { x: 0, y: 250 },
  panelIndex = 8,
  className
}: PanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ 
    x: initialPosition.x, 
    y: initialPosition.y + (panelIndex * 50) 
  })
  const [isDragging, setIsDragging] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [showPinned, setShowPinned] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animation effect - set visible after component mounts
    setTimeout(() => setIsVisible(true), 50)

    return () => {
      setIsVisible(false)
    }
  }, [])

  // Notify parent component when pin status changes
  useEffect(() => {
    if (onPinChange) {
      onPinChange(isPinned, id)
    }
  }, [isPinned, id, onPinChange])

  const togglePin = () => {
    const newPinState = !isPinned
    setIsPinned(newPinState)

    // When pinning while collapsed, show the pinned indicator
    if (collapsed) {
      setShowPinned(true)
    }

    // Notify parent component about pin state change
    if (onPinChange) {
      onPinChange(newPinState, id)
    }
  }

  const resetPanel = () => {
    setPosition({ 
      x: collapsed ? -60: 0, 
      y: initialPosition.y+(panelIndex * 50) 
    })
    setHasMoved(false)
  }

  const handleCollapse = () => {
    setCollapsed(!collapsed)
    setPosition({ 
      x: !collapsed ? -60: 0, 
      y: initialPosition.y+(panelIndex * 50) 
    })
  
    if (isPinned) {
      setShowPinned(!collapsed)
    }
  }

  // Determine if we should show the pinned indicator
  const shouldShowPinnedIndicator = isPinned && collapsed && showPinned

  return (
    <>
      {shouldShowPinnedIndicator && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed z-50 cursor-pointer"
          style={{
            left: `${position.x + 20}px`,
            top: `${position.y + 20}px`,
          }}
          onClick={() => setCollapsed(false)}
        >
          <div className="bg-teal-500 p-2 rounded-full shadow-lg">
            <Pin className="h-4 w-4 text-white" />
          </div>
        </motion.div>
      )}

      <motion.div
        ref={panelRef}
        initial={{ opacity: 0 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          x: position.x,
          y: position.y,
          scale: collapsed ? 0.6 : 1,
          width: collapsed ? "340px" : "400px",
          height: collapsed ? "auto" : "auto",
         
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        drag={!isPinned }
        dragConstraints={{ left: -100, right: window.innerWidth - 300, top: 0, bottom: window.innerHeight - 200 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(event, info: PanInfo) => {
          setIsDragging(false)
          setPosition({ x: position.x + info.offset.x, y: position.y + info.offset.y })
          setHasMoved(true)
        }}
        className={cn(
          "fixed bg-gray-900 text-white shadow-2xl z-50 overflow-hidden rounded-xl border border-gray-800",
          collapsed ? "max-h-[120px]" : "max-h-[calc(100vh-150px)] overflow-y-auto",
          isPinned ? "ring-2 ring-teal-500" : "cursor-move",
          className
        )}
        style={{
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
          touchAction: "none",
          position: "fixed",
        }}
      >
        <div className="relative p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${statusColor}`}></div>
              <h2 className="text-lg font-semibold truncate text-white">{title}</h2>
              {statusText && (
                <span className="ml-2 text-xs text-gray-400">{statusText}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={togglePin}
                className={`p-1.5 rounded-full hover:bg-gray-700 transition-colors ${
                  isPinned ? "bg-teal-900/50 text-teal-400" : ""
                }`}
                aria-label={isPinned ? "Unpin panel" : "Pin panel"}
                title={
                  isPinned
                    ? "Unpin panel (keep when selecting other items)"
                    : "Pin panel (keep when selecting other items)"
                }
              >
                {isPinned ? <PinOff className="h-5 w-5 text-teal-400" /> : <Pin className="h-5 w-5 text-gray-300" />}
              </button>

              <button
                onClick={handleCollapse}
                className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                aria-label={collapsed ? "Expand panel" : "Collapse panel"}
                title={collapsed ? "Expand panel" : "Collapse panel"}
              >
                <ChevronRight
                  className={`h-5 w-5 text-gray-300 transition-transform ${collapsed ? "-rotate-90" : "rotate-90"}`}
                />
              </button>

            

              {hasMoved && (
                <button
                  onClick={resetPanel}
                  className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                  aria-label="Reset position"
                  title="Reset position"
                >
                  <Loader2 className="h-5 w-5 text-teal-400" />
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Close panel"
                title="Close panel"
              >
                <X className="h-5 w-5 text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        {!collapsed ? (
          <div className="panel-content">{children}</div>
        ) : (
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${statusColor}`}></div>
                <div>
                  <h3 className="text-sm font-medium text-white truncate max-w-[120px]">{title}</h3>
                  {statusText && <p className="text-xs text-gray-400 truncate max-w-[120px]">{statusText}</p>}
                </div>
              </div>
              {isPinned && <Pin className="h-4 w-4 text-teal-400 mr-1" />}
            </div>

            <div className="flex justify-around mt-2 pt-2 border-t border-gray-700">
             

              <button
                className="flex items-center justify-center p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                title="Close panel"
              >
                <X className="h-4 w-4 text-rose-400" />
              </button>

              <button
                className="flex items-center justify-center p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  togglePin()
                }}
                title={isPinned ? "Unpin panel" : "Pin panel"}
              >
                {isPinned ? <PinOff className="h-4 w-4 text-teal-400" /> : <Pin className="h-4 w-4 text-gray-300" />}
              </button>
            </div>
          </div>
        )}

        {!isPinned&& (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex items-center justify-center pointer-events-none">
            <Move className="h-4 w-4 text-gray-500 opacity-50" />
          </div>
        )}
      </motion.div>
    </>
  )
}

export function PanelTabs({ 
  activeTab, 
  setActiveTab, 
  tabs 
}: { 
  activeTab: string, 
  setActiveTab: (tab: string) => void, 
  tabs: { id: string, label: string }[] 
}) {
  return (
    <div className="border-b border-t border-gray-700 bg-gray-800">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex-1 py-4 px-2 font-medium transition-colors ${
              activeTab === tab.id
                ? "text-teal-400 border-b-2 border-teal-400 bg-gray-800"
                : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function PanelManager() {
  const [panels, setPanels] = useState<{
    id: string;
    component: React.ReactNode;
    pinned: boolean;
  }[]>([])

  const addPanel = (id: string, component: React.ReactNode) => {
    // Check if panel already exists
    const existingPanelIndex = panels.findIndex(panel => panel.id === id)
    
    if (existingPanelIndex >= 0) {
      // If panel exists and is not pinned, replace it
      if (!panels[existingPanelIndex].pinned) {
        const updatedPanels = [...panels]
        updatedPanels[existingPanelIndex] = {
          ...updatedPanels[existingPanelIndex],
          component
        }
        setPanels(updatedPanels)
      }
      // If panel exists and is pinned, do nothing
      return
    }
    
    // Otherwise add new panel
    setPanels([...panels, { id, component, pinned: false }])
  }

  const removePanel = (id: string) => {
    setPanels(panels.filter(panel => panel.id !== id))
  }

  const updatePinStatus = (isPinned: boolean, id: string) => {
    setPanels(
      panels.map(panel => 
        panel.id === id ? { ...panel, pinned: isPinned } : panel
      )
    )
  }

  return {
    panels,
    addPanel,
    removePanel,
    updatePinStatus,
    renderPanels: () => (
      <AnimatePresence>
        {panels.map((panel, index) => (
          <React.Fragment key={panel.id}>
            {panel.component}
          </React.Fragment>
        ))}
      </AnimatePresence>
    )
  }
}
