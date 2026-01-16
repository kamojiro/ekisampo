import { useEffect, useState } from 'react'
import type { Station, StationGeoJSON } from '@/types'
import { buildSpatialIndex } from '@/lib/spatialIndex'
import { useAppStore } from '@/stores/appStore'

export function useStations() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const setStations = useAppStore((state) => state.setStations)
  const stations = useAppStore((state) => state.stations)

  useEffect(() => {
    async function loadStations() {
      try {
        setIsLoading(true)
        const response = await fetch('/static/data/stations.json')

        if (!response.ok) {
          throw new Error(`Failed to load stations: ${response.statusText}`)
        }

        const data: StationGeoJSON = await response.json()

        const stationList: Station[] = data.features.map((feature) => ({
          id: feature.properties.id,
          name: feature.properties.name,
          lines: feature.properties.lines,
          operator: feature.properties.operator,
          coordinates: feature.geometry.coordinates as [number, number],
        }))

        // Build spatial index
        buildSpatialIndex(stationList)

        // Update store
        setStations(stationList)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stations')
      } finally {
        setIsLoading(false)
      }
    }

    if (stations.length === 0) {
      loadStations()
    } else {
      setIsLoading(false)
    }
  }, [setStations, stations.length])

  return { stations, isLoading, error }
}
