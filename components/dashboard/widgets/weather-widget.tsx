"use client"

import { useState, useEffect } from "react"
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets } from "lucide-react"

interface WeatherData {
  temperature: number
  weatherCode: number
  humidity: number
  windSpeed: number
  location: string
}

const getWeatherIcon = (code: number) => {
  if (code === 0) return <Sun className="w-8 h-8 text-yellow-400" />
  if (code >= 1 && code <= 3) return <Cloud className="w-8 h-8 text-white/70" />
  if (code >= 51 && code <= 67) return <CloudRain className="w-8 h-8 text-blue-400" />
  if (code >= 71 && code <= 77) return <CloudSnow className="w-8 h-8 text-blue-200" />
  if (code >= 80 && code <= 82) return <CloudRain className="w-8 h-8 text-blue-400" />
  return <Cloud className="w-8 h-8 text-white/70" />
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

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m`
        )
        const data = await response.json()

        // Reverse geocode for location name
        let location = "Your Location"
        try {
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          )
          const geoData = await geoResponse.json()
          location = geoData.address?.city || geoData.address?.town || geoData.address?.village || "Your Location"
        } catch {
          // Fallback to coordinates
        }

        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weather_code,
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          location,
        })
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch weather")
        setLoading(false)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude)
        },
        () => {
          // Default to New York if geolocation fails
          fetchWeather(40.7128, -74.006)
        }
      )
    } else {
      fetchWeather(40.7128, -74.006)
    }
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-white/50 text-sm">Loading...</div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white/50 text-sm">{error || "No data"}</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col justify-center p-4">
      <div className="flex items-center gap-3">
        {getWeatherIcon(weather.weatherCode)}
        <div>
          <div className="text-3xl font-light text-white">{weather.temperature}°C</div>
          <div className="text-xs text-white/60">{getWeatherDescription(weather.weatherCode)}</div>
        </div>
      </div>
      <div className="mt-3 flex gap-4 text-[10px] text-white/50">
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3" />
          {weather.humidity}%
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-3 h-3" />
          {weather.windSpeed} km/h
        </div>
      </div>
      <div className="mt-1 text-[10px] text-white/40">{weather.location}</div>
    </div>
  )
}
