import type { BoundingBox } from '../../shared/contracts/realtimeMessages'

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value)
}

export function isValidBoundingBox(value: unknown): value is BoundingBox {
    if (!Array.isArray(value) || value.length !== 2) {
        return false
    }

    const [southWest, northEast] = value

    if (!Array.isArray(southWest) || !Array.isArray(northEast)) {
        return false
    }

    if (southWest.length !== 2 || northEast.length !== 2) {
        return false
    }

    const [southLat, westLon] = southWest
    const [northLat, eastLon] = northEast

    if (
        !isFiniteNumber(southLat) ||
        !isFiniteNumber(westLon) ||
        !isFiniteNumber(northLat) ||
        !isFiniteNumber(eastLon)
    ) {
        return false
    }

    if (southLat < -90 || southLat > 90) {
        return false
    }

    if (northLat < -90 || northLat > 90) {
        return false
    }

    if (westLon < -180 || westLon > 180) {
        return false
    }

    if (eastLon < -180 || eastLon > 180) {
        return false
    }

    if (southLat >= northLat) {
        return false
    }

    if (westLon >= eastLon) {
        return false
    }

    return true
}
