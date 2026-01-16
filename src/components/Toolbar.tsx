import {
  Pentagon,
  Circle,
  Trash2,
  Train,
  Locate,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/appStore'
import { useGeolocation } from '@/hooks/useGeolocation'
import type { DrawingMode } from '@/types'

export function Toolbar() {
  const drawingMode = useAppStore((state) => state.drawingMode)
  const drawnArea = useAppStore((state) => state.drawnArea)
  const stationsInArea = useAppStore((state) => state.stationsInArea)
  const excludedStationIds = useAppStore((state) => state.excludedStationIds)
  const setDrawingMode = useAppStore((state) => state.setDrawingMode)
  const selectRandomStation = useAppStore((state) => state.selectRandomStation)
  const clearDrawing = useAppStore((state) => state.clearDrawing)
  const setMapCenter = useAppStore((state) => state.setMapCenter)

  const { getCurrentPosition, isLoading: isLocating } = useGeolocation()

  const handleDrawingMode = (mode: DrawingMode) => {
    if (drawingMode === mode) {
      setDrawingMode(null)
    } else {
      setDrawingMode(mode)
    }
  }

  const handleLocate = () => {
    getCurrentPosition()
    // We need to get the position and set map center
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter([position.coords.latitude, position.coords.longitude])
      },
      () => {
        // Error handled by useGeolocation
      }
    )
  }

  const availableStations = stationsInArea.filter(
    (s) => !excludedStationIds.includes(s.id)
  )
  const canSelectStation = drawnArea && availableStations.length > 0

  return (
    <div className="flex items-center gap-2 p-3 bg-white border-b shadow-sm">
      <div className="flex items-center gap-1">
        <Button
          variant={drawingMode === 'polygon' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleDrawingMode('polygon')}
          title="多角形で範囲を指定"
        >
          <Pentagon className="h-4 w-4 mr-1" />
          多角形
        </Button>
        <Button
          variant={drawingMode === 'circle' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleDrawingMode('circle')}
          title="円で範囲を指定"
        >
          <Circle className="h-4 w-4 mr-1" />
          円
        </Button>
      </div>

      <div className="w-px h-6 bg-gray-300" />

      <Button
        variant="outline"
        size="sm"
        onClick={clearDrawing}
        disabled={!drawnArea}
        title="描画をクリア"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        クリア
      </Button>

      <div className="w-px h-6 bg-gray-300" />

      <Button
        variant="default"
        size="sm"
        onClick={selectRandomStation}
        disabled={!canSelectStation}
        title="範囲内の駅をランダムに選択"
      >
        <Train className="h-4 w-4 mr-1" />
        駅を探す
      </Button>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={handleLocate}
        disabled={isLocating}
        title="現在地を取得"
      >
        {isLocating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Locate className="h-4 w-4" />
        )}
      </Button>

      {drawnArea && (
        <span className="text-sm text-muted-foreground">
          範囲内: {availableStations.length}駅
          {excludedStationIds.length > 0 &&
            ` (除外: ${stationsInArea.length - availableStations.length})`}
        </span>
      )}
    </div>
  )
}
