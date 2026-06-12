import type { FeatureCollection, Point } from 'geojson'
import type { Vessel } from '../../../../shared/contracts/vesselType'

export type VesselGeoJsonProperties = {
    mmsi: string
    shipName: string
    sog: number | null
    cog: number | null
    heading: number | null
    rotation: number
    timestamp: string
}

export type VesselsGeoJson = FeatureCollection<Point, VesselGeoJsonProperties>

export function createVesselsGeoJson(vessels: Vessel[]): VesselsGeoJson {
    return {
        type: 'FeatureCollection',
        features: vessels.map((vessel) => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [vessel.lon, vessel.lat],
            },
            properties: {
                mmsi: vessel.mmsi,
                shipName: vessel.shipName ?? 'Unknown vessel',
                sog: vessel.sog,
                cog: vessel.cog,
                heading: vessel.heading,
                rotation: vessel.heading ?? vessel.cog ?? 0,
                timestamp: vessel.timestamp,
            },
        })),
    }
}
