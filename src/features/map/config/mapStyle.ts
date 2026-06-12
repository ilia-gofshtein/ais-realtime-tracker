import type { StyleSpecification } from 'maplibre-gl'

export const MAP_STYLE: StyleSpecification = {
    version: 8,
    sources: {
        'carto-light': {
            type: 'raster',
            tiles: [
                'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        },
    },
    layers: [
        {
            id: 'carto-light-layer',
            type: 'raster',
            source: 'carto-light',
        },
    ],
}
