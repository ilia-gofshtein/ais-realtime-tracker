import type { BoundingBox } from '../../shared/contracts/realtimeMessages'

// format:
//     [southLat, westLon],
//     [northLat, eastLon]

export const DEFAULT_BOUNDING_BOXES: BoundingBox[] = [
    [
        [51.7, 3.3],
        [52.7, 5.4],
    ],
]
