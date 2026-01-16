import { Loader2 } from 'lucide-react'
import { MapContainer } from '@/components/Map/MapContainer'
import { Toolbar } from '@/components/Toolbar'
import { ResultPanel } from '@/components/ResultPanel'
import { useStations } from '@/hooks/useStations'

function App() {
  const { isLoading, error } = useStations()

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-muted-foreground">駅データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-500">
          <p className="font-semibold">エラーが発生しました</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      <Toolbar />
      <div className="flex-1 flex min-h-0">
        <div className="flex-1">
          <MapContainer />
        </div>
        <ResultPanel />
      </div>
    </div>
  )
}

export default App
