import type { Vessel } from '../../shared/contracts/Vessel'
import type { RawAisMessage } from './AisTypes'

function toNumber(value: unknown): number | null {
    const result = Number(value)

    if (Number.isNaN(result)) {
        return null
    }

    return result
}

function toStringValue(value: unknown): string | null {
    if (value === null || value === undefined) {
        return null
    }

    const result = String(value).trim()

    return result.length > 0 ? result : null
}

export function normalizeAisMessage(raw: RawAisMessage): Vessel | null {
    const position = raw.Message?.PositionReport
    const metadata = raw.MetaData

    if (!position) {
        return null
    }

    const mmsi = toStringValue(metadata?.MMSI ?? position.UserID)

    const lat = toNumber(position.Latitude ?? metadata?.Latitude ?? metadata?.latitude)
    const lon = toNumber(position.Longitude ?? metadata?.Longitude ?? metadata?.longitude)

    if (!mmsi || lat === null || lon === null) {
        return null
    }

    const shipName = metadata?.ShipName?.trim()

    return {
        mmsi,
        shipName: shipName || undefined,

        lat,
        lon,

        sog: toNumber(position.Sog),
        cog: toNumber(position.Cog),
        heading: toNumber(position.TrueHeading),

        timestamp: metadata?.time_utc ?? new Date().toISOString(),
    }
}
