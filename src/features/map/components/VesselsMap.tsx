import { observer } from 'mobx-react-lite'

import { useRootStore } from '../../../app/RootStoreContext'
import { CenterMapButton } from './CenterMapButton'
import { MapOverlay } from './MapOverlay'
import { AMSTERDAM_PRESET } from '../config/mapPresets'
import { useMapInstance } from '../hooks/useMapInstance'
import { useVesselsMapSource } from '../hooks/useVesselsMapSource'

import '../styles/map.css'

export const VesselsMap = observer(() => {
    const rootStore = useRootStore()
    const { containerRef, mapRef } = useMapInstance()

    useVesselsMapSource({
        mapRef,
        vesselsStore: rootStore.vesselsStore,
    })

    const centerOnAmsterdam = (): void => {
        const map = mapRef.current

        if (!map) {
            return
        }

        map.flyTo({
            center: AMSTERDAM_PRESET.center,
            zoom: AMSTERDAM_PRESET.zoom,
            essential: true,
        })
    }

    return (
        <div className="vessels-map-shell">
            <div ref={containerRef} className="vessels-map" />

            <MapOverlay />

            <CenterMapButton onClick={centerOnAmsterdam} />
        </div>
    )
})
