import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { useMap } from 'react-leaflet'
import type { Station } from '@/types'

interface StationMarkerProps {
  station: Station
}

export function StationMarker({ station }: StationMarkerProps) {
  const map = useMap()
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    // Create custom icon with station name
    const icon = L.divIcon({
      className: 'custom-station-marker',
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            background-color: #ef4444;
            color: white;
            font-weight: bold;
            font-size: 13px;
            padding: 4px 10px;
            border-radius: 16px;
            border: 2px solid #fff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            white-space: nowrap;
          ">${station.name}</div>
          <div style="
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 10px solid #ef4444;
            margin-top: -2px;
          "></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 42],
      popupAnchor: [0, -42],
    })

    // Create marker - note: coordinates are [lng, lat], Leaflet expects [lat, lng]
    const marker = L.marker([station.coordinates[1], station.coordinates[0]], {
      icon,
    })

    // Add popup
    const popupContent = `
      <div style="min-width: 150px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${station.name}</h3>
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${station.operator}</p>
        <p style="margin: 0; font-size: 11px; color: #888;">${station.lines.join(', ')}</p>
      </div>
    `
    marker.bindPopup(popupContent)

    marker.addTo(map)
    markerRef.current = marker

    // Center map on station
    map.setView([station.coordinates[1], station.coordinates[0]], map.getZoom())

    return () => {
      if (markerRef.current) {
        markerRef.current.remove()
      }
    }
  }, [map, station])

  return null
}
