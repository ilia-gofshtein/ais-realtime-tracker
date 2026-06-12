import type { Map as MapLibreMap } from 'maplibre-gl'
import type { BoundingBox } from '../../../../shared/contracts/realtimeMessages'

// IMPORTANT:
//
// MapLibre / GeoJSON:
// [lon, lat]
//      BUT!
// AISStream BoundingBox:
// [[southLat, westLon], [northLat, eastLon]]

export function getMapBoundingBox(map: MapLibreMap): BoundingBox {
    const bounds = map.getBounds()

    return [
        [bounds.getSouth(), bounds.getWest()],
        [bounds.getNorth(), bounds.getEast()],
    ]
}
