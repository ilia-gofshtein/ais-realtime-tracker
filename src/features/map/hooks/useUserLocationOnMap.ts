import { useEffect } from 'react'
import { reaction } from 'mobx'
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl'
import type { UserLocationStore } from '../../../stores/UserLocationStore'

const USER_LOCATION_SOURCE_ID = 'user-location'
const USER_LOCATION_ACCURACY_LAYER_ID = 'user-location-accuracy'
const USER_LOCATION_POINT_LAYER_ID = 'user-location-point'

type UseUserLocationOnMapOptions = {
    mapRef: React.RefObject<MapLibreMap | null>
    userLocationStore: UserLocationStore
}

export function useUserLocationOnMap({ mapRef, userLocationStore }: UseUserLocationOnMapOptions): void {
    useEffect(() => {
        const map = mapRef.current

        if (!map) {
            return
        }

        const updateSource = (): void => {
            const location = userLocationStore.location

            if (!location) {
                return
            }

            const source = map.getSource(USER_LOCATION_SOURCE_ID) as GeoJSONSource | undefined

            if (!source) {
                console.warn('[UserLocation] source is not ready yet')
                return
            }

            source.setData({
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [location.lon, location.lat],
                        },
                        properties: {
                            accuracy: location.accuracy,
                        },
                    },
                ],
            })
        }

        const setupSourceAndLayers = (): void => {
            if (!map.getSource(USER_LOCATION_SOURCE_ID)) {
                map.addSource(USER_LOCATION_SOURCE_ID, {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [],
                    },
                })
            }

            if (!map.getLayer(USER_LOCATION_ACCURACY_LAYER_ID)) {
                map.addLayer({
                    id: USER_LOCATION_ACCURACY_LAYER_ID,
                    type: 'circle',
                    source: USER_LOCATION_SOURCE_ID,
                    paint: {
                        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 8, 14, 32],
                        'circle-color': '#38bdf8',
                        'circle-opacity': 0.16,
                        'circle-stroke-width': 1,
                        'circle-stroke-color': '#38bdf8',
                        'circle-stroke-opacity': 0.4,
                    },
                })
            }

            if (!map.getLayer(USER_LOCATION_POINT_LAYER_ID)) {
                map.addLayer({
                    id: USER_LOCATION_POINT_LAYER_ID,
                    type: 'circle',
                    source: USER_LOCATION_SOURCE_ID,
                    paint: {
                        'circle-radius': 7,
                        'circle-color': '#38bdf8',
                        'circle-stroke-width': 3,
                        'circle-stroke-color': '#ffffff',
                    },
                })
            }

            updateSource()
        }

        if (map.isStyleLoaded()) {
            setupSourceAndLayers()
        } else {
            map.once('load', setupSourceAndLayers)
        }

        const disposeReaction = reaction(
            () => userLocationStore.location,
            () => {
                updateSource()
            },
            {
                fireImmediately: true,
            }
        )

        return () => {
            disposeReaction()
        }
    }, [mapRef, userLocationStore])
}
