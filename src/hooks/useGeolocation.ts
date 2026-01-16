import { useState, useCallback } from 'react'

interface GeolocationState {
  position: [number, number] | null // [lat, lng]
  error: string | null
  isLoading: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isLoading: false,
  })

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
      }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          position: [position.coords.latitude, position.coords.longitude],
          error: null,
          isLoading: false,
        })
      },
      (error) => {
        let errorMessage = 'An unknown error occurred'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permission denied'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Request timeout'
            break
        }
        setState({
          position: null,
          error: errorMessage,
          isLoading: false,
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [])

  return {
    ...state,
    getCurrentPosition,
  }
}
