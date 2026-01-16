import { Shuffle, Ban, X, Trash2, Train, MapPin } from 'lucide-react'
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

  return (
    <div className="w-80 bg-white border-l flex flex-col h-full">
      {/* Selected Station */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Train className="h-5 w-5" />
          選択された駅
        </h2>

        {selectedStation ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{selectedStation.name}</CardTitle>
              <CardDescription>{selectedStation.operator}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 mb-4">
                {selectedStation.lines.map((line) => (
                  <span
                    key={line}
                    className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
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
                  className="flex-1"
                >
                  <Shuffle className="h-4 w-4 mr-1" />
                  再抽選
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => excludeStation(selectedStation.id)}
                  className="flex-1"
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

      {/* Excluded Stations */}
      <div className="flex-1 flex flex-col min-h-0 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm text-muted-foreground">
            除外リスト ({excludedStations.length})
          </h3>
          {excludedStations.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearExcludedStations}
              className="h-7 px-2 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              全削除
            </Button>
          )}
        </div>

        {excludedStations.length > 0 ? (
          <ScrollArea className="flex-1">
            <div className="space-y-1">
              {excludedStations.map((station) => (
                <div
                  key={station.id}
                  className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded text-sm"
                >
                  <span>{station.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeExcludedStation(station.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
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
  )
}
