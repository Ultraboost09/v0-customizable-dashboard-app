"use client"

import { useState, useEffect, useRef } from "react"
import { useDashboardStore } from "@/lib/store"
import { Play, Pause, SkipBack, SkipForward, Music, Volume2, Download, ExternalLink } from "lucide-react"

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
  const [visualizerBars, setVisualizerBars] = useState<number[]>(Array(12).fill(20))
  const animationRef = useRef<number | null>(null)

  // Animate visualizer bars
  useEffect(() => {
    const animate = () => {
      setVisualizerBars(prev => prev.map(() => Math.random() * 100))
      animationRef.current = requestAnimationFrame(animate)
    }
    
    if (localMedia?.isPlaying || nowPlaying?.isPlaying) {
      animate()
    } else {
      setVisualizerBars(Array(12).fill(20))
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [localMedia?.isPlaying, nowPlaying?.isPlaying])

  // Listen for Media Session API updates
  useEffect(() => {
    if ("mediaSession" in navigator) {
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

      checkMediaSession()
      const interval = setInterval(checkMediaSession, 1000)

      return () => clearInterval(interval)
    }
  }, [setNowPlaying])

  // Control media playback
  const controlPlayback = async (action: "play" | "pause" | "previoustrack" | "nexttrack") => {
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

  const displayData = localMedia || nowPlaying

  // No media playing state
  if (!displayData) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-4 overflow-hidden">
        <div 
          className="rounded-xl flex items-center justify-center mb-3"
          style={{ 
            background: "rgba(255,255,255,0.1)",
            width: "clamp(40px, 10vw, 56px)",
            height: "clamp(40px, 10vw, 56px)",
          }}
        >
          <Music className="w-6 h-6 text-white/40" />
        </div>
        <p className="text-white/60 font-medium" style={{ fontSize: "clamp(0.65rem, 2vw, 0.75rem)" }}>Now Playing</p>
        <p className="text-white/30 mt-1 text-center max-w-[180px]" style={{ fontSize: "clamp(0.5rem, 1.5vw, 0.625rem)" }}>
          Media from your browser will appear here
        </p>
        
        {/* Hint about desktop app */}
        <a 
          href="/download"
          className="mt-3 flex items-center gap-1.5 text-blue-400/70 hover:text-blue-400 transition-colors"
          style={{ fontSize: "clamp(0.5rem, 1.5vw, 0.6rem)" }}
        >
          <Download className="w-3 h-3" />
          Get desktop app for system audio
        </a>
        
        {/* Idle visualizer bars */}
        <div className="flex items-end gap-0.5 mt-3 h-5">
          {visualizerBars.map((height, i) => (
            <div
              key={i}
              className="w-1 bg-white/20 rounded-full transition-all duration-150"
              style={{ height: `${height}%`, minHeight: "3px" }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col p-3 overflow-hidden">
      <div className="flex items-center gap-3 flex-1 min-h-0">
        {/* Album Art */}
        <div 
          className="rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center"
          style={{ 
            background: "rgba(255,255,255,0.1)",
            width: "clamp(40px, 12vw, 56px)",
            height: "clamp(40px, 12vw, 56px)",
          }}
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
          <div 
            className="text-white font-medium truncate"
            style={{ fontSize: "clamp(0.7rem, 2vw, 0.875rem)" }}
          >
            {displayData.title}
          </div>
          <div 
            className="text-white/50 truncate"
            style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)" }}
          >
            {displayData.artist}
          </div>
          {displayData.album && (
            <div 
              className="text-white/30 truncate mt-0.5"
              style={{ fontSize: "clamp(0.5rem, 1.2vw, 0.625rem)" }}
            >
              {displayData.album}
            </div>
          )}
        </div>

        {/* Playing indicator visualizer */}
        {displayData.isPlaying && (
          <div className="flex items-end gap-0.5 h-4 flex-shrink-0">
            {[0, 1, 2, 3].map((i) => (
              <div 
                key={i}
                className="w-0.5 bg-green-400 rounded-full transition-all duration-75"
                style={{ height: `${visualizerBars[i] || 50}%`, minHeight: "3px" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-white/10 flex-shrink-0">
        <button 
          onClick={() => controlPlayback("previoustrack")}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <SkipBack className="w-4 h-4 text-white/70" />
        </button>
        <button 
          onClick={() => controlPlayback(displayData.isPlaying ? "pause" : "play")}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
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
