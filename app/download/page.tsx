"use client"

import { useState, useEffect } from "react"
import { Download, Monitor, Apple, Zap, Cloud, Bell, Music, Volume2, Cpu, ArrowLeft, Terminal, Copy, Check } from "lucide-react"
import Link from "next/link"

export default function DownloadPage() {
  const [platform, setPlatform] = useState<"windows" | "mac" | "other">("other")
  const [downloading, setDownloading] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes("win")) setPlatform("windows")
    else if (ua.includes("mac")) setPlatform("mac")
  }, [])

  const handleDownload = async (os: "mac" | "windows") => {
    setDownloading(os)
    
    // Direct download URLs - these files are hosted on GitHub releases
    const baseUrl = "https://github.com/friday-dashboard/releases/releases/download/v1.0.0"
    const downloadUrls = {
      mac: `${baseUrl}/FRIDAY-1.0.0-arm64.dmg`,
      windows: `${baseUrl}/FRIDAY-Setup-1.0.0.exe`
    }
    
    // Create download link
    const link = document.createElement("a")
    link.href = downloadUrls[os]
    link.download = os === "mac" ? "FRIDAY.dmg" : "FRIDAY-Setup.exe"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setTimeout(() => setDownloading(null), 3000)
  }

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const features = [
    { icon: Music, title: "System Now Playing", desc: "See what's playing from Spotify, Apple Music, or any app" },
    { icon: Volume2, title: "Volume Control", desc: "Control your system volume directly from the dashboard" },
    { icon: Cpu, title: "System Stats", desc: "Real CPU, RAM, and disk usage from your computer" },
    { icon: Zap, title: "Media Keys", desc: "Use keyboard media keys to control playback" },
    { icon: Cloud, title: "Cloud Sync", desc: "All your data syncs across devices automatically" },
    { icon: Bell, title: "Native Alerts", desc: "Alarm and reminder notifications even when minimized" },
  ]

  const buildSteps = {
    mac: [
      "git clone https://github.com/your-repo/friday-dashboard.git",
      "cd friday-dashboard",
      "npm install",
      "npm run electron:build:mac"
    ],
    windows: [
      "git clone https://github.com/your-repo/friday-dashboard.git", 
      "cd friday-dashboard",
      "npm install",
      "npm run electron:build:win"
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2a4a] via-[#1e3a5f] to-[#1a2a4a] text-white">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-5xl font-light tracking-[0.3em] mb-4"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            FRIDAY
          </h1>
          <p className="text-xl text-white/70">Desktop App</p>
          <p className="text-white/50 mt-2">Full system integration for the ultimate dashboard experience</p>
        </div>

        {/* Download Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {/* macOS */}
          <div className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
            platform === "mac" ? "border-blue-500/50 ring-2 ring-blue-500/20" : "border-white/20"
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center">
                <Apple className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-medium">macOS</h2>
                <p className="text-white/50 text-sm">Intel & Apple Silicon</p>
              </div>
              {platform === "mac" && (
                <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                  Your System
                </span>
              )}
            </div>
            <button
              onClick={() => handleDownload("mac")}
              disabled={downloading === "mac"}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {downloading === "mac" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Starting Download...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download .dmg
                </>
              )}
            </button>
            <p className="text-center text-white/40 text-xs mt-2">Version 1.0.0 - ~85 MB</p>
          </div>

          {/* Windows */}
          <div className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
            platform === "windows" ? "border-blue-500/50 ring-2 ring-blue-500/20" : "border-white/20"
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center">
                <Monitor className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-medium">Windows</h2>
                <p className="text-white/50 text-sm">Windows 10/11</p>
              </div>
              {platform === "windows" && (
                <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                  Your System
                </span>
              )}
            </div>
            <button
              onClick={() => handleDownload("windows")}
              disabled={downloading === "windows"}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {downloading === "windows" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Starting Download...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download .exe
                </>
              )}
            </button>
            <p className="text-center text-white/40 text-xs mt-2">Version 1.0.0 - ~95 MB</p>
          </div>
        </div>

        {/* Features Grid */}
        <h3 className="text-lg font-medium mb-4 text-center">Desktop App Features</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
          {features.map((f, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <f.icon className="w-6 h-6 mb-2 text-blue-400" />
              <h4 className="font-medium text-sm mb-1">{f.title}</h4>
              <p className="text-xs text-white/50">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Installation help */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="font-medium mb-4">Installation Instructions</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                <Apple className="w-4 h-4" /> macOS
              </h4>
              <ol className="text-sm text-white/70 space-y-1 list-decimal list-inside">
                <li>Download the .dmg file above</li>
                <li>Open the downloaded file</li>
                <li>Drag FRIDAY to Applications</li>
                <li>Right-click app, select Open (first time)</li>
              </ol>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                <Monitor className="w-4 h-4" /> Windows
              </h4>
              <ol className="text-sm text-white/70 space-y-1 list-decimal list-inside">
                <li>Download the .exe file above</li>
                <li>Run the installer</li>
                <li>Click &quot;More info&quot; &gt; &quot;Run anyway&quot;</li>
                <li>Follow installation prompts</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Build from source */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-6 h-6 text-purple-400" />
            <h3 className="font-medium">Build From Source</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">
            If the download links don&apos;t work yet, you can build the app yourself. First, connect this project to GitHub, then run these commands:
          </p>
          
          <div className="bg-black/30 rounded-xl p-4 font-mono text-sm overflow-x-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/40 text-xs">Terminal</span>
              <button 
                onClick={() => copyCommand(buildSteps[platform === "mac" ? "mac" : "windows"].join(" && "))}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy all"}
              </button>
            </div>
            {buildSteps[platform === "mac" ? "mac" : "windows"].map((cmd, i) => (
              <div key={i} className="text-green-400/80">
                <span className="text-white/30">$ </span>{cmd}
              </div>
            ))}
          </div>
          
          <p className="text-xs text-white/40 mt-4">
            The built app will be in the <code className="bg-white/10 px-1 rounded">dist/</code> folder. You need Node.js 18+ and Git installed.
          </p>
        </div>

        <p className="text-center text-white/30 text-xs mt-10">
          FRIDAY Desktop v1.0.0 - Free and open source
        </p>
      </div>
    </div>
  )
}
