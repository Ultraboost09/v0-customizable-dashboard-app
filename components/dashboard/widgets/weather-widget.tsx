"use client"

import { useState, useEffect } from "react"
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, MapPin } from "lucide-react"

interface WeatherData {
  temperature: number
  weatherCode: number
  humidity: number
  windSpeed: number
  high: number
  low: number
  location: string
}

const getWeatherIcon = (code: number, size: string = "w-8 h-8") => {
  if (code === 0) return <Sun className={`${size} text-yellow-400`} />
  if (code >= 1 && code <= 3) return <Cloud className={`${size} text-white/70`} />
  if (code >= 51 && code <= 67) return <CloudRain className={`${size} text-blue-400`} />
  if (code >= 71 && code <= 77) return <CloudSnow className={`${size} text-blue-200`} />
  if (code >= 80 && code <= 82) return <CloudRain className={`${size} text-blue-400`} />
  return <Cloud className={`${size} text-white/70`} />
}

const getWeatherDescription = (code: number) => {
  if (code === 0) return "Clear"
  if (code >= 1 && code <= 3) return "Cloudy"
  if (code >= 51 && code <= 55) return "Drizzle"
  if (code >= 56 && code <= 67) return "Rain"
  if (code >= 71 && code <= 77) return "Snow"
  if (code >= 80 && code <= 82) return "Showers"
  if (code >= 95) return "Storm"
  return "Unknown"
}

// Savannah, GA coordinates
const SAVANNAH_LAT = 32.0809
const SAVANNAH_LON = -81.0912

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Fetch weather for Savannah, GA
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${SAVANNAH_LAT}&longitude=${SAVANNAH_LON}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/New_York`
        )
        const data = await response.json()

        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weather_code,
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          high: Math.round(data.daily.temperature_2m_max[0]),
          low: Math.round(data.daily.temperature_2m_min[0]),
          location: "Savannah, GA",
        })
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch weather")
        setLoading(false)
      }
    }

    fetchWeather()
    // Refresh weather every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-pulse text-white/50 text-sm">Loading...</div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-white/50 text-sm">{error || "No data"}</div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col justify-center p-3 overflow-hidden">
      {/* Location */}
      <div className="flex items-center gap-1 mb-2">
        <MapPin className="w-3 h-3 text-white/50 flex-shrink-0" />
        <span className="text-white/60 truncate" style={{ fontSize: "clamp(0.5rem, 2vw, 0.65rem)" }}>
          {weather.location}
        </span>
      </div>

      {/* Main weather display */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {getWeatherIcon(weather.weatherCode, "w-10 h-10")}
        </div>
        <div className="min-w-0">
          <div 
            className="font-light text-white"
            style={{ fontSize: "clamp(1.5rem, 6vw, 2.5rem)" }}
          >
            {weather.temperature}°F
          </div>
          <div 
            className="text-white/60"
            style={{ fontSize: "clamp(0.6rem, 2vw, 0.75rem)" }}
          >
            {getWeatherDescription(weather.weatherCode)}
          </div>
        </div>
      </div>

      {/* High/Low */}
      <div 
        className="flex gap-3 mt-2 text-white/50"
        style={{ fontSize: "clamp(0.5rem, 1.5vw, 0.65rem)" }}
      >
        <span>H: {weather.high}°</span>
        <span>L: {weather.low}°</span>
      </div>

      {/* Details */}
      <div 
        className="mt-2 flex gap-4 text-white/50"
        style={{ fontSize: "clamp(0.5rem, 1.5vw, 0.625rem)" }}
      >
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3 flex-shrink-0" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-3 h-3 flex-shrink-0" />
          <span>{weather.windSpeed} mph</span>
        </div>
      </div>
    </div>
  )
}
