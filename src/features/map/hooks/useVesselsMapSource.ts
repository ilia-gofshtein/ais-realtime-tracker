import { useEffect } from 'react'
import { reaction } from 'mobx'
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl'
import type { VesselsStore } from '../../../stores/VesselsStore'
import { createVesselsGeoJson } from '../lib/createVesselsGeoJson'
import { createVesselTriangleImageData } from '../lib/createVesselTriangleImage'

const VESSELS_SOURCE_ID = 'vessels'
const VESSELS_LAYER_ID = 'vessels-layer'
const VESSEL_ICON_ID = 'vessel-triangle'

type UseVesselsMapSourceOptions = {
    mapRef: React.MutableRefObject<MapLibreMap | null>
    vesselsStore: VesselsStore
}

export const useVesselsMapSource = ({ mapRef, vesselsStore }: UseVesselsMapSourceOptions): void => {
    useEffect(() => {
        const map = mapRef.current

        if (!map) {
            return
        }

        let frameId: number | null = null

        const setupSourceAndLayer = (): void => {
            if (!map.hasImage(VESSEL_ICON_ID)) {
                map.addImage(VESSEL_ICON_ID, createVesselTriangleImageData('#38bdf8', 128), {
                    pixelRatio: 2,
                })
            }

            if (!map.getSource(VESSELS_SOURCE_ID)) {
                map.addSource(VESSELS_SOURCE_ID, {
                    type: 'geojson',
                    data: createVesselsGeoJson(vesselsStore.vesselsList),
                })
            }

            if (!map.getLayer(VESSELS_LAYER_ID)) {
                map.addLayer({
                    id: VESSELS_LAYER_ID,
                    type: 'symbol',
                    source: VESSELS_SOURCE_ID,
                    layout: {
                        'icon-image': VESSEL_ICON_ID,
                        'icon-size': ['interpolate', ['linear'], ['zoom'], 6, 0.18, 8, 0.25, 10, 0.35, 12, 0.5],
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true,
                        'icon-rotate': ['get', 'rotation'],
                        'icon-rotation-alignment': 'map',
                    },
                })
            }
        }

        const updateSource = (): void => {
            const source = map.getSource(VESSELS_SOURCE_ID) as GeoJSONSource | undefined

            if (!source) {
                return
            }

            source.setData(createVesselsGeoJson(vesselsStore.vesselsList))
        }

        const scheduleUpdate = (): void => {
            if (frameId !== null) {
                return
            }

            frameId = window.requestAnimationFrame(() => {
                frameId = null
                updateSource()
            })
        }

        if (map.isStyleLoaded()) {
            setupSourceAndLayer()
        } else {
            map.once('load', setupSourceAndLayer)
        }

        const disposeReaction = reaction(
            () => vesselsStore.vesselsList,
            () => {
                scheduleUpdate()
            }
        )

        return () => {
            disposeReaction()

            if (frameId !== null) {
                window.cancelAnimationFrame(frameId)
            }
        }
    }, [mapRef, vesselsStore])
}
