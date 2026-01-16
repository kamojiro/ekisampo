import * as turf from '@turf/turf'
import type { Feature, Polygon } from 'geojson'
import type { Station, DrawnArea } from '@/types'
import { searchByBBox } from './spatialIndex'

export function findStationsInArea(
  drawnArea: DrawnArea,
  allStations: Station[]
): Station[] {
  const { feature } = drawnArea

  // Get bounding box of the drawn area for initial filtering
  const bbox = turf.bbox(feature)
  const [minLng, minLat, maxLng, maxLat] = bbox

  // First, get candidates using R-tree spatial index
  const candidates = searchByBBox(minLng, minLat, maxLng, maxLat)

  // If no candidates from index, fall back to all stations
  const stationsToCheck = candidates.length > 0 ? candidates : allStations

  // Then, do precise point-in-polygon check
  const stationsInArea = stationsToCheck.filter((station) => {
    const point = turf.point([station.coordinates[0], station.coordinates[1]])
    return turf.booleanPointInPolygon(point, feature as Feature<Polygon>)
  })

  return stationsInArea
}

export function createCirclePolygon(
  center: [number, number],
  radiusInMeters: number,
  steps: number = 64
): Feature<Polygon> {
  // center is [lat, lng], turf expects [lng, lat]
  const turfCenter = turf.point([center[1], center[0]])
  const radiusInKm = radiusInMeters / 1000

  const circle = turf.circle(turfCenter, radiusInKm, {
    steps,
    units: 'kilometers',
  })

  return circle as Feature<Polygon>
}
