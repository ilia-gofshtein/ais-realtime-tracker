import type { BoundingBox } from '../../../../shared/contracts/realtimeMessages'

export type MapPreset = {
    label: string
    center: [number, number] // [lon, lat] for MapLibre
    zoom: number
    boundingBoxes: BoundingBox[]
}

export const AMSTERDAM_PRESET: MapPreset = {
    label: 'Amsterdam',
    center: [4.9, 52.37],
    zoom: 11,
    boundingBoxes: [
        [
            [52.2, 4.4],
            [52.6, 5.1],
        ],
    ],
}
