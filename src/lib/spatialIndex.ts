import RBush from 'rbush'
import type { Station, BBoxItem } from '@/types'

class StationIndex extends RBush<BBoxItem> {
  toBBox(item: BBoxItem) {
    return {
      minX: item.minX,
      minY: item.minY,
      maxX: item.maxX,
      maxY: item.maxY,
    }
  }

  compareMinX(a: BBoxItem, b: BBoxItem) {
    return a.minX - b.minX
  }

  compareMinY(a: BBoxItem, b: BBoxItem) {
    return a.minY - b.minY
  }
}

let stationIndex: StationIndex | null = null

export function buildSpatialIndex(stations: Station[]): StationIndex {
  const index = new StationIndex()

  const items: BBoxItem[] = stations.map((station) => ({
    minX: station.coordinates[0], // lng
    minY: station.coordinates[1], // lat
    maxX: station.coordinates[0],
    maxY: station.coordinates[1],
    station,
  }))

  index.load(items)
  stationIndex = index

  return index
}

export function getSpatialIndex(): StationIndex | null {
  return stationIndex
}

export function searchByBBox(
  minLng: number,
  minLat: number,
  maxLng: number,
  maxLat: number
): Station[] {
  if (!stationIndex) {
    return []
  }

  const results = stationIndex.search({
    minX: minLng,
    minY: minLat,
    maxX: maxLng,
    maxY: maxLat,
  })

  return results.map((item) => item.station)
}
