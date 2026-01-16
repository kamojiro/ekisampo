import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Station, DrawingMode, DrawnArea } from '@/types'

interface AppState {
  // Map state
  mapCenter: [number, number]
  mapZoom: number

  // Drawing state
  drawingMode: DrawingMode
  drawnArea: DrawnArea | null

  // Station data
  stations: Station[]
  stationsInArea: Station[]
  selectedStation: Station | null
  excludedStationIds: string[]

  // Loading state
  isLoading: boolean

  // Actions
  setMapCenter: (center: [number, number]) => void
  setMapZoom: (zoom: number) => void
  setDrawingMode: (mode: DrawingMode) => void
  setDrawnArea: (area: DrawnArea | null) => void
  setStations: (stations: Station[]) => void
  setStationsInArea: (stations: Station[]) => void
  selectRandomStation: () => void
  setSelectedStation: (station: Station | null) => void
  excludeStation: (id: string) => void
  removeExcludedStation: (id: string) => void
  clearExcludedStations: () => void
  setIsLoading: (loading: boolean) => void
  clearDrawing: () => void
}

// Default center is Tokyo Station
const DEFAULT_CENTER: [number, number] = [35.6812, 139.7671]
const DEFAULT_ZOOM = 13

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      mapCenter: DEFAULT_CENTER,
      mapZoom: DEFAULT_ZOOM,
      drawingMode: null,
      drawnArea: null,
      stations: [],
      stationsInArea: [],
      selectedStation: null,
      excludedStationIds: [],
      isLoading: false,

      // Actions
      setMapCenter: (center) => set({ mapCenter: center }),
      setMapZoom: (zoom) => set({ mapZoom: zoom }),
      setDrawingMode: (mode) => set({ drawingMode: mode }),
      setDrawnArea: (area) => set({ drawnArea: area }),
      setStations: (stations) => set({ stations }),
      setStationsInArea: (stations) => set({ stationsInArea: stations }),

      selectRandomStation: () => {
        const { stationsInArea, excludedStationIds } = get()
        const availableStations = stationsInArea.filter(
          (s) => !excludedStationIds.includes(s.id)
        )

        if (availableStations.length === 0) {
          set({ selectedStation: null })
          return
        }

        const randomIndex = Math.floor(Math.random() * availableStations.length)
        set({ selectedStation: availableStations[randomIndex] })
      },

      setSelectedStation: (station) => set({ selectedStation: station }),

      excludeStation: (id) =>
        set((state) => ({
          excludedStationIds: [...state.excludedStationIds, id],
          selectedStation:
            state.selectedStation?.id === id ? null : state.selectedStation,
        })),

      removeExcludedStation: (id) =>
        set((state) => ({
          excludedStationIds: state.excludedStationIds.filter((i) => i !== id),
        })),

      clearExcludedStations: () => set({ excludedStationIds: [] }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      clearDrawing: () =>
        set({
          drawnArea: null,
          stationsInArea: [],
          selectedStation: null,
          drawingMode: null,
        }),
    }),
    {
      name: 'ekisampo-storage',
      partialize: (state) => ({
        excludedStationIds: state.excludedStationIds,
      }),
    }
  )
)
