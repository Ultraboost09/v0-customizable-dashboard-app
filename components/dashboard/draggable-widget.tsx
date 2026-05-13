"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useDashboardStore } from "@/lib/store"
import { GripVertical, X } from "lucide-react"

interface DraggableWidgetProps {
  id: string
  x: number
  y: number
  children: React.ReactNode
  className?: string
}

export function DraggableWidget({
  id,
  x,
  y,
  children,
  className = "",
}: DraggableWidgetProps) {
  const { editMode, updateWidgetPosition, toggleWidgetVisibility } = useDashboardStore()
  const [position, setPosition] = useState({ x, y })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef({ x: 0, y: 0 })

  // Sync position with store
  useEffect(() => {
    setPosition({ x, y })
  }, [x, y])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!editMode) return

    const rect = dragRef.current?.getBoundingClientRect()
    if (!rect) return

    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(0, e.clientX - offsetRef.current.x)
      const newY = Math.max(0, e.clientY - offsetRef.current.y)
      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      updateWidgetPosition(id, position.x, position.y)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, id, position.x, position.y, updateWidgetPosition])

  return (
    <div
      ref={dragRef}
      className={`absolute transition-shadow ${
        isDragging ? "z-50 shadow-2xl" : "z-20"
      } ${editMode ? "ring-1 ring-blue-500/30" : ""} ${className}`}
      style={{
        left: position.x,
        top: position.y,
        cursor: editMode ? (isDragging ? "grabbing" : "grab") : "default",
      }}
    >
      {/* Edit Mode Controls */}
      {editMode && (
        <div className="absolute -top-6 left-0 right-0 flex items-center justify-between px-1 opacity-0 hover:opacity-100 transition-opacity">
          <div
            onMouseDown={handleMouseDown}
            className="flex items-center gap-1 text-white/60 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-3 h-3" />
            <span className="text-[10px] capitalize">{id}</span>
          </div>
          <button
            onClick={() => toggleWidgetVisibility(id)}
            className="p-0.5 bg-red-500/80 rounded hover:bg-red-500"
          >
            <X className="w-2 h-2 text-white" />
          </button>
        </div>
      )}

      {/* Widget Content */}
      <div
        onMouseDown={editMode ? handleMouseDown : undefined}
        className={`backdrop-blur-xl bg-white/10 rounded-xl border border-white/10 shadow-lg overflow-hidden ${
          editMode ? "pointer-events-auto" : ""
        }`}
      >
        {children}
      </div>
    </div>
  )
}
