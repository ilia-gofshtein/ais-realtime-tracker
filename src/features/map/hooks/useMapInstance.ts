import { useEffect, useRef } from 'react'
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl'
import { MAP_STYLE } from '../config/mapStyle'

export const useMapInstance = () => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const mapRef = useRef<MapLibreMap | null>(null)

    useEffect(() => {
        if (!containerRef.current || mapRef.current) {
            return
        }

        const map = new maplibregl.Map({
            container: containerRef.current,
            style: MAP_STYLE,
            center: [4.6, 52.1],
            zoom: 7,
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
