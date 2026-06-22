import http from 'node:http'
import { WebSocket, WebSocketServer } from 'ws'
import { ClientMessageType } from '../../shared/contracts/realtimeMessageTypes'
import { ServerMessageType } from '../../shared/contracts/realtimeMessageTypes'
import type { BoundingBox, ClientToServerMessage, ServerToClientMessage } from '../../shared/contracts/realtimeMessages'
import type { VesselService } from '../vessels/vesselService'
import { logger } from '../app/logger'
import { isValidBoundingBox } from './isValidBoundingBox'

type RealtimeServerOptions = {
    server: http.Server
    vesselService: VesselService
    onSubscribe: (boundingBoxes: BoundingBox[]) => void
}

export class RealtimeServer {
    private readonly wss: WebSocketServer
    private readonly clients = new Set<WebSocket>()

    constructor(private readonly options: RealtimeServerOptions) {
        this.wss = new WebSocketServer({
            server: options.server,
            path: '/ws',
        })

        this.wss.on('connection', (socket) => {
            this.handleConnection(socket)
        })
    }

    broadcast(message: ServerToClientMessage): void {
        const json = JSON.stringify(message)

        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(json)
            }
        }
    }

    private handleConnection(socket: WebSocket): void {
        this.clients.add(socket)

        logger.info('realtime', 'frontend client connected', {
            clientsCount: this.clients.size,
        })

        this.send(socket, {
            type: ServerMessageType.AisStatus,
            payload: 'connected-to-local-proxy',
        })

        this.send(socket, {
            type: ServerMessageType.VesselsSnapshot,
            payload: this.options.vesselService.getSnapshot(),
        })

        socket.on('message', (buffer) => {
            try {
                const message = JSON.parse(buffer.toString()) as ClientToServerMessage
                this.handleClientMessage(message)
            } catch (error) {
                logger.warn('realtime', 'bad client message', {
                    error: error instanceof Error ? error.message : String(error),
                })
            }
        })

        socket.on('close', () => {
            this.clients.delete(socket)

            logger.info('realtime', 'frontend client disconnected', {
                clientsCount: this.clients.size,
            })
        })
    }

    private handleClientMessage(message: ClientToServerMessage): void {
        if (message.type !== ClientMessageType.Subscribe) {
            logger.warn('realtime', 'unknown client message type')
            return
        }
        logger.info('realtime', JSON.stringify(message.boundingBoxes))
        const validBoundingBoxes = message.boundingBoxes.filter(isValidBoundingBox)

        if (validBoundingBoxes.length === 0) {
            logger.warn('realtime', 'subscription ignored: no valid bounding boxes')
            return
        }

        logger.info('realtime', 'subscription received', {
            boundingBoxesCount: validBoundingBoxes.length,
        })

        this.options.onSubscribe(validBoundingBoxes)
    }

    private send(socket: WebSocket, message: ServerToClientMessage): void {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message))
        }
    }
}
