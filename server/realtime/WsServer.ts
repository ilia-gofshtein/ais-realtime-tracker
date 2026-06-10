import http from 'node:http'
import { WebSocketServer, WebSocket } from 'ws'
import type { ClientToServerMessage, ServerToClientMessage, BoundingBox } from '../../shared/contracts/realtimeMessages'
import type { VesselService } from '../vessels/VesselService'

type RealtimeServerOptions = {
    server: http.Server
    vesselService: VesselService
    onSubscribe: (boundingBoxes: BoundingBox[]) => void
}

export class RealtimeServer {
    private wss: WebSocketServer
    private clients = new Set<WebSocket>()

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

    broadcastVesselsSnapshot(): void {
        this.broadcast({
            type: 'vessels-snapshot',
            payload: this.options.vesselService.getSnapshot(),
        })
    }

    private handleConnection(socket: WebSocket): void {
        console.log('[Realtime] frontend client connected')

        this.clients.add(socket)

        this.send(socket, {
            type: 'ais-status',
            payload: 'connected-to-local-proxy',
        })

        this.send(socket, {
            type: 'vessels-snapshot',
            payload: this.options.vesselService.getSnapshot(),
        })

        socket.on('message', (buffer) => {
            try {
                const message = JSON.parse(buffer.toString()) as ClientToServerMessage
                this.handleClientMessage(message)
            } catch (error) {
                console.error('[Realtime] Bad client message', error)
            }
        })

        socket.on('close', () => {
            this.clients.delete(socket)
            console.log('[Realtime] frontend client disconnected')
        })
    }

    private handleClientMessage(message: ClientToServerMessage): void {
        if (message.type === 'subscribe') {
            this.options.onSubscribe(message.boundingBoxes)
        }
    }

    private send(socket: WebSocket, message: ServerToClientMessage): void {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message))
        }
    }
}
