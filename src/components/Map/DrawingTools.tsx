import { useEffect, useRef, useCallback } from 'react'
import { useMap } from 'react-leaflet'
import '@geoman-io/leaflet-geoman-free'
import type L from 'leaflet'
import type { Feature, Polygon } from 'geojson'
import { useAppStore } from '@/stores/appStore'
import { findStationsInArea, createCirclePolygon } from '@/lib/stationSearch'
import type { DrawnArea } from '@/types'

export function DrawingTools() {
  const map = useMap()
  const drawnLayerRef = useRef<L.Layer | null>(null)

  const drawingMode = useAppStore((state) => state.drawingMode)
  const drawnArea = useAppStore((state) => state.drawnArea)
  const stations = useAppStore((state) => state.stations)
  const setDrawnArea = useAppStore((state) => state.setDrawnArea)
  const setStationsInArea = useAppStore((state) => state.setStationsInArea)
  const setDrawingMode = useAppStore((state) => state.setDrawingMode)

  // Update area after drag/edit
  const updateAreaFromLayer = useCallback((layer: L.Layer) => {
    let area: DrawnArea

    if ((layer as L.Circle).getRadius) {
      const circle = layer as L.Circle
      const center = circle.getLatLng()
      const radius = circle.getRadius()

      const polygonFeature = createCirclePolygon(
        [center.lat, center.lng],
        radius
      )

      area = {
        type: 'circle',
        feature: polygonFeature,
        center: [center.lat, center.lng],
        radius,
      }
    } else {
      const polygon = layer as L.Polygon
      const geoJson = polygon.toGeoJSON() as Feature<Polygon>

      area = {
        type: 'polygon',
        feature: geoJson,
      }
    }

    setDrawnArea(area)
    const stationsInArea = findStationsInArea(area, stations)
    setStationsInArea(stationsInArea)
  }, [stations, setDrawnArea, setStationsInArea])

  // Initialize geoman
  useEffect(() => {
    if (!map.pm) return

    map.pm.addControls({
      position: 'topleft',
      drawCircle: false,
      drawCircleMarker: false,
      drawMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawPolygon: false,
      drawText: false,
      editMode: false,
      dragMode: false,
      cutPolygon: false,
      removalMode: false,
      rotateMode: false,
    })

    // Set global options
    map.pm.setGlobalOptions({
      allowSelfIntersection: false,
    })
  }, [map])

  // Custom circle drawing with drag (bounding box style)
  const circlePreviewRef = useRef<L.Circle | null>(null)
  const rectPreviewRef = useRef<L.Rectangle | null>(null)
  const isDrawingCircleRef = useRef(false)
  const startPointRef = useRef<L.LatLng | null>(null)

  // Handle drawing mode changes
  useEffect(() => {
    if (!map.pm) return

    // First, disable all drawing modes
    map.pm.disableDraw()

    if (drawingMode === 'polygon') {
      map.pm.enableDraw('Polygon', {
        snappable: true,
        snapDistance: 20,
        allowSelfIntersection: false,
        templineStyle: { color: '#3b82f6', weight: 2 },
        hintlineStyle: { color: '#3b82f6', weight: 2, dashArray: '5, 5' },
        pathOptions: {
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
        },
      })
    }
    // Circle mode is handled by custom drag implementation below
  }, [map, drawingMode])

  // Custom drag-to-draw for circles (bounding box inscribed circle)
  useEffect(() => {
    if (!map || drawingMode !== 'circle') return

    // Disable map dragging while in circle draw mode
    map.dragging.disable()

    // Helper to calculate inscribed circle from two corner points
    const calcInscribedCircle = (p1: L.LatLng, p2: L.LatLng) => {
      // Calculate center of the bounding box
      const centerLat = (p1.lat + p2.lat) / 2
      const centerLng = (p1.lng + p2.lng) / 2
      const center = L.latLng(centerLat, centerLng)

      // Calculate width and height in meters
      const topLeft = L.latLng(p1.lat, p1.lng)
      const topRight = L.latLng(p1.lat, p2.lng)
      const bottomLeft = L.latLng(p2.lat, p1.lng)

      const width = topLeft.distanceTo(topRight)
      const height = topLeft.distanceTo(bottomLeft)

      // Radius is half of the smaller dimension (inscribed in square)
      const radius = Math.min(width, height) / 2

      return { center, radius }
    }

    const handleMouseDown = (e: L.LeafletMouseEvent) => {
      isDrawingCircleRef.current = true
      startPointRef.current = e.latlng

      // Create preview rectangle
      rectPreviewRef.current = L.rectangle(
        [e.latlng, e.latlng],
        {
          color: '#94a3b8',
          fillColor: 'transparent',
          fillOpacity: 0,
          weight: 1,
          dashArray: '4, 4',
        }
      ).addTo(map)

      // Create preview circle
      circlePreviewRef.current = L.circle(e.latlng, {
        radius: 0,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map)
    }

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      if (!isDrawingCircleRef.current || !startPointRef.current) return

      const { center, radius } = calcInscribedCircle(startPointRef.current, e.latlng)

      // Update rectangle preview
      if (rectPreviewRef.current) {
        rectPreviewRef.current.setBounds([startPointRef.current, e.latlng])
      }

      // Update circle preview
      if (circlePreviewRef.current) {
        circlePreviewRef.current.setLatLng(center)
        circlePreviewRef.current.setRadius(radius)
      }
    }

    const handleMouseUp = (e: L.LeafletMouseEvent) => {
      if (!isDrawingCircleRef.current || !startPointRef.current) return

      isDrawingCircleRef.current = false

      const { center, radius } = calcInscribedCircle(startPointRef.current, e.latlng)

      // Remove preview shapes
      if (circlePreviewRef.current) {
        map.removeLayer(circlePreviewRef.current)
        circlePreviewRef.current = null
      }
      if (rectPreviewRef.current) {
        map.removeLayer(rectPreviewRef.current)
        rectPreviewRef.current = null
      }

      // Only create circle if radius is meaningful (> 100m)
      if (radius < 100) {
        startPointRef.current = null
        return
      }

      // Remove previous drawn layer
      if (drawnLayerRef.current) {
        const oldLayer = drawnLayerRef.current as L.Circle | L.Polygon
        if (oldLayer.pm) {
          oldLayer.pm.disableLayerDrag()
        }
        map.removeLayer(drawnLayerRef.current)
      }

      // Create final circle
      const circle = L.circle(center, {
        radius,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(map)

      drawnLayerRef.current = circle

      // Enable drag on the circle
      if (circle.pm) {
        circle.pm.enableLayerDrag()
        circle.on('pm:dragend', () => {
          updateAreaFromLayer(circle)
        })
      }

      // Update area
      updateAreaFromLayer(circle)

      // Disable drawing mode
      setDrawingMode(null)
      startPointRef.current = null
    }

    map.on('mousedown', handleMouseDown)
    map.on('mousemove', handleMouseMove)
    map.on('mouseup', handleMouseUp)

    return () => {
      map.dragging.enable()
      map.off('mousedown', handleMouseDown)
      map.off('mousemove', handleMouseMove)
      map.off('mouseup', handleMouseUp)

      // Cleanup previews if exist
      if (circlePreviewRef.current) {
        map.removeLayer(circlePreviewRef.current)
        circlePreviewRef.current = null
      }
      if (rectPreviewRef.current) {
        map.removeLayer(rectPreviewRef.current)
        rectPreviewRef.current = null
      }
    }
  }, [map, drawingMode, updateAreaFromLayer, setDrawingMode])

  // Handle drawing creation
  useEffect(() => {
    if (!map) return

    const handleCreate = (e: { layer: L.Layer; shape: string }) => {
      // Remove previous drawn layer if exists
      if (drawnLayerRef.current) {
        // Disable drag on old layer
        if ((drawnLayerRef.current as L.Circle | L.Polygon).pm) {
          (drawnLayerRef.current as L.Circle | L.Polygon).pm.disableLayerDrag()
        }
        map.removeLayer(drawnLayerRef.current)
      }

      drawnLayerRef.current = e.layer

      // Enable drag mode on the new layer
      const layer = e.layer as L.Circle | L.Polygon
      if (layer.pm) {
        layer.pm.enableLayerDrag()

        // Listen for drag end to update stations
        layer.on('pm:dragend', () => {
          updateAreaFromLayer(layer)
        })
      }

      // Update area
      updateAreaFromLayer(e.layer)

      // Disable drawing mode after creation
      setDrawingMode(null)
    }

    map.on('pm:create', handleCreate)

    return () => {
      map.off('pm:create', handleCreate)
    }
  }, [map, updateAreaFromLayer, setDrawingMode])

  // Clear drawing when drawnArea is null
  useEffect(() => {
    if (!drawnArea && drawnLayerRef.current) {
      // Disable drag before removing
      const layer = drawnLayerRef.current as L.Circle | L.Polygon
      if (layer.pm) {
        layer.pm.disableLayerDrag()
      }
      map.removeLayer(drawnLayerRef.current)
      drawnLayerRef.current = null
    }
  }, [map, drawnArea])

  return null
}
