export type Vessel = {
    mmsi: string
    shipName?: string

    lat: number
    lon: number

    sog: number | null
    cog: number | null
    heading: number | null

    timestamp: string
}
