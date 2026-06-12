import type { Vessel } from './vesselType'
import { ClientMessageType, ServerMessageType } from './realtimeMessageTypes'

export type BoundingBox = [[number, number], [number, number]]

export type ServerToClientMessage =
    | {
          type: typeof ServerMessageType.AisStatus
          payload: string
      }
    | {
          type: typeof ServerMessageType.VesselPosition
          payload: Vessel
      }
    | {
          type: typeof ServerMessageType.VesselsSnapshot
          payload: Vessel[]
      }

export type ClientToServerMessage = {
    type: typeof ClientMessageType.Subscribe
    boundingBoxes: BoundingBox[]
}
