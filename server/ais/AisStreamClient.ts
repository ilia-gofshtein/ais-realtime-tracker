import { WebSocket } from 'ws'
import { env } from '../app/env'
import type { BoundingBox } from '../../shared/contracts/realtimeMessages'
import type { RawAisMessage } from './AisTypes'
import { normalizeAisMessage } from './aisNormalizer'
import type { VesselService } from '../vessels/VesselService'

type AisStreamClientOptions = {
    boundingBoxes: BoundingBox[]
    vesselService: VesselService
    onVesselPosition: () => void
    onStatusChange: (status: string) => void
}

export class AisStreamClient {
    private socket: WebSocket | null = null
    private reconnectTimer: NodeJS.Timeout | null = null
    private options: AisStreamClientOptions

    constructor(options: AisStreamClientOptions) {
        this.options = options
    }

    connect(): void {
        if (this.socket && ([WebSocket.OPEN, WebSocket.CONNECTING] as unknown[]).includes(this.socket.readyState)) {
            return
        }

        this.options.onStatusChange('connecting-to-aisstream')

        this.socket = new WebSocket('wss://stream.aisstream.io/v0/stream')

        this.socket.on('open', () => {
            this.options.onStatusChange('connected-to-aisstream')

            const subscription = {
                APIKey: env.AISSTREAM_API_KEY,
                BoundingBoxes: this.options.boundingBoxes,
                FilterMessageTypes: ['PositionReport'],
            }

            this.socket?.send(JSON.stringify(subscription))

            console.log('[AIS] connected and subscription sent')
        })

        this.socket.on('message', (buffer) => {
            try {
                const raw = JSON.parse(buffer.toString()) as RawAisMessage
                const vessel = normalizeAisMessage(raw)

                if (!vessel) {
                    return
                }

                this.options.vesselService.handlePositionUpdate(vessel)
                this.options.onVesselPosition()
            } catch (error) {
                console.error('[AIS] Failed to parse message', error)
            }
        })

        this.socket.on('close', () => {
            console.log('[AIS] disconnected')

            this.options.onStatusChange('disconnected-from-aisstream')
            this.scheduleReconnect()
        })

        this.socket.on('error', (error) => {
            console.error('[AIS] WebSocket error', error)
            this.options.onStatusChange('aisstream-error')
        })
    }

    reconnectWithBoundingBoxes(boundingBoxes: BoundingBox[]): void {
        this.options.boundingBoxes = boundingBoxes
        this.disconnect()
        this.connect()
    }

    disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }

        this.socket?.close()
        this.socket = null
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer) {
            return
        }

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null
            this.connect()
        }, 3000)
    }
}
