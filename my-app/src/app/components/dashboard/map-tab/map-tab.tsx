'use client'

import React, { useEffect, useRef } from 'react'

declare global {
  interface Window {
    google: typeof google
    initMap?: () => void
  }
}

interface Report {
  id: number
  lat: number
  lng: number
  issueType: string
  severity: number
  status: string
}

interface MapTabProps {
  reports: Report[]
  loading: boolean
  score: number
  mapLoaded: boolean
  onMapLoad: () => void
}

const MapTab: React.FC<MapTabProps> = ({ reports, loading, score, mapLoaded, onMapLoad }) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<google.maps.Map | null>(null)
  const markers = useRef<google.maps.Marker[]>([])

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
      
      window.initMap = () => {
        if (mapContainer.current && !map.current) {
          map.current = new window.google.maps.Map(mapContainer.current, {
            center: { lat: 28.6, lng: 77.2 }, // Delhi
            zoom: 10,
          })
          onMapLoad()
        }
      }
    }

    if (!window.google) {
      loadGoogleMaps()
    } else if (mapContainer.current && !map.current) {
      map.current = new window.google.maps.Map(mapContainer.current, {
        center: { lat: 28.6, lng: 77.2 }, // Delhi
        zoom: 10,
      })
      onMapLoad()
    }

    return () => {
      if (window.initMap) {
        window.initMap = undefined as any
      }
    }
  }, [onMapLoad])

  // Update Markers
  const updateMarkers = (data: Report[]) => {
    if (!map.current || !window.google) return

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null))
    markers.current = []

    data.forEach(report => {
      const marker = new window.google.maps.Marker({
        position: { lat: report.lat, lng: report.lng },
        map: map.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 15,
          fillColor: report.severity > 7 ? '#ef4444' : '#f59e0b',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 5px 0; color: #333;">${report.issueType.toUpperCase()}</h3>
            <p style="margin: 0; color: #666;">Severity: ${report.severity}/10</p>
            <p style="margin: 5px 0 0 0; color: #666;">Status: ${report.status}</p>
          </div>
        `,
      })

      marker.addListener('click', () => {
        infoWindow.open(map.current, marker)
      })

      markers.current.push(marker)
    })
  }

  useEffect(() => {
    if (mapLoaded && map.current) {
      updateMarkers(reports)
    }
  }, [reports, mapLoaded])

  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
      <div ref={mapContainer} className="h-96 w-full" />
      {loading && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded shadow-lg">
          <span className="flex items-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading live data...
          </span>
        </div>
      )}
      
      {/* Leaderboard */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 w-64">
        <h3 className="font-bold text-lg mb-2">Ward Leaderboard</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Kalindi Kunj</span>
            <span className="font-semibold text-green-600">92</span>
          </div>
          <div className="flex justify-between">
            <span>Saket</span>
            <span className="font-semibold text-yellow-600">85</span>
          </div>
          <div className="flex justify-between">
            <span>Rohini</span>
            <span className="font-semibold text-red-600">68</span>
          </div>
        </div>
      </div>
      
      {/* Additional map info below */}
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">Live Civic Score</div>
            <div className="text-3xl font-bold text-green-600">{score}/100</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">Total Issues</div>
            <div className="text-3xl font-bold text-blue-600">{reports.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapTab

