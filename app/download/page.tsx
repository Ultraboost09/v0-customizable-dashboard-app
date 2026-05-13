"use client"

import { Monitor, Apple, Download, Music, Volume2, Sun, ArrowLeft, Check, Terminal, Github, Cpu, Zap, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function DownloadPage() {
  const [activeTab, setActiveTab] = useState<"download" | "build">("download")
  
  const features = [
    {
      icon: Music,
      title: "Now Playing Integration",
      description: "See what's playing from Spotify, Apple Music, YouTube, or any media app on your system",
    },
    {
      icon: Volume2,
      title: "System Volume Control",
      description: "Adjust your system volume directly from the dashboard sliders",
    },
    {
      icon: Sun,
      title: "Screen Brightness",
      description: "Control your display brightness without leaving the dashboard",
    },
    {
      icon: Cpu,
      title: "Real System Stats",
      description: "Monitor your actual CPU, RAM, and disk usage in real-time",
    },
  ]

  const buildSteps = [
    {
      step: 1,
      title: "Clone the Repository",
      code: "git clone https://github.com/your-username/friday-dashboard.git\ncd friday-dashboard",
    },
    {
      step: 2,
      title: "Install Dependencies",
      code: "pnpm install",
    },
    {
      step: 3,
      title: "Build for Your Platform",
      code: "# For macOS:\npnpm electron:build:mac\n\n# For Windows:\npnpm electron:build:win\n\n# For Linux:\npnpm electron:build:linux",
    },
    {
      step: 4,
      title: "Find Your App",
      code: "# The built app will be in:\n# dist-electron/\n#   - FRIDAY Dashboard.dmg (macOS)\n#   - FRIDAY Dashboard Setup.exe (Windows)\n#   - FRIDAY Dashboard.AppImage (Linux)",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2a4a] via-[#2a3a5a] to-[#1a2a4a]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <h1
            className="text-white text-5xl font-medium mb-4"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              letterSpacing: "0.2em",
            }}
          >
            FRIDAY
          </h1>
          <p className="text-white/60 text-xl mb-2">Desktop Application</p>
          <p className="text-white/40 text-sm max-w-lg mx-auto">
            Get the full desktop experience with system integration, media controls, and more.
          </p>
        </div>

        {/* Desktop app benefits */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-12">
          <h2 className="text-white text-xl font-medium mb-6 text-center">Desktop Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                  <p className="text-white/50 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/5 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setActiveTab("download")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "download" 
                  ? "bg-blue-500 text-white" 
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Download className="w-4 h-4 inline mr-2" />
              Download
            </button>
            <button
              onClick={() => setActiveTab("build")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "build" 
                  ? "bg-blue-500 text-white" 
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Terminal className="w-4 h-4 inline mr-2" />
              Build from Source
            </button>
          </div>
        </div>

        {activeTab === "download" ? (
          <>
            {/* Download buttons */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Windows */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Monitor className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-medium">Windows</h3>
                    <p className="text-white/50 text-sm">Windows 10 or later</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>System media controls</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Volume control</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Native notifications</span>
                  </div>
                </div>
                <a
                  href="/api/download?platform=win"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download for Windows
                </a>
                <p className="text-white/30 text-xs text-center mt-2">v1.0.0 - Installer (.exe)</p>
              </div>

              {/* macOS */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                    <Apple className="w-7 h-7 text-white/80" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-medium">macOS</h3>
                    <p className="text-white/50 text-sm">macOS 11 Big Sur or later</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Now Playing widget (Spotify, Apple Music)</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Volume & brightness control</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Real system stats</span>
                  </div>
                </div>
                <a
                  href="/api/download?platform=mac"
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download for macOS
                </a>
                <p className="text-white/30 text-xs text-center mt-2">v1.0.0 - Universal Binary (.dmg)</p>
              </div>
            </div>

            {/* Note about building */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center mb-8">
              <p className="text-amber-200/80 text-sm">
                <Zap className="w-4 h-4 inline mr-1" />
                Pre-built binaries require code signing. For now, build from source or use the web version.
              </p>
            </div>
          </>
        ) : (
          /* Build instructions */
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-medium">Build from Source</h2>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
              >
                <Github className="w-4 h-4" />
                View on GitHub
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-6">
              {/* Prerequisites */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-medium mb-2">Prerequisites</h3>
                <ul className="text-white/60 text-sm space-y-1">
                  <li>Node.js 18+ and pnpm installed</li>
                  <li>Git installed</li>
                  <li>macOS: Xcode Command Line Tools</li>
                  <li>Windows: Visual Studio Build Tools</li>
                </ul>
              </div>

              {/* Steps */}
              {buildSteps.map((step) => (
                <div key={step.step} className="border-l-2 border-blue-500/50 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-medium">
                      {step.step}
                    </span>
                    <h3 className="text-white font-medium">{step.title}</h3>
                  </div>
                  <pre className="bg-black/40 rounded-lg p-3 text-white/80 text-sm overflow-x-auto font-mono">
                    {step.code}
                  </pre>
                </div>
              ))}

              {/* Run in dev mode */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/30">
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-green-400" />
                  Quick Development Mode
                </h3>
                <p className="text-white/60 text-sm mb-3">
                  Run the app in development mode without building:
                </p>
                <pre className="bg-black/40 rounded-lg p-3 text-green-300 text-sm font-mono">
                  pnpm electron:dev
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Web version note */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-white/10 p-6 text-center">
          <h3 className="text-white font-medium mb-2">Prefer the Web Version?</h3>
          <p className="text-white/50 text-sm mb-4">
            The web version works great and syncs all your data across devices. 
            The desktop app adds system-level integrations for media controls and hardware access.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            Continue using web version
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>

        {/* Technical info */}
        <div className="mt-12 text-center">
          <p className="text-white/30 text-xs">
            Built with Electron for cross-platform support.
          </p>
        </div>
      </div>
    </div>
  )
}
