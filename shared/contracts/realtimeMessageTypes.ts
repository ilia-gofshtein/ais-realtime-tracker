export const ServerMessageType = {
    AisStatus: 'ais-status',
    VesselPosition: 'vessel-position',
    VesselsSnapshot: 'vessels-snapshot',
} as const

export type ServerMessageType = (typeof ServerMessageType)[keyof typeof ServerMessageType]

export const ClientMessageType = {
    Subscribe: 'subscribe',
} as const

export type ClientMessageType = (typeof ClientMessageType)[keyof typeof ClientMessageType]
