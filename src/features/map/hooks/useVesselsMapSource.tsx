import { useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { reaction } from 'mobx'
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap, type MapLayerMouseEvent } from 'maplibre-gl'
import type { VesselsStore } from '../../../stores/VesselsStore'
import { createVesselsGeoJson } from '../lib/createVesselsGeoJson'
import { createVesselTriangleImage } from '../lib/createVesselTriangleImage'
import { VesselPopup } from '../components/VesselPopup'

const VESSELS_SOURCE_ID = 'vessels'
const VESSELS_LAYER_ID = 'vessels-layer'
const VESSEL_ICON_ID = 'vessel-triangle'

type UseVesselsMapSourceOptions = {
    mapRef: React.RefObject<MapLibreMap | null>
    vesselsStore: VesselsStore
}

type VesselPopupProperties = {
    mmsi?: string
    shipName?: string
    sog?: number | string | null
    cog?: number | string | null
    heading?: number | string | null
    timestamp?: string
}

function formatNullableValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
        return '—'
    }

    return String(value)
}

function formatTime(value: unknown): string {
    if (typeof value !== 'string') {
        return '—'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return date.toLocaleString()
}

export function useVesselsMapSource({ mapRef, vesselsStore }: UseVesselsMapSourceOptions): void {
    useEffect(() => {
        const map = mapRef.current

        if (!map) {
            return
        }

        let frameId: number | null = null
        let popup: maplibregl.Popup | null = null
        let popupRoot: Root | null = null

        const removePopup = (): void => {
            popupRoot?.unmount()
            popupRoot = null

            popup?.remove()
            popup = null
        }

        let areLayerEventsRegistered = false

        const handleMouseEnter = (): void => {
            map.getCanvas().style.cursor = 'pointer'
        }

        const handleMouseLeave = (): void => {
            map.getCanvas().style.cursor = ''
        }

        const handleVesselClick = (event: MapLayerMouseEvent): void => {
            const feature = event.features?.[0]

            if (!feature || feature.geometry.type !== 'Point') {
                return
            }

            const coordinates = feature.geometry.coordinates.slice() as [number, number]

            const properties = feature.properties as VesselPopupProperties

            const container = document.createElement('div')

            popupRoot = createRoot(container)

            popupRoot.render(
                <VesselPopup
                    shipName={properties.shipName}
                    mmsi={properties.mmsi}
                    sog={properties.sog}
                    cog={properties.cog}
                    heading={properties.heading}
                    timestamp={properties.timestamp}
                />
            )

            popup?.remove()

            popup = new maplibregl.Popup({
                closeButton: true,
                closeOnClick: true,
                offset: 16,
                maxWidth: '320px',
            })
                .setLngLat(coordinates)
                .setDOMContent(container)
                .addTo(map)

            popup.on('close', () => {
                popupRoot?.unmount()
                popupRoot = null
            })
        }

        const setupSourceAndLayer = (): void => {
            if (!map.hasImage(VESSEL_ICON_ID)) {
                map.addImage(VESSEL_ICON_ID, createVesselTriangleImage('#38bdf8', 128), {
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

            if (!areLayerEventsRegistered) {
                map.on('mouseenter', VESSELS_LAYER_ID, handleMouseEnter)
                map.on('mouseleave', VESSELS_LAYER_ID, handleMouseLeave)
                map.on('click', VESSELS_LAYER_ID, handleVesselClick)

                areLayerEventsRegistered = true
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
            updateSource()
        } else {
            map.once('load', () => {
                setupSourceAndLayer()
                updateSource()
            })
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

            removePopup()

            if (areLayerEventsRegistered) {
                try {
                    map.off('mouseenter', VESSELS_LAYER_ID, handleMouseEnter)
                    map.off('mouseleave', VESSELS_LAYER_ID, handleMouseLeave)
                    map.off('click', VESSELS_LAYER_ID, handleVesselClick)
                } catch {
                    // Map may already be removed.
                }
            }
        }
    }, [mapRef, vesselsStore])
}
