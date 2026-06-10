import http from 'node:http'
import { env } from './app/env'
import { DEFAULT_BOUNDING_BOXES } from './config/boundingBoxes'
import { VesselRepository } from './vessels/vesselRepository'
import { VesselService } from './vessels/VesselService'
import { RealtimeServer } from './realtime/WsServer'
import { AisStreamClient } from './ais/AisStreamClient'

const httpServer = http.createServer()

const vesselRepository = new VesselRepository()
const vesselService = new VesselService(vesselRepository)

let realtimeServer: RealtimeServer

const aisStreamClient = new AisStreamClient({
    boundingBoxes: DEFAULT_BOUNDING_BOXES,
    vesselService,

    onVesselPosition: () => {
        realtimeServer.broadcastVesselsSnapshot()
    },

    onStatusChange: (status: string) => {
        realtimeServer.broadcast({
            type: 'ais-status',
            payload: status,
        })
    },
})

realtimeServer = new RealtimeServer({
    server: httpServer,
    vesselService,

    onSubscribe: (boundingBoxes) => {
        aisStreamClient.reconnectWithBoundingBoxes(boundingBoxes)
    },
})

httpServer.listen(env.PORT, () => {
    console.log(`[Server] listening on ws://localhost:${env.PORT}/ws`)

    aisStreamClient.connect()
})
