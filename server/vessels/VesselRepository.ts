import type { Vessel } from '../../shared/contracts/Vessel'

export class VesselRepository {
    private vessels = new Map<string, Vessel>()

    upsert(vessel: Vessel): Vessel {
        this.vessels.set(vessel.mmsi, vessel)
        return vessel
    }

    getAll(): Vessel[] {
        return Array.from(this.vessels.values())
    }

    getByMmsi(mmsi: string): Vessel | undefined {
        return this.vessels.get(mmsi)
    }

    clear(): void {
        this.vessels.clear()
    }

    get count(): number {
        return this.vessels.size
    }
}
