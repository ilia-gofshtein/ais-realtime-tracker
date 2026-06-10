import type { Vessel } from './Vessel'

export type BoundingBox = [[number, number], [number, number]]

export type ServerToClientMessage =
    | {
          type: 'ais-status'
          payload: string
      }
    | {
          type: 'vessel-position'
          payload: Vessel
      }
    | {
          type: 'vessels-snapshot'
          payload: Vessel[]
      }

export type ClientToServerMessage = {
    type: 'subscribe'
    boundingBoxes: BoundingBox[]
}
