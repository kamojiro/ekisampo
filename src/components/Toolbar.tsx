import {
  Pentagon,
  Circle,
  Trash2,
  Train,
  Locate,
  Loader2,
  Pencil,
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
    <div className="flex items-center gap-2 p-3 bg-white border-b shadow-sm flex-wrap">
      {/* Drawing mode group */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <div className="flex items-center gap-1 px-2 text-muted-foreground">
          <Pencil className="h-3.5 w-3.5" />
          <span className="text-xs font-medium hidden sm:inline">描画</span>
        </div>
        <Button
          variant={drawingMode === 'polygon' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleDrawingMode('polygon')}
          title="多角形で範囲を指定"
          className="btn-hover-scale h-8"
        >
          <Pentagon className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">多角形</span>
        </Button>
        <Button
          variant={drawingMode === 'circle' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleDrawingMode('circle')}
          title="円で範囲を指定"
          className="btn-hover-scale h-8"
        >
          <Circle className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">円</span>
        </Button>
      </div>

      {/* Clear button */}
      <Button
        variant="outline"
        size="sm"
        onClick={clearDrawing}
        disabled={!drawnArea}
        title="描画をクリア"
        className="btn-hover-scale h-8"
      >
        <Trash2 className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">クリア</span>
      </Button>

      <div className="w-px h-6 bg-gray-300 hidden sm:block" />

      {/* Main action button */}
      <Button
        variant="default"
        size="sm"
        onClick={selectRandomStation}
        disabled={!canSelectStation}
        title="範囲内の駅をランダムに選択"
        className="btn-hover-scale bg-blue-600 hover:bg-blue-700 h-9 px-4"
      >
        <Train className="h-4 w-4 mr-1.5" />
        駅を探す
      </Button>

      <div className="flex-1" />

      {/* Status and location */}
      <div className="flex items-center gap-2">
        {drawnArea && (
          <div className="flex items-center gap-1.5 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
            <span className="font-medium">{availableStations.length}</span>
            <span className="text-blue-600">駅</span>
            {excludedStationIds.length > 0 && (
              <span className="text-blue-400 text-xs">
                (除外: {stationsInArea.length - availableStations.length})
              </span>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLocate}
          disabled={isLocating}
          title="現在地を取得"
          className="btn-hover-scale h-9 w-9 p-0"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Locate className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
