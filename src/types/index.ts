import type { Feature, Polygon, Point } from 'geojson'

export interface Station {
  id: string
  name: string
  lines: string[]
  operator: string
  coordinates: [number, number] // [lng, lat]
}

export interface StationGeoJSON {
  type: 'FeatureCollection'
  features: Array<Feature<Point, StationProperties>>
}

export interface StationProperties {
  id: string
  name: string
  lines: string[]
  operator: string
}

export type DrawingMode = 'polygon' | 'circle' | null

export interface DrawnArea {
  type: 'polygon' | 'circle'
  feature: Feature<Polygon>
  center?: [number, number] // for circle
  radius?: number // for circle in meters
}

export interface BBoxItem {
  minX: number
  minY: number
  maxX: number
  maxY: number
  station: Station
}
