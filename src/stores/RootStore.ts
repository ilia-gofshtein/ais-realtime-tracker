import { runInAction } from 'mobx'
import type { BoundingBox } from '../../shared/contracts/realtimeMessages'
import { RealtimeClient } from '../shared/api/RealtimeClient'
import { REALTIME_WS_URL } from '../../shared/config/realtime'
import { UserLocationStore } from './UserLocationStore'
import { VesselsStore } from './VesselsStore'

export class RootStore {
    readonly vesselsStore: VesselsStore
    readonly userLocationStore: UserLocationStore
    readonly realtimeClient: RealtimeClient

    constructor() {
        this.vesselsStore = new VesselsStore()
        this.userLocationStore = new UserLocationStore()

        this.realtimeClient = new RealtimeClient({
            url: REALTIME_WS_URL,

            onMessage: (message) => {
                runInAction(() => {
                    this.vesselsStore.handleRealtimeMessage(message)
                })
            },

            onStatusChange: (status) => {
                runInAction(() => {
                    this.vesselsStore.setStatus(status)
                })
            },

            onError: (error) => {
                runInAction(() => {
                    this.vesselsStore.setError(error.message)
                })
            },
        })
    }

    start(): void {
        this.realtimeClient.connect()
    }

    stop(): void {
        this.realtimeClient.disconnect()
    }

    requestUserLocation(): Promise<unknown> {
        return this.userLocationStore.requestCurrentLocation()
    }

    subscribeToAisBoundingBoxes(boundingBoxes: BoundingBox[]): void {
        console.log('Subscribing to AIS with bounding boxes:', boundingBoxes)
        this.realtimeClient.subscribeByBoundingBoxes(boundingBoxes)
    }
}
