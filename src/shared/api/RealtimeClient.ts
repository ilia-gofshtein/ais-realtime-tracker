import type {
    BoundingBox,
    ClientToServerMessage,
    ServerToClientMessage,
} from '../../../shared/contracts/realtimeMessages'
import { ClientMessageType } from '../../../shared/contracts/realtimeMessageTypes'
import { RealtimeConnectionStatus } from '../../../shared/contracts/serverStatuses'

type RealtimeClientOptions = {
    url: string
    onMessage: (message: ServerToClientMessage) => void
    onStatusChange?: (status: string) => void
    onError?: (error: Error) => void
}

export class RealtimeClient {
    private socket: WebSocket | null = null

    private latestSubscriptionMessage: ClientToServerMessage | null = null
    private isManualDisconnect = false
    private readonly options: RealtimeClientOptions

    constructor(options: RealtimeClientOptions) {
        this.options = options
    }

    connect(): void {
        if (this.socket && ([WebSocket.OPEN, WebSocket.CONNECTING] as unknown[]).includes(this.socket.readyState)) {
            return
        }

        this.isManualDisconnect = false

        this.options.onStatusChange?.(RealtimeConnectionStatus.Connecting)

        const socket = new WebSocket(this.options.url)
        this.socket = socket

        socket.onopen = () => {
            if (this.socket !== socket) {
                return
            }

            this.options.onStatusChange?.(RealtimeConnectionStatus.Connected)
            this.flushLatestSubscription()
        }

        socket.onmessage = (event) => {
            if (this.socket !== socket) {
                return
            }

            try {
                const message = JSON.parse(event.data) as ServerToClientMessage
                this.options.onMessage(message)
            } catch (error) {
                this.options.onError?.(error instanceof Error ? error : new Error('Failed to parse realtime message'))
            }
        }

        socket.onerror = () => {
            if (this.socket !== socket) {
                return
            }

            this.options.onStatusChange?.(RealtimeConnectionStatus.Error)
        }

        socket.onclose = () => {
            if (this.socket !== socket) {
                return
            }

            this.socket = null

            if (!this.isManualDisconnect) {
                this.options.onStatusChange?.(RealtimeConnectionStatus.Disconnected)
            }
        }
    }

    disconnect(): void {
        this.isManualDisconnect = true

        const socket = this.socket
        this.socket = null

        if (socket && ([WebSocket.OPEN, WebSocket.CONNECTING] as unknown[]).includes(socket.readyState)) {
            socket.close()
        }

        this.options.onStatusChange?.(RealtimeConnectionStatus.Disconnected)
    }

    subscribeByBoundingBoxes(boundingBoxes: BoundingBox[]): void {
        this.latestSubscriptionMessage = {
            type: ClientMessageType.Subscribe,
            boundingBoxes,
        }

        this.sendLatestSubscriptionIfConnected()
    }

    private flushLatestSubscription(): void {
        this.sendLatestSubscriptionIfConnected()
    }

    private sendLatestSubscriptionIfConnected(): void {
        if (!this.latestSubscriptionMessage) {
            return
        }

        this.send(this.latestSubscriptionMessage)
    }

    private send(message: ClientToServerMessage): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            return
        }

        this.socket.send(JSON.stringify(message))
    }
}
