import { WebSocket } from 'ws'
import type { Vessel } from '../../shared/contracts/vesselType'
import type { BoundingBox } from '../../shared/contracts/realtimeMessages'
import { AisConnectionStatus } from '../../shared/contracts/serverStatuses'
import { env } from '../app/env'
import { logger } from '../app/logger'
import type { VesselService } from '../vessels/vesselService'
import { normalizeAisMessage } from './aisNormalizer'
import type { RawAisMessage } from './aisTypes'

type AisStreamClientOptions = {
    boundingBoxes: BoundingBox[]
    vesselService: VesselService
    onVesselPosition: (vessel: Vessel) => void
    onStatusChange: (status: string) => void
}

export class AisStreamClient {
    private socket: WebSocket | null = null
    private reconnectTimer: NodeJS.Timeout | null = null
    private shouldReconnect = false
    private intentionalClose = false

    constructor(private readonly options: AisStreamClientOptions) {}

    connect(): void {
        if (this.socket && ([WebSocket.OPEN, WebSocket.CONNECTING] as unknown[]).includes(this.socket.readyState)) {
            return
        }

        this.shouldReconnect = true
        this.intentionalClose = false

        this.options.onStatusChange(AisConnectionStatus.Connecting)
        logger.info('ais', 'connecting to AISStream')

        const socket = new WebSocket('wss://stream.aisstream.io/v0/stream')
        this.socket = socket

        socket.on('open', () => {
            this.options.onStatusChange(AisConnectionStatus.Connected)

            logger.info('ais', 'connected to AISStream', {
                boundingBoxesCount: this.options.boundingBoxes.length,
            })

            socket.send(
                JSON.stringify({
                    APIKey: env.AISSTREAM_API_KEY,
                    BoundingBoxes: this.options.boundingBoxes,
                    FilterMessageTypes: ['PositionReport'],
                })
            )
        })

        socket.on('message', (buffer) => {
            try {
                const raw = JSON.parse(buffer.toString()) as RawAisMessage
                const vessel = normalizeAisMessage(raw)

                if (!vessel) {
                    return
                }

                this.options.vesselService.handlePositionUpdate(vessel)
                this.options.onVesselPosition(vessel)
            } catch (error) {
                logger.warn('ais', 'failed to parse AIS message', {
                    error: error instanceof Error ? error.message : String(error),
                })
            }
        })

        socket.on('close', () => {
            this.socket = null
            this.options.onStatusChange(AisConnectionStatus.Disconnected)

            logger.info('ais', 'disconnected from AISStream', {
                intentionalClose: this.intentionalClose,
                shouldReconnect: this.shouldReconnect,
            })

            if (!this.intentionalClose && this.shouldReconnect) {
                this.scheduleReconnect()
            }
        })

        socket.on('error', (error) => {
            this.options.onStatusChange(AisConnectionStatus.Error)

            logger.error('ais', 'AISStream WebSocket error', {
                error: error instanceof Error ? error.message : String(error),
            })
        })
    }

    reconnectWithBoundingBoxes(boundingBoxes: BoundingBox[]): void {
        logger.info('ais', 'reconnecting with new bounding boxes', {
            boundingBoxesCount: boundingBoxes.length,
        })

        this.options.boundingBoxes = boundingBoxes
        this.stop()
        this.connect()
    }

    stop(): void {
        this.shouldReconnect = false
        this.intentionalClose = true

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

        logger.info('ais', 'scheduling reconnect')

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null
            this.connect()
        }, 3000)
    }
}
