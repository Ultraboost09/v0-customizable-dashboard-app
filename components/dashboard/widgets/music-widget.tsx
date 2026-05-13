"use client"

import { useState, useEffect } from "react"
import { useDashboardStore } from "@/lib/store"
import { Play, Pause, SkipBack, SkipForward, Music, Volume2 } from "lucide-react"

interface MediaState {
  title: string
  artist: string
  album: string
  artwork: string
  isPlaying: boolean
}

export function MusicWidget() {
  const { nowPlaying, setNowPlaying } = useDashboardStore()
  const [localMedia, setLocalMedia] = useState<MediaState | null>(null)

  // Listen for Media Session API updates (detects media playing from browser/system)
  useEffect(() => {
    // Check if Media Session API is available
    if ("mediaSession" in navigator) {
      // Poll for media session metadata changes
      const checkMediaSession = () => {
        const session = navigator.mediaSession
        if (session.metadata) {
          const metadata = session.metadata
          const newState: MediaState = {
            title: metadata.title || "Unknown Track",
            artist: metadata.artist || "Unknown Artist",
            album: metadata.album || "",
            artwork: metadata.artwork?.[0]?.src || "",
            isPlaying: session.playbackState === "playing",
          }
          setLocalMedia(newState)
          setNowPlaying({
            ...newState,
            isPlaying: session.playbackState === "playing",
          })
        }
      }

      // Check immediately and then poll
      checkMediaSession()
      const interval = setInterval(checkMediaSession, 1000)

      return () => clearInterval(interval)
    }
  }, [setNowPlaying])

  // Try to control media playback
  const controlPlayback = async (action: "play" | "pause" | "previoustrack" | "nexttrack") => {
    // Media Session API action handlers
    if ("mediaSession" in navigator) {
      // Dispatch the action - this will be handled by the media player
      const actionHandlers = navigator.mediaSession
      
      // Find and click the appropriate media control if available
      const mediaElements = document.querySelectorAll("audio, video")
      mediaElements.forEach((element) => {
        const media = element as HTMLMediaElement
        if (action === "play") {
          media.play().catch(() => {})
        } else if (action === "pause") {
          media.pause()
        }
      })
    }
  }

  const displayData = localMedia || nowPlaying

  // No media playing state
  if (!displayData) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <Music className="w-6 h-6 text-white/40" />
        </div>
        <p className="text-white/60 text-xs font-medium">Now Playing</p>
        <p className="text-white/30 text-[10px] mt-1 text-center">
          Play media in your browser to see it here
        </p>
        
        {/* Demo mode with visualizer bars */}
        <div className="flex items-end gap-0.5 mt-4 h-6">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-white/20 rounded-full"
              style={{
                height: `${Math.random() * 100}%`,
                minHeight: "4px",
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-3">
      <div className="flex items-center gap-3 flex-1">
        {/* Album Art */}
        <div 
          className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          {displayData.artwork ? (
            <img 
              src={displayData.artwork} 
              alt={displayData.album}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <Music className="w-6 h-6 text-white/40" />
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-medium truncate">{displayData.title}</div>
          <div className="text-white/50 text-xs truncate">{displayData.artist}</div>
          {displayData.album && (
            <div className="text-white/30 text-[10px] truncate mt-0.5">{displayData.album}</div>
          )}
        </div>

        {/* Playing indicator */}
        {displayData.isPlaying && (
          <div className="flex items-end gap-0.5 h-4">
            <div className="w-0.5 bg-green-400 rounded-full animate-pulse" style={{ height: "60%", animationDelay: "0ms" }} />
            <div className="w-0.5 bg-green-400 rounded-full animate-pulse" style={{ height: "100%", animationDelay: "150ms" }} />
            <div className="w-0.5 bg-green-400 rounded-full animate-pulse" style={{ height: "40%", animationDelay: "300ms" }} />
            <div className="w-0.5 bg-green-400 rounded-full animate-pulse" style={{ height: "80%", animationDelay: "450ms" }} />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-white/10">
        <button 
          onClick={() => controlPlayback("previoustrack")}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <SkipBack className="w-4 h-4 text-white/70" />
        </button>
        <button 
          onClick={() => controlPlayback(displayData.isPlaying ? "pause" : "play")}
          className="p-2.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        >
          {displayData.isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" />
          )}
        </button>
        <button 
          onClick={() => controlPlayback("nexttrack")}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <SkipForward className="w-4 h-4 text-white/70" />
        </button>
        <div className="ml-2 flex items-center gap-1">
          <Volume2 className="w-3 h-3 text-white/40" />
        </div>
      </div>
    </div>
  )
}
