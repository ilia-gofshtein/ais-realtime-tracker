import { action, computed, makeObservable, observable } from 'mobx'
import type { ServerToClientMessage } from '../../shared/contracts/realtimeMessages'
import { ServerMessageType } from '../../shared/contracts/realtimeMessageTypes'
import type { Vessel } from '../../shared/contracts/vesselType'

export class VesselsStore {
    vessels = new Map<string, Vessel>()
    status = 'idle'
    error: string | null = null

    constructor() {
        makeObservable(this, {
            vessels: observable,
            status: observable,
            error: observable,

            handleRealtimeMessage: action,
            upsertVessel: action,
            setVesselsSnapshot: action,
            setStatus: action,
            setError: action,
            clear: action,

            vesselsList: computed,
            vesselsCount: computed,
            hasVessels: computed,
        })
    }

    handleRealtimeMessage(message: ServerToClientMessage): void {
        switch (message.type) {
            case ServerMessageType.AisStatus:
                this.setStatus(message.payload)
                return

            case ServerMessageType.VesselPosition:
                this.upsertVessel(message.payload)
                return

            case ServerMessageType.VesselsSnapshot:
                this.setVesselsSnapshot(message.payload)
                return

            default:
                this.setError('Unknown realtime message')
        }
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

    setError(error: string | null): void {
        this.error = error
    }

    clear(): void {
        this.vessels.clear()
        this.error = null
    }

    get vesselsList(): Vessel[] {
        return Array.from(this.vessels.values()).sort((a, b) => {
            const nameA = a.shipName?.trim() || 'Unknown vessel'
            const nameB = b.shipName?.trim() || 'Unknown vessel'

            const nameCompare = nameA.localeCompare(nameB, undefined, {
                sensitivity: 'base',
                numeric: true,
            })

            if (nameCompare !== 0) {
                return nameCompare
            }

            return a.mmsi.localeCompare(b.mmsi)
        })
    }

    get vesselsCount(): number {
        return this.vessels.size
    }

    get hasVessels(): boolean {
        return this.vessels.size > 0
    }
}
