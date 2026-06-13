import { useEffect, useRef } from 'react'
import { reaction, toJS } from 'mobx'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { BoundingBox } from '../../../../shared/contracts/realtimeMessages'
import type { UserLocationStore } from '../../../stores/UserLocationStore'
import { getMapBoundingBox } from '../lib/getMapBoundingBox'

type UseInitialAisSubscriptionOptions = {
    mapRef: React.RefObject<MapLibreMap | null>
    userLocationStore: UserLocationStore
    onBoundingBoxesReady: (boundingBoxes: BoundingBox[]) => void
}

export const useInitialAisSubscription = ({
    mapRef,
    userLocationStore,
    onBoundingBoxesReady,
}: UseInitialAisSubscriptionOptions): void => {
    const hasSubscribedRef = useRef(false)

    useEffect(() => {
        const disposeReaction = reaction(
            () => userLocationStore.location,
            (location) => {
                const map = mapRef.current
                if (!map || !location || hasSubscribedRef.current) {
                    return
                }

                hasSubscribedRef.current = true

                map.flyTo({
                    center: [location.lon, location.lat],
                    zoom: 11,
                    essential: true,
                })

                map.once('moveend', () => {
                    onBoundingBoxesReady([getMapBoundingBox(map)])
                })
            }
        )

        return () => {
            disposeReaction()
        }
    }, [mapRef, userLocationStore, onBoundingBoxesReady])
}
