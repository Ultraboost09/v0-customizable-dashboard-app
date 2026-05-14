"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useDashboardStore } from "@/lib/store"
import { GripVertical, X, Maximize2 } from "lucide-react"

// Added widgetType here to fix the TypeScript error
interface DraggableWidgetProps {
  id: string
  x: number
  y: number
  width: number
  height: number
  widgetType: string
  children: React.ReactNode
  className?: string
  minWidth?: number
  minHeight?: number
}

export function DraggableWidget({
  id,
  x,
  y,
  width,
  height,
  widgetType, // Added here as well
  children,
  className = "",
  minWidth = 120,
  minHeight = 80,
}: DraggableWidgetProps) {
  const { editMode, updateWidgetPosition, updateWidgetSize, toggleWidgetVisibility } = useDashboardStore()
  const [position, setPosition] = useState({ x, y })
  const [size, setSize] = useState({ width, height })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const startSizeRef = useRef({ width: 0, height: 0 })
  const startPosRef = useRef({ x: 0, y: 0 })

  // Sync position and size with store
  useEffect(() => {
    setPosition({ x, y })
  }, [x, y])

  useEffect(() => {
    setSize({ width, height })
  }, [width, height])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!editMode) return
    e.stopPropagation()

    const rect = dragRef.current?.getBoundingClientRect()
    if (!rect) return

    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    setIsDragging(true)
  }

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (!editMode) return
    e.stopPropagation()
    e.preventDefault()

    setResizeDirection(direction)
    setIsResizing(true)
    startSizeRef.current = { width: size.width, height: size.height }
    startPosRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, e.clientX - offsetRef.current.x)
      const newY = Math.max(0, e.clientY - offsetRef.current.y)
      setPosition({ x: newX, y: newY })
    }
    
    if (isResizing && resizeDirection) {
      const deltaX = e.clientX - startPosRef.current.x
      const deltaY = e.clientY - startPosRef.current.y
      
      let newWidth = startSizeRef.current.width
      let newHeight = startSizeRef.current.height
      
      if (resizeDirection.includes("e")) {
        newWidth = Math.max(minWidth, startSizeRef.current.width + deltaX)
      }
      if (resizeDirection.includes("s")) {
        newHeight = Math.max(minHeight, startSizeRef.current.height + deltaY)
      }
      if (resizeDirection.includes("w")) {
        newWidth = Math.max(minWidth, startSizeRef.current.width - deltaX)
      }
      if (resizeDirection.includes("n")) {
        newHeight = Math.max(minHeight, startSizeRef.current.height - deltaY)
      }
      
      setSize({ width: newWidth, height: newHeight })
    }
  }, [isDragging, isResizing, resizeDirection, minWidth, minHeight])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      updateWidgetPosition(id, position.x, position.y)
    }
    if (isResizing) {
      updateWidgetSize(id, size.width, size.height)
    }
    setIsDragging(false)
    setIsResizing(false)
    setResizeDirection(null)
  }, [isDragging, isResizing, id, position.x, position.y, size.width, size.height, updateWidgetPosition, updateWidgetSize])

  useEffect(() => {
    if (!isDragging && !isResizing) return

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={dragRef}
      className={`absolute transition-shadow ${
        isDragging || isResizing ? "z-50 shadow-2xl" : "z-20"
      } ${editMode ? "ring-1 ring-white/20 hover:ring-white/40" : ""} ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: editMode ? (isDragging ? "grabbing" : "default") : "default",
      }}
    >
      {/* Edit Mode Controls */}
      {editMode && (
        <>
          {/* Top bar with grip and close */}
          <div className="absolute -top-6 left-0 right-0 flex items-center justify-between px-1">
            <div
              onMouseDown={handleMouseDown}
              className="flex items-center gap-1 text-white/60 cursor-grab active:cursor-grabbing hover:text-white/90"
            >
              <GripVertical className="w-3 h-3" />
              <span className="text-[10px] capitalize font-medium">{id}</span>
            </div>
            <button
              onClick={() => toggleWidgetVisibility(id)}
              className="p-0.5 bg-red-500/80 rounded hover:bg-red-500 transition-colors"
            >
              <X className="w-2.5 h-2.5 text-white" />
            </button>
          </div>

          {/* Resize handles */}
          {/* Right */}
          <div
            onMouseDown={(e) => handleResizeStart(e, "e")}
            className="absolute top-2 bottom-2 right-0 w-2 cursor-e-resize hover:bg-blue-500/30 rounded-r transition-colors"
          />
          {/* Bottom */}
          <div
            onMouseDown={(e) => handleResizeStart(e, "s")}
            className="absolute left-2 right-2 bottom-0 h-2 cursor-s-resize hover:bg-blue-500/30 rounded-b transition-colors"
          />
          {/* Corner */}
          <div
            onMouseDown={(e) => handleResizeStart(e, "se")}
            className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize hover:bg-blue-500/50 rounded-br transition-colors flex items-center justify-center"
          >
            <Maximize2 className="w-2.5 h-2.5 text-white/40 rotate-90" />
          </div>
        </>
      )}

      {/* Widget Content */}
      <div
        onMouseDown={editMode ? handleMouseDown : undefined}
        className="w-full h-full backdrop-blur-2xl rounded-2xl border border-white/15 shadow-xl overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        {children}
      </div>
    </div>
  )
}
