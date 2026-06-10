import type { Vessel } from '../../shared/contracts/Vessel'
import { VesselRepository } from './VesselRepository'

export class VesselService {
    constructor(private readonly vesselRepository: VesselRepository) {}

    handlePositionUpdate(vessel: Vessel): Vessel {
        return this.vesselRepository.upsert(vessel)
    }

    getSnapshot(): Vessel[] {
        return this.vesselRepository.getAll()
    }

    get count(): number {
        return this.vesselRepository.count
    }
}
