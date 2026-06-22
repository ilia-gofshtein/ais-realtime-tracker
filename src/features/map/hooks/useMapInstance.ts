import { useEffect, useRef } from 'react'
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl'

import { MAP_STYLE } from '../config/mapStyle'
import { AMSTERDAM_PRESET } from '../config/mapPresets'

export function useMapInstance() {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const mapRef = useRef<MapLibreMap | null>(null)

    useEffect(() => {
        if (!containerRef.current || mapRef.current) {
            return
        }

        const map = new maplibregl.Map({
            container: containerRef.current,
            style: MAP_STYLE,
            center: AMSTERDAM_PRESET.center,
            zoom: AMSTERDAM_PRESET.zoom,
        })

        map.addControl(new maplibregl.NavigationControl(), 'top-right')

        mapRef.current = map

        return () => {
            mapRef.current = null
            map.remove()
        }
    }, [])

    return {
        containerRef,
        mapRef,
    }
}
