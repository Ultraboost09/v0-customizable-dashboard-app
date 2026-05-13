"use client"

import { useState, useEffect, useRef } from "react"
import { useDashboardStore } from "@/lib/store"
import { Play, Pause, SkipBack, SkipForward, Music, Volume2, Download, Disc3 } from "lucide-react"

interface MediaState {
  title: string
  artist: string
  album: string
  artwork: string
  isPlaying: boolean
  app?: string
}

export function MusicWidget() {
  const { nowPlaying, setNowPlaying } = useDashboardStore()
  const [localMedia, setLocalMedia] = useState<MediaState | null>(null)
  const [isElectron, setIsElectron] = useState(false)
  const [visualizerBars, setVisualizerBars] = useState<number[]>(Array(12).fill(20))
  const animationRef = useRef<number | null>(null)

  // Check if running in Electron
  useEffect(() => {
    setIsElectron(!!window.electronAPI?.isElectron)
  }, [])

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

  // Use Electron API for now playing if available
  useEffect(() => {
    if (window.electronAPI?.isElectron) {
      const fetchNowPlaying = async () => {
        const data = await window.electronAPI!.getNowPlaying()
        if (data) {
          const newState: MediaState = {
            title: data.title,
            artist: data.artist,
            album: data.album,
            artwork: "",
            isPlaying: data.isPlaying,
            app: data.app,
          }
          setLocalMedia(newState)
          setNowPlaying(newState)
        } else {
          setLocalMedia(null)
        }
      }

      fetchNowPlaying()
      const interval = setInterval(fetchNowPlaying, 1000)

      // Listen for media keys
      window.electronAPI.onMediaKey((key) => {
        if (key === 'playpause') {
          window.electronAPI?.mediaControl('playpause')
        } else if (key === 'next') {
          window.electronAPI?.mediaControl('next')
        } else if (key === 'previous') {
          window.electronAPI?.mediaControl('previous')
        }
      })

      return () => clearInterval(interval)
    } else {
      // Fallback to Media Session API for browser
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
    }
  }, [setNowPlaying])

  // Control media playback
  const controlPlayback = async (action: "play" | "pause" | "playpause" | "previous" | "next") => {
    if (window.electronAPI?.isElectron) {
      await window.electronAPI.mediaControl(action)
    } else {
      // Browser fallback
      const mediaElements = document.querySelectorAll("audio, video")
      mediaElements.forEach((element) => {
        const media = element as HTMLMediaElement
        if (action === "play" || action === "playpause") {
          if (media.paused) {
            media.play().catch(() => {})
          } else {
            media.pause()
          }
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
          {isElectron 
            ? "Play music in Spotify or Apple Music" 
            : "Media from your browser will appear here"
          }
        </p>
        
        {/* Hint about desktop app if in browser */}
        {!isElectron && (
          <a 
            href="/download"
            className="mt-3 flex items-center gap-1.5 text-blue-400/70 hover:text-blue-400 transition-colors"
            style={{ fontSize: "clamp(0.5rem, 1.5vw, 0.6rem)" }}
          >
            <Download className="w-3 h-3" />
            Get desktop app for system audio
          </a>
        )}
        
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
          className="rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center relative"
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
            <Disc3 className={`w-6 h-6 text-white/40 ${displayData.isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
          )}
          {displayData.isPlaying && (
            <div className="absolute inset-0 border-2 border-green-400/50 rounded-lg animate-pulse" />
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
          {(displayData.album || displayData.app) && (
            <div 
              className="text-white/30 truncate mt-0.5 flex items-center gap-1"
              style={{ fontSize: "clamp(0.5rem, 1.2vw, 0.625rem)" }}
            >
              {displayData.album && <span>{displayData.album}</span>}
              {displayData.app && (
                <span className="bg-white/10 px-1 py-0.5 rounded text-white/40">
                  {displayData.app}
                </span>
              )}
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
          onClick={() => controlPlayback("previous")}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <SkipBack className="w-4 h-4 text-white/70" />
        </button>
        <button 
          onClick={() => controlPlayback("playpause")}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        >
          {displayData.isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" />
          )}
        </button>
        <button 
          onClick={() => controlPlayback("next")}
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
