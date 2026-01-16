import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet'
import { useAppStore } from '@/stores/appStore'
import { DrawingTools } from './DrawingTools'
import { StationMarker } from './StationMarker'

export function MapContainer() {
  const mapCenter = useAppStore((state) => state.mapCenter)
  const mapZoom = useAppStore((state) => state.mapZoom)
  const selectedStation = useAppStore((state) => state.selectedStation)

  return (
    <LeafletMapContainer
      center={mapCenter}
      zoom={mapZoom}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DrawingTools />
      {selectedStation && <StationMarker station={selectedStation} />}
    </LeafletMapContainer>
  )
}
