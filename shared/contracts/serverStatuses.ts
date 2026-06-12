export const AisConnectionStatus = {
    Idle: 'idle',
    WaitingForSubscription: 'waiting-for-subscription',
    Connecting: 'connecting-to-aisstream',
    Connected: 'connected-to-aisstream',
    Disconnected: 'disconnected-from-aisstream',
    Error: 'aisstream-error',
} as const

export type AisConnectionStatus = (typeof AisConnectionStatus)[keyof typeof AisConnectionStatus]

export const RealtimeConnectionStatus = {
    Connecting: 'connecting-to-local-proxy',
    Connected: 'connected-to-local-proxy',
    Disconnected: 'disconnected-from-local-proxy',
    Error: 'local-proxy-error',
} as const

export type RealtimeConnectionStatus = (typeof RealtimeConnectionStatus)[keyof typeof RealtimeConnectionStatus]
