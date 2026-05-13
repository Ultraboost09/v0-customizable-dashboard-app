"use client"

import { useEffect, useRef } from "react"

interface Droplet {
  x: number
  y: number
  radius: number
  speed: number
  opacity: number
  trail: number
}

export function RainEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dropletsRef = useRef<Droplet[]>([])
  const staticDropletsRef = useRef<{ x: number; y: number; radius: number; opacity: number }[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStaticDroplets()
    }

    const initStaticDroplets = () => {
      staticDropletsRef.current = []
      const count = Math.floor((canvas.width * canvas.height) / 8000)
      for (let i = 0; i < count; i++) {
        staticDropletsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          opacity: Math.random() * 0.4 + 0.1,
        })
      }
    }

    const initDroplets = () => {
      dropletsRef.current = []
      const count = 80
      for (let i = 0; i < count; i++) {
        dropletsRef.current.push(createDroplet())
      }
    }

    const createDroplet = (): Droplet => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      radius: Math.random() * 2 + 1,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      trail: Math.random() * 100 + 50,
    })

    const drawStaticDroplet = (x: number, y: number, radius: number, opacity: number) => {
      // Droplet body with refraction effect
      const gradient = ctx.createRadialGradient(
        x - radius * 0.3,
        y - radius * 0.3,
        0,
        x,
        y,
        radius
      )
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.8})`)
      gradient.addColorStop(0.5, `rgba(200, 220, 255, ${opacity * 0.4})`)
      gradient.addColorStop(1, `rgba(150, 180, 220, ${opacity * 0.1})`)

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Highlight
      ctx.beginPath()
      ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`
      ctx.fill()
    }

    const drawRunningDroplet = (droplet: Droplet) => {
      // Trail (condensation streak)
      const trailGradient = ctx.createLinearGradient(
        droplet.x,
        droplet.y - droplet.trail,
        droplet.x,
        droplet.y
      )
      trailGradient.addColorStop(0, "rgba(200, 220, 255, 0)")
      trailGradient.addColorStop(0.7, `rgba(200, 220, 255, ${droplet.opacity * 0.15})`)
      trailGradient.addColorStop(1, `rgba(200, 220, 255, ${droplet.opacity * 0.3})`)

      ctx.beginPath()
      ctx.moveTo(droplet.x - droplet.radius * 0.5, droplet.y - droplet.trail)
      ctx.lineTo(droplet.x + droplet.radius * 0.5, droplet.y - droplet.trail)
      ctx.lineTo(droplet.x + droplet.radius, droplet.y)
      ctx.lineTo(droplet.x - droplet.radius, droplet.y)
      ctx.closePath()
      ctx.fillStyle = trailGradient
      ctx.fill()

      // Main droplet
      drawStaticDroplet(droplet.x, droplet.y, droplet.radius * 1.5, droplet.opacity)
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw condensation overlay
      ctx.fillStyle = "rgba(200, 220, 240, 0.02)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw static droplets
      staticDropletsRef.current.forEach((droplet) => {
        drawStaticDroplet(droplet.x, droplet.y, droplet.radius, droplet.opacity)
      })

      // Update and draw running droplets
      dropletsRef.current.forEach((droplet, index) => {
        droplet.y += droplet.speed

        if (droplet.y > canvas.height + droplet.trail) {
          dropletsRef.current[index] = createDroplet()
        }

        drawRunningDroplet(droplet)
      })

      requestAnimationFrame(animate)
    }

    resize()
    initDroplets()
    window.addEventListener("resize", resize)
    animate()

    return () => {
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: "overlay" }}
    />
  )
}
