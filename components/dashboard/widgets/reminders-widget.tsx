"use client"

import { useState } from "react"
import { useDashboardStore } from "@/lib/store"
import { Plus, Trash2, Check, X, Edit2 } from "lucide-react"

export function RemindersWidget() {
  const { tasks, addTask, toggleTask, deleteTask, editTask } = useDashboardStore()
  const [newTask, setNewTask] = useState("")
  const [newCategory, setNewCategory] = useState("Personal")
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")

  const categories = ["Personal", "Work", "Shopping", "Health"]
  const incompleteTasks = tasks.filter((t) => !t.completed).slice(0, 5)
  const completedCount = tasks.filter((t) => t.completed).length

  const handleAdd = () => {
    if (newTask.trim()) {
      addTask(newTask.trim(), newCategory)
      setNewTask("")
      setShowAdd(false)
    }
  }

  const handleEdit = (id: string) => {
    if (editText.trim()) {
      editTask(id, editText.trim())
      setEditingId(null)
    }
  }

  return (
    <div className="h-full flex flex-col p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-white font-medium text-sm">Reminders</span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <Plus className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Add Task Form */}
      {showAdd && (
        <div className="mb-2 p-2 bg-white/5 rounded">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="New reminder..."
            className="w-full bg-transparent text-white text-xs placeholder-white/40 outline-none mb-2"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          <div className="flex gap-1 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setNewCategory(cat)}
                className={`text-[10px] px-2 py-0.5 rounded ${
                  newCategory === cat ? "bg-blue-500 text-white" : "bg-white/10 text-white/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-1 mt-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-blue-500 text-white text-xs py-1 rounded"
            >
              Add
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-2 bg-white/10 text-white/70 text-xs py-1 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin">
        {incompleteTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 group"
          >
            <button
              onClick={() => toggleTask(task.id)}
              className="w-4 h-4 rounded border border-white/30 flex items-center justify-center hover:bg-white/10 flex-shrink-0"
            >
              {task.completed && <Check className="w-2 h-2 text-white" />}
            </button>

            {editingId === task.id ? (
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => handleEdit(task.id)}
                onKeyDown={(e) => e.key === "Enter" && handleEdit(task.id)}
                className="flex-1 bg-transparent text-white text-xs outline-none"
                autoFocus
              />
            ) : (
              <span
                className={`flex-1 text-xs ${task.completed ? "line-through text-white/40" : "text-white/80"}`}
              >
                {task.text}
              </span>
            )}

            <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
              <button
                onClick={() => {
                  setEditingId(task.id)
                  setEditText(task.text)
                }}
                className="p-0.5 hover:bg-white/10 rounded"
              >
                <Edit2 className="w-2.5 h-2.5 text-white/50" />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-0.5 hover:bg-white/10 rounded"
              >
                <Trash2 className="w-2.5 h-2.5 text-red-400/70" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {tasks.length > 5 && (
        <div className="text-[10px] text-white/40 mt-1">
          +{tasks.length - 5} more
        </div>
      )}
    </div>
  )
}
