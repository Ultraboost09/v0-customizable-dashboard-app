"use client"

import { useState } from "react"
import { useDashboardStore } from "@/lib/store"
import { Plus, X, Globe } from "lucide-react"
import Image from "next/image"

// Get favicon URL from a website URL
function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // Use Google's favicon service - reliable and fast
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`
  } catch {
    return ""
  }
}

// Favicon component with fallback
function Favicon({ url, name, size = 20 }: { url: string; name: string; size?: number }) {
  const [error, setError] = useState(false)
  const faviconUrl = getFaviconUrl(url)

  if (error || !faviconUrl) {
    return <Globe className="text-white/70" style={{ width: size, height: size }} />
  }

  return (
    <Image
      src={faviconUrl}
      alt={name}
      width={size}
      height={size}
      className="rounded"
      onError={() => setError(true)}
      unoptimized
    />
  )
}

export function QuickLinksWidget() {
  const { quickLinks, addQuickLink, removeQuickLink } = useDashboardStore()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState("")
  const [newUrl, setNewUrl] = useState("")

  const handleAdd = async () => {
    if (newName.trim() && newUrl.trim()) {
      let url = newUrl.trim()
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url
      }
      await addQuickLink({ name: newName.trim(), url, icon: "auto" })
      setNewName("")
      setNewUrl("")
      setShowAdd(false)
    }
  }

  return (
    <div className="h-full w-full flex items-center gap-2 p-2 overflow-x-auto overflow-y-hidden scrollbar-hide">
      {/* Quick Links */}
      {quickLinks.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group relative flex-shrink-0 hover:scale-105"
          style={{ 
            width: "clamp(38px, 8vw, 48px)", 
            height: "clamp(38px, 8vw, 48px)" 
          }}
          title={link.name}
        >
          <Favicon url={link.url} name={link.name} size={22} />
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              removeQuickLink(link.id)
            }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center hidden group-hover:flex shadow-lg"
          >
            <X className="w-2.5 h-2.5 text-white" />
          </button>
          {/* Tooltip */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/80 rounded text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {link.name}
          </div>
        </a>
      ))}

      {/* Add Button / Form */}
      {showAdd ? (
        <div className="flex items-center gap-2 p-2 bg-white/10 rounded-xl flex-shrink-0 border border-white/10">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="w-16 bg-transparent text-white placeholder-white/40 outline-none text-xs px-1"
            autoFocus
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="google.com"
            className="w-24 bg-transparent text-white placeholder-white/40 outline-none text-xs px-1"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              setShowAdd(false)
              setNewName("")
              setNewUrl("")
            }}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/70"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-dashed border-white/20 flex-shrink-0 hover:border-white/40"
          style={{ 
            width: "clamp(38px, 8vw, 48px)", 
            height: "clamp(38px, 8vw, 48px)" 
          }}
          title="Add link"
        >
          <Plus className="w-5 h-5 text-white/40" />
        </button>
      )}
    </div>
  )
}
