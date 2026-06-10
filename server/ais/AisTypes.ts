export type RawAisMessage = {
    MessageType?: string

    MetaData?: {
        MMSI?: number | string
        ShipName?: string
        latitude?: number
        longitude?: number
        Latitude?: number
        Longitude?: number
        time_utc?: string
    }

    Message?: {
        PositionReport?: {
            UserID?: number | string
            Latitude?: number
            Longitude?: number
            Sog?: number
            Cog?: number
            TrueHeading?: number
        }
    }
}
