import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import type { Vessel } from '../../shared/contracts/vessel'
import type { ServerToClientMessage } from '../../shared/contracts/realtimeMessages'
import { REALTIME_WS_URL } from '../../shared/config/realtime'

export class VesselsStore {
    vessels = new Map<string, Vessel>()
    status = 'idle'
    error: string | null = null

    private socket: WebSocket | null = null

    constructor() {
        makeObservable<this, 'handleServerMessage' | 'setError' | 'resetSocket'>(this, {
            vessels: observable,
            status: observable,
            error: observable,

            connect: action,
            disconnect: action,
            upsertVessel: action,
            setVesselsSnapshot: action,
            setStatus: action,
            clear: action,

            handleServerMessage: action,
            setError: action,
            resetSocket: action,

            vesselsList: computed,
            vesselsCount: computed,
            hasVessels: computed,
        })
    }

    connect(): void {
        if (this.socket) {
            return
        }

        this.setStatus('connecting-to-local-proxy')
        this.setError(null)

        const socket = new WebSocket(REALTIME_WS_URL)

        socket.onopen = () => {
            runInAction(() => {
                this.setStatus('connected-to-local-proxy')
            })
        }

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as ServerToClientMessage

                runInAction(() => {
                    this.handleServerMessage(message)
                })
            } catch (error) {
                runInAction(() => {
                    this.setError('Failed to parse server message')
                })

                console.error('[VesselsStore] Failed to parse message', error)
            }
        }

        socket.onerror = () => {
            runInAction(() => {
                this.setStatus('local-proxy-error')
                this.setError('WebSocket error')
            })
        }

        socket.onclose = () => {
            runInAction(() => {
                this.setStatus('disconnected-from-local-proxy')
                this.resetSocket()
            })
        }

        this.socket = socket
    }

    disconnect(): void {
        this.socket?.close()
        this.resetSocket()
        this.setStatus('disconnected')
    }

    upsertVessel(vessel: Vessel): void {
        this.vessels.set(vessel.mmsi, vessel)
    }

    setVesselsSnapshot(vessels: Vessel[]): void {
        this.vessels.clear()

        for (const vessel of vessels) {
            this.vessels.set(vessel.mmsi, vessel)
        }
    }

    setStatus(status: string): void {
        this.status = status
    }

    clear(): void {
        this.vessels.clear()
        this.error = null
    }

    get vesselsList(): Vessel[] {
        return Array.from(this.vessels.values()).sort((a, b) => {
            return b.timestamp.localeCompare(a.timestamp)
        })
    }

    get vesselsCount(): number {
        return this.vessels.size
    }

    get hasVessels(): boolean {
        return this.vessels.size > 0
    }

    private handleServerMessage(message: ServerToClientMessage): void {
        switch (message.type) {
            case 'ais-status': {
                this.setStatus(message.payload)
                break
            }

            case 'vessel-position': {
                this.upsertVessel(message.payload)
                break
            }

            case 'vessels-snapshot': {
                this.setVesselsSnapshot(message.payload)
                break
            }

            default: {
                this.setError('Unknown server message')
            }
        }
    }

    private setError(error: string | null): void {
        this.error = error
    }

    private resetSocket(): void {
        this.socket = null
    }
}

export const vesselsStore = new VesselsStore()
