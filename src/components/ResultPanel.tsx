import { useState } from 'react'
import { Shuffle, Ban, X, Trash2, Train, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/stores/appStore'

export function ResultPanel() {
  const [isExcludedListOpen, setIsExcludedListOpen] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const selectedStation = useAppStore((state) => state.selectedStation)
  const stationsInArea = useAppStore((state) => state.stationsInArea)
  const excludedStationIds = useAppStore((state) => state.excludedStationIds)
  const selectRandomStation = useAppStore((state) => state.selectRandomStation)
  const excludeStation = useAppStore((state) => state.excludeStation)
  const removeExcludedStation = useAppStore(
    (state) => state.removeExcludedStation
  )
  const clearExcludedStations = useAppStore(
    (state) => state.clearExcludedStations
  )
  const stations = useAppStore((state) => state.stations)

  const availableStations = stationsInArea.filter(
    (s) => !excludedStationIds.includes(s.id)
  )

  const excludedStations = stations.filter((s) =>
    excludedStationIds.includes(s.id)
  )

  const handleRemoveExcluded = (id: string) => {
    setRemovingId(id)
    setTimeout(() => {
      removeExcludedStation(id)
      setRemovingId(null)
    }, 200)
  }

  return (
    <div className="w-80 bg-white border-l flex flex-col h-full md:relative md:w-80 max-md:mobile-bottom-sheet max-md:animate-slide-in-up">
      {/* Mobile handle */}
      <div className="md:hidden mobile-bottom-sheet-handle" />

      {/* Selected Station */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Train className="h-5 w-5 text-blue-500" />
          選択された駅
        </h2>

        {selectedStation ? (
          <Card className="station-card-gradient shadow-lg animate-pulse-ring">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-blue-900">
                {selectedStation.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {selectedStation.operator}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedStation.lines.map((line, index) => (
                  <span
                    key={line}
                    className={`line-badge line-badge-${index % 6}`}
                  >
                    {line}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={selectRandomStation}
                  disabled={availableStations.length <= 1}
                  className="flex-1 btn-hover-scale"
                >
                  <Shuffle className="h-4 w-4 mr-1" />
                  再抽選
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => excludeStation(selectedStation.id)}
                  className="flex-1 btn-hover-scale"
                >
                  <Ban className="h-4 w-4 mr-1" />
                  除外
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">
              地図上で範囲を指定して
              <br />
              「駅を探す」をクリックしてください
            </p>
          </div>
        )}
      </div>

      {/* Excluded Stations - Collapsible */}
      <div className="flex-1 flex flex-col min-h-0 p-4">
        <button
          onClick={() => setIsExcludedListOpen(!isExcludedListOpen)}
          className="flex items-center justify-between mb-2 w-full text-left hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
        >
          <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
            除外リスト
            {excludedStations.length > 0 && (
              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {excludedStations.length}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {excludedStations.length > 0 && isExcludedListOpen && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  clearExcludedStations()
                }}
                className="h-7 px-2 text-xs btn-hover-scale"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                全削除
              </Button>
            )}
            {isExcludedListOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        <div
          className={`collapsible-content ${isExcludedListOpen ? 'expanded' : 'collapsed'}`}
        >
          {excludedStations.length > 0 ? (
            <ScrollArea className="flex-1 max-h-64">
              <div className="space-y-1">
                {excludedStations.map((station) => (
                  <div
                    key={station.id}
                    className={`flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm transition-all ${
                      removingId === station.id ? 'animate-slide-out-right' : ''
                    }`}
                  >
                    <span className="font-medium">{station.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveExcluded(station.id)}
                      className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 btn-hover-scale"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              除外された駅はありません
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
