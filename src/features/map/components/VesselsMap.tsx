import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../../app/RootStoreContext'
import { LocateMeButton } from './LocateMeButton'
import { MapOverlay } from './MapOverlay'
import { useInitialAisSubscription } from '../hooks/useInitialAisSubscription'
import { useMapInstance } from '../hooks/useMapInstance'
import { useUserLocationOnMap } from '../hooks/useUserLocationOnMap'
import { useVesselsMapSource } from '../hooks/useVesselsMapSource'
import '../styles/map.css'

export const VesselsMap = observer(() => {
    const rootStore = useRootStore()
    const { containerRef, mapRef } = useMapInstance()

    useVesselsMapSource({
        mapRef,
        vesselsStore: rootStore.vesselsStore,
    })

    useUserLocationOnMap({
        mapRef,
        userLocationStore: rootStore.userLocationStore,
    })

    useInitialAisSubscription({
        mapRef,
        userLocationStore: rootStore.userLocationStore,
        onBoundingBoxesReady: (boundingBoxes) => {
            rootStore.subscribeToAisBoundingBoxes(boundingBoxes)
        },
    })

    const centerOnUserLocation = (): void => {
        const map = mapRef.current
        const location = rootStore.userLocationStore.location

        if (!map || !location) {
            void rootStore.userLocationStore.requestCurrentLocation()
            return
        }

        map.flyTo({
            center: [location.lon, location.lat],
            zoom: Math.max(map.getZoom(), 13),
            essential: true,
        })
    }

    return (
        <div className="vessels-map-shell">
            <div ref={containerRef} className="vessels-map" />

            <MapOverlay />

            <LocateMeButton onLocate={centerOnUserLocation} />
        </div>
    )
})
