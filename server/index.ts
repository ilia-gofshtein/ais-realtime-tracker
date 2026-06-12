import http from 'node:http'
import { ServerMessageType } from '../shared/contracts/realtimeMessageTypes'
import { AisConnectionStatus } from '../shared/contracts/serverStatuses'
import { env } from './app/env'
import { logger } from './app/logger'
import { AisStreamClient } from './ais/AisStreamClient'
import { DEFAULT_BOUNDING_BOXES } from './config/boundingBoxes'
import { RealtimeServer } from './realtime/wsServer'
import { VesselRepository } from './vessels/VesselRepository'
import { VesselService } from './vessels/vesselService'

const httpServer = http.createServer()

const vesselRepository = new VesselRepository()
const vesselService = new VesselService(vesselRepository)

let realtimeServer: RealtimeServer

const aisStreamClient = new AisStreamClient({
    boundingBoxes: DEFAULT_BOUNDING_BOXES,
    vesselService,

    onVesselPosition: (vessel) => {
        realtimeServer.broadcast({
            type: ServerMessageType.VesselPosition,
            payload: vessel,
        })
    },

    onStatusChange: (status) => {
        realtimeServer.broadcast({
            type: ServerMessageType.AisStatus,
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
    logger.info('server', `listening on ws://localhost:${env.PORT}/ws`)
    logger.info('ais', AisConnectionStatus.WaitingForSubscription)
})
